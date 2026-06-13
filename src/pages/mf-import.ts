import { getEpisodeMeta } from '../data/modern-family'
import { mfStorage } from '../storage/mf-imports'
import { parseSrt } from '../utils/srt-parser'
import { renderTvViewer } from './tv-viewer'

export function renderMfImport(episodeId: string, onBack: () => void): HTMLElement {
  const meta = getEpisodeMeta(episodeId)
  const el = document.createElement('div')
  el.className = 'page mf-import-page'

  let srtFile: File | null = null
  let stillFiles: File[] = []
  let status = ''
  let importing = false

  function render() {
    if (!meta) {
      el.innerHTML = '<p>集数不存在</p>'
      return
    }

    el.innerHTML = `
      <button class="btn btn-ghost back-btn" id="back">← 第 ${meta.season} 季</button>
      <header class="page-header">
        <h1>S${String(meta.season).padStart(2, '0')}E${String(meta.episode).padStart(2, '0')} · ${esc(meta.title)}</h1>
        <p class="subtitle">${esc(meta.titleZh)}</p>
      </header>

      <div class="card import-card">
        <div class="import-notice">
          <strong>📺 原台词 + 剧照，需要你自己导入</strong>
          <p>完整字幕和官方剧照有版权，应用不能内置。请从<strong>你已合法购买/订阅</strong>的片源导出字幕（.srt）和截图，仅在本机学习使用。</p>
        </div>

        <div class="import-step">
          <h3>① 导入英文字幕 (.srt)</h3>
          <p class="hint">字幕里的台词会<strong>一字不差</strong>按原样显示，像看电视一样逐句播放。</p>
          <label class="file-drop">
            <input type="file" id="srt-file" accept=".srt,text/plain" hidden />
            <span>${srtFile ? `✓ ${esc(srtFile.name)}` : '点击选择 .srt 字幕文件'}</span>
          </label>
        </div>

        <div class="import-step">
          <h3>② 导入剧照（可选，可多选）</h3>
          <p class="hint">从你正在看的视频里截图，或导出官方 stills。多张会随台词进度自动切换背景。</p>
          <label class="file-drop">
            <input type="file" id="still-files" accept="image/*" multiple hidden />
            <span>${stillFiles.length ? `✓ 已选 ${stillFiles.length} 张图片` : '点击选择剧照（jpg/png）'}</span>
          </label>
        </div>

        <div class="import-actions">
          <button class="btn btn-primary" id="import-btn" ${!srtFile || importing ? 'disabled' : ''}>
            ${importing ? '导入中…' : '保存并开始看'}
          </button>
          ${status ? `<p class="import-status">${esc(status)}</p>` : ''}
        </div>
      </div>

      <details class="import-help card">
        <summary>如何获取字幕和截图？</summary>
        <ul>
          <li><strong>字幕</strong>：播放你购买的 DVD / 流媒体时，用播放器导出英文字幕，或搜索 "Modern Family S01E01 english.srt" 仅作个人学习（请遵守当地法律与平台条款）。</li>
          <li><strong>剧照</strong>：观看时按 Pause 截图（Win: Win+Shift+S），或从 Disc 附赠素材提取。</li>
          <li>导入后数据只存在<strong>你的浏览器</strong>，不会上传。</li>
        </ul>
      </details>
    `

    bindEvents()
  }

  function bindEvents() {
    el.querySelector('#back')?.addEventListener('click', onBack)
    el.querySelector('#srt-file')?.addEventListener('change', (e) => {
      const f = (e.target as HTMLInputElement).files?.[0]
      srtFile = f ?? null
      status = ''
      render()
    })
    el.querySelector('#still-files')?.addEventListener('change', (e) => {
      stillFiles = Array.from((e.target as HTMLInputElement).files ?? [])
      render()
    })
    el.querySelector('#import-btn')?.addEventListener('click', doImport)
  }

  async function doImport() {
    if (!srtFile || !meta) return
    importing = true
    status = '正在解析字幕…'
    render()

    try {
      const raw = await mfStorage.readFileAsText(srtFile)
      const cues = parseSrt(raw)
      if (cues.length === 0) {
        status = '❌ 未能解析到台词，请确认是英文 .srt 文件'
        importing = false
        render()
        return
      }

      status = '正在保存剧照…'
      render()
      const stillImages = stillFiles.length
        ? await mfStorage.filesToDataUrls(stillFiles)
        : []

      await mfStorage.save({
        episodeId,
        season: meta.season,
        episode: meta.episode,
        title: meta.title,
        titleZh: meta.titleZh,
        importedAt: Date.now(),
        cues,
        backdropImage: stillImages[0],
        stillImages,
      })

      el.innerHTML = ''
      el.appendChild(renderTvViewer(episodeId, onBack))
    } catch (err) {
      status = `❌ ${err instanceof Error ? err.message : '导入失败'}`
      importing = false
      render()
    }
  }

  render()
  return el
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
