export interface VocabItem {
  word: string
  phonetic?: string
  meaning: string
}

export interface LessonPage {
  title: string
  image: string
  content: string
  translation: string
  vocabulary: VocabItem[]
  tip?: string
}

export interface Lesson {
  id: string
  courseId: string
  order: number
  title: string
  subtitle: string
  coverImage: string
  level: string
  duration: string
  pages: LessonPage[]
}

export interface Course {
  id: string
  title: string
  description: string
  coverImage: string
  emoji: string
  color: string
  lessons: Lesson[]
}

export const COURSES: Course[] = [
  {
    id: 'daily',
    title: '日常英语',
    description: '从打招呼到点咖啡，覆盖最高频的真实场景',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    emoji: '🌅',
    color: '#7c5cbf',
    lessons: [
      {
        id: 'daily-1',
        courseId: 'daily',
        order: 1,
        title: '第一课：打招呼 & 自我介绍',
        subtitle: 'Greetings & Introductions',
        coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
        level: 'A1–A2',
        duration: '10 分钟',
        pages: [
          {
            title: '基础问候',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
            content: `Good morning! ☀️
Good afternoon!
Good evening!
Good night! 🌙

Hi! / Hey! — casual, with friends
Hello! — neutral, anyone

How are you?
— I'm good, thanks! And you?
— Not bad. How about you?
— Great, thanks!`,
            translation: `早上好！下午好！晚上好！晚安！

Hi / Hey — 朋友之间随意用
Hello — 正式/中性

How are you? — 你好吗？
— 我很好，谢谢！你呢？
— 还行。你呢？
— 很棒，谢谢！`,
            vocabulary: [
              { word: 'morning', phonetic: '/ˈmɔːrnɪŋ/', meaning: '早晨' },
              { word: 'afternoon', phonetic: '/ˌæftərˈnuːn/', meaning: '下午' },
              { word: 'casual', phonetic: '/ˈkæʒuəl/', meaning: '随意的' },
            ],
            tip: '回答 "How are you?" 不需要太长 — "Good, thanks!" 完全够用。',
          },
          {
            title: '自我介绍',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
            content: `Hi, I'm Michael. Nice to meet you!

My name is ...
I'm from China.
I work in tech. / I'm a designer.
I've been learning English for 2 years.

What do you do? — 你是做什么的？
Where are you from? — 你来自哪里？`,
            translation: `嗨，我是 Michael。很高兴认识你！

我叫……
我来自中国。
我在科技行业工作。/ 我是设计师。
我学英语两年了。

What do you do? — 问职业
Where are you from? — 问来自哪里`,
            vocabulary: [
              { word: 'Nice to meet you', meaning: '很高兴认识你（初次见面）' },
              { word: 'introduce', phonetic: '/ˌɪntrəˈduːs/', meaning: '介绍' },
            ],
            tip: '自我介绍控制在 3-4 句 — 名字 + 来自哪里 + 做什么，就够了。',
          },
          {
            title: '小练习',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
            content: `📝 Try saying out loud:

1. "Hi! I'm ___. Nice to meet you."
2. "I'm from ___. I work in ___."
3. "How are you?" → "I'm good, thanks!"

🎯 情景：你在公司遇到新同事，用英语自我介绍 30 秒。
有不懂的词？点「问 Luna」！`,
            translation: `大声练三遍：

1. 嗨！我是___。很高兴认识你。
2. 我来自___。我在___工作。
3. 你好吗？→ 我很好，谢谢！

情景练习：遇到新同事，30 秒自我介绍。`,
            vocabulary: [
              { word: 'colleague', phonetic: '/ˈkɑːliːɡ/', meaning: '同事' },
            ],
          },
        ],
      },
      {
        id: 'daily-2',
        courseId: 'daily',
        order: 2,
        title: '第二课：咖啡店点单',
        subtitle: 'Ordering at a Café',
        coverImage: 'https://images.unsplash.com/photo-1495474472287-4d21bcffdc4?w=800&q=80',
        level: 'A2',
        duration: '12 分钟',
        pages: [
          {
            title: '走进咖啡店',
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
            content: `Barista: Hi! What can I get for you today?
You: Can I get a latte, please?
Barista: Sure! What size — small, medium, or large?
You: Medium, please.
Barista: For here or to go?
You: To go, please.
Barista: That's $4.50. Cash or card?
You: Card, please. Thank you!`,
            translation: `店员：嗨！今天要点什么？
你：请给我一杯拿铁。
店员：好的！要什么杯型 — 小、中、大？
你：中杯，谢谢。
店员：在这喝还是带走？
你：带走。
店员：一共 4.5 美元。现金还是刷卡？
你：刷卡。谢谢！`,
            vocabulary: [
              { word: 'latte', phonetic: '/ˈlɑːteɪ/', meaning: '拿铁' },
              { word: 'to go', meaning: '带走（美式常用）' },
              { word: 'for here', meaning: '在这喝' },
            ],
            tip: '"Can I get..." 比 "I want..." 更礼貌自然。',
          },
          {
            title: '定制你的饮料',
            image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
            content: `Can I get an iced Americano with oat milk?
— 冰美式，燕麦奶

Could I have less sugar / no sugar?
— 少糖 / 无糖

Extra shot, please.
— 加一份浓缩

Actually, can I change that to a cappuccino?
— 其实能换成卡布奇诺吗？`,
            translation: `以上都是真实点单句式 — 背下来直接能用。`,
            vocabulary: [
              { word: 'iced', meaning: '冰的' },
              { word: 'oat milk', meaning: '燕麦奶' },
              { word: 'extra shot', meaning: '加一份浓缩' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'show',
    title: '美剧口语',
    description: '从经典台词学地道表达，边看边练',
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    emoji: '🎬',
    color: '#ff8c42',
    lessons: [
      {
        id: 'show-1',
        courseId: 'show',
        order: 1,
        title: '第一课：Friends 经典台词',
        subtitle: 'Friends — Iconic Lines',
        coverImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
        level: 'B1',
        duration: '15 分钟',
        pages: [
          {
            title: 'How you doin\'?',
            image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
            content: `Joey's pick-up line — 乔伊的搭讪金句：

"How you doin'?"
— 不是 "How are you doing?" 的缩写误用
— 是故意拖长音的 flirty 说法 😏
— 语气要自信、放松

Similar vibes:
"What's up?" — 朋友间
"How's it going?" — 日常`,
            translation: `这是 Joey 的标志性搭讪语，故意用非标准语法+拖长音，显得自信有趣。

类似日常：
What's up? — 怎么样？
How's it going? — 最近怎样？`,
            vocabulary: [
              { word: "How you doin'", meaning: '乔伊式搭讪（非正式）' },
              { word: 'pick-up line', meaning: '搭讪开场白' },
            ],
            tip: '学美剧台词重点学「语气」和「语境」，不是每个语法错误都要学。',
          },
          {
            title: 'We were on a break!',
            image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&q=80',
            content: `Ross's famous line:

"We were on a break!"
— 我们当时分手了！（在冷静期）

Break 在这里 = 情侣之间的「冷静期/暂停」
NOT a coffee break ☕

Useful phrase:
"Let's take a break." — 我们冷静一下吧。`,
            translation: `Ross 的经典辩解 — break 指情侣冷静期，不是休息。

Let's take a break. — 我们冷静一下吧。`,
            vocabulary: [
              { word: 'on a break', meaning: '（情侣）冷静期中' },
              { word: 'famous line', meaning: '名台词' },
            ],
          },
          {
            title: 'Could I BE wearing any more clothes?',
            image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
            content: `Chandler's sarcasm — 钱德勒的讽刺：

"Could I BE wearing any more clothes?"
— 强调 BE 的重音是 Chandler 的标志

Learn the pattern:
"Could I BE any more ___?"
— 我还能更___吗？（讽刺）

Example: "Could I BE any more tired?" 😩`,
            translation: `钱德勒式讽刺模板 — 重读 BE：

Could I BE any more + 形容词？
= 我还能更___吗？（其实已经很___了）`,
            vocabulary: [
              { word: 'sarcasm', phonetic: '/ˈsɑːrkæzəm/', meaning: '讽刺' },
              { word: 'emphasis', meaning: '重音/强调' },
            ],
            tip: '试着用 Chandler 的语气读 — 重读 BE，效果立刻出来。',
          },
        ],
      },
    ],
  },
  {
    id: 'story',
    title: '童话精读',
    description: '读经典故事，逐句拆解词汇和句型',
    coverImage: 'https://images.unsplash.com/photo-1512820790801-4153a25438d6?w=800&q=80',
    emoji: '📖',
    color: '#34d399',
    lessons: [
      {
        id: 'story-1',
        courseId: 'story',
        order: 1,
        title: '第一课：The Very Hungry Caterpillar',
        subtitle: '好饿的毛毛虫（节选）',
        coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80',
        level: 'A2–B1',
        duration: '15 分钟',
        pages: [
          {
            title: '开头',
            image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80',
            content: `In the light of the moon,
a little egg lay on a leaf.

One Sunday morning,
the warm sun came up and —
pop! — out of the egg came
a tiny and very hungry caterpillar.`,
            translation: `月光下，一个小卵躺在叶子上。

一个星期天的早上，温暖的太阳升起来了 ——
啪！从卵里钻出来一只 tiny and very hungry 毛毛虫。`,
            vocabulary: [
              { word: 'caterpillar', phonetic: '/ˈkætərpɪlər/', meaning: '毛毛虫' },
              { word: 'lay', meaning: '躺/位于（过去式 lay）' },
              { word: 'pop', meaning: '啪（拟声词）' },
              { word: 'tiny', meaning: '极小的' },
            ],
            tip: 'Eric Carle 的句子短而重复 — 非常适合跟读。',
          },
          {
            title: '星期一 ~ 星期三',
            image: 'https://images.unsplash.com/photo-1466692476869-a0481d4f8923?w=800&q=80',
            content: `He started to look for some food.

On Monday he ate through
one apple. But he was still hungry.

On Tuesday he ate through
two pears, but he was still hungry.

On Wednesday he ate through
three plums, but he was still hungry.`,
            translation: `他开始找东西吃。

周一：吃了一个苹果 — 还是饿。
周二：吃了两个梨 — 还是饿。
周三：吃了三个李子 — 还是饿。`,
            vocabulary: [
              { word: 'ate through', meaning: '从头到尾吃穿/吃完' },
              { word: 'pear', phonetic: '/per/', meaning: '梨' },
              { word: 'plum', phonetic: '/plʌm/', meaning: '李子' },
              { word: 'still hungry', meaning: '仍然饿' },
            ],
            tip: '"But he was still hungry" 重复出现 — 跟读时注意节奏感。',
          },
          {
            title: '词汇总结',
            image: 'https://images.unsplash.com/photo-1456513080510-7bf93aee5610?w=800&q=80',
            content: `📝 Key patterns from this story:

"he ate through ___" — 他吃掉了___
"he was still hungry" — 他还是饿
"a little / tiny ___" — 一只小小的___

🎯 挑战：用 "He ate through ___ but he was still hungry" 造句，说给 Luna 听！`,
            translation: `本课核心句型总结 — 点击「问 Luna」让她帮你造句或纠正发音。`,
            vocabulary: [
              { word: 'pattern', meaning: '句型/模式' },
              { word: 'challenge', meaning: '挑战' },
            ],
          },
        ],
      },
    ],
  },
]

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function getLesson(lessonId: string): { course: Course; lesson: Lesson } | undefined {
  for (const course of COURSES) {
    const lesson = course.lessons.find((l) => l.id === lessonId)
    if (lesson) return { course, lesson }
  }
  return undefined
}
