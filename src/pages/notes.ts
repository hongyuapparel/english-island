import { storage } from '../storage'

export function renderNotes(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'page notes-page'

  function refresh() {
    const notes = storage.getErrorNotes()
    el.innerHTML = `
      <header class="page-header">
        <h1>错句本</h1>
        <p class="subtitle">对话中收藏的错误和纠正，方便日后复习</p>
      </header>

      ${
        notes.length === 0
          ? `<div class="card empty-state">
              <p>还没有收藏任何错句</p>
              <p class="hint">在对话页面选中 AI 回复中的内容，点击「收藏到错句本」即可添加</p>
            </div>`
          : `<div class="notes-list">
              ${notes
                .map(
                  (n) => `
                <div class="card note-card" data-id="${n.id}">
                  <div class="note-meta">${formatDate(n.createdAt)}</div>
                  ${n.original ? `<div class="note-row"><span class="label wrong">原句</span><p>${esc(n.original)}</p></div>` : ''}
                  ${n.corrected ? `<div class="note-row"><span class="label right">纠正</span><p>${esc(n.corrected)}</p></div>` : ''}
                  <div class="note-row"><span class="label">说明</span><p>${esc(n.explanation)}</p></div>
                  <button class="btn btn-ghost btn-sm delete-note" data-id="${n.id}">删除</button>
                </div>
              `,
                )
                .join('')}
            </div>`
      }
    `

    el.querySelectorAll('.delete-note').forEach((btn) => {
      btn.addEventListener('click', () => {
        storage.deleteErrorNote((btn as HTMLElement).dataset.id!)
        refresh()
      })
    })
  }

  refresh()
  return el
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN')
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
