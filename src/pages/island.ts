import { SPOTS, sceneById, spotById } from '../data/island'
import type { Scene, Spot, Step } from '../data/island'
import { storage } from '../storage'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { AGENT_NAME } from '../types'
import { goTo } from '../app'

const tts = new VoiceHelper()

type SpotState = 'today' | 'done' | 'soon' | 'locked'

function spotState(spot: Spot): SpotState {
  const island = storage.getIsland()
  if (!island.unlockedSpots.includes(spot.id)) return 'locked'
  if (spot.opens) return 'today' // activity spots (library) are always open
  if (!spot.sceneId) return 'done'
  if (island.completedScenes.includes(spot.sceneId)) return 'done'
  return storage.unlockedToday() ? 'soon' : 'today'
}

export function renderIsland(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page island-page'

  function map() {
    tts.stopSpeaking()
    const island = storage.getIsland()
    const stats = storage.getStats()
    const todaySpot = SPOTS.find((s) => spotState(s) === 'today' && s.sceneId)

    el.innerHTML = `
      <div class="island-top">
        <div class="island-title">
          <h1>🏝️ 英语小岛</h1>
          <p class="subtitle">每天解锁一个童话场景，把小岛养大</p>
        </div>
        <div class="island-coins">🐚 <b>${island.coins}</b></div>
      </div>

      <div class="island-map">
        ${SPOTS.map((s) => spotPin(s)).join('')}
        <div class="map-sea"></div>
      </div>

      <div class="island-banner">
        ${
          todaySpot
            ? `<button class="btn btn-primary btn-block" id="play-today">
                 ✨ 今日故事：${esc(todaySpot.nameZh)} →
               </button>`
            : storage.unlockedToday()
              ? `<div class="island-rest">🌙 今天的新故事已经读过啦，明天再回来解锁下一处。<br><span class="hint">连续 ${stats.streak} 天 · 已点亮 ${island.unlockedSpots.length} 处</span></div>`
              : `<div class="island-rest">🎉 你已经走遍了现在的小岛！更多场景很快会上线。</div>`
        }
      </div>
    `

    el.querySelector('#play-today')?.addEventListener('click', () => {
      if (todaySpot?.sceneId) openScene(sceneById(todaySpot.sceneId)!)
    })

    el.querySelectorAll('.spot-pin').forEach((pin) => {
      pin.addEventListener('click', () => onSpotClick((pin as HTMLElement).dataset.id!))
    })
  }

  function spotPin(spot: Spot): string {
    const state = spotState(spot)
    const locked = state === 'locked'
    const label = locked ? '???' : spot.nameZh
    return `
      <button class="spot-pin spot-${state}" data-id="${spot.id}"
        style="left:${spot.x}%;top:${spot.y}%" ${locked ? 'aria-disabled="true"' : ''}>
        <span class="spot-emoji">${locked ? '❓' : spot.emoji}</span>
        <span class="spot-label">${esc(label)}</span>
        ${state === 'today' ? '<span class="spot-badge">今日</span>' : ''}
        ${state === 'done' ? '<span class="spot-check">✓</span>' : ''}
      </button>
    `
  }

  function onSpotClick(id: string) {
    const spot = spotById(id)!
    const state = spotState(spot)
    if (state === 'locked') {
      const need = spot.requires ? spotById(spot.requires)?.nameZh : ''
      toast(need ? `先点亮「${need}」才能到这里` : '还没解锁')
      return
    }
    if (spot.opens === 'reading') {
      goTo('reading')
      return
    }
    if (!spot.sceneId) return
    if (state === 'soon') {
      toast('今天的新故事已读过，明天再来解锁这里 🌙')
      return
    }
    openScene(sceneById(spot.sceneId)!)
  }

  // ---- Scene player ----------------------------------------------------

  type Bubble = { who: 'narration' | 'fox' | 'resident' | 'player'; name?: string; emoji?: string; en: string; zh: string }

  function openScene(scene: Scene) {
    const isReplay = storage.getIsland().completedScenes.includes(scene.id)
    let phase: 'intro' | 'play' | 'reward' = 'intro'
    let index = 0
    let awaitingChoice = false
    let showZh = false
    const transcript: Bubble[] = []

    function speak(en: string) {
      if (isTTSSupported() && storage.getVoiceAutoRead()) tts.speak(en, 'en-US', 0.9)
    }

    function enter(i: number) {
      const step = scene.steps[i] as Step | undefined
      if (!step) {
        finish()
        return
      }
      if (step.kind === 'line') {
        transcript.push({ who: step.speaker, name: step.name, emoji: step.emoji, en: step.en, zh: step.zh })
        awaitingChoice = false
        speak(step.en)
      } else {
        transcript.push({ who: step.speaker, name: step.name, emoji: step.emoji, en: step.en, zh: step.zh })
        awaitingChoice = true
        speak(step.en)
      }
      paint()
    }

    function next() {
      index += 1
      enter(index)
    }

    function choose(optIndex: number) {
      const step = scene.steps[index]
      if (step.kind !== 'choice') return
      const opt = step.options[optIndex]
      transcript.push({ who: 'player', en: opt.en, zh: opt.zh })
      transcript.push({ who: step.speaker, name: step.name, emoji: step.emoji, en: opt.reply.en, zh: opt.reply.zh })
      awaitingChoice = false
      speak(opt.reply.en)
      next()
    }

    function finish() {
      phase = 'reward'
      if (!isReplay) {
        storage.completeScene(scene.id, scene.reward)
        storage.recordActivity(1)
      }
      paint()
    }

    function avatar(who: Bubble['who'], emoji?: string): string {
      if (who === 'fox') return `<img src="/fox.svg" class="sc-av" alt="" />`
      if (who === 'player') return ''
      if (who === 'narration') return ''
      return `<span class="sc-av sc-av-emoji">${emoji ?? '🙂'}</span>`
    }

    function paint() {
      if (phase === 'intro') {
        el.innerHTML = `
          <div class="scene-intro">
            <div class="scene-intro-emoji">${scene.emoji}</div>
            <h1>${esc(scene.titleZh)}</h1>
            <p class="scene-intro-en">${esc(scene.title)}</p>
            <p class="scene-setting">${esc(scene.setting)}</p>
            <button class="btn btn-primary btn-block" id="begin">开始 ▶</button>
            <button class="btn btn-ghost btn-sm" id="leave">← 回小岛</button>
          </div>
        `
        el.querySelector('#begin')?.addEventListener('click', () => {
          phase = 'play'
          enter(0)
        })
        el.querySelector('#leave')?.addEventListener('click', map)
        return
      }

      if (phase === 'reward') {
        const unlocked = scene.reward.unlockSpot ? spotById(scene.reward.unlockSpot) : undefined
        el.innerHTML = `
          <div class="scene-reward">
            <div class="reward-emoji">🎉</div>
            <h1>${isReplay ? '重温完成' : '场景完成！'}</h1>
            ${
              isReplay
                ? '<p class="hint">这是重玩，奖励只发一次哦。</p>'
                : `<div class="reward-rows">
                    <div class="reward-row">🐚 +${scene.reward.coins} 贝壳</div>
                    ${unlocked ? `<div class="reward-row reward-unlock">🔓 解锁了「${esc(unlocked.nameZh)}」${unlocked.emoji}</div>` : ''}
                  </div>`
            }
            <div class="reward-vocab">
              <h3>📒 这段的新词</h3>
              <div class="vocab-grid">
                ${scene.vocab
                  .map(
                    (v) => `<div class="vocab-item">
                      <button class="vocab-say" data-say="${escAttr(v.word)}" title="朗读">🔊</button>
                      <div><b>${esc(v.word)}</b><span>${esc(v.meaning)}</span></div>
                      <button class="vocab-add" data-w="${escAttr(v.word)}" data-m="${escAttr(v.meaning)}" title="收藏">＋</button>
                    </div>`,
                  )
                  .join('')}
              </div>
              <button class="btn btn-secondary btn-sm" id="add-all">收藏全部新词</button>
            </div>
            <button class="btn btn-primary btn-block" id="back-island">回到小岛 🏝️</button>
          </div>
        `
        el.querySelector('#back-island')?.addEventListener('click', map)
        el.querySelector('#add-all')?.addEventListener('click', (e) => {
          storage.addSavedWords(scene.vocab)
          ;(e.target as HTMLElement).textContent = '✓ 已全部收藏'
        })
        el.querySelectorAll('.vocab-say').forEach((b) =>
          b.addEventListener('click', () => tts.speak((b as HTMLElement).dataset.say ?? '', 'en-US', 0.85)),
        )
        el.querySelectorAll('.vocab-add').forEach((b) =>
          b.addEventListener('click', () => {
            const btn = b as HTMLElement
            storage.addSavedWords([{ word: btn.dataset.w!, meaning: btn.dataset.m! }])
            btn.textContent = '✓'
            btn.classList.add('added')
          }),
        )
        return
      }

      // phase === 'play'
      const step = scene.steps[index]
      el.innerHTML = `
        <div class="scene-bar">
          <button class="btn btn-ghost btn-sm" id="leave2">← 回小岛</button>
          <span class="scene-name">${scene.emoji} ${esc(scene.titleZh)}</span>
          <label class="zh-toggle"><input type="checkbox" id="zh" ${showZh ? 'checked' : ''}/> 中文</label>
        </div>
        <div class="scene-stage" id="stage">
          ${transcript.map((b) => bubbleHtml(b)).join('')}
        </div>
        <div class="scene-controls" id="controls">
          ${
            awaitingChoice && step.kind === 'choice'
              ? step.options
                  .map((o, i) => `<button class="choice-btn" data-i="${i}"><span class="choice-en">${esc(o.en)}</span>${showZh ? `<span class="choice-zh">${esc(o.zh)}</span>` : ''}</button>`)
                  .join('')
              : `<button class="btn btn-primary btn-block" id="continue">继续 ▶</button>`
          }
        </div>
      `

      el.querySelector('#leave2')?.addEventListener('click', () => {
        tts.stopSpeaking()
        map()
      })
      el.querySelector('#zh')?.addEventListener('change', (e) => {
        showZh = (e.target as HTMLInputElement).checked
        paint()
      })
      el.querySelector('#continue')?.addEventListener('click', next)
      el.querySelectorAll('.choice-btn').forEach((b) =>
        b.addEventListener('click', () => choose(Number((b as HTMLElement).dataset.i))),
      )
      el.querySelectorAll('.sc-say').forEach((b) =>
        b.addEventListener('click', () => tts.speak((b as HTMLElement).dataset.say ?? '', 'en-US', 0.9)),
      )

      const stage = el.querySelector('#stage')
      if (stage) requestAnimationFrame(() => (stage.scrollTop = stage.scrollHeight))
    }

    function bubbleHtml(b: Bubble): string {
      if (b.who === 'narration') {
        return `<p class="sc-narration">${esc(b.en)}${showZh ? `<span class="sc-zh"> ${esc(b.zh)}</span>` : ''}</p>`
      }
      const side = b.who === 'player' ? 'right' : 'left'
      const name = b.who === 'fox' ? AGENT_NAME : b.name ?? ''
      return `
        <div class="sc-bubble sc-${side}">
          ${side === 'left' ? avatar(b.who, b.emoji) : ''}
          <div class="sc-body">
            ${name ? `<span class="sc-name">${esc(name)}</span>` : ''}
            <p class="sc-en">${esc(b.en)}
              ${b.who !== 'player' ? `<button class="sc-say" data-say="${escAttr(b.en)}" title="朗读">🔊</button>` : ''}
            </p>
            ${showZh ? `<p class="sc-zh">${esc(b.zh)}</p>` : ''}
          </div>
        </div>
      `
    }

    paint()
  }

  function toast(msg: string) {
    const t = document.createElement('div')
    t.className = 'island-toast'
    t.textContent = msg
    el.appendChild(t)
    setTimeout(() => t.classList.add('show'), 10)
    setTimeout(() => {
      t.classList.remove('show')
      setTimeout(() => t.remove(), 300)
    }, 2200)
  }

  map()
  return el
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;')
}
