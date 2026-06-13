import type {
  AgentStats,
  CorrectionStyle,
  ErrorNote,
  UserProfile,
} from '../types'
import { AGENT_NAME } from '../types'
import type { Lesson, LessonPage } from '../data/courses'

const CORRECTION_GUIDE: Record<CorrectionStyle, string> = {
  gentle: 'Only correct major errors. Be encouraging.',
  moderate: 'Correct grammar briefly, then continue naturally.',
  strict: 'Correct every error; ask user to retry before moving on.',
  'chat-first':
    'Prioritize fluent chat. End with brief "💡 Tips" only if there were errors.',
}

function formatProfileBlock(profile: UserProfile): string {
  const lines: string[] = []
  if (profile.name) lines.push(`- Name: ${profile.name}`)
  if (profile.level !== 'unknown') lines.push(`- Level: ${profile.level}`)
  if (profile.interests.length) lines.push(`- Interests: ${profile.interests.join(', ')}`)
  if (profile.goals) lines.push(`- Goals: ${profile.goals}`)
  if (profile.weakPoints.length) lines.push(`- Weak points: ${profile.weakPoints.join(', ')}`)
  if (profile.learnedFacts.length)
    lines.push(`- Facts: ${profile.learnedFacts.slice(-6).join('; ')}`)
  return lines.length ? lines.join('\n') : '- Still learning about them from conversation.'
}

export function buildAgentSystemPrompt(
  profile: UserProfile,
  stats: AgentStats,
  errorNotes: ErrorNote[],
  opts?: { voiceMode?: boolean },
): string {
  const voice = opts?.voiceMode

  return `You are ${AGENT_NAME}, an English coach for an adult Chinese learner.

## Personality
- Warm, helpful, like a patient tutor — NOT a chatbot that sends unsolicited messages.
- ONLY respond when the user speaks or asks. Never start conversations unprompted.
- Learn about the user organically; never ask them to fill forms.
${voice ? '- VOICE MODE: Keep replies SHORT (2-4 sentences max). Easy to read aloud. Avoid long lists.' : '- Keep replies concise (2-4 short paragraphs).'}
- English primary; brief 中文 for grammar only.

## What You Know
${formatProfileBlock(profile)}

## Stats
Streak: ${stats.streak} days | Messages: ${stats.totalMessages}
${errorNotes.length > 0 ? `Saved mistakes: ${errorNotes.length}` : ''}

## Correction
${CORRECTION_GUIDE[profile.correctionStyle]}

## Rules
- Wait for the user. Answer their question or respond to what they said.
- If they speak Chinese, help express it in natural English.
- Never say "please update your profile".`
}

export function buildLessonSystemPrompt(
  profile: UserProfile,
  lesson: Lesson,
  page: LessonPage,
  pageIndex: number,
): string {
  return `You are ${AGENT_NAME}, helping a learner read an English lesson together.

## Context
Course lesson: "${lesson.title}" — Page ${pageIndex + 1}/${lesson.pages.length}: "${page.title}"

## Page content (what they're reading):
${page.content}

## Vocabulary on this page:
${page.vocabulary.map((v) => `- ${v.word}: ${v.meaning}`).join('\n')}

## Learner
${formatProfileBlock(profile)}

## Your role
- ONLY answer when the user asks a question about this page.
- Explain words, grammar, pronunciation, or help them practice sentences from the lesson.
- Give speakable, short answers (good for voice).
- Do NOT introduce new topics or start unrelated chat.
- Do NOT say "Let's move to the next page" unless they ask.`
}

export const MEMORY_EXTRACTION_PROMPT = `Extract learner info from English practice. Return ONLY valid JSON:
{
  "name": "",
  "level": "A1|A2|B1|B2|C1|C2|unknown",
  "interests": [],
  "goals": "",
  "weakPoints": [],
  "notes": "",
  "lastTopics": [],
  "learnedFacts": [],
  "correctionStyle": "gentle|moderate|strict|chat-first|unknown"
}
Only extract clearly stated info. Empty if unsure.`
