import { SPOTS, sceneById, spotById } from '../data/island'
import { FOX_ICON } from '../asset'
import type { Scene, Spot } from '../data/island'
import { storage } from '../storage'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { AGENT_NAME } from '../types'
import { goTo } from '../app'

const tts = new VoiceHelper()

type SpotState = 'today' | 'done' | 'soon' | 'locked'

function spotState(spot: Spot): SpotState {
  const island = storage.getIsland()
  if (!island.unlockedSpots.includes(spot.id)) return 'locked'
  if (spot.opens) return 'today'
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
      <div class="island-scene">
        <div class="isl-sky"></div>
        <div class="isl-sun"></div>
        <div class="isl-cloud isl-cloud-1">☁️</div>
        <div class="isl-cloud isl-cloud-2">☁️</div>
        <div class="isl-land"></div>
        <svg class="isl-trails" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="${trailPath()}" />
        </svg>
        ${SPOTS.map((s) => spotPin(s)).join('')}

        <div class="isl-hud">
          <div class="isl-title">🏝️ 英语小岛</div>
          <div class="isl-coins">🐚 <b>${island.coins}</b></div>
        </div>
      </div>

      <div class="island-banner">
        ${
          todaySpot
            ? `<button class="btn-quest" id="play-today">
                 <span class="quest-spark">✨</span>
                 <span class="quest-text"><b>今日故事</b><small>${esc(todaySpot.nameZh)}</small></span>
                 <span class="quest-go">▶</span>
               </button>`
            : storage.unlockedToday()
              ? `<div class="island-rest">🌙 今天的新故事读完啦，明天再来解锁下一处<br><span class="hint">连续 ${stats.streak} 天 · 已点亮 ${island.unlockedSpots.length} 处</span></div>`
              : `<div class="island-rest">🎉 你已经走遍了现在的小岛！更多场景很快上线</div>`
        }
      </div>
    `

    el.querySelector('#play-today')?.addEventListener('click', () => {
      if (todaySpot?.sceneId) openScene(sceneById(todaySpot.sceneId)!)
    })
    el.querySelectorAll('.spot-pin').forEach((pin) =>
      pin.addEventListener('click', () => onSpotClick((pin as HTMLElement).dataset.id!)),
    )
  }

  function trailPath(): string {
    const pts = SPOTS.filter((s) => !s.opens || s.id !== 'library') // chain through scene spots + library
    return pts.map((s, i) => `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`).join(' ')
  }

  function spotPin(spot: Spot): string {
    const state = spotState(spot)
    const locked = state === 'locked'
    return `
      <button class="spot-pin spot-${state}" data-id="${spot.id}"
        style="left:${spot.x}%;top:${spot.y}%">
        <span class="spot-bubble">
          <span class="spot-emoji">${locked ? '🔒' : spot.emoji}</span>
        </span>
        <span class="spot-label">${locked ? '？？？' : esc(spot.nameZh)}</span>
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

  // ---- Visual-novel scene player ---------------------------------------

  type Who = 'narration' | 'fox' | 'resident' | 'player'
  type Line = { who: Who; name?: string; emoji?: string; en: string; zh: string }

  function openScene(scene: Scene) {
    const isReplay = storage.getIsland().completedScenes.includes(scene.id)
    let phase: 'intro' | 'play' | 'reward' = 'intro'
    let index = 0
    let showZh = false

    let current: Line | null = null
    let choosing = false // showing choice buttons, not yet picked
    let resolved = false // a choice has been picked, can advance
    let playerEcho: string | null = null

    let typer: ReturnType<typeof setInterval> | null = null
    let typing = false
    let fullText = ''
    let shown = 0

    const bg = `scene-bg-${scene.spotId}`

    function speak(en: string) {
      if (isTTSSupported() && storage.getVoiceAutoRead()) tts.speak(en, 'en-US', 0.92)
    }

    function enter(i: number) {
      const step = scene.steps[i]
      if (!step) {
        finish()
        return
      }
      resolved = false
      playerEcho = null
      current = { who: step.speaker, name: step.name, emoji: step.emoji, en: step.en, zh: step.zh }
      choosing = step.kind === 'choice'
      speak(step.en)
      paintPlay()
      startTyper()
    }

    function next() {
      index += 1
      enter(index)
    }

    function choose(optIndex: number) {
      const step = scene.steps[index]
      if (step.kind !== 'choice') return
      const opt = step.options[optIndex]
      playerEcho = opt.en
      current = { who: step.speaker, name: step.name, emoji: step.emoji, en: opt.reply.en, zh: opt.reply.zh }
      choosing = false
      resolved = true
      speak(opt.reply.en)
      paintPlay()
      startTyper()
    }

    function advance() {
      if (typing) {
        finishTyper()
        return
      }
      const step = scene.steps[index]
      if (step?.kind === 'choice' && !resolved) return
      next()
    }

    function finish() {
      stopTyper()
      phase = 'reward'
      if (!isReplay) {
        storage.completeScene(scene.id, scene.reward)
        storage.recordActivity(1)
      }
      paintReward()
    }

    // --- typewriter ---
    function startTyper() {
      stopTyper()
      fullText = current?.en ?? ''
      shown = 0
      typing = true
      updateText()
      typer = setInterval(() => {
        shown += 2
        if (shown >= fullText.length) finishTyper()
        else updateText()
      }, 22)
    }
    function finishTyper() {
      stopTyper()
      shown = fullText.length
      typing = false
      updateText()
      const hint = el.querySelector('.vn-tap-hint') as HTMLElement | null
      if (hint && !choosing) hint.style.visibility = 'visible'
    }
    function stopTyper() {
      if (typer) {
        clearInterval(typer)
        typer = null
      }
    }
    function updateText() {
      const t = el.querySelector('#vn-text')
      if (t) t.textContent = fullText.slice(0, shown)
    }

    // --- sprites ---
    function sprite(line: Line | null): string {
      if (!line) return ''
      if (line.who === 'fox')
        return `<img src="${FOX_ICON}" class="vn-sprite vn-pop" alt="${AGENT_NAME}" />`
      if (line.who === 'resident')
        return `<span class="vn-sprite vn-sprite-emoji vn-pop">${line.emoji ?? '🙂'}</span>`
      return `<span class="vn-sprite vn-sprite-scene">${scene.emoji}</span>`
    }

    function paintIntro() {
      el.innerHTML = `
        <div class="vn ${bg}">
          <div class="vn-intro">
            <div class="vn-intro-emoji vn-pop">${scene.emoji}</div>
            <h1>${esc(scene.titleZh)}</h1>
            <p class="vn-intro-en">${esc(scene.title)}</p>
            <p class="vn-setting">${esc(scene.setting)}</p>
            <button class="btn-quest vn-begin" id="begin"><span class="quest-text"><b>开始故事</b></span><span class="quest-go">▶</span></button>
            <button class="vn-leave-text" id="leave">← 回小岛</button>
          </div>
        </div>
      `
      el.querySelector('#begin')?.addEventListener('click', () => {
        phase = 'play'
        enter(0)
      })
      el.querySelector('#leave')?.addEventListener('click', map)
    }

    function paintPlay() {
      const line = current
      const name = line?.who === 'fox' ? AGENT_NAME : line?.name ?? ''
      const step = scene.steps[index]
      const opts = choosing && step.kind === 'choice' ? step.options : null

      el.innerHTML = `
        <div class="vn ${bg}">
          <div class="vn-top">
            <button class="vn-icon-btn" id="leave2">←</button>
            <span class="vn-chip">${scene.emoji} ${esc(scene.titleZh)}</span>
            <button class="vn-icon-btn ${showZh ? 'on' : ''}" id="zh-toggle">中</button>
          </div>

          <div class="vn-stage" id="vn-stage">
            ${playerEcho ? `<div class="vn-echo">🗨️ You: ${esc(playerEcho)}</div>` : ''}
            ${sprite(line)}
          </div>

          <div class="vn-box" id="vn-box">
            ${name ? `<div class="vn-name">${esc(name)}</div>` : '<div class="vn-name vn-name-narr">旁白</div>'}
            <div class="vn-text" id="vn-text"></div>
            ${showZh && line?.zh ? `<div class="vn-zh">${esc(line.zh)}</div>` : ''}
            <div class="vn-foot">
              <button class="vn-say" id="vn-say">🔊 再听</button>
              ${opts ? '' : '<span class="vn-tap-hint">轻点屏幕继续 ▶</span>'}
            </div>
            ${
              opts
                ? `<div class="vn-choices">${opts
                    .map(
                      (o, i) =>
                        `<button class="vn-choice" data-i="${i}"><span class="ce">${esc(o.en)}</span>${showZh ? `<span class="cz">${esc(o.zh)}</span>` : ''}</button>`,
                    )
                    .join('')}</div>`
                : ''
            }
          </div>
        </div>
      `

      el.querySelector('.vn')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('button')) return
        advance()
      })
      el.querySelector('#leave2')?.addEventListener('click', (e) => {
        e.stopPropagation()
        tts.stopSpeaking()
        stopTyper()
        map()
      })
      el.querySelector('#zh-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation()
        showZh = !showZh
        const keepShown = shown
        paintPlay()
        // restore typewriter progress so toggling doesn't restart the line
        shown = keepShown
        typing = false
        stopTyper()
        updateText()
        const hint = el.querySelector('.vn-tap-hint') as HTMLElement | null
        if (hint) hint.style.visibility = 'visible'
      })
      el.querySelector('#vn-say')?.addEventListener('click', (e) => {
        e.stopPropagation()
        if (current) tts.speak(current.en, 'en-US', 0.92)
      })
      el.querySelectorAll('.vn-choice').forEach((b) =>
        b.addEventListener('click', (e) => {
          e.stopPropagation()
          choose(Number((b as HTMLElement).dataset.i))
        }),
      )
    }

    function paintReward() {
      const unlocked = scene.reward.unlockSpot ? spotById(scene.reward.unlockSpot) : undefined
      el.innerHTML = `
        <div class="vn ${bg}">
          <div class="vn-reward">
            <div class="reward-burst">🎉</div>
            <h1>${isReplay ? '重温完成' : '完成！'}</h1>
            ${
              isReplay
                ? '<p class="hint">重玩不再重复发奖励哦</p>'
                : `<div class="reward-rows">
                     <div class="reward-row reward-coin">🐚 +${scene.reward.coins} 贝壳</div>
                     ${unlocked ? `<div class="reward-row reward-unlock">🔓 解锁「${esc(unlocked.nameZh)}」 ${unlocked.emoji}</div>` : ''}
                   </div>`
            }
            <div class="reward-vocab">
              <div class="reward-vocab-title">📒 这段的新词</div>
              ${scene.vocab
                .map(
                  (v) => `<div class="rv-item">
                    <button class="rv-say" data-say="${escAttr(v.word)}">🔊</button>
                    <b>${esc(v.word)}</b><span>${esc(v.meaning)}</span>
                    <button class="rv-add" data-w="${escAttr(v.word)}" data-m="${escAttr(v.meaning)}">＋</button>
                  </div>`,
                )
                .join('')}
              <button class="btn-soft" id="add-all">收藏全部新词</button>
            </div>
            <button class="btn-quest vn-begin" id="back-island"><span class="quest-text"><b>回到小岛</b> 🏝️</span></button>
          </div>
        </div>
      `
      el.querySelector('#back-island')?.addEventListener('click', map)
      el.querySelector('#add-all')?.addEventListener('click', (e) => {
        storage.addSavedWords(scene.vocab)
        ;(e.target as HTMLElement).textContent = '✓ 已全部收藏'
      })
      el.querySelectorAll('.rv-say').forEach((b) =>
        b.addEventListener('click', () => tts.speak((b as HTMLElement).dataset.say ?? '', 'en-US', 0.85)),
      )
      el.querySelectorAll('.rv-add').forEach((b) =>
        b.addEventListener('click', () => {
          const btn = b as HTMLElement
          storage.addSavedWords([{ word: btn.dataset.w!, meaning: btn.dataset.m! }])
          btn.textContent = '✓'
          btn.classList.add('added')
        }),
      )
    }

    if (phase === 'intro') paintIntro()
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
