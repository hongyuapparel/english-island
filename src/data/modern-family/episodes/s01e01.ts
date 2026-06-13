import type { MFEpisode } from '../types'
import { n, t } from '../index'

export const S01E01: MFEpisode = {
  id: 's01e01',
  season: 1,
  episode: 1,
  title: 'Pilot',
  titleZh: '试播集',
  synopsis:
    '三户不太一样的家庭，同一个故事。Jay 娶了年轻的 Gloria；Claire 和「酷爸爸」Phil 管着三个青春期的孩子；Mitchell 和 Cam 刚收养了 Lily。第一集奠定整部剧「伪纪录片」式的吐槽与温情。',
  coverImage:
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
  available: true,
  annotations: {
    'doc-style': {
      id: 'doc-style',
      phrase: 'mockumentary style',
      meaning: '伪纪录片风格',
      explanation:
        'Modern Family 用「采访镜头 + 日常场景」拍摄，角色会直接对着镜头说话（breaking the fourth wall），像纪录片一样 — 所以叫 mockumentary（mock + documentary）。',
    },
    newlyweds: {
      id: 'newlyweds',
      phrase: 'newlyweds',
      meaning: '新婚夫妇',
      explanation: 'newly（最近）+ wed（结婚）。通常指结婚一年内的夫妻。Jay 和 Gloria 年龄差很大，这句自带喜剧效果。',
      example: 'The newlyweds are still learning about each other.',
    },
    'age-gap': {
      id: 'age-gap',
      phrase: 'age gap',
      meaning: '年龄差距',
      explanation: 'gap = 缺口、差距。说 couple 有 age gap 指两人年龄相差较大。',
    },
    enforcer: {
      id: 'enforcer',
      phrase: 'the enforcer',
      meaning: '「执法者」/ 管事的那个人',
      explanation:
        '原意是强制执行规则的人（如警察、黑帮打手）。Claire 用来自嘲：家里真正管孩子、定规矩的是她，Phil 太软。',
      example: "In this house, I'm the enforcer.",
    },
    'cool-dad': {
      id: 'cool-dad',
      phrase: 'cool dad',
      meaning: '酷爸爸',
      explanation:
        'Phil 总想当孩子朋友而不是权威家长 — hugging, 说 "awesome"、学滑板。美式文化里 cool parent 有时 = 不够 strict。',
    },
    'same-sex': {
      id: 'same-sex',
      phrase: 'same-sex couple',
      meaning: '同性伴侣',
      explanation: '2010 年首播时，主流 sitcom 很少把同性家庭放在核心位置。Mitchell 和 Cam 是剧集的重要突破之一。',
    },
    adopted: {
      id: 'adopted',
      phrase: 'adopted',
      meaning: '领养的',
      explanation: 'adopt a baby = 合法收养婴儿。Mitchell 和 Cam 从越南 收养 Lily 是第一季的重要线索。',
    },
    'butt-dial': {
      id: 'butt-dial',
      phrase: 'butt-dial',
      meaning: '屁股误拨（手机在口袋里误触拨号）',
      explanation:
        '也叫 pocket dial。手机在裤袋里摩擦不小心拨出去 — 经典现代喜剧梗。本集 Luke 的 phone 在 party 上惹祸与此相关。',
    },
    'go-time': {
      id: 'go-time',
      phrase: 'go time',
      meaning: '该行动了 / 关键时刻',
      explanation:
        'Phil 爱说的口头禅，表示「现在就开始！」带有 overly enthusiastic 的 Phil 风格。',
      example: "All right, it's go time!",
    },
    'drop-the-act': {
      id: 'drop-the-act',
      phrase: 'drop the act',
      meaning: '别装了',
      explanation: 'act = 装出来的样子。Drop the act = 停止伪装、露出真面目。',
      example: "Come on, drop the act. We know you are nervous.",
    },
    'accident-prone': {
      id: 'accident-prone',
      phrase: 'accident-prone',
      meaning: '容易出事故的',
      explanation: 'prone = 易于…的。Luke 是 classic accident-prone kid — 撞头、摔伤、搞破坏。',
      example: "He is very accident-prone.",
    },
    wingman: {
      id: 'wingman',
      phrase: 'wingman',
      meaning: '（帮你搭讪的）僚机、帮手',
      explanation:
        '原指战斗机编队的僚机。口语里指朋友在酒吧帮你跟异性聊天、打掩护的人。Phil 常自封 cool wingman。',
    },
    'touch-footies': {
      id: 'touch-footies',
      phrase: 'touch football',
      meaning: '触碰式橄榄球（非冲撞）',
      explanation:
        'Thanksgiving 玩 touch football 是美国家庭传统 — 只触碰 tagging，不 tackle 冲撞。本剧多次出现家庭橄榄球梗。',
    },
  },
  pages: [
    {
      sceneTitle: 'Opening — Three Families',
      sceneTitleZh: '开场：三个家庭',
      image:
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=80',
      imageCaption: '三家人，一种混乱的 love。',
      paragraphs: [
        {
          type: 'narration',
          parts: [
            t('Modern Family opens in a '),
            n('doc-style', 'mockumentary style'),
            t(' — characters talk to the camera as if being interviewed for a family documentary. This lets them say what they '),
            n('drop-the-act', 'really think'),
            t(', not just what they say at the dinner table.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Jay',
          parts: [
            t('Gloria and I are '),
            n('newlyweds', 'newlyweds'),
            t(', even though there\'s a bit of an '),
            n('age-gap', 'age gap'),
            t(' between us. She\'s Colombian, I\'m American — we make it work.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Claire',
          parts: [
            t('Phil thinks he\'s a '),
            n('cool-dad', 'cool dad'),
            t('. I\'m '),
            n('enforcer', 'the enforcer'),
            t('. Three kids, one house, zero quiet moments.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Mitchell',
          parts: [
            t('Cam and I are a '),
            n('same-sex', 'same-sex couple'),
            t('. We just '),
            n('adopted', 'adopted'),
            t(' a baby from Vietnam — her name is Lily.'),
          ],
        },
      ],
    },
    {
      sceneTitle: "Phil's World",
      sceneTitleZh: 'Phil 的世界',
      image:
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80',
      imageCaption: 'Phil：永远 110% 热情。',
      paragraphs: [
        {
          type: 'narration',
          parts: [
            t('Phil Dunphy is a real estate agent who believes parenting is about enthusiasm. He wants to be his kids\' friend, their '),
            n('wingman', 'wingman'),
            t(', their coach — sometimes all at once.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Phil',
          parts: [
            t('"I\'m a '),
            n('cool-dad', 'cool dad'),
            t('. That\'s my thing. I\'m hip — I surf the web, I text. LOL — laugh out loud."'),
          ],
        },
        {
          type: 'stage',
          parts: [
            t('（Phil 对着镜头，一脸认真，孩子们在背景里翻白眼 — 这是全剧经典构图。）'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Claire',
          parts: [
            t('"Phil thinks he\'s the fun parent. I\'m the one who actually gets things done. Somebody has to be '),
            n('enforcer', 'the enforcer'),
            t('."'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Claire 和 Phil 的 dynamic 是 sitcom 黄金公式：一个 loose cannon，一个 control freak。但 Modern Family 的好在于 — 他们真的爱彼此，只是表达方式很 clumsy.'),
          ],
        },
      ],
    },
    {
      sceneTitle: "Luke's Party",
      sceneTitleZh: 'Luke 的生日派对',
      image:
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80',
      imageCaption: 'Luke：行走的事故现场。',
      paragraphs: [
        {
          type: 'narration',
          parts: [
            t('Youngest kid Luke is famously '),
            n('accident-prone', 'accident-prone'),
            t('. The pilot builds to his birthday party — where a toy airplane, a phone in a pocket, and Phil\'s need to be "fun dad" collide.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Phil',
          parts: [
            t('"Okay, everybody — it\'s '),
            n('go-time', 'go time'),
            t('! Who wants to play pin the tail on the donkey?"'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Meanwhile, Claire discovers someone may have sent a compromising text from Luke\'s phone — a classic '),
            n('butt-dial', 'butt-dial'),
            t(' situation. The word "butt-dial" itself became part of everyday English thanks to scenes like this.'),
          ],
        },
        {
          type: 'stage',
          parts: [
            t('（这一段的喜剧节奏：误会 → 升级 → 全家抓狂 → 其实没那么糟。学语言时注意他们怎么 '),
            n('drop-the-act', 'drop the act'),
            t(' 对着镜头解释刚才发生了什么。）'),
          ],
        },
      ],
    },
    {
      sceneTitle: 'Jay & Gloria',
      sceneTitleZh: 'Jay 与 Gloria',
      image:
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=80',
      paragraphs: [
        {
          type: 'dialogue',
          speaker: 'Gloria',
          parts: [
            t('"Jay\'s family doesn\'t understand me. His daughter Claire — she thinks I\'m a gold digger. I\'m not. I love Jay."'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Gloria 的英语带 accent，有时会搞错习语 — 这既是笑点也是学习点：native speakers 也会 note 她的 malapropisms（用词错误），但 love 从不打折.'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Jay',
          parts: [
            t('"I\'m not the most touchy-feely guy. But Gloria? She\'s taught me to — I don\'t know — show up. That\'s enough."'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('touchy-feely = 情感外露的、爱肢体接触的。Jay 是典型的 stoic American dad archetype，Gloria 是 firecracker — 文化碰撞产生最好的台词.'),
          ],
        },
      ],
    },
    {
      sceneTitle: 'Mitchell, Cam & Lily',
      sceneTitleZh: 'Mitchell、Cam 和 Lily',
      image:
        'https://images.unsplash.com/photo-1515488042361-ee00e9450b60?w=900&q=80',
      paragraphs: [
        {
          type: 'dialogue',
          speaker: 'Cameron',
          parts: [
            t('"We\'re fathers now. Actual fathers. I\'m gonna be the fun one — Mitchell\'s gonna be the '),
            n('enforcer', 'enforcer'),
            t('."'),
          ],
        },
        {
          type: 'dialogue',
          speaker: 'Mitchell',
          parts: [
            t('"Cam, we talked about this. We\'re co-parents. Also, you\'re not allowed to say \'go time\' in front of the baby."'),
          ],
        },
        {
          type: 'narration',
          parts: [
            t('Cam 戏剧化（dramatic），Mitchell 焦虑（anxious）— 他们的 chemistry 是全剧灵魂之一。注意 co-parent = 共同育儿，不分 primary/secondary.'),
          ],
        },
        {
          type: 'stage',
          parts: [
            t('📖 读本页提示：点击高亮词查看注释。读完后想想 — 三家人有什么相同、有什么不同？'),
          ],
        },
      ],
    },
  ],
}
