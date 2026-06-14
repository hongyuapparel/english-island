// The English Island game world: a cozy map of spots, and the short
// fairy-tale scene dialogues you play (in English) to grow the island.

export type Speaker = 'narration' | 'fox' | 'resident'

export interface Line {
  speaker: Speaker
  name?: string
  emoji?: string
  en: string
  zh: string
}

export interface ChoiceOption {
  en: string
  zh: string
  reply: { en: string; zh: string }
  /** a warm/"correct-feeling" choice, just for flavor */
  good?: boolean
}

export type Step =
  | ({ kind: 'line' } & Line)
  | {
      kind: 'choice'
      /** the resident/Fox line that asks the question */
      speaker: Speaker
      name?: string
      emoji?: string
      en: string
      zh: string
      options: ChoiceOption[]
    }

export interface Scene {
  id: string
  spotId: string
  title: string
  titleZh: string
  emoji: string
  /** short Chinese setup shown before the scene starts */
  setting: string
  steps: Step[]
  vocab: { word: string; meaning: string }[]
  reward: { coins: number; unlockSpot?: string }
}

export interface Spot {
  id: string
  name: string
  nameZh: string
  emoji: string
  /** position on the map, in percent */
  x: number
  y: number
  /** spot that must be unlocked first */
  requires?: string
  /** scene played here; if absent, the spot opens an activity instead */
  sceneId?: string
  /** non-scene spots route somewhere (e.g. the library opens 故事) */
  opens?: 'reading'
  blurb: string
}

export const SPOTS: Spot[] = [
  { id: 'beach', name: 'Driftwood Beach', nameZh: '浮木海滩', emoji: '🏖️', x: 24, y: 70, sceneId: 's_arrival', blurb: '你醒来的地方' },
  { id: 'bakery', name: 'The Warm Oven', nameZh: '暖炉面包坊', emoji: '🥐', x: 52, y: 55, requires: 'beach', sceneId: 's_bakery', blurb: '小老鼠 Pip 的面包香' },
  { id: 'lighthouse', name: 'Old Lighthouse', nameZh: '老灯塔', emoji: '🗼', x: 78, y: 34, requires: 'bakery', sceneId: 's_lighthouse', blurb: '猫头鹰 Hoot 守着灯' },
  { id: 'garden', name: "Rosa's Garden", nameZh: '萝莎的花园', emoji: '🌷', x: 40, y: 30, requires: 'lighthouse', sceneId: 's_garden', blurb: '兔子 Rosa 的花田' },
  { id: 'library', name: 'Story Cabin', nameZh: '故事书屋', emoji: '📚', x: 64, y: 72, requires: 'garden', opens: 'reading', blurb: '读一篇小故事，和 Fox 聊聊' },
]

