import {
  SPOTS,
  PLOTS,
  DAILY_COLLECT,
  TOWN_GOAL,
  townTier,
  nextTier,
  sceneById,
  spotById,
  plotById,
} from '../data/island'
import { FOX_ICON } from '../asset'
import type { Scene, Spot, Plot } from '../data/island'
import { storage } from '../storage'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { AGENT_NAME } from '../types'
import { goTo } from '../app'
import { WATERCOLOR_DEFS, sceneArt, foxArt, hasSceneArt, buildingArt } from '../art/watercolor'
import { lookupWord, transcribeAudio } from '../ai/chat'
import { CallSession } from '../voice/recorder'

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

  // One mic session per visit to a scene; released when the page goes away
  // (e.g. switching tabs) so the microphone never stays open in the background.
  let activeRecorder: CallSession | null = null
  const pageObserver = new MutationObserver(() => {
    if (!document.body.contains(el)) {
      activeRecorder?.end()
      activeRecorder = null
      tts.stopSpeaking()
      pageObserver.disconnect()
    }
  })
  pageObserver.observe(document.body, { childList: true, subtree: true })

  function map() {
    tts.stopSpeaking()
    const island = storage.getIsland()
    const stats = storage.getStats()
    const todaySpot = SPOTS.find((s) => spotState(s) === 'today' && s.sceneId)

    const builtCount = island.built.length
    const tier = townTier(builtCount)
    const next = nextTier(builtCount)
    const goalPct = Math.round((builtCount / PLOTS.length) * 100)

    el.innerHTML = `
      <div class="island-scene">
        ${WATERCOLOR_DEFS}
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
            <span class="isl-prosper">🏠 <b>${builtCount}</b></span>
          </div>
        </div>

        <div class="isl-goal">
          <div class="isl-goal-top">
            <span class="isl-goal-name">${tier.emoji} ${tier.name}</span>
            <span class="isl-goal-target">🎯 ${TOWN_GOAL}</span>
          </div>
          <div class="isl-goal-bar"><div class="isl-goal-fill" style="width:${goalPct}%"></div></div>
          <div class="isl-goal-hint">${
            next
              ? `已建 ${builtCount}/${PLOTS.length} 座 · 再建 ${next.min - builtCount} 座升级「${next.name}」`
              : '🎉 你已把荒岛建成了童话小镇！'
          }</div>
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
      const affordable = island.coins >= plot.cost
      return `
        <button class="plot-pin plot-unbuilt ${affordable ? 'can-build' : ''}" data-id="${plot.id}" style="left:${plot.x}%;top:${plot.y}%">
          <span class="plot-ghost">${plot.emoji}</span>
          <span class="plot-cost">🔨 ${plot.cost}🐚</span>
        </button>`
    }
    const canCollect = storage.canCollect(plot.id)
    const style = BUILDING_STYLE[plot.id] ?? { roof: '#c98b56', wall: '#f0e0c0' }
    return `
      <button class="plot-pin plot-built" data-id="${plot.id}" style="left:${plot.x}%;top:${plot.y}%">
        <span class="isl-building isl-pop">${buildingArt(style.roof, style.wall, plot.residentEmoji)}</span>
        <span class="spot-label">${esc(plot.nameZh)}</span>
        ${canCollect ? '<span class="plot-collect">🐚</span>' : ''}
      </button>`
  }

  function onPlotClick(id: string) {
    const plot = plotById(id)!
    const island = storage.getIsland()
    if (!island.built.includes(plot.id)) {
      if (island.coins < plot.cost) {
        toast(`还差 ${plot.cost - island.coins} 🐚，去玩故事过关、或找居民收集贝壳`)
        return
      }
      const before = island.built.length
      storage.buildPlot(plot.id, plot.cost)
      const after = before + 1
      const leveledUp = townTier(after).name !== townTier(before).name
      toast(`🎉 建好了「${plot.nameZh}」！`)
      if (leveledUp) {
        const t = townTier(after)
        setTimeout(() => toast(`${t.emoji} 小镇升级为「${t.name}」！`), 1300)
      }
      map()
      return
    }
    visitPlot(plot)
  }

  const BUILDING_STYLE: Record<string, { roof: string; wall: string }> = {
    farm: { roof: '#cf8b4a', wall: '#f1e2bd' },
    market: { roof: '#c95f6b', wall: '#f4e4d0' },
    fountain: { roof: '#6fa8c9', wall: '#e9eff1' },
    cottage: { roof: '#b06a4a', wall: '#f2e3c9' },
    school: { roof: '#7b9e6a', wall: '#eff1e0' },
    dock: { roof: '#5e8aa0', wall: '#e7dec9' },
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

    // read-aloud gate: you must read each line well enough to advance
    let passed = false
    let recording = false
    let linesRead = 0
    let scoreSum = 0
    let bestStars = 0

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

    // Wrap every English word so any of them can be tapped for sound + meaning.
    // Preset story words get a dotted underline so they stand out as "new".
    function renderWords(text: string): string {
      return text.replace(/[A-Za-z][A-Za-z'’-]*|[^A-Za-z]+/g, (tok) => {
        if (!/^[A-Za-z]/.test(tok)) return esc(tok)
        const lower = tok.toLowerCase().replace(/['’-]+$/g, '')
        const isKey = vocabMap.has(lower)
        return `<span class="vn-word${isKey ? ' vn-word-key' : ''}" data-w="${escAttr(tok)}">${esc(tok)}</span>`
      })
    }

    function bindWordTaps() {
      el.querySelectorAll('.vn-word').forEach((w) => {
        w.addEventListener('click', async (e) => {
          e.stopPropagation()
          const span = w as HTMLElement
          const word = (span.dataset.w ?? '').replace(/[^A-Za-z'’-]/g, '')
          if (!word) return
          tts.speak(word, 'en-US', 0.8)
          el.querySelectorAll('.vn-word-tip').forEach((t) => t.remove())
          const tip = document.createElement('div')
          tip.className = 'vn-word-tip'
          const preset = vocabMap.get(word.toLowerCase())
          const body = preset ? esc(preset) : '<span class="vn-tip-load">查询中…</span>'
          tip.innerHTML = `<button class="wt-say">🔊</button><span class="wt-body"><b>${esc(word)}</b> ${body}</span>`
          tip.querySelector('.wt-say')?.addEventListener('click', (ev) => {
            ev.stopPropagation()
            tts.speak(word, 'en-US', 0.8)
          })
          span.appendChild(tip)
          if (!preset) {
            try {
              const meaning = await lookupWord(storage.getAiSettings(), word, current?.en ?? '')
              const bodyEl = tip.querySelector('.wt-body')
              if (bodyEl) bodyEl.innerHTML = `<b>${esc(word)}</b> ${esc(meaning || '（未找到释义）')}`
            } catch {
              const bodyEl = tip.querySelector('.wt-body')
              if (bodyEl) bodyEl.innerHTML = `<b>${esc(word)}</b> <span class="vn-tip-load">查询失败，点🔊听发音</span>`
            }
          }
          setTimeout(() => tip.remove(), 6000)
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
      passed = false
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
      passed = false
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
      if (!choosing && !passed) return // must read this line aloud first
      next()
    }

    function leaveScene() {
      tts.stopSpeaking()
      stopTyper()
      activeRecorder?.end()
      activeRecorder = null
      map()
    }

    function finish() {
      stopTyper()
      activeRecorder?.end()
      activeRecorder = null
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
        t.innerHTML = renderWords(fullText)
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

    // ---- read-aloud "pass to continue" challenge ----
    async function ensureRecorder(): Promise<CallSession> {
      if (!activeRecorder) activeRecorder = await CallSession.start()
      return activeRecorder
    }

    function starsFor(score: number): number {
      return score >= 0.9 ? 3 : score >= 0.75 ? 2 : score >= 0.55 ? 1 : 0
    }

    async function doRead() {
      if (recording) {
        activeRecorder?.stopCurrent()
        return
      }
      const settings = storage.getAiSettings()
      const status = el.querySelector('#read-status') as HTMLElement | null
      const micBtn = el.querySelector('#vn-mic') as HTMLElement | null
      if (!status || !micBtn) return
      if (!settings.openaiApiKey) {
        status.innerHTML =
          '需要 AIHubMix Key 才能自动评分。<button class="vn-skip" id="self-pass">我已读，过关 ▶</button>'
        status.querySelector('#self-pass')?.addEventListener('click', () => passLine(1))
        return
      }
      try {
        tts.stopSpeaking()
        recording = true
        micBtn.classList.add('rec')
        micBtn.textContent = '● 录音中…读完会自动停（也可点我结束）'
        status.textContent = '🎤 在听你读…'
        const rec = await ensureRecorder()
        const blob = await rec.recordUtterance(650, 9000)
        recording = false
        micBtn.classList.remove('rec')
        micBtn.textContent = '🎤 再读一遍'
        if (!blob) {
          status.textContent = '没听清，凑近一点再读一遍 🎤'
          return
        }
        status.textContent = '⏳ 评分中…'
        const said = await transcribeAudio(blob, settings)
        showScore(scoreReading(current?.en ?? '', said))
      } catch (err) {
        recording = false
        micBtn.classList.remove('rec')
        micBtn.textContent = '🎤 读这句过关'
        status.innerHTML =
          '录音/识别失败：' +
          esc(err instanceof Error ? err.message : '请允许麦克风权限') +
          ' <button class="vn-skip" id="skip-line">先跳过 ▶</button>'
        status.querySelector('#skip-line')?.addEventListener('click', () => passLine(0))
      }
    }

    function showScore(res: ReadResult) {
      const status = el.querySelector('#read-status') as HTMLElement | null
      if (!status) return
      const pct = Math.round(res.score * 100)
      const stars = starsFor(res.score)
      const wordsHtml = res.words
        .map((w) => `<span class="rd-w ${w.ok ? 'ok' : 'bad'}">${esc(w.w)}</span>`)
        .join(' ')
      if (stars >= 1) {
        status.innerHTML = `<div class="rd-line">${wordsHtml}</div>
          <div class="rd-result good">${'⭐'.repeat(stars)} ${pct}分 · 读得真棒！<b>轻点屏幕继续 ▶</b></div>`
        passLine(res.score)
      } else {
        status.innerHTML = `<div class="rd-line">${wordsHtml}</div>
          <div class="rd-result">${pct}分 · 红色的词再读清楚点 🎤
          <button class="vn-skip" id="skip-line">太难了，先跳过 ▶</button></div>`
        status.querySelector('#skip-line')?.addEventListener('click', () => passLine(res.score))
      }
    }

    function passLine(score: number) {
      if (passed) return
      passed = true
      linesRead += 1
      scoreSum += score
      bestStars = Math.max(bestStars, starsFor(score))
      const micBtn = el.querySelector('#vn-mic') as HTMLElement | null
      if (micBtn) {
        micBtn.textContent = '✓ 过关 · 轻点屏幕继续 ▶'
        micBtn.classList.add('done')
      }
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
              <button class="vn-say" id="vn-say">🔊 听一遍</button>
              <span class="vn-word-hint">💡 点单词查中文</span>
            </div>
            ${
              opts
                ? `<div class="vn-choices">${opts
                    .map(
                      (o, i) =>
                        `<button class="vn-choice" data-i="${i}"><span class="ce">${esc(o.en)}</span><span class="cz">${esc(o.zh)}</span></button>`,
                    )
                    .join('')}</div>`
                : `<div class="vn-read">
                     <button class="vn-mic ${passed ? 'done' : ''}" id="vn-mic">${passed ? '✓ 过关 · 轻点屏幕继续 ▶' : '🎤 读这句过关'}</button>
                     <div class="vn-read-status" id="read-status"></div>
                   </div>`
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
        leaveScene()
      })
      el.querySelector('#vn-mic')?.addEventListener('click', (e) => {
        e.stopPropagation()
        if (passed) {
          advance()
          return
        }
        doRead()
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
              linesRead > 0
                ? `<div class="reward-read">🎤 你大声读对了 ${linesRead} 句，平均 ${Math.round((scoreSum / linesRead) * 100)} 分</div>`
                : ''
            }
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

// --- read-aloud scoring (compare what the learner said to the target line) ---
function normalizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

interface ReadResult {
  score: number
  words: { w: string; ok: boolean }[]
}

function scoreReading(target: string, said: string): ReadResult {
  const tw = normalizeWords(target)
  const saidWords = normalizeWords(said)
  const bag = new Set(saidWords)
  let matched = 0
  const words = tw.map((w) => {
    const ok =
      bag.has(w) ||
      saidWords.some((x) => x.length > 3 && w.length > 3 && (x.includes(w) || w.includes(x)))
    if (ok) matched++
    return { w, ok }
  })
  const score = tw.length ? matched / tw.length : 1
  return { score, words }
}
