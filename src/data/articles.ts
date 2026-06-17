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
  /** fixed description of recurring characters/setting/style, added to every
   *  illustration prompt so a book's pictures stay visually consistent. */
  artNote?: string
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
    artNote:
      'Recurring character: the same small red fox with a white-tipped tail and gentle eyes, in a calm moonlit pine forest with one bright silver star. Keep the fox and setting identical on every page.',
  },
  {
    id: 'tale-honest-woodcutter',
    title: 'The Honest Woodcutter',
    titleZh: '诚实的樵夫',
    category: '童话',
    emoji: '🪓',
    level: 'A2',
    words: 340,
    hook: '把斧头掉进河里的樵夫，用诚实换来了真正的宝藏。',
    paragraphs: [
      `Long ago, a poor woodcutter lived at the edge of a great forest. Every day he cut wood with his old iron axe and sold it in the village. He did not have much money, but he was always honest.`,
      `One morning, while he was cutting a tree beside a deep river, the axe slipped from his hands and fell into the water with a loud splash. The woodcutter sat down on the bank and held his head. "Without my axe," he said, "I cannot work, and my family cannot eat."`,
      `Suddenly the water began to shine, and a kind river spirit rose up. "Why are you crying?" she asked. The woodcutter told her about his lost axe. The spirit dived into the river and came back holding an axe made of gold. "Is this one yours?" she asked.`,
      `The golden axe sparkled in the sun. The woodcutter looked at it and shook his head. "No," he said. "That is not mine." The spirit dived again and returned with an axe of bright silver. "Then is this one yours?" "No," said the woodcutter. "Mine is only old iron."`,
      `The spirit smiled and brought up his plain iron axe. "Yes!" cried the woodcutter. "That one is mine. Thank you!" He was so happy to hold his old axe again that he forgot all about the gold and the silver.`,
      `"You could have lied," said the spirit, "but you told the truth, even when it cost you. Honesty like yours is rarer than gold." And she gave him all three axes as a reward.`,
      `The woodcutter went home a rich man, yet he never changed. He stayed kind and honest for the rest of his days — and that, the village always said, was his real treasure.`,
    ],
    translation: [
      `很久以前，一位贫穷的樵夫住在一片大森林的边缘。他每天用那把旧铁斧砍柴，再拿到村里去卖。他没有多少钱，但他始终诚实。`,
      `一天早上，他在一条深河边砍树时，斧头从手中滑落，"扑通"一声掉进了水里。樵夫坐在岸边，抱着头说："没了斧头，我没法干活，一家人就没饭吃了。"`,
      `忽然，河水开始发光，一位善良的河神升了起来。"你为什么哭呢？"她问。樵夫把丢斧头的事告诉了她。河神潜入水中，回来时手里拿着一把金斧头。"这把是你的吗？"她问。`,
      `金斧头在阳光下闪闪发亮。樵夫看了看，摇了摇头。"不，"他说，"那不是我的。"河神又潜下去，带回一把闪亮的银斧头。"那这把是你的吗？""不是，"樵夫说，"我的只是旧铁的。"`,
      `河神微笑着，捞起了他那把普通的铁斧头。"对！"樵夫喊道，"那把才是我的。谢谢你！"能重新握住自己的旧斧头，他高兴得把金的银的全忘到了脑后。`,
      `"你本可以撒谎，"河神说，"但你说了实话，哪怕这会让你吃亏。像你这样的诚实，比黄金还稀有。"于是她把三把斧头都送给了他，作为奖赏。`,
      `樵夫成了富人回到家，却始终没有变。他余生都保持着善良与诚实——而村里人总说，这才是他真正的宝藏。`,
    ],
    vocab: [
      { word: 'honest', meaning: '诚实的' },
      { word: 'slipped', meaning: 'slip 的过去式，滑落' },
      { word: 'spirit', meaning: '精灵、神灵' },
      { word: 'reward', meaning: '奖赏、回报' },
    ],
    discussion: [
      `Have you ever told the truth even when a lie would have helped you? How did it feel?`,
      `The spirit said honesty is "rarer than gold." Do you agree?`,
      `What do you think is your own "real treasure"?`,
    ],
    artNote:
      'Recurring characters: the same kind woodcutter — a bearded man in simple brown clothes — and a gentle glowing river spirit, a woman made of softly shining water. A green forest beside a deep river. Keep both characters and the setting identical on every page.',
  },
  {
    id: 'classic-alice-rabbit-hole',
    title: "Alice in Wonderland — Down the Rabbit-Hole",
    titleZh: '爱丽丝梦游仙境 · 掉进兔子洞',
    category: '名著·童话',
    emoji: '🐰',
    level: 'B1',
    words: 620,
    hook: '爱丽丝追着揣怀表的兔子，掉进了奇妙的地下世界。（儿童版 · 第一章）',
    paragraphs: [
      `Alice was sitting by the river with her sister on a warm afternoon. Her sister was reading a book with no pictures, and Alice was beginning to feel very sleepy and bored. "What is the use of a book," she thought, "without pictures?"`,
      `Suddenly, a White Rabbit with pink eyes ran close by. That was not so strange. But then the Rabbit took a watch out of its pocket, looked at it, and cried, "Oh dear! Oh dear! I shall be late!" Alice had never seen a rabbit with a watch before, so she jumped up and ran after it.`,
      `The Rabbit hurried down a large hole under the hedge, and Alice followed — without once thinking how she would ever get out again. The hole went straight, like a tunnel, and then it suddenly dropped. Alice found herself falling, very slowly, down a deep well.`,
      `Down, down, down she went. The sides of the well were full of cupboards and shelves. As she passed, she picked up a jar that said "ORANGE MARMALADE," but it was empty, so she put it back. "After a fall like this," she thought, "I shall not be afraid of anything!"`,
      `At last she landed softly on a pile of dry leaves. In front of her was a long, dark hall, and the White Rabbit was still hurrying ahead. Alice ran after him, but when she turned the corner, the Rabbit was gone.`,
      `Now she was in a hall full of doors, but every one of them was locked. Then she saw a little glass table with a tiny golden key on it. The key was too small for the big doors — but behind a low curtain she found a little door, only about fifteen inches high.`,
      `The key fitted! Alice opened the little door and saw the loveliest garden she had ever imagined, with bright flowers and cool fountains. But the door was far too small; she could not even fit her head through. "Oh, how I wish I could make myself smaller!" she said.`,
      `Back on the glass table stood a small bottle. Around its neck was a paper label with the words "DRINK ME" printed neatly. Alice was careful — she checked that it did not say "poison" — and then she drank it all. "How strange!" she said. "I feel like I am closing up like a telescope!"`,
      `And so she was. Soon Alice was only ten inches tall, exactly the right size for the little door. But when she ran to it, she remembered that she had left the golden key up on the glass table — and now she was far too small to reach it. She sat down and cried.`,
      `Then she noticed a little glass box under the table. Inside was a small cake, with the words "EAT ME" written on it in currants. "I will eat it," said Alice. "If it makes me grow, I can reach the key; and if it makes me smaller, I can creep under the door."`,
      `She ate a little piece. This time she grew — up and up — until her head pressed against the ceiling of the hall. Now she was more than nine feet tall! She took the key easily, but of course she was far too big for the little door. Poor Alice began to cry again, and her great tears made a deep pool all across the floor.`,
      `Soon the White Rabbit came running back. When he saw the giant Alice, he dropped his white gloves in fright and ran away. As she waited, Alice slowly grew small again and slipped into her own pool of tears, where a little Mouse was swimming nearby. "Perhaps it can talk," thought Alice — and that was only the beginning of her curious adventures in Wonderland.`,
    ],
    translation: [
      `一个温暖的午后，爱丽丝和姐姐坐在河边。姐姐在读一本没有插图的书，爱丽丝开始觉得又困又无聊。"一本书要是没有图画，"她想，"那有什么意思呢？"`,
      `忽然，一只长着粉红眼睛的白兔从旁边跑过。这本来也不算太奇怪。可接着，兔子从口袋里掏出一只怀表，看了看，叫道："哎呀！哎呀！我要迟到了！"爱丽丝从没见过揣着怀表的兔子，于是她跳起来追了上去。`,
      `兔子匆匆钻进树篱下一个大洞，爱丽丝也跟了进去——压根没想过自己要怎么再出来。洞先是像隧道一样笔直，随后猛地向下一沉。爱丽丝发觉自己正缓缓地、沿着一口深井往下坠。`,
      `往下，往下，一直往下。井壁上满是橱柜和架子。经过时，她顺手拿起一个写着"橘子酱"的罐子，可里面是空的，她又把它放了回去。"经过这样一跌，"她想，"我以后再也不会害怕任何事了！"`,
      `最后，她轻轻落在一堆干树叶上。面前是一条又长又暗的走廊，白兔还在前面匆匆赶路。爱丽丝追了上去，可一转弯，兔子就不见了。`,
      `这时她来到一个满是门的大厅，可每一扇门都锁着。随后她看见一张小玻璃桌，上面放着一把小小的金钥匙。钥匙对那些大门来说太小了——但在一道矮帘子后面，她发现了一扇小门，只有大约十五英寸高。`,
      `钥匙正合适！爱丽丝打开小门，看见了她所能想象的最美的花园，有鲜艳的花朵和清凉的喷泉。可那扇门实在太小，她连头都伸不过去。"哎，我真希望自己能变小一点！"她说。`,
      `玻璃桌上立着一个小瓶子，瓶颈上挂着一张纸标签，整整齐齐印着"喝我"两个字。爱丽丝很小心——她先看清楚上面没写"毒药"——然后才把它一饮而尽。"真奇怪！"她说，"我感觉自己像望远镜一样在缩起来！"`,
      `果真如此。不一会儿，爱丽丝只有十英寸高，正好是那扇小门的尺寸。可当她跑到门前，才想起金钥匙落在了玻璃桌上——现在她太小了，根本够不着。她坐下来哭了。`,
      `接着，她注意到桌子底下有一个小玻璃盒。里面是一块小蛋糕，上面用葡萄干拼出"吃我"两个字。"我就吃了它，"爱丽丝说，"要是它让我长大，我就能拿到钥匙；要是让我变小，我就能从门底下钻过去。"`,
      `她吃了一小块。这一次她长大了——越长越高——直到头顶住了大厅的天花板。现在她有九英尺多高！她轻松拿到了钥匙，可她当然又对那扇小门来说太大了。可怜的爱丽丝又哭了起来，大颗的眼泪在地板上汇成了一个深深的水池。`,
      `不久，白兔又跑了回来。一看见变成巨人的爱丽丝，他吓得扔下白手套就跑了。等待的时候，爱丽丝慢慢又缩小了，滑进了自己的泪水池里，旁边正有一只小老鼠在游。"也许它会说话，"爱丽丝想——而这，仅仅是她在仙境里奇妙冒险的开始。`,
    ],
    vocab: [
      { word: 'hurried', meaning: 'hurry 的过去式，匆忙地走' },
      { word: 'label', meaning: '标签' },
      { word: 'telescope', meaning: '望远镜' },
      { word: 'curious', meaning: '好奇的；奇妙的' },
    ],
    discussion: [
      `If you fell down the rabbit-hole, what is the first thing you would do?`,
      `Alice drank from a bottle just because it said "DRINK ME." Was that brave or careless?`,
      `Would you like to read the next chapter of Alice's adventures together?`,
    ],
    artNote:
      'Recurring character: the same young girl Alice with long blonde hair, a light blue dress and a white pinafore apron; and a white rabbit in a waistcoat holding a pocket watch. Keep Alice and the rabbit looking identical on every page.',
  },
  {
    id: 'tale-bear-counts-stars',
    title: 'Little Bear Counts Stars',
    titleZh: '小熊数星星',
    category: '童话·亲子',
    emoji: '🐻',
    level: 'A1',
    words: 220,
    hook: '小熊问妈妈：天上到底有多少颗星星？',
    paragraphs: [
      `One night, Little Bear could not sleep. He crawled out of bed and sat by the window. The sky was full of tiny, sparkling lights. "Mama," he called softly, "how many stars are up there?"`,
      `Mama Bear walked in slowly, still wearing her big brown slippers. She sat beside Little Bear and looked up at the dark sky. "Well," she said with a smile, "let's count them together and find out."`,
      `"One, two, three…" Little Bear began, pointing at each star with his little paw. "Four, five, six…" But then he lost track and had to start again. "Oh no! I lost count again!"`,
      `Mama Bear laughed softly. "That's all right," she said. "Some things are too wonderful to count. We just have to enjoy them." She pulled him close with her big warm arm.`,
      `"But Mama," said Little Bear, "if we can't count them, how do we know they're all there?" Mama smiled and kissed his soft round ear.`,
      `"Because," she said quietly, "every single night — without fail — they come back. And so do I."`,
      `Little Bear thought about that for a moment. Then he yawned a very big yawn, and his eyes began to close. "Mama," he whispered, "I think I counted enough for tonight." And with the stars still shining above, he fell fast asleep.`,
    ],
    translation: [
      `一天夜里，小熊睡不着。他爬下床，坐在窗边。天空里满是小小的、闪闪发光的光点。"妈妈，"他轻轻地喊道，"天上到底有多少颗星星？"`,
      `熊妈妈慢慢走了进来，还穿着她那双大棕色拖鞋。她坐在小熊身边，望向深邃的夜空。"嗯，"她微笑着说，"我们一起数数，看看有多少颗。"`,
      `"一、二、三……"小熊开始数，用小爪子指着每一颗星星。"四、五、六……"可是数着数着就乱了，只好重新开始。"哎呀！我又数错了！"`,
      `熊妈妈轻轻笑了。"没关系，"她说，"有些东西美好得数不清。我们只要好好欣赏就够了。"她用温暖的大手臂把他搂了过来。`,
      `"但是妈妈，"小熊说，"如果我们数不清，怎么知道它们都在呢？"熊妈妈微笑着，亲了亲他柔软的圆耳朵。`,
      `"因为，"她轻声说，"每个夜晚——一次不落——它们都会回来。就像我一样。"`,
      `小熊想了想。然后他打了一个大大的哈欠，眼睛开始慢慢合上。"妈妈，"他轻声说，"我觉得今晚我数够了。"就这样，在满天繁星的陪伴下，他沉沉地睡着了。`,
    ],
    vocab: [
      { word: 'sparkling', meaning: '闪闪发光的' },
      { word: 'slippers', meaning: '拖鞋' },
      { word: 'paw', meaning: '（动物的）爪子' },
      { word: 'whispered', meaning: 'whisper 的过去式，低声说' },
    ],
    discussion: [
      `What question do you like to ask at bedtime that no one can really answer?`,
      `Mama Bear says some things are "too wonderful to count." Do you have something like that?`,
      `Why do you think Little Bear finally felt sleepy?`,
    ],
    artNote:
      'Recurring characters: a small round brown bear cub with big ears and gentle eyes, and a large cozy mama bear in brown slippers. A warm bedroom with a starry night sky through the window. Keep both bears and the cozy bedroom setting identical on every page.',
  },
  {
    id: 'baby-i-love-you-fox',
    title: 'I Love You, Little Fox',
    titleZh: '我爱你，小狐狸',
    category: '宝宝·睡前',
    emoji: '🦊',
    level: 'A1',
    words: 110,
    hook: '一首给小宝宝的睡前情诗：每页一句，柔柔地说"我爱你"。',
    paragraphs: [
      `The day is done. The stars appear. Come, little fox, your bed is near.`,
      `Two little ears, one button nose, ten little paws, and ten little toes.`,
      `I love your ears. I love your eyes. I love your sleepy little sighs.`,
      `I love you high. I love you low. I love you wherever you go.`,
      `When the moon is bright and the night is deep, I'll hold you close as you fall asleep.`,
      `The owls say hush. The wind sings low. The whole wide world is soft as snow.`,
      `No matter how far, no matter how high, my love will always find you. That's no lie.`,
      `Goodnight, little fox. Sweet dreams, my dear. Tomorrow will come, and I'll be here.`,
    ],
    translation: [
      `一天结束了，星星出来了。来吧，小狐狸，你的小床就在身边。`,
      `两只小耳朵，一个纽扣鼻，十只小爪子，十个小脚趾。`,
      `我爱你的耳朵，我爱你的眼睛，我爱你困倦的小小叹息。`,
      `你在高处我爱你，你在低处我爱你，无论你去哪里我都爱你。`,
      `当月亮明亮、夜色深沉，我会把你抱紧，伴你入睡。`,
      `猫头鹰轻轻说"嘘"，风儿低低地唱，整个世界柔软得像雪一样。`,
      `不管多远，不管多高，我的爱永远会找到你。这是真的。`,
      `晚安，小狐狸。做个好梦，我的宝贝。明天会到来，而我会一直在。`,
    ],
    vocab: [
      { word: 'love', meaning: '爱' },
      { word: 'moon', meaning: '月亮' },
      { word: 'paws', meaning: '爪子（paw 的复数）' },
      { word: 'goodnight', meaning: '晚安' },
    ],
    discussion: [
      `What is your favorite part of bedtime with a little one?`,
      `Do you have a goodnight phrase you say every single night?`,
      `Which line of this little book would you whisper first?`,
    ],
    artNote:
      'Recurring characters: the same small watercolor fox cub with big soft eyes and a fluffy white-tipped tail, and a gentle grown-up parent fox. A cosy moonlit den at bedtime, with stars through a small round window and a soft blanket. Keep the foxes and the cosy bedtime den identical and consistent on every page; delicate pen-and-watercolor, very gentle and warm.',
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
