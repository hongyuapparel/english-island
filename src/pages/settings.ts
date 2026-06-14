import type { AiProvider, AiSettings } from '../types'
import { storage } from '../storage'
import { fetchOllamaModels } from '../ai/chat'
import { VoiceHelper } from '../voice/speech'
import { GEMINI_VOICES, neuralSpeak, useNeuralVoice } from '../voice/neural-tts'

const previewVoice = new VoiceHelper()
const PREVIEW_LINE = "Hi! I'm Fox. Welcome to English Island — let's read a story together."

export function renderSettings(): HTMLElement {
  const settings = storage.getAiSettings()
  const el = document.createElement('div')
  el.className = 'page settings-page'

  el.innerHTML = `
    <header class="page-header">
      <h1>AI 设置</h1>
      <p class="subtitle">支持免费方案：本地 Ollama 或 Google Gemini 免费 API</p>
    </header>

    <form class="card form-grid" id="settings-form">
      <div class="field full">
        <label for="provider">AI 提供商</label>
        <select id="provider">
          <option value="ollama" ${settings.provider === 'ollama' ? 'selected' : ''}>Ollama（本地免费，推荐）</option>
          <option value="gemini" ${settings.provider === 'gemini' ? 'selected' : ''}>Google Gemini（免费 API Key）</option>
        </select>
      </div>

      <div id="ollama-section" class="provider-section full">
        <h3>Ollama 配置</h3>
        <p class="hint">安装 <a href="https://ollama.com" target="_blank" rel="noopener">Ollama</a> 后运行 <code>ollama pull qwen2.5:7b</code></p>
        <div class="field">
          <label for="ollamaBaseUrl">服务地址</label>
          <input id="ollamaBaseUrl" type="text" value="${esc(settings.ollamaBaseUrl)}" />
        </div>
        <div class="field">
          <label for="ollamaModel">模型</label>
          <div class="input-row">
            <input id="ollamaModel" type="text" value="${esc(settings.ollamaModel)}" placeholder="qwen2.5:7b" />
            <button type="button" class="btn btn-secondary" id="fetch-models">检测模型</button>
          </div>
          <div id="model-list" class="model-list"></div>
        </div>
        <div id="ollama-status" class="status-msg"></div>
      </div>

      <div id="gemini-section" class="provider-section full">
        <h3>Gemini 配置</h3>
        <p class="hint">在 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a> 免费申请 API Key</p>
        <div class="field full">
          <label for="geminiApiKey">API Key</label>
          <input id="geminiApiKey" type="password" value="${esc(settings.geminiApiKey)}" placeholder="AIza..." autocomplete="off" />
        </div>
        <div class="field">
          <label for="geminiModel">模型</label>
          <select id="geminiModel">
            <option value="gemini-2.0-flash" ${settings.geminiModel === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash（推荐）</option>
            <option value="gemini-2.0-flash-lite" ${settings.geminiModel === 'gemini-2.0-flash-lite' ? 'selected' : ''}>gemini-2.0-flash-lite（更快）</option>
            <option value="gemini-1.5-flash" ${settings.geminiModel === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash</option>
          </select>
        </div>
      </div>

      <div class="provider-section full">
        <h3>🔊 朗读语音</h3>
        <p class="hint">自然语音用 Gemini 合成，温暖有感情（需填上面的 Key）；没有 Key 时自动用系统语音。</p>
        <div class="field">
          <label for="ttsVoice">语音类型</label>
          <select id="ttsVoice">
            <option value="natural" ${settings.ttsVoice === 'natural' ? 'selected' : ''}>自然语音（Gemini，推荐）</option>
            <option value="system" ${settings.ttsVoice === 'system' ? 'selected' : ''}>系统语音（免 Key，离线）</option>
          </select>
        </div>
        <div class="field">
          <label for="geminiVoiceName">音色</label>
          <div class="input-row">
            <select id="geminiVoiceName">
              ${GEMINI_VOICES.map(
                (v) =>
                  `<option value="${esc(v.name)}" ${settings.geminiVoiceName === v.name ? 'selected' : ''}>${esc(v.name)}（${esc(v.zh)}）</option>`,
              ).join('')}
            </select>
            <button type="button" class="btn btn-secondary" id="preview-voice">🔊 试听</button>
          </div>
          <div id="voice-status" class="status-msg"></div>
        </div>
      </div>

      <div class="form-actions full">
        <button type="submit" class="btn btn-primary">保存设置</button>
        <span id="save-status" class="save-status"></span>
      </div>
    </form>
  `

  const providerSelect = el.querySelector('#provider') as HTMLSelectElement
  const ollamaSection = el.querySelector('#ollama-section') as HTMLElement
  const geminiSection = el.querySelector('#gemini-section') as HTMLElement

  function toggleSections() {
    const isOllama = providerSelect.value === 'ollama'
    ollamaSection.style.display = isOllama ? 'block' : 'none'
    geminiSection.style.display = isOllama ? 'none' : 'block'
  }
  toggleSections()
  providerSelect.addEventListener('change', toggleSections)

  el.querySelector('#fetch-models')!.addEventListener('click', async () => {
    const status = el.querySelector('#ollama-status')!
    const list = el.querySelector('#model-list')!
    const baseUrl = (el.querySelector('#ollamaBaseUrl') as HTMLInputElement).value.trim()
    status.textContent = '检测中...'
    status.className = 'status-msg'
    try {
      const models = await fetchOllamaModels(baseUrl)
      if (models.length === 0) {
        status.textContent = '未找到模型，请先运行 ollama pull'
        status.className = 'status-msg error'
        list.innerHTML = ''
        return
      }
      status.textContent = `✓ 已连接，找到 ${models.length} 个模型`
      status.className = 'status-msg success'
      list.innerHTML = models
        .map((m) => `<button type="button" class="model-chip" data-model="${esc(m)}">${esc(m)}</button>`)
        .join('')
      list.querySelectorAll('.model-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          ;(el.querySelector('#ollamaModel') as HTMLInputElement).value = (
            chip as HTMLElement
          ).dataset.model!
        })
      })
    } catch (err) {
      status.textContent = err instanceof Error ? err.message : '连接失败'
      status.className = 'status-msg error'
      list.innerHTML = ''
    }
  })

  function readForm(): AiSettings {
    return {
      provider: providerSelect.value as AiProvider,
      ollamaBaseUrl: (el.querySelector('#ollamaBaseUrl') as HTMLInputElement).value.trim(),
      ollamaModel: (el.querySelector('#ollamaModel') as HTMLInputElement).value.trim(),
      geminiApiKey: (el.querySelector('#geminiApiKey') as HTMLInputElement).value.trim(),
      geminiModel: (el.querySelector('#geminiModel') as HTMLSelectElement).value,
      ttsVoice: (el.querySelector('#ttsVoice') as HTMLSelectElement).value as AiSettings['ttsVoice'],
      geminiVoiceName: (el.querySelector('#geminiVoiceName') as HTMLSelectElement).value,
    }
  }

  el.querySelector('#preview-voice')!.addEventListener('click', () => {
    const s = readForm()
    const status = el.querySelector('#voice-status')!
    if (s.ttsVoice === 'natural' && !s.geminiApiKey) {
      status.textContent = '自然语音需要先填 Gemini API Key'
      status.className = 'status-msg error'
      return
    }
    status.textContent = '试听中…'
    status.className = 'status-msg'
    if (useNeuralVoice(s)) {
      neuralSpeak(PREVIEW_LINE, s, 'warm')
        .then(() => (status.textContent = ''))
        .catch(() => {
          status.textContent = '自然语音失败，已用系统语音（检查 Key / 网络）'
          status.className = 'status-msg error'
          previewVoice.speak(PREVIEW_LINE, 'en-US', 0.9)
        })
    } else {
      previewVoice.speak(PREVIEW_LINE, 'en-US', 0.9)
      status.textContent = ''
    }
  })

  const form = el.querySelector('#settings-form') as HTMLFormElement
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    storage.saveAiSettings(readForm())
    const status = el.querySelector('#save-status')!
    status.textContent = '✓ 已保存'
    setTimeout(() => (status.textContent = ''), 2000)
  })

  return el
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
