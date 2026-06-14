export interface Article {
  id: string
  title: string
  titleZh: string
  category: string
  emoji: string
  level: string
  /** rough word count, shown to the user */
  words: number
  /** one-line Chinese hook shown in the list */
  hook: string
  /** English body, one entry per paragraph */
  paragraphs: string[]
  /** Chinese translation, aligned to paragraphs */
  translation: string[]
  vocab: { word: string; meaning: string }[]
  /** conversation openers Fox uses to discuss the piece */
  discussion: string[]
}

export const ARTICLES: Article[] = [
  {
    id: 'startup-first-customer',
    title: 'The First Customer',
    titleZh: '第一个客户',
    category: '创业',
    emoji: '🚀',
    level: 'B1',
    words: 320,
    hook: '一个小本生意如何赢得第一个真正的客户。',
    paragraphs: [
      `Mei had been making handbags in her small apartment for almost a year. She loved the work, but her online shop had no sales. Every morning she opened the app, hoping to see an order, and every morning the number stayed at zero.`,
      `One evening, a message arrived from a woman named Clara. "Your bags look beautiful," she wrote, "but I'm worried about the quality. Can I trust a shop with no reviews?" Mei's first instinct was to send a long list of reasons. Instead, she stopped and thought about how she would feel as a buyer.`,
      `She replied honestly. "You're right to be careful. I'm new, so I can't show you reviews yet. But I can send you extra photos, and if the bag isn't perfect when it arrives, you don't pay." Clara placed the order that night.`,
      `When the bag arrived, Clara was delighted. She posted a photo, wrote a warm review, and tagged three friends. Within a week, Mei had eleven new orders. The first customer had been the hardest, but she had also become the most valuable.`,
      `Mei learned something she never forgot: trust is not built with arguments. It is built when you take the risk that the other person is afraid to take.`,
    ],
    translation: [
      `美在她的小公寓里做手提包已经将近一年了。她热爱这份工作，但她的网店没有任何销量。每天早上她打开应用，盼着能看到一笔订单，而每天早上那个数字都停留在零。`,
      `一天傍晚，一条消息来自一位名叫克拉拉的女士。"你的包很漂亮，"她写道，"但我担心质量。我能信任一家没有评价的店吗？"美的第一反应是发一长串理由。但她停了下来，想象自己作为买家会有什么感受。`,
      `她诚实地回复："你谨慎是对的。我是新店，还没法给你看评价。但我可以多发一些照片，如果包到手时不完美，你就不用付钱。"克拉拉当晚就下了单。`,
      `包寄到时，克拉拉非常满意。她发了一张照片，写下温暖的评价，还@了三个朋友。一周之内，美收到了十一笔新订单。第一个客户是最难的，但她也成了最宝贵的。`,
      `美学到了一件她永远不会忘记的事：信任不是靠争辩建立的。它建立于你愿意承担对方害怕承担的那份风险时。`,
    ],
    vocab: [
      { word: 'instinct', meaning: '本能、直觉反应' },
      { word: 'honestly', meaning: '诚实地、坦率地' },
      { word: 'delighted', meaning: '非常高兴的' },
      { word: 'valuable', meaning: '宝贵的、有价值的' },
    ],
    discussion: [
      `Have you ever been nervous to buy from a new shop? What made you decide?`,
      `Mei offered "if it's not perfect, you don't pay." Would you make the same promise in your business?`,
      `Why do you think trust is "built when you take a risk"? Do you agree?`,
    ],
  },
  {
    id: 'trade-email-tone',
    title: 'A Better Reply',
    titleZh: '更好的回复',
    category: '外贸',
    emoji: '🌍',
    level: 'B1',
    words: 300,
    hook: '一封外贸邮件，怎么写才不会丢掉客户。',
    paragraphs: [
      `Daniel ran a small factory that sold cotton shirts to buyers overseas. One Monday, a long-time client in Germany sent an angry email. The last shipment had arrived two weeks late, and some boxes were damaged.`,
      `Daniel was tempted to explain everything: the port delay, the typhoon, the trucking company. But a list of excuses, he knew, would only sound defensive. The client did not want reasons. The client wanted to feel safe ordering again.`,
      `So Daniel wrote four short sentences. "I'm sorry. This was our responsibility. We will replace the damaged boxes at no cost and ship them by Friday. Here is how we'll make sure it never happens again."`,
      `Then he explained, in one line, the new checks his team would run before every shipment. He did not beg, and he did not over-promise. He simply showed that he understood the problem and had already fixed it.`,
      `The client replied within an hour: "Thank you for being direct. Let's continue." In business, the goal of an apology is not to win the argument. It is to keep the relationship.`,
    ],
    translation: [
      `丹尼尔经营一家向海外买家出售棉衬衫的小工厂。一个周一，他在德国的一位老客户发来一封愤怒的邮件。上一批货晚到了两周，还有几箱受了损。`,
      `丹尼尔很想把一切都解释清楚：港口延误、台风、货运公司。但他知道，一长串借口只会显得在为自己辩护。客户要的不是理由。客户要的是再次下单时的安全感。`,
      `于是丹尼尔写了四个短句。"很抱歉。这是我们的责任。我们将免费更换受损的箱子，并在周五前发出。以下是我们如何确保此事不再发生。"`,
      `然后他用一句话说明了团队在每次发货前将做的新检查。他没有乞求，也没有过度承诺。他只是表明自己理解问题，而且已经解决了。`,
      `客户在一小时内回复："谢谢你这么直接。我们继续合作。"在商业中，道歉的目的不是赢得争辩，而是保住这段关系。`,
    ],
    vocab: [
      { word: 'shipment', meaning: '一批货、装运' },
      { word: 'defensive', meaning: '辩护的、自我防卫的' },
      { word: 'responsibility', meaning: '责任' },
      { word: 'replace', meaning: '更换、替换' },
    ],
    discussion: [
      `Have you ever had to apologize to a customer? How did you do it?`,
      `Daniel wrote only four short sentences. Do you think short or long replies work better when someone is upset?`,
      `What is the difference between giving a reason and giving an excuse?`,
    ],
  },
  {
    id: 'parenting-question',
    title: 'The Question at Bedtime',
    titleZh: '睡前的提问',
    category: '育儿',
    emoji: '🧸',
    level: 'A2',
    words: 280,
    hook: '孩子问了一个你答不上来的问题，怎么办？',
    paragraphs: [
      `Every night, Leo's six-year-old daughter asked him one question before bed. Usually they were easy. "Why is the sky blue?" "Where do birds sleep?" Leo enjoyed answering them.`,
      `But one night she asked, "Daddy, are you ever scared?" Leo paused. His first thought was to say no, because he wanted her to feel safe. But that did not feel honest.`,
      `"Yes," he said quietly. "Sometimes I'm scared too. I get scared before a big meeting, or when you have a fever." Her eyes grew wide. "But what do you do?" she asked.`,
      `"I take a deep breath," Leo said, "and I remember that being scared doesn't mean something is wrong. It just means something matters." His daughter nodded slowly and held his hand.`,
      `Leo realized that children don't need parents who are never afraid. They need parents who show them what to do with fear. That night, he didn't teach a fact. He taught something far more useful.`,
    ],
    translation: [
      `每天晚上，里奥六岁的女儿都会在睡前问他一个问题。通常都很简单。"天空为什么是蓝的？""鸟在哪里睡觉？"里奥很享受回答它们。`,
      `但有一晚她问："爸爸，你会害怕吗？"里奥停顿了。他的第一个念头是说不，因为他想让她有安全感。但那感觉并不诚实。`,
      `"会，"他轻声说。"有时候我也会害怕。开重要会议前我会怕，你发烧的时候我也会怕。"她睁大了眼睛。"那你会怎么做？"她问。`,
      `"我会深呼吸，"里奥说，"然后我会提醒自己，害怕并不代表出了什么问题。它只是说明有些东西很重要。"女儿慢慢点头，握住了他的手。`,
      `里奥意识到，孩子不需要从不害怕的父母。他们需要能示范如何面对恐惧的父母。那天晚上，他没有教一个知识点，而是教了更有用的东西。`,
    ],
    vocab: [
      { word: 'scared', meaning: '害怕的' },
      { word: 'honest', meaning: '诚实的' },
      { word: 'matters', meaning: '重要、要紧（动词）' },
      { word: 'realize', meaning: '意识到' },
    ],
    discussion: [
      `What is a hard question a child has asked you — or that you asked your own parents?`,
      `Do you agree that it's okay for parents to admit they feel scared? Why or why not?`,
      `Leo said fear "means something matters." Have you felt that?`,
    ],
  },
  {
    id: 'fitness-small-promise',
    title: 'Two Minutes a Day',
    titleZh: '每天两分钟',
    category: '健身',
    emoji: '💪',
    level: 'A2',
    words: 270,
    hook: '为什么"每天两分钟"比"每天一小时"更有效。',
    paragraphs: [
      `For years, Aisha started every January with the same plan: exercise one hour a day. By February, she had always quit. The plan was too big, and one missed day felt like failure.`,
      `This year she tried something different. She promised herself just two minutes. After waking up, she would do two minutes of stretching — nothing more. It felt almost too easy to count.`,
      `But two minutes was a promise she could always keep, even when she was tired or busy. And once she started, she often kept going for ten or fifteen minutes. The hard part was never the exercise. It was beginning.`,
      `Six months later, Aisha was stronger than she had ever been. Not because two minutes is powerful, but because two minutes, repeated every single day, becomes a habit that larger plans never could.`,
      `She learned to trust small promises. A goal you keep is worth more than a goal that sounds impressive but lives only in your head.`,
    ],
    translation: [
      `多年来，艾莎每年一月都以同样的计划开始：每天锻炼一小时。到了二月，她总是放弃。这个计划太大了，漏掉一天就感觉像失败。`,
      `今年她尝试了不同的方法。她只向自己承诺两分钟。起床后，她会做两分钟拉伸——仅此而已。这简单得几乎不值一提。`,
      `但两分钟是她总能兑现的承诺，哪怕在疲惫或忙碌的时候。而一旦开始，她常常会继续做上十到十五分钟。困难的从来不是锻炼本身，而是开始。`,
      `六个月后，艾莎比以往任何时候都更强壮。不是因为两分钟有多厉害，而是因为每一天都重复的两分钟，会变成一个再宏大的计划都无法形成的习惯。`,
      `她学会了相信小小的承诺。一个你能坚持的目标，比一个听起来很厉害、却只活在你脑海里的目标更有价值。`,
    ],
    vocab: [
      { word: 'quit', meaning: '放弃、退出' },
      { word: 'stretching', meaning: '拉伸（运动）' },
      { word: 'habit', meaning: '习惯' },
      { word: 'impressive', meaning: '令人印象深刻的' },
    ],
    discussion: [
      `What is one tiny habit you could promise yourself for two minutes a day?`,
      `Aisha says "the hard part was beginning." Do you find that true for you?`,
      `Why do you think big plans often fail by February?`,
    ],
  },
  {
    id: 'travel-wrong-train',
    title: 'The Wrong Train',
    titleZh: '坐错的火车',
    category: '旅行',
    emoji: '🚆',
    level: 'B1',
    words: 300,
    hook: '一次坐错车，成了整趟旅行最好的记忆。',
    paragraphs: [
      `On her first trip to Japan, Hana boarded the wrong train. She only noticed when the familiar city names disappeared and the windows filled with green rice fields. Her phone had no signal. Her heart began to race.`,
      `At the next small station, she stepped off, unsure what to do. An elderly man sweeping the platform saw her worried face. They shared no common language, but he understood at once. He pointed to a bench and gestured for her to wait.`,
      `Twenty minutes later, he returned with a hand-drawn map and a cup of warm tea from a machine. He walked her to the right platform, bowed, and waved as her train pulled away. Hana never learned his name.`,
      `She reached her hotel three hours late. But years later, she could barely remember the city she had planned to see. What she remembered was the quiet station, the drawn map, and the kindness of a stranger who owed her nothing.`,
      `Sometimes the wrong train takes you exactly where you needed to go.`,
    ],
    translation: [
      `第一次去日本旅行时，花上错了火车。直到熟悉的城市名消失、窗外满是绿色稻田，她才察觉。她的手机没有信号。她的心开始狂跳。`,
      `在下一个小站，她下了车，不知所措。一位在站台上扫地的老人看到了她担忧的脸。他们没有共同的语言，但他立刻就懂了。他指了指长椅，示意她等一下。`,
      `二十分钟后，他带着一张手绘地图和一杯从机器里接来的热茶回来了。他把她送到正确的站台，鞠了一躬，在她的火车开走时挥手。花始终没能知道他的名字。`,
      `她比原计划晚了三小时到达酒店。但多年以后，她几乎记不起本打算去看的那座城市。她记得的，是那个安静的小站、那张手绘地图，以及一个素不相识、对她毫无亏欠的陌生人的善意。`,
      `有时候，坐错的那班车，恰好把你带到你真正需要去的地方。`,
    ],
    vocab: [
      { word: 'boarded', meaning: '登上（车、船、飞机）' },
      { word: 'signal', meaning: '信号' },
      { word: 'gestured', meaning: '打手势' },
      { word: 'stranger', meaning: '陌生人' },
    ],
    discussion: [
      `Have you ever gotten lost while traveling? What happened?`,
      `A stranger helped Hana with no common language. Have you experienced kindness like that?`,
      `Do you agree that "the wrong train" can take you somewhere good?`,
    ],
  },
  {
    id: 'tale-fox-and-star',
    title: 'The Fox and the Star',
    titleZh: '狐狸与星星',
    category: '童话',
    emoji: '⭐',
    level: 'A2',
    words: 260,
    hook: '一只想摘下星星的小狐狸，学会了另一种拥有。',
    paragraphs: [
      `In a quiet forest lived a young fox who loved one star above all the others. Every night it shone just over the tallest pine, bright and silver. The fox decided that he would climb up and keep it for himself.`,
      `He climbed the pine, but the star was higher. He climbed the mountain behind it, but the star was higher still. No matter how far he went, the star stayed exactly as far away.`,
      `Tired and sad, the fox sat down by a river. There, in the dark water, was his star — shining up at him, close enough to touch. He reached out, and gentle ripples carried its light across his paws.`,
      `The fox understood then. He could not own the star, but it had been with him the whole time: above the pine, over the mountain, and now in the river at his feet.`,
      `From that night on, he stopped trying to catch the star. Instead, every evening, he simply sat by the water and let it keep him company.`,
    ],
    translation: [
      `在一片安静的森林里，住着一只小狐狸，他爱着一颗胜过其他所有的星星。每晚它就在最高的那棵松树之上闪耀，明亮而银白。狐狸决定要爬上去，把它据为己有。`,
      `他爬上了松树，可星星更高。他爬上了树后的山，可星星依然更高。无论他走多远，星星总是离他一样远。`,
      `又累又难过，狐狸在一条河边坐了下来。就在那里，幽暗的水中，有他的星星——朝着他闪耀，近得仿佛伸手可及。他伸出手，温柔的涟漪把它的光带过他的爪子。`,
      `那一刻狐狸明白了。他无法拥有这颗星星，但它一直都与他同在：在松树之上，在山峦之巅，如今又在他脚边的河里。`,
      `从那夜起，他不再试图抓住星星。相反，每个夜晚，他只是坐在水边，让它陪伴自己。`,
    ],
    vocab: [
      { word: 'shone', meaning: 'shine 的过去式，闪耀' },
      { word: 'ripples', meaning: '涟漪、波纹' },
      { word: 'company', meaning: '陪伴' },
      { word: 'gentle', meaning: '温柔的、轻柔的' },
    ],
    discussion: [
      `Is there something you once wanted to "catch" but later learned to enjoy in a different way?`,
      `The fox stopped chasing and started enjoying. Is that wisdom, or giving up? What do you think?`,
      `Which line of the story did you like most?`,
    ],
  },
]

export function articleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id)
}

/** Split an English paragraph into sentences for line-by-line listening. */
export function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]*["']?\s*/g)
  if (!matches) return [text.trim()].filter(Boolean)
  return matches.map((x) => x.trim()).filter(Boolean)
}