export const SCENES: Scene[] = [
  {
    id: 's_arrival',
    spotId: 'beach',
    title: 'Washed Ashore',
    titleZh: '漂上海岸',
    emoji: '🏖️',
    setting: '你在一片陌生的海滩上醒来。海浪很轻，远处有人朝你走来……',
    steps: [
      { kind: 'line', speaker: 'narration', en: 'You open your eyes on a warm, sandy beach. Waves whisper behind you.', zh: '你在温暖的沙滩上睁开眼睛。身后海浪轻语。' },
      { kind: 'line', speaker: 'fox', emoji: '🦊', en: "Oh! You're awake! I'm Fox. Welcome to English Island.", zh: '哦！你醒啦！我是 Fox。欢迎来到英语小岛。' },
      {
        kind: 'choice',
        speaker: 'fox',
        emoji: '🦊',
        en: "You drifted here from far away. How are you feeling?",
        zh: '你从很远的地方漂来。你现在感觉怎么样？',
        options: [
          { en: "I'm okay, just a little lost.", zh: '我还好，只是有点迷路。', good: true, reply: { en: "That's alright. Everyone arrives a little lost. I'll show you around.", zh: '没关系。每个人刚来都有点迷路。我带你转转。' } },
          { en: "Where am I? What is this place?", zh: '我在哪？这是什么地方？', reply: { en: "This is a tiny island where we speak English together. The more we talk, the more it grows.", zh: '这是一座小岛，我们在这里一起说英语。我们聊得越多，它就长得越大。' } },
        ],
      },
      { kind: 'line', speaker: 'fox', emoji: '🦊', en: "See that path? It leads to the bakery. Pip makes the best bread on the island.", zh: '看见那条小路了吗？通往面包坊。Pip 做的面包是岛上最好吃的。' },
      { kind: 'line', speaker: 'fox', emoji: '🦊', en: "Come back every day and we'll discover a new place together. Ready?", zh: '每天回来，我们就一起发现一个新地方。准备好了吗？' },
      { kind: 'line', speaker: 'narration', en: 'Fox hands you a small pouch of golden shells — the island’s coins.', zh: 'Fox 递给你一小袋金色贝壳——这是小岛的钱币。' },
    ],
    vocab: [
      { word: 'ashore', meaning: '上岸、到岸上' },
      { word: 'whisper', meaning: '低语、轻声说' },
      { word: 'lost', meaning: '迷路的' },
      { word: 'discover', meaning: '发现' },
    ],
    reward: { coins: 20, unlockSpot: 'bakery' },
  },
  {
    id: 's_bakery',
    spotId: 'bakery',
    title: 'Warm Bread',
    titleZh: '热面包',
    emoji: '🥐',
    setting: '面包坊飘出热腾腾的香味。一只系着围裙的小老鼠站在柜台后。',
    steps: [
      { kind: 'line', speaker: 'narration', en: 'The little shop smells of butter and warm bread. A mouse in an apron beams at you.', zh: '小店里满是黄油和热面包的香味。一只系着围裙的小老鼠朝你笑。' },
      { kind: 'line', speaker: 'resident', name: 'Pip', emoji: '🐭', en: "Welcome, welcome! I'm Pip. You must be the one Fox found on the beach!", zh: '欢迎欢迎！我是 Pip。你一定就是 Fox 在海滩上发现的那位！' },
      {
        kind: 'choice',
        speaker: 'resident',
        name: 'Pip',
        emoji: '🐭',
        en: "Everything is fresh this morning. What would you like?",
        zh: '今早一切都新鲜出炉。你想要点什么？',
        options: [
          { en: "Could I have a loaf of bread, please?", zh: '可以给我一个面包吗，谢谢？', good: true, reply: { en: "Of course! 'Please' — what lovely manners. Here you are, still warm.", zh: '当然！说"please"——真有礼貌。给你，还热乎着呢。' } },
          { en: "What do you recommend?", zh: '你推荐什么？', good: true, reply: { en: "Ooh, good question! Try the honey roll. It's my favorite.", zh: '哦，问得好！试试蜂蜜卷吧，那是我的最爱。' } },
        ],
      },
      { kind: 'line', speaker: 'resident', name: 'Pip', emoji: '🐭', en: "That'll be three shells. But for a new friend — the first one is free!", zh: '这要三个贝壳。不过对新朋友——第一个免费！' },
      {
        kind: 'choice',
        speaker: 'resident',
        name: 'Pip',
        emoji: '🐭',
        en: "So, do you like to cook back home?",
        zh: '对了，你在家喜欢做饭吗？',
        options: [
          { en: "Yes, I cook almost every day.", zh: '喜欢，我几乎天天做饭。', reply: { en: "Wonderful! Then you and I will get along just fine.", zh: '太好了！那我们俩一定合得来。' } },
          { en: "Not really, but I love eating!", zh: '不太会，但我超爱吃！', good: true, reply: { en: "Ha! Then you came to the right shop. I'll keep you well fed.", zh: '哈！那你来对店了。我会把你喂得饱饱的。' } },
        ],
      },
      { kind: 'line', speaker: 'resident', name: 'Pip', emoji: '🐭', en: "Take this lantern to the old lighthouse, would you? Hoot has been lonely up there.", zh: '帮我把这盏灯笼送到老灯塔好吗？Hoot 一个人在上面很孤单。' },
    ],
    vocab: [
      { word: 'fresh', meaning: '新鲜的' },
      { word: 'loaf', meaning: '一个（面包）' },
      { word: 'recommend', meaning: '推荐' },
      { word: 'manners', meaning: '礼貌、礼仪' },
    ],
    reward: { coins: 25, unlockSpot: 'lighthouse' },
  },
  {
    id: 's_lighthouse',
    spotId: 'lighthouse',
    title: 'Light the Lamp',
    titleZh: '点亮灯塔',
    emoji: '🗼',
    setting: '灯塔又高又旧，灯灭着。楼梯顶上，一只戴眼镜的猫头鹰在打盹。',
    steps: [
      { kind: 'line', speaker: 'narration', en: 'The lighthouse is tall and quiet. At the top, an owl with round glasses dozes by a dark lamp.', zh: '灯塔又高又静。塔顶，一只戴圆眼镜的猫头鹰在熄灭的灯旁打盹。' },
      { kind: 'line', speaker: 'resident', name: 'Hoot', emoji: '🦉', en: "Hm? A visitor? It has been so long. The lamp went out, and I couldn't fix it alone.", zh: '嗯？有客人？好久没人来了。灯灭了，我一个人修不好。' },
      {
        kind: 'choice',
        speaker: 'resident',
        name: 'Hoot',
        emoji: '🦉',
        en: "Would you help an old owl light it again?",
        zh: '你愿意帮一只老猫头鹰把灯重新点亮吗？',
        options: [
          { en: "I'd be happy to help you.", zh: '我很乐意帮你。', good: true, reply: { en: "Bless you. Hold the lantern high — yes, just like that.", zh: '真好。把灯笼举高——对，就这样。' } },
          { en: "I'm not sure how, but I'll try.", zh: '我不太会，但我试试。', good: true, reply: { en: "Trying is all I ask. Lift the lantern to the wick, slowly.", zh: '肯试就够了。把灯笼慢慢凑到灯芯上。' } },
        ],
      },
      { kind: 'line', speaker: 'narration', en: 'A warm flame catches. Golden light spills across the whole island.', zh: '温暖的火苗燃起。金色的光洒满整座小岛。' },
      { kind: 'line', speaker: 'resident', name: 'Hoot', emoji: '🦉', en: "Look at that. The ships will find their way home now. Thank you, truly.", zh: '看哪。船只现在能找到回家的路了。真心谢谢你。' },
      {
        kind: 'choice',
        speaker: 'resident',
        name: 'Hoot',
        emoji: '🦉',
        en: "Tell me — what brought you all the way to our island?",
        zh: '告诉我——是什么把你带到我们岛上的？',
        options: [
          { en: "I want to speak English with confidence.", zh: '我想自信地说英语。', good: true, reply: { en: "Then you're already on your way. Confidence grows one small light at a time.", zh: '那你已经在路上了。自信就像灯，一盏一盏慢慢亮起来。' } },
          { en: "I'm just curious about the world.", zh: '我只是对世界很好奇。', good: true, reply: { en: "Curiosity is the best compass there is. Keep following it.", zh: '好奇心是最好的指南针。一直跟着它走。' } },
        ],
      },
    ],
    vocab: [
      { word: 'visitor', meaning: '访客' },
      { word: 'flame', meaning: '火焰' },
      { word: 'confidence', meaning: '自信' },
      { word: 'curiosity', meaning: '好奇心' },
    ],
    reward: { coins: 30, unlockSpot: 'garden' },
  },
  {
    id: 's_garden',
    spotId: 'garden',
    title: 'Seeds of Spring',
    titleZh: '春天的种子',
    emoji: '🌷',
    setting: '一片刚翻过土的花田。一只兔子蹲在地上，手里捧着一把种子。',
    steps: [
      { kind: 'line', speaker: 'narration', en: 'Rows of fresh soil wait under the sun. A rabbit looks up, paws full of tiny seeds.', zh: '一排排新翻的泥土晒着太阳。一只兔子抬起头，爪子里捧着细小的种子。' },
      { kind: 'line', speaker: 'resident', name: 'Rosa', emoji: '🐰', en: "Hello there! I'm Rosa. I'm planting the first flowers of the season.", zh: '你好呀！我是 Rosa。我在种这一季的第一批花。' },
      {
        kind: 'choice',
        speaker: 'resident',
        name: 'Rosa',
        emoji: '🐰',
        en: "If you plant one seed with me, what would you wish for it to become?",
        zh: '如果你和我一起种下一颗种子，你希望它长成什么？',
        options: [
          { en: "A tall sunflower that follows the light.", zh: '一朵追着光的高高的向日葵。', good: true, reply: { en: "What a bright wish! Sunflowers always face the morning.", zh: '多明亮的愿望！向日葵总是朝着清晨。' } },
          { en: "Something small but strong.", zh: '小小的，但很坚强的东西。', good: true, reply: { en: "I love that. The toughest roots are often the quietest ones.", zh: '我喜欢这个。最坚韧的根，往往是最安静的。' } },
        ],
      },
      { kind: 'line', speaker: 'resident', name: 'Rosa', emoji: '🐰', en: "Press the seed in gently, then whisper a kind word to it. Plants hear more than we think.", zh: '把种子轻轻按进土里，再对它说句温柔的话。植物听得见的，比我们以为的多。' },
      {
        kind: 'choice',
        speaker: 'resident',
        name: 'Rosa',
        emoji: '🐰',
        en: "You're getting better at English every day. Does it feel hard sometimes?",
        zh: '你的英语每天都在进步。有时候会觉得难吗？',
        options: [
          { en: "Yes, but I keep going.", zh: '会，但我一直坚持。', good: true, reply: { en: "That's exactly how gardens — and people — grow. Slowly, then suddenly.", zh: '花园和人，正是这样长大的。先是慢慢地，然后忽然就成了。' } },
          { en: "Talking with you makes it easier.", zh: '和你聊天让它变简单了。', good: true, reply: { en: "Aw. Then I'll always leave the garden gate open for you.", zh: '哎呀。那我会一直为你留着花园的门。' } },
        ],
      },
      { kind: 'line', speaker: 'narration', en: 'Rosa points to a cozy cabin nearby. "That’s the Story Cabin. Fox keeps tales from all over the world there."', zh: 'Rosa 指向不远处一间温馨的小屋。"那是故事书屋。Fox 在那儿收藏着来自世界各地的故事。"' },
    ],
    vocab: [
      { word: 'plant', meaning: '种植（动词）' },
      { word: 'gently', meaning: '轻轻地、温柔地' },
      { word: 'root', meaning: '根' },
      { word: 'suddenly', meaning: '忽然、突然' },
    ],
    reward: { coins: 30, unlockSpot: 'library' },
  },
]

export function sceneById(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id)
}
export function spotById(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id)
}
