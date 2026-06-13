import type { Annotation, BookParagraph, TextPart } from '../data/modern-family/types'

export function renderAnnotatedParts(
  parts: TextPart[],
  annotations: Record<string, Annotation>,
  activeNoteId: string | null,
): string {
  return parts
    .map((p) => {
      if (p.type === 'text') return esc(p.value)
      const note = p.noteId ? annotations[p.noteId] : undefined
      const label = note?.phrase ?? p.value
      const active = p.noteId === activeNoteId ? ' active' : ''
      return `<button type="button" class="annotated-word${active}" data-note="${escAttr(p.noteId ?? '')}" title="点击查看注释">${esc(label)}</button>`
    })
    .join('')
}

export function renderParagraph(
  para: BookParagraph,
  annotations: Record<string, Annotation>,
  activeNoteId: string | null,
): string {
  const inner = renderAnnotatedParts(para.parts, annotations, activeNoteId)

  switch (para.type) {
    case 'dialogue':
      return `
        <div class="book-dialogue">
          <span class="book-speaker">${esc(para.speaker ?? '')}</span>
          <p class="book-line">${inner}</p>
        </div>`
    case 'stage':
      return `<p class="book-stage">${inner}</p>`
    default:
      return `<p class="book-narration">${inner}</p>`
  }
}

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;')
}
