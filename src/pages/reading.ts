import { ARTICLES, articleById, splitSentences } from '../data/articles'
import type { Article } from '../data/articles'
import { storage } from '../storage'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { prefetchMany } from '../voice/neural-tts'
import { getIllustration, illustrationsEnabled, warmIllustrations } from '../ai/illustrate'
import { startArticleDiscussion } from './voice'

// Soft watercolor cover palettes, cycled per book so the shelf looks varied.
const COVER_THEMES = [
  'linear-gradient(150deg,#ffd9a8,#ff9e7d)',
  'linear-gradient(150deg,#bfe3ff,#7fb6e6)',
  'linear-gradient(150deg,#d8f0c0,#8fce72)',
  'linear-gradient(150deg,#e6d6ff,#b79be6)',
  'linear-gradient(150deg,#ffd6e6,#ff9ec0)',
  'linear-gradient(150deg,#fff0bf,#ffce6a)',
  'linear-gradient(150deg,#c8efe8,#74c7b8)',
]

const tts = new VoiceHelper()

export function renderReading(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page reading-page'

  function list() {
    tts.stopSpeaking()
    const read = new Set(storage.getReadArticles())
    el.innerHTML = `
      <header class="page-header">
        <h1>📚 绘本书架</h1>
        <p class="subtitle">挑一本读，每段都有钢笔淡彩插画，读完和 Fox 聊聊</p>
      </header>
      <div class="book-shelf">
        ${ARTICLES.map(
          (a, i) => `
          <button class="book-card" data-id="${a.id}">
            <div class="book-cover" style="background:${COVER_THEMES[i % COVER_THEMES.length]}">
              <span class="book-emoji">${a.emoji}</span>
              <span class="book-cover-title">${esc(a.title)}</span>
              ${read.has(a.id) ? '<span class="book-ribbon">✓ 读过</span>' : ''}
              <span class="book-spine"></span>
            </div>
            <div class="book-foot">
              <div class="book-title-zh">${esc(a.titleZh)}</div>
              <div class="book-tags"><span class="tag-soft">${esc(a.category)}</span><span class="tag-soft">${a.level}</span><span class="tag-soft">${a.words}词</span></div>
            </div>
          </button>`,
        ).join('')}
      </div>
    `
    el.querySelectorAll('.book-card').forEach((c) =>
      c.addEventListener('click', () =>
        reader(articleById((c as HTMLElement).dataset.id!)!),
      ),
    )

    // Start drawing every book's pictures in the background while you browse,
    // so opening one is (near-)instant — and fully instant on later visits.
    warmIllustrations(
      ARTICLES.flatMap((a) =>
        a.paragraphs.map((p, i) => ({
          key: `${a.id}-${i}`,
          text: p,
          artNote: a.artNote,
          bookKey: a.id,
        })),
      ),
    )
  }

  function reader(article: Article) {
    tts.stopSpeaking()
    storage.markArticleRead(article.id)
    let showZh = false
    let coReadIdx = -1  // -1 = normal view; >=0 = co-read slideshow at this paragraph index
    const illoOn = illustrationsEnabled()

    // Warm up the first few sentences so "正常朗读" starts instantly; the rest
    // are generated just-in-time (look-ahead) as it reads, same expressive voice.
    const sentences = article.paragraphs.flatMap((p) => splitSentences(p))
    void prefetchMany(sentences.slice(0, 6), storage.getAiSettings(), 'warm')

    // Draw every page's illustration right away (a few at a time), so the whole
    // story is illustrated without waiting for scrolling or taps.
    function loadIllustrations() {
      if (!illoOn) return
      const imgs = Array.from(el.querySelectorAll('img.pb-img')) as HTMLImageElement[]
      let i = 0
      const runOne = async (): Promise<void> => {
        const img = imgs[i++]
        if (!img) return
        const idx = img.dataset.idx ?? '0'
        const text = article.paragraphs[Number(idx)] ?? ''
        try {
          const src = await getIllustration(`${article.id}-${idx}`, text, article.artNote, article.id)
          if (el.contains(img)) {
            const page = img.closest('.pb-page')
            img.onload = () => page?.classList.add('ready')
            img.onerror = () => page?.classList.add('failed')
            img.src = src
            if (img.complete && img.naturalWidth) page?.classList.add('ready')
          }
        } catch {
          img.closest('.pb-page')?.classList.add('failed') // show text on paper
        }
        return runOne()
      }
      const concurrency = Math.min(3, imgs.length)
      for (let c = 0; c < concurrency; c++) void runOne()
    }

    function paint() {
      el.innerHTML = `
        <button class="btn btn-ghost back-btn" id="back">← 全部文章</button>
        <article class="reader">
          <div class="reader-head">
            <span class="reader-emoji">${article.emoji}</span>
            <div>
              <h1>${esc(article.title)}</h1>
              <p class="reader-sub">${esc(article.titleZh)} · ${esc(article.category)} · ${article.level}</p>
            </div>
          </div>

          ${
            isTTSSupported()
              ? `<div class="listen-bar">
                  <button class="btn btn-secondary btn-sm" id="play-normal">🔊 正常朗读</button>
                  <button class="btn btn-secondary btn-sm" id="play-slow">🐢 慢速</button>
                  <button class="btn btn-ghost btn-sm" id="stop-tts">⏹ 停止</button>
                  <label class="zh-toggle"><input type="checkbox" id="zh" ${showZh ? 'checked' : ''}/> 中文</label>
                </div>
                <p class="listen-hint">💡 点任意句子可单独重复朗读，方便跟读</p>`
              : `<div class="card voice-warn">此浏览器不支持朗读，建议用 Chrome / Edge</div>`
          }

          <div class="reader-body pb-book ${illoOn ? 'has-illo' : ''}">
            ${article.paragraphs
              .map(
                (p, i) => `
              <section class="pb-page" data-idx="${i}">
                ${illoOn ? `<div class="pb-img-wrap"><img class="pb-img" data-idx="${i}" alt="" /></div>` : ''}
                <div class="pb-text">
                  <p class="reader-para">${splitSentences(p)
                    .map(
                      (s) =>
                        `<span class="sentence" data-say="${escAttr(s)}">${esc(s)} </span>`,
                    )
                    .join('')}</p>
                  ${showZh ? `<p class="reader-zh">${esc(article.translation[i] ?? '')}</p>` : ''}
                </div>
              </section>`,
              )
              .join('')}
          </div>

          <div class="vocab-box">
            <h3>📌 重点词汇</h3>
            <div class="vocab-grid">
              ${article.vocab
                .map(
                  (v) => `
                <div class="vocab-item">
                  <button class="vocab-say" data-say="${escAttr(v.word)}" title="朗读">🔊</button>
                  <div><b>${esc(v.word)}</b><span>${esc(v.meaning)}</span></div>
                  <button class="vocab-add" data-w="${escAttr(v.word)}" data-m="${escAttr(v.meaning)}" title="收藏">＋</button>
                </div>`,
                )
                .join('')}
            </div>
          </div>

          <div class="reader-action-row">
            <button class="btn btn-secondary btn-block" id="co-read-start">
              👨‍👩‍👧 亲子共读
            </button>
            <button class="btn btn-primary btn-block discuss-btn" id="discuss">
              💬 和 Fox 聊聊这篇
            </button>
          </div>
        </article>
      `

      el.querySelector('#back')?.addEventListener('click', () => {
        tts.stopSpeaking()
        list()
      })
      el.querySelector('#play-normal')?.addEventListener('click', () =>
        tts.speakLong(plainText(article), 0.95),
      )
      el.querySelector('#play-slow')?.addEventListener('click', () =>
        tts.speakLong(plainText(article), 0.6),
      )
      el.querySelector('#stop-tts')?.addEventListener('click', () =>
        tts.stopSpeaking(),
      )
      el.querySelector('#zh')?.addEventListener('change', (e) => {
        showZh = (e.target as HTMLInputElement).checked
        paint()
      })
      el.querySelectorAll('.sentence, .vocab-say').forEach((s) =>
        s.addEventListener('click', () =>
          tts.speak((s as HTMLElement).dataset.say ?? '', 'en-US', 0.85),
        ),
      )
      el.querySelectorAll('.vocab-add').forEach((b) =>
        b.addEventListener('click', () => {
          const btn = b as HTMLElement
          storage.addSavedWords([{ word: btn.dataset.w!, meaning: btn.dataset.m! }])
          btn.textContent = '✓'
          btn.classList.add('added')
        }),
      )
      el.querySelector('#discuss')?.addEventListener('click', () => {
        tts.stopSpeaking()
        startArticleDiscussion(article.id)
      })
      el.querySelector('#co-read-start')?.addEventListener('click', () => {
        tts.stopSpeaking()
        coReadIdx = 0
        paintCoRead()
      })

      loadIllustrations()
    }

    function paintCoRead() {
      const total = article.paragraphs.length
      const para = article.paragraphs[coReadIdx]
      const isA = coReadIdx % 2 === 0
      const roleLabel = isA ? '📖 大人读' : '🧒 孩子读'
      const roleClass = isA ? 'co-role-a' : 'co-role-b'
      const progress = Math.round(((coReadIdx + 1) / total) * 100)
      const isFirst = coReadIdx === 0
      const isLast = coReadIdx === total - 1
      const zhLine =
        showZh && article.translation[coReadIdx]
          ? `<p class="reader-zh co-zh">${esc(article.translation[coReadIdx])}</p>`
          : ''

      el.innerHTML = `
        <button class="btn btn-ghost back-btn" id="co-back">← 返回文章</button>
        <div class="reader" style="padding-top:0.25rem">
          <div class="co-read-header">
            <h2 class="co-read-title">${esc(article.emoji)} ${esc(article.title)}</h2>
            <div class="co-progress-row">
              <div class="co-progress-bar"><div class="co-progress-fill" style="width:${progress}%"></div></div>
              <span class="co-progress-text">${coReadIdx + 1} / ${total}</span>
            </div>
          </div>

          <div class="co-slide ${roleClass}">
            <span class="co-badge">${roleLabel}</span>
            <div class="co-text">
              <p class="reader-para">${splitSentences(para)
                .map((s) => `<span class="sentence co-sentence" data-say="${escAttr(s)}">${esc(s)} </span>`)
                .join('')}</p>
              ${zhLine}
            </div>
            <button class="btn btn-ghost co-play-btn" id="co-play">🔊 朗读这段</button>
          </div>

          <div class="co-nav">
            <button class="btn btn-secondary" id="co-prev" ${isFirst ? 'disabled' : ''}>← 上一段</button>
            ${isLast
              ? `<button class="btn btn-primary" id="co-done">🎉 读完啦！</button>`
              : `<button class="btn btn-primary" id="co-next">下一段 →</button>`
            }
          </div>

          <label class="co-zh-toggle">
            <input type="checkbox" id="co-zh" ${showZh ? 'checked' : ''}/> 显示中文
          </label>
        </div>
      `

      el.querySelector('#co-back')?.addEventListener('click', () => {
        tts.stopSpeaking()
        coReadIdx = -1
        paint()
      })
      el.querySelector('#co-play')?.addEventListener('click', () =>
        tts.speakLong(para, 0.85),
      )
      el.querySelectorAll('.co-sentence').forEach((s) =>
        s.addEventListener('click', () =>
          tts.speak((s as HTMLElement).dataset.say ?? '', 'en-US', 0.85),
        ),
      )
      el.querySelector('#co-prev')?.addEventListener('click', () => {
        tts.stopSpeaking()
        coReadIdx--
        paintCoRead()
      })
      el.querySelector('#co-next')?.addEventListener('click', () => {
        tts.stopSpeaking()
        coReadIdx++
        paintCoRead()
      })
      el.querySelector('#co-done')?.addEventListener('click', () => {
        tts.stopSpeaking()
        showCelebration()
      })
      el.querySelector('#co-zh')?.addEventListener('change', (e) => {
        showZh = (e.target as HTMLInputElement).checked
        paintCoRead()
      })
    }

    function showCelebration() {
      el.innerHTML = `
        <div class="co-celebration">
          <div class="co-celeb-emoji">🎉</div>
          <h2>太棒了！</h2>
          <p>你们一起读完了<br><b>《${esc(article.title)}》</b></p>
          <div class="co-celeb-stars">⭐ ⭐ ⭐</div>
          <button class="btn btn-primary btn-block" id="co-finish" style="max-width:280px">回到文章</button>
          <button class="btn btn-ghost btn-block" id="co-discuss" style="max-width:280px">💬 和 Fox 聊聊这篇</button>
        </div>
      `
      el.querySelector('#co-finish')?.addEventListener('click', () => {
        coReadIdx = -1
        paint()
      })
      el.querySelector('#co-discuss')?.addEventListener('click', () => {
        tts.stopSpeaking()
        startArticleDiscussion(article.id)
      })
    }

    paint()
  }

  // Deep-link from Home's "read today" card.
  const pending = sessionStorage.getItem('ei_open_article')
  if (pending) {
    sessionStorage.removeItem('ei_open_article')
    const a = articleById(pending)
    if (a) reader(a)
    else list()
  } else {
    list()
  }

  return el
}

function plainText(a: Article): string {
  return a.paragraphs.join(' ')
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;')
}
