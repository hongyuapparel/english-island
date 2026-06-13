import type { MFEpisode } from '../types'
import { n, t } from '../index'

export const S01E02: MFEpisode = {
  id: 's01e02',
  season: 1,
  episode: 2,
  title: 'The Bicycle Thief',
  titleZh: '偷车贼',
  synopsis:
    'Phil 给 Luke 买了新自行车，却在邻居面前被误会成「偷车贼」。本集经典主题：面子、过度补偿、以及 Dunphy 家永远搞砸的 social situations。',
  coverImage:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  available: true,
  annotations: {
    'cover-for': {
      id: 'cover-for',
      phrase: 'cover for someone',
      meaning: '替某人打掩护 / 包庇',
      explanation: 'If you cover for someone, you protect them from trouble — sometimes by lying.',
      example: 'I covered for my brother when he broke the vase.',
    },
    'blow-off': {
      id: 'blow-off',
      phrase: 'blow off',
      meaning: '放鸽子 / 爽约',
      explanation: 'blow off plans = 临时取消约定，不太礼貌的说法。',
      example: 'He blew off our lunch again.',
    },
    'save-face': {
      id: 'save-face',
      phrase: 'save face',
      meaning: '保全面子',
      explanation: '来自中文「丢脸」的反面 — 避免 public embarrassment。Phil 的一生都在 save face.',
    },
    overcompensate: {
      id: 'overcompensate',
      phrase: 'overcompensate',
      meaning: '过度补偿',
      explanation: '因为内疚或 insecurity 而做过头。Phil 买自行车 partly overcompensating for not spending enough time with Luke.',
    },
    'karma': {
      id: 'karma',
      phrase: 'karma',
      meaning: '因果报应',
      explanation: 'Cam 爱说的词 — what goes around comes around.',
    },
    'snarky': {
      id: 'snarky',
      phrase: 'snarky',
      meaning: '尖酸刻薄的（带幽默）',
      explanation: 'Mitchell 的 default tone。Snarky comment = 带刺但 clever 的吐槽。',
    },
    'go-time': {
      id: 'go-time',
      phrase: 'go time',
      meaning: '该行动了 / 关键时刻',
      explanation: 'Phil 口头禅，全季反复出现。',
    },
    'perp-walk': {
      id: 'perp-walk',
      phrase: 'perp walk',
      meaning: '嫌犯示众（被带着走过）',
      explanation: 'perp = perpetrator 罪犯。新闻里嫌犯被手铐带着走 — Phil 被误会时有这种 humiliation comedy.',
    },
  },
  pages: [
    {
      sceneTitle: 'The New Bike',
      sceneTitleZh: '新自行车',
      image:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      imageCaption: 'Phil 的礼物，Phil 的灾难。',
      paragraphs: [
        {
          type: 'narration',
          parts: [
            t('Phil buys Luke a fancy new bike — partly guilt, partly '),
            n('overcompensate', 'overcompensation'),
            t('. He wants to be the hero dad. The bike gets stolen almost immediately.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Phil',
          parts: [
            t('"Nothing says \'I love you\' like a ten-speed with shock absorbers. It\'s '),
            n('go-time', 'go time'),
            t(' for father-son bonding!"'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('（注：go time 是 Phil 全季口头禅，在此集再次出现 — 表示他又要「全力以赴」了。）'),
          ],
        },
      ],
    },
    {
      sceneTitle: 'Wrong Guy',
      sceneTitleZh: '抓错人',
      image:
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&q=80',
      paragraphs: [
        {
          type: 'narration',
          parts: [
            t('The neighbors confront a man they think stole the bike. It\'s humiliating — a suburban '),
            n('perp-walk', 'perp walk'),
            t(' moment. Phil tries to '),
            n('save-face', 'save face'),
            t(' in front of everyone.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Claire',
          parts: [
            t('"Phil, you cannot keep trying to '),
            n('cover-for', 'cover for'),
            t(' Luke every time he — actually, this one might be your fault."'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Phil',
          parts: [
            t('"I didn\'t steal a bike! I\'m a real estate agent! I sell dreams!"'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Phil 的 defense 越描越黑 — 这是 character comedy 的 core：越解释越 ridiculous.'),
          ],
        },
      ],
    },
    {
      sceneTitle: 'Cam & Mitchell Subplot',
      sceneTitleZh: 'Cam 和 Mitchell 支线',
      image:
        'https://images.unsplash.com/photo-1515488042361-ee00e9450b60?w=900&q=80',
      paragraphs: [
        {
          type: 'dialogue',
          speaker: 'Cameron',
          parts: [
            t('"Maybe it\'s '),
            n('karma', 'karma'),
            t('. Maybe the universe is teaching Phil a lesson about materialism."'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Mitchell',
          parts: [
            t('"( '),
            n('snarky', 'snarky'),
            t(' ) Or maybe Phil is just Phil."'),
          ],
        },
        {
          type: 'stage',
          parts: [
            t('📖 本集学点：save face / cover for / blow off 都是日常高频 phrasal verbs — 点击高亮词复习。'),
          ],
        },
      ],
    },
  ],
}
