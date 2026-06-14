import { SPOTS, PLOTS, DAILY_COLLECT, sceneById, spotById, plotById } from '../data/island'
import { FOX_ICON } from '../asset'
import type { Scene, Spot, Plot } from '../data/island'
import { storage } from '../storage'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { AGENT_NAME } from '../types'
import { goTo } from '../app'
import { WATERCOLOR_DEFS, sceneArt, foxArt, hasSceneArt } from '../art/watercolor'

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
        <div class="isl-cloud isl-cloud-3">☁️</div>
        <div class="isl-wave isl-wave-1"></div>
        <div class="isl-wave isl-wave-2"></div>
        <div class="isl-land"></div>
        <svg class="isl-trails" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="${trailPath()}" />
        </svg>
        ${SPOTS.map((s) => spotPin(s)).join('')}
        ${PLOTS.map((p) => plotPin(p)).join('')}

        <div class="isl-hud">
          <div class="isl-title">🏝️ 英语小岛</div>
          <div class="isl-hud-stats">
            <span class="isl-coins">🐚 <b>${island.coins}</b></span>
            <span class="isl-prosper">🏠 <b>${island.built.length}</b></span>
          </div>
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
              ? `<div class="island-rest">🌙 今天的新故事读完啦，明天再来解锁下一处<br><span class="hint">连续 ${stats.streak} 天 · 用 🐚 在岛上建造新建筑吧</span></div>`
              : `<div class="island-rest">🎉 主线走完啦！用 🐚 建造小岛、每天回来和居民聊聊</div>`
        }
      </div>
    `

    el.querySelector('#play-today')?.addEventListener('click', () => {
      if (todaySpot?.sceneId) openScene(sceneById(todaySpot.sceneId)!)
    })
    el.querySelectorAll('.spot-pin').forEach((pin) =>
      pin.addEventListener('click', () => onSpotClick((pin as HTMLElement).dataset.id!)),
    )
    el.querySelectorAll('.plot-pin').forEach((pin) =>
      pin.addEventListener('click', () => onPlotClick((pin as HTMLElement).dataset.id!)),
    )
  }

  function plotPin(plot: Plot): string {
    const island = storage.getIsland()
    const built = island.built.includes(plot.id)
    if (!built) {
      return `
        <button class="plot-pin plot-unbuilt" data-id="${plot.id}" style="left:${plot.x}%;top:${plot.y}%">
          <span class="plot-ghost">${plot.emoji}</span>
          <span class="plot-cost">🔨 ${plot.cost}🐚</span>
        </button>`
    }
    const canCollect = storage.canCollect(plot.id)
    return `
      <button class="plot-pin plot-built" data-id="${plot.id}" style="left:${plot.x}%;top:${plot.y}%">
        <span class="spot-bubble"><span class="spot-emoji">${plot.emoji}</span></span>
        <span class="spot-label">${esc(plot.nameZh)}</span>
        ${canCollect ? '<span class="plot-collect">🐚</span>' : ''}
      </button>`
  }

  function onPlotClick(id: string) {
    const plot = plotById(id)!
    const island = storage.getIsland()
    if (!island.built.includes(plot.id)) {
      if (island.coins < plot.cost) {
        toast(`还差 ${plot.cost - island.coins} 🐚，去玩故事或收集贝壳`)
        return
      }
      storage.buildPlot(plot.id, plot.cost)
      toast(`🎉 建好了「${plot.nameZh}」！`)
      map()
      return
    }
    visitPlot(plot)
  }

  function trailPath(): string {
    const pts = SPOTS.filter((s) => !s.opens || s.id !== 'library')
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

  const SCENE_DECOR: Record<string, string[]> = {
    beach: ['🐚', '🌊', '✨', '🦀'],
    bakery: ['🍞', '🧈', '✨', '🥐'],
    lighthouse: ['⭐', '🌙', '✨', '🕯️'],
    garden: ['🌸', '🦋', '✨', '🌻'],
  }

  type Who = 'narration' | 'fox' | 'resident' | 'player'
  type Line = { who: Who; name?: string; emoji?: string; en: string; zh: string }

  function openScene(scene: Scene) {
    const isReplay = storage.getIsland().completedScenes.includes(scene.id)
    let phase: 'intro' | 'play' | 'reward' = 'intro'
    let index = 0
    let showZh = true

    let current: Line | null = null
    let choosing = false
    let resolved = false
    let playerEcho: string | null = null

    let typer: ReturnType<typeof setInterval> | null = null
    let typing = false
    let fullText = ''
    let shown = 0

    const bg = `scene-bg-${scene.spotId}`
    const vocabMap = new Map(scene.vocab.map((v) => [v.word.toLowerCase(), v.meaning]))

    function speak(en: string) {
      if (isTTSSupported() && storage.getVoiceAutoRead()) tts.speak(en, 'en-US', 0.92)
    }

    const painted = hasSceneArt(scene.spotId)

    function backdropHtml(): string {
      // Painted watercolor scenes carry their own atmosphere; elsewhere we
      // sprinkle the floating emoji decorations over the CSS gradient.
      if (painted) return WATERCOLOR_DEFS + sceneArt(scene.spotId)
      const emojis = SCENE_DECOR[scene.spotId] ?? ['✨']
      return emojis.map((e, i) => `<span class="vn-decor vn-decor-${i}">${e}</span>`).join('')
    }

    function progressHtml(): string {
      const total = scene.steps.length
      const pct = Math.round(((index + 1) / total) * 100)
      return `<div class="vn-progress"><div class="vn-progress-fill" style="width:${pct}%"></div></div>`
    }

    function highlightVocab(text: string): string {
      let html = esc(text)
      for (const [word, meaning] of vocabMap) {
        const re = new RegExp(`\\b(${word})\\b`, 'gi')
        html = html.replace(re, `<span class="vn-word" data-word="$1" data-meaning="${escAttr(meaning)}">$1</span>`)
      }
      return html
    }

    function bindWordTaps() {
      el.querySelectorAll('.vn-word').forEach((w) => {
        w.addEventListener('click', (e) => {
          e.stopPropagation()
          const span = w as HTMLElement
          const word = span.dataset.word ?? ''
          const meaning = span.dataset.meaning ?? ''
          el.querySelectorAll('.vn-word-tip').forEach((t) => t.remove())
          const tip = document.createElement('div')
          tip.className = 'vn-word-tip'
          tip.innerHTML = `<b>${esc(word)}</b> ${esc(meaning)}`
          span.style.position = 'relative'
          span.appendChild(tip)
          tts.speak(word, 'en-US', 0.85)
          setTimeout(() => tip.remove(), 2500)
        })
      })
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
      const t = el.querySelector('#vn-text')
      if (t) {
        t.innerHTML = highlightVocab(fullText)
        bindWordTaps()
      }
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

    function sprite(line: Line | null): string {
      if (!line) return ''
      if (line.who === 'fox') {
        if (painted) return `<div class="vn-sprite-wrap vn-breathe">${foxArt()}</div>`
        return `<img src="${FOX_ICON}" class="vn-sprite vn-breathe" alt="${AGENT_NAME}" />`
      }
      if (line.who === 'resident')
        return `<span class="vn-sprite vn-sprite-emoji vn-breathe">${line.emoji ?? '🙂'}</span>`
      // narration: on painted scenes the backdrop is the picture, so no big emoji
      if (painted) return ''
      return `<span class="vn-sprite vn-sprite-scene">${scene.emoji}</span>`
    }

    function paintIntro() {
      el.innerHTML = `
        <div class="vn ${bg} ${painted ? 'vn-painted' : ''}">
          ${backdropHtml()}
          <div class="vn-intro">
            <div class="vn-intro-emoji vn-pop">${scene.emoji}</div>
            <h1>${esc(scene.titleZh)}</h1>
            <p class="vn-intro-en">${esc(scene.title)}</p>
            <p class="vn-setting">${esc(scene.setting)}</p>
            <div class="vn-vocab-preview">
              <div class="vn-vocab-title">📖 本节生词（点击可查看释义）</div>
              <div class="vn-vocab-chips">
                ${scene.vocab.map((v) => `<span class="vn-vocab-chip"><b>${esc(v.word)}</b> ${esc(v.meaning)}</span>`).join('')}
              </div>
            </div>
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
        <div class="vn ${bg} ${painted ? 'vn-painted' : ''}">
          ${backdropHtml()}
          ${progressHtml()}
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
              <span class="vn-word-hint">💡 点击<u>高亮单词</u>查看释义</span>
              ${opts ? '' : '<span class="vn-tap-hint">轻点屏幕继续 ▶</span>'}
            </div>
            ${
              opts
                ? `<div class="vn-choices">${opts
                    .map(
                      (o, i) =>
                        `<button class="vn-choice" data-i="${i}"><span class="ce">${esc(o.en)}</span><span class="cz">${esc(o.zh)}</span></button>`,
                    )
                    .join('')}</div>`
                : ''
            }
          </div>
        </div>
      `

      el.querySelector('.vn')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('button, .vn-word')) return
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
        const wasDone = !typing
        paintPlay()
        if (wasDone) {
          finishTyper()
        } else {
          shown = keepShown
          typing = true
          updateText()
        }
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

  function visitPlot(plot: Plot) {
    tts.stopSpeaking()
    let showZh = false
    let line = plot.lines[Math.floor(Math.random() * plot.lines.length)]

    const overlay = document.createElement('div')
    overlay.className = 'visit-overlay'

    function speakLine() {
      if (isTTSSupported() && storage.getVoiceAutoRead()) tts.speak(line.en, 'en-US', 0.92)
    }

    function paint() {
      const canCollect = storage.canCollect(plot.id)
      overlay.innerHTML = `
        <div class="visit-card">
          <button class="visit-x" id="visit-close">✕</button>
          <div class="visit-head">
            <span class="visit-face vn-pop">${plot.residentEmoji}</span>
            <div><b>${esc(plot.resident)}</b><span>${esc(plot.nameZh)}</span></div>
          </div>
          <div class="visit-bubble">
            <p class="visit-en">${esc(line.en)} <button class="visit-say" id="visit-say">🔊</button></p>
            ${showZh ? `<p class="visit-zh">${esc(line.zh)}</p>` : ''}
          </div>
          <div class="visit-actions">
            <button class="btn-soft" id="visit-zh-btn">${showZh ? '隐藏中文' : '显示中文'}</button>
            <button class="btn-soft" id="visit-next">换一句</button>
          </div>
          <button class="btn-quest visit-collect" id="visit-collect" ${canCollect ? '' : 'disabled'}>
            <span class="quest-text"><b>${canCollect ? `收集今日 +${DAILY_COLLECT} 🐚` : '今天已收集，明天再来'}</b></span>
          </button>
          <div class="visit-vocab">
            ${plot.vocab
              .map(
                (v) => `<span class="word-chip"><b>${esc(v.word)}</b> ${esc(v.meaning)}
                  <button class="vw-add" data-w="${escAttr(v.word)}" data-m="${escAttr(v.meaning)}">＋</button></span>`,
              )
              .join('')}
          </div>
        </div>
      `

      overlay.querySelector('#visit-close')?.addEventListener('click', close)
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close()
      })
      overlay.querySelector('#visit-say')?.addEventListener('click', () => tts.speak(line.en, 'en-US', 0.92))
      overlay.querySelector('#visit-zh-btn')?.addEventListener('click', () => {
        showZh = !showZh
        paint()
      })
      overlay.querySelector('#visit-next')?.addEventListener('click', () => {
        line = plot.lines[Math.floor(Math.random() * plot.lines.length)]
        paint()
        speakLine()
      })
      overlay.querySelector('#visit-collect')?.addEventListener('click', () => {
        const gained = storage.collectFromPlot(plot.id, DAILY_COLLECT)
        if (gained > 0) toast(`+${gained} 🐚`)
        paint()
      })
      overlay.querySelectorAll('.vw-add').forEach((b) =>
        b.addEventListener('click', () => {
          const btn = b as HTMLElement
          storage.addSavedWords([{ word: btn.dataset.w!, meaning: btn.dataset.m! }])
          btn.textContent = '✓'
        }),
      )
    }

    function close() {
      tts.stopSpeaking()
      overlay.remove()
      map()
    }

    paint()
    el.appendChild(overlay)
    speakLine()
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
