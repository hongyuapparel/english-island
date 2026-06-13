export interface Annotation {
  id: string
  phrase: string
  meaning: string
  explanation: string
  example?: string
}

export interface TextPart {
  type: 'text' | 'note'
  value: string
  noteId?: string
}

export interface BookParagraph {
  type: 'narration' | 'dialogue' | 'stage'
  speaker?: string
  parts: TextPart[]
}

export interface BookPage {
  sceneTitle: string
  sceneTitleZh?: string
  image?: string
  imageCaption?: string
  paragraphs: BookParagraph[]
}

export interface MFEpisode {
  id: string
  season: number
  episode: number
  title: string
  titleZh: string
  synopsis: string
  coverImage: string
  annotations: Record<string, Annotation>
  pages: BookPage[]
  available: boolean
}

export interface MFSeason {
  season: number
  title: string
  episodes: MFEpisodeMeta[]
}

export interface MFEpisodeMeta {
  id: string
  season: number
  episode: number
  title: string
  titleZh: string
  synopsis: string
  coverImage: string
  available: boolean
}
