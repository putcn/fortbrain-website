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
      title: '实际地为企业降人力成本、增加单位人效',
      body: '让 AI 成为企业不知疲倦的成长动力。不是为了智能化而智能化，而是每一分投入都落在人效上。',
    },
    layers: {
      label: '一个工作台',
      title: '私人助理、沟通、项目、日历、告警、大屏，都在这里',
      body: '左边是入口，中间是正在发生的事，右边是你和助理一起做的决定。',
    },
    p1: {
      label: '01 · 主动',
      title: '主动，而不是等着被问',
      body: '业务事件经过分诊，私人助理<strong>主动</strong>开一个会话找你要决定。打扰有预算，助理不会变成噪音。',
    },
    p2: {
      label: '02 · 看得见',
      title: '看得见的经营',
      body: 'POS 数据自动汇入，今日收入与订单逐笔回放在城市地图上。不假装秒级，屏上明写延时。',
    },
    p3: {
      label: '03 · 流动',
      title: '库存像液体一样流动',
      body: '仓、店、供应商都是玻璃罐，液面就是有货比例。货道发光，在途的车走到哪一步一眼看清。',
    },
    p4: {
      label: '04 · 分级',
      title: '告警分级，不打扰',
      body: 'L0 静默记录，L1 / L2 普通通知，L3 告警，L4 让助理主动开会话并要求确认。该响的响，不该响的不响。',
    },
    p5: {
      label: '05 · 协作',
      title: '智能体之间会协作',
      body: '你的助理可以去问同事的助理，跨部门知识库直接对话，委托子任务。四道防风暴机制，不会自己聊起来。',
    },
    p6: {
      label: '06 · 接入',
      title: '零改动接入',
      body: 'POS、爬虫、外部系统按统一的 Addon 协议接进来，核心代码零改动。授权到人，撤销即失效。',
    },
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
      title: 'Cut real labor cost. Raise output per person.',
      body: 'Let AI be the tireless engine of the company’s growth. Not intelligence for its own sake: every yuan spent lands on productivity.',
    },
    layers: {
      label: 'One workbench',
      title: 'Assistant, chat, projects, calendar, alerts, dashboards. All in one place.',
      body: 'Left: where you go. Middle: what is happening. Right: the decisions you and your assistant make together.',
    },
    p1: {
      label: '01 · Proactive',
      title: 'Proactive, not waiting to be asked',
      body: 'Business events are triaged, and your assistant <strong>opens a conversation</strong> to ask for a decision. Interruptions have a budget, so the assistant never becomes noise.',
    },
    p2: {
      label: '02 · Visible',
      title: 'Operations you can see',
      body: 'POS data flows in on its own. Today’s revenue and orders replay, one by one, on a real city map. No fake real-time: the delay is printed on screen.',
    },
    p3: {
      label: '03 · Flow',
      title: 'Inventory flows like liquid',
      body: 'Warehouses, stores and suppliers are glass tanks; the liquid level is stock coverage. Lanes glow, and every shipment shows how far along it is.',
    },
    p4: {
      label: '04 · Tiered',
      title: 'Tiered alerts, no nagging',
      body: 'L0 is logged silently, L1 / L2 notify, L3 alerts, L4 makes the assistant open a conversation and demand confirmation. What should ring, rings.',
    },
    p5: {
      label: '05 · Collaborate',
      title: 'Agents collaborate',
      body: 'Your assistant can ask a colleague’s assistant, query another department’s knowledge base, delegate a subtask. Four storm guards keep them from chatting among themselves.',
    },
    p6: {
      label: '06 · Plug in',
      title: 'Plug in with zero core changes',
      body: 'POS, crawlers and external systems attach through one Addon protocol; the core never changes. Access is granted per person and gone the moment it is revoked.',
    },
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
