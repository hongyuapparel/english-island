import { storage } from '../storage'
import { renderSettings } from './settings'
import { AGENT_NAME } from '../types'

export function renderMe(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page me-page'

  function refresh() {
    const profile = storage.getProfile()
    const stats = storage.getStats()
    const words = storage.getSavedWords()
    const summaries = storage.getSummaries()
    const notes = storage.getErrorNotes()

    el.innerHTML = `
      <header class="page-header">
        <h1>👤 我的</h1>
        <p class="subtitle">${AGENT_NAME} 眼中的你，会随着你们的相处不断更新</p>
      </header>

      <section class="card profile-card">
        <div class="profile-top">
          <div class="profile-name">${profile.name ? esc(profile.name) : '还没告诉我名字'}</div>
          <div class="profile-level">${profile.level === 'unknown' ? '水平识别中' : 'CEFR ' + profile.level}</div>
        </div>
        <div class="profile-stats">
          <div><b>${stats.streak}</b><span>连续天数</span></div>
          <div><b>${stats.totalMessages}</b><span>累计对话</span></div>
          <div><b>${words.length}</b><span>单词本</span></div>
        </div>
        ${
          profile.interests.length
            ? `<div class="profile-block"><span class="profile-key">兴趣</span><div class="chips">${profile.interests
                .map((i) => `<span class="chip">${esc(i)}</span>`)
                .join('')}</div></div>`
            : ''
        }
        ${
          profile.goals
            ? `<div class="profile-block"><span class="profile-key">目标</span><p>${esc(profile.goals)}</p></div>`
            : ''
        }
        ${
          profile.learnedFacts.length
            ? `<div class="profile-block"><span class="profile-key">${AGENT_NAME} 记得</span><ul class="facts">${profile.learnedFacts
                .slice(-8)
                .map((f) => `<li>${esc(f)}</li>`)
                .join('')}</ul></div>`
            : `<p class="hint">多和 ${AGENT_NAME} 聊聊，它会慢慢记住关于你的事。</p>`
        }
      </section>

      <section class="me-section">
        <h2>📒 单词本 <span class="count">${words.length}</span></h2>
        ${
          words.length === 0
            ? `<p class="hint">阅读时点「＋」，或聊完总结，新词会自动收藏到这里。</p>`
            : `<div class="word-list">${words
                .slice(0, 60)
                .map(
                  (w) => `
              <div class="word-row">
                <button class="word-x" data-w="${escAttr(w.word)}" title="删除">✕</button>
                <b>${esc(w.word)}</b><span>${esc(w.meaning)}</span>
              </div>`,
                )
                .join('')}</div>`
        }
      </section>

      ${
        summaries.length
          ? `<section class="me-section">
              <h2>🪞 历史小结 <span class="count">${summaries.length}</span></h2>
              <div class="summary-history">
                ${summaries
                  .slice(0, 5)
                  .map(
                    (s) => `
                  <div class="card mini-summary">
                    <div class="note-meta">${formatDate(s.createdAt)}</div>
                    ${s.encouragement ? `<p>🌟 ${esc(s.encouragement)}</p>` : ''}
                    ${s.commonMistakes.length ? `<p class="hint">📍 ${esc(s.commonMistakes[0])}</p>` : ''}
                  </div>`,
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      ${
        notes.length
          ? `<section class="me-section">
              <h2>📝 错句本 <span class="count">${notes.length}</span></h2>
              <div class="notes-list">
                ${notes
                  .slice(0, 20)
                  .map(
                    (n) => `
                  <div class="card note-card">
                    ${n.original ? `<div class="note-row"><span class="label wrong">原句</span><p>${esc(n.original)}</p></div>` : ''}
                    ${n.corrected ? `<div class="note-row"><span class="label right">纠正</span><p>${esc(n.corrected)}</p></div>` : ''}
                    ${n.explanation ? `<div class="note-row"><span class="label">说明</span><p>${esc(n.explanation)}</p></div>` : ''}
                  </div>`,
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      <section class="me-section" id="settings-host">
        <h2>⚙️ AI 设置</h2>
      </section>
    `

    el.querySelectorAll('.word-x').forEach((b) =>
      b.addEventListener('click', () => {
        storage.deleteSavedWord((b as HTMLElement).dataset.w!)
        refresh()
      }),
    )

    el.querySelector('#settings-host')?.appendChild(renderSettings())
  }

  refresh()
  return el
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('zh-CN')
}
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
