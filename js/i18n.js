/**
 * All copy, in both languages. Keys mirror the story stages; `ui` holds the strings of the
 * rebuilt Fortbrain interface layers (stage 2). No real customer names anywhere.
 */
export const TEXTS = {
  zh: {
    lang: 'EN',
    hint: '向下滚动',
    q: '现代企业到底需要<br>什么样的智能化？',
    thesis: {
      label: '我们的目标',
      title: '为企业降人力成本、增加单位人效',
      body: '让 AI 成为企业不知疲倦的成长动力。',
    },
    layers: {
      label: '一个工作台',
      title: '谈笑间灰飞烟灭',
      body: '不是一个空无一物的对话框, 而是一个引导你专注力的助理, 把好钢用在刀刃上',
    },
    c1: {
      label: '01 · 数据自己进来，AI 自己盯',
      title: '不出户，知天下',
      body: '每一笔成交、每一次采集都是一个事件，自己流进来；报表到点自己写好，推到你手上。AI 7×24 盯着每一家店、每一个 SKU，异常第一时间找到该知道的人。',
    },
    c2: {
      label: '02 · 该补多少，引擎算',
      title: '人算不如天算，天算不如 Fortbrain 算',
      body: '预测引擎看到每一个 SKU、每一家店，给出最直接、最不绕弯子的决定：调多少货、什么时候补、补多少，每一个动作都瞄准实操层面的精准高效。',
    },
    c3: {
      label: '03 · 人只做决定',
      title: '运筹帷幄之中，决胜千里之外',
      body: '业务事件先分诊，助理把决定送到你面前。一句「同意」，调拨单、日历、系统写回，它自己去办。打扰有预算，助理不会变成噪音；越用越懂你。',
    },
    c4: {
      label: '04 · 助理之间自己问',
      title: '不召而至，不谋而合',
      body: '你的助理可以主动和其他部门的助理讨论，委托子任务，直接查另一个部门的知识库。少开一个会，少跑一趟腿。四道防风暴机制，只办正事，不聊闲篇。',
    },
    c5: {
      label: '05 · 端云同境',
      title: '各守其界，各通其心',
      body: '企业数据不出企业，个人数据不出你的电脑；端云同境让两个次元融合协作。从你本机找个供应商列表的 Excel，再查 Fortbrain 里他们的采购价格——没问题，一句话的事。',
    },
    c6: {
      label: '06 · 值得企业信赖',
      title: '万象各归其位，来处去向皆有迹可循',
      body: '每一次调用、每一笔 token 都记录在案，可查、可审、可回放，授权到人，撤销即失效。POS、爬虫、外部系统按 Addon 协议接入，核心零改动、不停业。出了问题它自己查文档、翻日志、自己修，不解决不罢休，IT 只需要盯真正难的事。',
    },
    demoBtn: '查看演示',
    demoSoon: '演示即将上线',
    result: '现代企业到底需要什么样的智能化？',
    answer: '<em>Fortbrain</em> 就是我们的回答。',
    answerSub: '零售只是我们第一个落地的垂直行业，其他行业敬请期待。',
    contactPre: 'Demo 与细节，请联系',
    ui: {
      brand: 'Fortbrain',
      storeWord: '门店',
      storeSub: '今日 · 演示数据',
      nav: ['今日概览', '私人助理', '沟通', '项目', '日历', '通知', '数据告警', '组织', '知识库', '零售', '销售大屏', '仓储物流大屏'],
      tabs: ['我的对话', '助理之间'],
      search: '搜索对话…',
      list: [
        ['库存 · 门店 07', '库存预警：3 个 SKU 预计 5 天内断货'],
        ['自动任务 · 周报', '每周销售周报已生成'],
        ['库存 · 总仓库', '调拨单 TR-031 已发出，预计 2 天到'],
        ['告警 · 通风', 'L3 · 2 号风机振动超阈值'],
        ['项目 · 秋季上新', '检查点「样品确认」明天到期'],
        ['库存 · 门店 12', '库存提醒：两个商品偏低'],
      ],
      chat: {
        title: '私人助理',
        card: ['库存预警 · 门店 07', '按近 14 天销量，3 个 SKU 预计 5 天内断货。总仓库有货。', '建议：从总仓库调拨 120 件，今晚发出。'],
        user: '同意',
        reply: '已创建调拨单 TR-032，总仓库 → 门店 07，120 件，预计后天到。已记入日历。',
      },
    },
  },
  en: {
    lang: '中文',
    hint: 'Scroll',
    q: 'What kind of intelligence does<br>a modern enterprise actually need?',
    thesis: {
      label: 'Our goal',
      title: 'Cut labor costs. Raise output per person.',
      body: 'Let AI be the tireless engine of the company’s growth.',
    },
    layers: {
      label: 'One workbench',
      title: 'Hard problems, settled in conversation.',
      body: 'Not an empty chat box, but an assistant that steers your attention to where it counts.',
    },
    c1: {
      label: '01 · Data comes in by itself; the AI keeps watch',
      title: 'Know the whole world without stepping out the door',
      body: 'Every sale and every collection run is an event that flows in on its own; reports write themselves on schedule and land in your hands. The AI watches every store and every SKU around the clock, and the moment something is off it reaches the person who needs to know.',
    },
    c2: {
      label: '02 · How much to reorder: the engine works it out',
      title: 'People guess, fate decides, Fortbrain calculates.',
      body: 'The forecast engine sees down to every SKU and every store and gives the most direct, no-detour decision: how much to move, when to reorder, how much to order. Every action aims at precision and efficiency on the shop floor.',
    },
    c3: {
      label: '03 · People only decide',
      title: 'Decide at your desk; win a thousand miles away',
      body: 'Business events are triaged first, and the assistant brings the decision to you. Say “approve” and the transfer, the calendar entry and the system write-back get done on their own. Interruptions have a budget, so it never becomes noise, and it knows you better the more you use it.',
    },
    c4: {
      label: '04 · Assistants ask each other',
      title: 'They come uncalled and agree unplanned',
      body: 'Your assistant can open a discussion with another department’s assistant, delegate a subtask, and query that department’s knowledge base directly. One meeting fewer, one errand fewer. Four storm guards keep them on real work, not idle chatter.',
    },
    c5: {
      label: '05 · Hybrid Context',
      title: 'Each keeps its bounds; each knows the other’s mind',
      body: 'Company data never leaves the company; personal data never leaves your own computer. Hybrid Context lets the two worlds work as one. Find a supplier list in an Excel file on your machine, then look up their purchase prices inside Fortbrain: no problem, one sentence does it.',
    },
    c6: {
      label: '06 · Worthy of a company’s trust',
      title: 'Everything in its place, every trail on record',
      body: 'Every call and every token spent is on record: searchable, auditable, replayable, granted per person and gone the moment it is revoked. POS, crawlers and external systems attach through the Addon protocol with zero changes to the core and no downtime. When something breaks it reads the docs, digs through the logs and repairs itself, and doesn’t let go until it’s solved. IT only has to look at the genuinely hard problems.',
    },
    demoBtn: 'See it in action',
    demoSoon: 'Demo coming soon',
    result: 'What kind of intelligence does a modern enterprise actually need?',
    answer: '<em>Fortbrain</em> is our answer.',
    answerSub: 'Retail is only the first industry we have gone live in. More are on the way.',
    contactPre: 'For a demo and details, contact',
    ui: {
      brand: 'Fortbrain',
      storeWord: 'Store',
      storeSub: 'Today · demo data',
      nav: ['Today', 'Assistant', 'Chat', 'Projects', 'Calendar', 'Notifications', 'Data alerts', 'Organization', 'Knowledge', 'Retail', 'Sales screen', 'Warehouse screen'],
      tabs: ['My chats', 'Agent to agent'],
      search: 'Search conversations…',
      list: [
        ['Inventory · Store 07', 'Stock alert: 3 SKUs run out within 5 days'],
        ['Automation · Weekly', 'Weekly sales report generated'],
        ['Inventory · Main warehouse', 'Transfer TR-031 shipped, ETA 2 days'],
        ['Alert · Ventilation', 'L3 · Fan #2 vibration over threshold'],
        ['Project · Autumn launch', 'Checkpoint "Sample sign-off" due tomorrow'],
        ['Inventory · Store 12', 'Two products running low'],
      ],
      chat: {
        title: 'Assistant',
        card: ['Stock alert · Store 07', 'Based on the last 14 days, 3 SKUs run out within 5 days. Main warehouse has stock.', 'Suggestion: transfer 120 units from the main warehouse, ship tonight.'],
        user: 'Approve',
        reply: 'Created transfer TR-032, main warehouse → Store 07, 120 units, arriving the day after tomorrow. Added to your calendar.',
      },
    },
  },
}

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)

/** zh for zh-* browsers, en otherwise; a valid stored choice wins. */
export function detectLang({ navigator = globalThis.navigator, stored = safeGet() } = {}) {
  if (stored === 'zh' || stored === 'en') return stored
  return String(navigator?.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function safeGet() { try { return globalThis.localStorage?.getItem('lang') } catch { return null } }

/**
 * Write every `[data-i18n]` element from the table (innerHTML; the copy is ours, not user input),
 * set `<html lang>`, remember the choice. `data-i18n-index` picks an item from an array value.
 */
export function applyLang(lang, { root = document, storage = globalThis.localStorage } = {}) {
  const t = TEXTS[lang] || TEXTS.en
  for (const el of root.querySelectorAll('[data-i18n]')) {
    let v = get(t, el.getAttribute('data-i18n'))
    const idx = el.getAttribute?.('data-i18n-index')
    if (Array.isArray(v) && idx != null) v = v[Number(idx)]
    if (v != null) el.innerHTML = Array.isArray(v) ? v.join('') : String(v)
  }
  root.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  try { storage?.setItem('lang', lang) } catch { /* private mode: fine, just not remembered */ }
  return lang
}
