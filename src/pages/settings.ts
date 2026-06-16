import type { AiProvider, AiSettings } from '../types'
import { storage } from '../storage'
import { fetchOllamaModels } from '../ai/chat'
import { VoiceHelper } from '../voice/speech'
import { FREE_VOICES, GEMINI_VOICES, OPENAI_VOICES, neuralSpeak, useNeuralVoice } from '../voice/neural-tts'

const previewVoice = new VoiceHelper()
const PREVIEW_LINE = "Hi! I'm Fox. Welcome to English Island — let's read a story together."

function voiceOptions(mode: AiSettings['ttsVoice'], settings: AiSettings): string {
  const list = mode === 'free' ? FREE_VOICES : mode === 'openai' ? OPENAI_VOICES : GEMINI_VOICES
  const cur =
    mode === 'free' ? settings.freeVoice : mode === 'openai' ? settings.openaiVoice : settings.geminiVoiceName
  return list
    .map(
      (v) =>
        `<option value="${esc(v.name)}" ${cur === v.name ? 'selected' : ''}>${esc(v.name)}（${esc(v.zh)}）</option>`,
    )
    .join('')
}

export function renderSettings(): HTMLElement {
  const settings = storage.getAiSettings()
  const el = document.createElement('div')
  el.className = 'page settings-page'

  el.innerHTML = `
    <header class="page-header">
      <h1>AI 设置</h1>
      <p class="subtitle">默认用免费 AI，无需 Key 即可对话和朗读</p>
    </header>

    <form class="card form-grid" id="settings-form">
      <div class="field full">
        <label for="provider">对话 AI</label>
        <select id="provider">
          <option value="openai" ${settings.provider === 'openai' ? 'selected' : ''}>OpenAI 兼容 / AIHubMix（用你的 Key，推荐）</option>
          <option value="free" ${settings.provider === 'free' ? 'selected' : ''}>免费 AI（无需 Key）</option>
          <option value="gemini" ${settings.provider === 'gemini' ? 'selected' : ''}>Google Gemini（需 API Key）</option>
          <option value="ollama" ${settings.provider === 'ollama' ? 'selected' : ''}>Ollama（本地，仅电脑）</option>
        </select>
      </div>

      <div id="free-section" class="provider-section full">
        <p class="hint">✅ 免费 AI 已就绪，直接到「对话」开聊。它是公共免费服务，偶尔会慢或排队。</p>
      </div>

      <div id="openai-section" class="provider-section full">
        <h3>OpenAI 兼容 / AIHubMix</h3>
        <p class="hint">填入你的 AIHubMix Key。模型可填 <code>gpt-4o-mini</code>、<code>deepseek-chat</code>、<code>gemini-2.0-flash</code> 等。</p>
        <div class="field full">
          <label for="openaiBaseUrl">接口地址</label>
          <input id="openaiBaseUrl" type="text" value="${esc(settings.openaiBaseUrl)}" placeholder="https://aihubmix.com/v1" />
        </div>
        <div class="field full">
          <label for="openaiApiKey">API Key</label>
          <input id="openaiApiKey" type="password" value="${esc(settings.openaiApiKey)}" placeholder="sk-..." autocomplete="off" />
        </div>
        <div class="field">
          <label for="openaiModel">模型</label>
          <input id="openaiModel" type="text" value="${esc(settings.openaiModel)}" placeholder="gpt-4o-mini" />
        </div>
      </div>

      <div id="ollama-section" class="provider-section full">
        <h3>Ollama 配置</h3>
        <p class="hint">安装 <a href="https://ollama.com" target="_blank" rel="noopener">Ollama</a> 后运行 <code>ollama pull qwen2.5:7b</code>（仅在电脑本机可用）</p>
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
        <p class="hint">在 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a> 申请 API Key（部分地区/账号需开通计费）</p>
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
        <p class="hint">「AIHubMix 热情语音」用升级版 gpt-4o-mini-tts，带感情、抑扬顿挫，且进故事时会<b>提前生成好整段语音</b>，朗读时即时播放、几乎无延迟（用你的 AIHubMix Key，推荐）。音色可选 coral（热情女声）。<br>「系统语音」离线最稳但偏平；想本地更好听可在 iPhone「设置→辅助功能→朗读内容→声音→英语」下载"增强"女声。</p>
        <button type="button" class="btn btn-primary" id="sound-test" style="width:100%;margin-bottom:0.6rem;">🔊 点我测试声音</button>
        <div id="sound-test-status" class="status-msg" style="margin-bottom:0.6rem;"></div>
        <div class="field">
          <label for="ttsVoice">语音类型</label>
          <select id="ttsVoice">
            <option value="openai" ${settings.ttsVoice === 'openai' ? 'selected' : ''}>AIHubMix 热情语音（推荐·已升级带感情）</option>
            <option value="natural" ${settings.ttsVoice === 'natural' ? 'selected' : ''}>Gemini 语音 Sulafat（热情·需 Key）</option>
            <option value="system" ${settings.ttsVoice === 'system' ? 'selected' : ''}>系统语音（离线最稳，但偏平）</option>
            <option value="free" ${settings.ttsVoice === 'free' ? 'selected' : ''}>自然语音 Polly（免费）</option>
          </select>
        </div>
        <div class="field" id="voice-field">
          <label for="voiceName">音色</label>
          <div class="input-row">
            <select id="voiceName">${voiceOptions(settings.ttsVoice === 'system' ? 'free' : settings.ttsVoice, settings)}</select>
            <button type="button" class="btn btn-secondary" id="preview-voice">🔊 试听</button>
          </div>
          <div id="voice-status" class="status-msg"></div>
        </div>
      </div>

      <div class="provider-section full">
        <h3>🎨 绘本配图</h3>
        <p class="hint">开启后，读文章时会用 AIHubMix 按<b>每段内容</b>生成钢笔淡彩插画，做成绘本（需 AIHubMix Key）。图片会缓存，每张只生成一次。注意：生成图片会按你的 AIHubMix 用量计费，且每张约需若干秒。</p>
        <label class="zh-toggle"><input type="checkbox" id="illustrate" ${storage.getIllustrate() ? 'checked' : ''}/> 开启绘本配图</label>
      </div>

      <div class="form-actions full">
        <button type="submit" class="btn btn-primary">保存设置</button>
        <span id="save-status" class="save-status"></span>
      </div>
    </form>
  `

  const providerSelect = el.querySelector('#provider') as HTMLSelectElement
  const freeSection = el.querySelector('#free-section') as HTMLElement
  const openaiSection = el.querySelector('#openai-section') as HTMLElement
  const ollamaSection = el.querySelector('#ollama-section') as HTMLElement
  const geminiSection = el.querySelector('#gemini-section') as HTMLElement
  const ttsSelect = el.querySelector('#ttsVoice') as HTMLSelectElement
  const voiceField = el.querySelector('#voice-field') as HTMLElement
  const voiceSelect = el.querySelector('#voiceName') as HTMLSelectElement

  function toggleSections() {
    const p = providerSelect.value
    freeSection.style.display = p === 'free' ? 'block' : 'none'
    openaiSection.style.display = p === 'openai' ? 'block' : 'none'
    ollamaSection.style.display = p === 'ollama' ? 'block' : 'none'
    geminiSection.style.display = p === 'gemini' ? 'block' : 'none'
  }
  toggleSections()
  providerSelect.addEventListener('change', toggleSections)

  function toggleVoice() {
    const mode = ttsSelect.value as AiSettings['ttsVoice']
    voiceField.style.display = mode === 'system' ? 'none' : 'block'
    if (mode !== 'system') voiceSelect.innerHTML = voiceOptions(mode, settings)
  }
  toggleVoice()
  ttsSelect.addEventListener('change', toggleVoice)

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
          ;(el.querySelector('#ollamaModel') as HTMLInputElement).value = (chip as HTMLElement).dataset.model!
        })
      })
    } catch (err) {
      status.textContent = err instanceof Error ? err.message : '连接失败'
      status.className = 'status-msg error'
      list.innerHTML = ''
    }
  })

  function readForm(): AiSettings {
    const mode = ttsSelect.value as AiSettings['ttsVoice']
    const pickedVoice = voiceSelect.value
    return {
      provider: providerSelect.value as AiProvider,
      ollamaBaseUrl: (el.querySelector('#ollamaBaseUrl') as HTMLInputElement).value.trim(),
      ollamaModel: (el.querySelector('#ollamaModel') as HTMLInputElement).value.trim(),
      geminiApiKey: (el.querySelector('#geminiApiKey') as HTMLInputElement).value.trim(),
      geminiModel: (el.querySelector('#geminiModel') as HTMLSelectElement).value,
      openaiBaseUrl: (el.querySelector('#openaiBaseUrl') as HTMLInputElement).value.trim(),
      openaiApiKey: (el.querySelector('#openaiApiKey') as HTMLInputElement).value.trim(),
      openaiModel: (el.querySelector('#openaiModel') as HTMLInputElement).value.trim(),
      ttsVoice: mode,
      geminiVoiceName: mode === 'natural' ? pickedVoice : settings.geminiVoiceName,
      freeVoice: mode === 'free' ? pickedVoice : settings.freeVoice,
      openaiVoice: mode === 'openai' ? pickedVoice : settings.openaiVoice,
    }
  }

  el.querySelector('#preview-voice')!.addEventListener('click', () => {
    const s = readForm()
    const status = el.querySelector('#voice-status')!
    if (s.ttsVoice === 'natural' && !s.geminiApiKey) {
      status.textContent = 'Gemini 语音需要先填 API Key'
      status.className = 'status-msg error'
      return
    }
    if (s.ttsVoice === 'openai' && !s.openaiApiKey) {
      status.textContent = 'OpenAI 语音需要先填 AIHubMix / OpenAI Key'
      status.className = 'status-msg error'
      return
    }
    status.textContent = '试听中…'
    status.className = 'status-msg'
    if (useNeuralVoice(s)) {
      neuralSpeak(PREVIEW_LINE, s, 'warm')
        .then(() => (status.textContent = ''))
        .catch(() => {
          status.textContent = '语音失败，已用系统语音（检查网络）'
          status.className = 'status-msg error'
          previewVoice.speak(PREVIEW_LINE, 'en-US', 0.9)
        })
    } else {
      previewVoice.speak(PREVIEW_LINE, 'en-US', 0.9)
      status.textContent = ''
    }
  })

  el.querySelector('#sound-test')!.addEventListener('click', () => {
    const s = readForm()
    const status = el.querySelector('#sound-test-status')!
    const path =
      s.ttsVoice === 'system'
        ? '系统语音'
        : s.ttsVoice === 'free'
          ? '免费 Polly'
          : s.ttsVoice === 'openai'
            ? 'AIHubMix 语音'
            : 'Gemini 语音'
    status.className = 'status-msg'
    status.textContent = `▶ 用「${path}」播放中…请把手机音量调大、关掉侧边静音键`
    if (useNeuralVoice(s)) {
      neuralSpeak(PREVIEW_LINE, s, 'warm')
        .then(() => {
          status.textContent = `✓ 播放完成（${path}）。若仍没听到：检查手机侧边静音键和媒体音量`
          status.className = 'status-msg success'
        })
        .catch((err) => {
          status.textContent = `❌ ${path}失败（${err instanceof Error ? err.message : err}），已改用系统语音`
          status.className = 'status-msg error'
          previewVoice.speak(PREVIEW_LINE, 'en-US', 0.9)
        })
    } else {
      status.textContent = '▶ 系统语音播放中…'
      previewVoice.speakAwait(PREVIEW_LINE, 'en-US', 0.98).then(() => {
        status.textContent =
          '✓ 播放完成（系统语音）。没听到就检查：手机侧边静音键、媒体音量；想更好听可在系统设置里下载"增强"英语女声'
        status.className = 'status-msg success'
      })
    }
  })

  el.querySelector('#illustrate')?.addEventListener('change', (e) => {
    storage.setIllustrate((e.target as HTMLInputElement).checked)
  })

  const form = el.querySelector('#settings-form') as HTMLFormElement
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    storage.saveAiSettings(readForm())
    storage.setIllustrate((el.querySelector('#illustrate') as HTMLInputElement).checked)
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
