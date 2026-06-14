import { ARTICLES, articleById, splitSentences } from '../data/articles'
import type { Article } from '../data/articles'
import { storage } from '../storage'
import { VoiceHelper, isTTSSupported } from '../voice/speech'
import { startArticleDiscussion } from './voice'

const tts = new VoiceHelper()

export function renderReading(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page reading-page'

  function list() {
    tts.stopSpeaking()
    const read = new Set(storage.getReadArticles())
    el.innerHTML = `
      <header class="page-header">
        <h1>📖 每日阅读</h1>
        <p class="subtitle">300–800 词的小故事，读完和 Fox 聊聊</p>
      </header>
      <div class="article-list">
        ${ARTICLES.map(
          (a) => `
          <button class="article-card" data-id="${a.id}">
            <span class="article-emoji">${a.emoji}</span>
            <div class="article-info">
              <div class="article-tags">
                <span class="tag">${esc(a.category)}</span>
                <span class="tag tag-soft">${a.level}</span>
                <span class="tag tag-soft">${a.words} 词</span>
                ${read.has(a.id) ? '<span class="tag tag-done">✓ 读过</span>' : ''}
              </div>
              <h3>${esc(a.title)} · ${esc(a.titleZh)}</h3>
              <p>${esc(a.hook)}</p>
            </div>
          </button>`,
        ).join('')}
      </div>
    `
    el.querySelectorAll('.article-card').forEach((c) =>
      c.addEventListener('click', () =>
        reader(articleById((c as HTMLElement).dataset.id!)!),
      ),
    )
  }

  function reader(article: Article) {
    tts.stopSpeaking()
    storage.markArticleRead(article.id)
    let showZh = false

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

          <div class="reader-body">
            ${article.paragraphs
              .map(
                (p, i) => `
              <p class="reader-para">${splitSentences(p)
                .map(
                  (s) =>
                    `<span class="sentence" data-say="${escAttr(s)}">${esc(s)} </span>`,
                )
                .join('')}</p>
              ${showZh ? `<p class="reader-zh">${esc(article.translation[i] ?? '')}</p>` : ''}`,
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

          <button class="btn btn-primary btn-block discuss-btn" id="discuss">
            💬 和 Fox 聊聊这篇
          </button>
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
