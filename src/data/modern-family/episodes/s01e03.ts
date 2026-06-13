import type { MFEpisode } from '../types'
import { n, t } from '../index'

export const S01E03: MFEpisode = {
  id: 's01e03',
  season: 1,
  episode: 3,
  title: 'Come Fly with Me',
  titleZh: '与我同飞',
  synopsis:
    'Jay 第一次带 Gloria 和 Manny 坐飞机 — 同时 Mitchell 害怕告诉 Cam 他怕 flying。机场 = 英语社交高密度场景：安检、登机、delay、small talk。',
  coverImage:
    'https://images.unsplash.com/photo-1436491865339-9a61a46a755a?w=800&q=80',
  available: true,
  annotations: {
    turbulence: {
      id: 'turbulence',
      phrase: 'turbulence',
      meaning: '气流颠簸',
      explanation: '飞行中最常听到的词之一。seatbelt sign is on due to turbulence.',
    },
    'white-knuckle': {
      id: 'white-knuckle',
      phrase: 'white-knuckle',
      meaning: '紧张到指节发白的',
      explanation: 'white-knuckle flyer = 极度恐飞的人，抓 armrest 抓到指节发白。',
    },
    layover: {
      id: 'layover',
      phrase: 'layover',
      meaning: '中转停留',
      explanation: '两个航班之间的 waiting time。How long is your layover?',
    },
    'gate-change': {
      id: 'gate-change',
      phrase: 'gate change',
      meaning: '登机口变更',
      explanation: 'Airport PA: "Attention, gate change for flight 204..." — 旅行必备听力。',
    },
    'carry-on': {
      id: 'carry-on',
      phrase: 'carry-on',
      meaning: '随身行李',
      explanation: 'carry-on bag vs checked luggage（托运）。Is this your carry-on?',
    },
    upgrade: {
      id: 'upgrade',
      phrase: 'upgrade',
      meaning: '升舱',
      explanation: 'Phil 型人格 forever hoping for a free upgrade to first class.',
    },
    'frequent-flyer': {
      id: 'frequent-flyer',
      phrase: 'frequent flyer',
      meaning: '常旅客',
      explanation: 'Jay 这种老商务人士是 frequent flyer — 知道所有 airport shortcuts。',
    },
  },
  pages: [
    {
      sceneTitle: 'Airport Morning',
      sceneTitleZh: '机场清晨',
      image:
        'https://images.unsplash.com/photo-1436491865339-9a61a46a755a?w=900&q=80',
      imageCaption: 'Terminal chaos, family style.',
      paragraphs: [
        {
          type: 'narration',
          parts: [
            t('Jay is a '),
            n('frequent-flyer', 'frequent flyer'),
            t(' — he knows TSA, gates, and lounges. Gloria and Manny are excited. Mitchell has a secret: he\'s a '),
            n('white-knuckle', 'white-knuckle'),
            t(' flyer but never told Cam.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Jay',
          parts: [
            t('"All right — '),
            n('carry-on', 'carry-on'),
            t(' only, we\'re not checking bags. I\'m not paying those fees."'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Gloria',
          parts: [
            t('"Jay, Manny needs his books, his pillow, his special snacks —"'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Airport vocabulary 密集区：boarding pass, security, gate, departure — 本集适合反复听 airport announcements.'),
          ],
        },
      ],
    },
    {
      sceneTitle: 'Fear of Flying',
      sceneTitleZh: '恐飞',
      image:
        'https://images.unsplash.com/photo-1529074963761-56a4194d242f?w=900&q=80',
      paragraphs: [
        {
          type: 'dialogue',
          speaker: 'Mitchell',
          parts: [
            t('"I just need you to know — I\'m not great with flying. If there\'s '),
            n('turbulence', 'turbulence'),
            t(', I might… panic a little."'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Cameron',
          parts: [
            t('"Mitchell! Why didn\'t you tell me? I would\'ve held your hand through the whole '),
            n('layover', 'layover'),
            t('!"'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Cam 的 reaction 总是 dramatic but sincere — 学表达 fear 时可以用 Mitchell 这种 understated way: "not great with…" = 我不太行.'),
          ],
        },
      ],
    },
    {
      sceneTitle: 'Gate Change',
      sceneTitleZh: '登机口变更',
      image:
        'https://images.unsplash.com/photo-1544620347-4d0c6c4f583a?w=900&q=80',
      paragraphs: [
        {
          type: 'stage',
          parts: [
            t('Airport PA: "Attention passengers — '),
            n('gate-change', 'gate change'),
            t('. Flight 815 will now depart from Gate 22."'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Phil',
          parts: [
            t('"Any chance of an '),
            n('upgrade', 'upgrade'),
            t('? I have a very important real estate conference. And these eyes."'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Phil 跟 gate agent 套近乎 — 典型 failed social engineering。学 travel English 时，记住：polite + brief 比 Phil 的 approach 更有效.'),
          ],
        },
        {
          type: 'stage',
          parts: [
            t('📖 挑战：用本集 5 个 airport 词汇，描述你上次坐飞机的经历 — 去「语音对话」说给 Luna 听。'),
          ],
        },
      ],
    },
  ],
}
