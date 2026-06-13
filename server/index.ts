import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '2mb' }))

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/ollama/models', async (req, res) => {
  const baseUrl = (req.query.baseUrl as string) || 'http://localhost:11434'
  try {
    const response = await fetch(`${baseUrl}/api/tags`)
    if (!response.ok) {
      res.status(502).json({ error: '无法连接 Ollama，请确认已安装并运行' })
      return
    }
    const data = await response.json()
    res.json(data)
  } catch {
    res.status(502).json({ error: '无法连接 Ollama，请确认已安装并运行 (ollama serve)' })
  }
})

app.post('/api/chat', async (req, res) => {
  const {
    provider,
    messages,
    ollamaBaseUrl,
    ollamaModel,
    geminiApiKey,
    geminiModel,
  } = req.body as {
    provider: 'ollama' | 'gemini'
    messages: ChatMessage[]
    ollamaBaseUrl?: string
    ollamaModel?: string
    geminiApiKey?: string
    geminiModel?: string
  }

  try {
    if (provider === 'ollama') {
      const baseUrl = ollamaBaseUrl || 'http://localhost:11434'
      const model = ollamaModel || 'qwen2.5:7b'
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: { temperature: 0.7 },
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        res.status(502).json({ error: `Ollama 错误: ${errText}` })
        return
      }

      const data = (await response.json()) as { message?: { content?: string } }
      res.json({ content: data.message?.content ?? '' })
      return
    }

    if (provider === 'gemini') {
      if (!geminiApiKey) {
        res.status(400).json({ error: '请先在设置中填写 Gemini API Key' })
        return
      }

      const model = geminiModel || 'gemini-2.0-flash'
      const systemMsg = messages.find((m) => m.role === 'system')
      const chatMessages = messages.filter((m) => m.role !== 'system')

      const contents = chatMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const body: Record<string, unknown> = { contents }
      if (systemMsg) {
        body.systemInstruction = { parts: [{ text: systemMsg.content }] }
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errText = await response.text()
        res.status(502).json({ error: `Gemini 错误: ${errText}` })
        return
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      res.json({ content: text })
      return
    }

    res.status(400).json({ error: '未知的 AI 提供商' })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    res.status(500).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
