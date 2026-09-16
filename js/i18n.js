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
      body: '让 AI 成为企业不知疲倦的成长动力。下面的每一点，都对应一件今天还在由人做、明天不必再由人做的事。',
    },
    layers: {
      label: '一个工作台',
      title: '私人助理、沟通、项目、日历、告警、大屏，都在这里',
      body: '左边是入口，中间是正在发生的事，右边是你和助理一起做的决定。',
    },
    p2: {
      label: '01 · 省掉录数与做表',
      title: '数据自己进来，报表自己写好',
      body: '每一笔成交、每一轮采集都是一个事件，AI 据此<strong>主动</strong>行动：POS 数据自动汇入，今日收入与订单逐笔回放在城市地图上，日报、周报到点自己写好。它不知疲倦、不休假，边做边学、自主进化，越用越准。原来录数、对账、做表的人时，不再需要。',
    },
    p3: {
      label: '02 · 省掉盯库存',
      title: 'AI 7×24 盯着库存，物流一屏看清',
      body: 'AI 全天候盯着每一家店、每一个 SKU：缺货、偏低、在途逾期，第一时间知道。仓储物流大屏上，仓、店、供应商是玻璃罐，液面就是有货比例，货道发光，每一单在途走到哪一步一目了然。没有人需要每天翻库存表。',
    },
    insight: {
      label: '03 · 省掉盘算',
      title: '该补多少、什么时候补，引擎替人算',
      body: '预测引擎洞察到每一个 SKU、每一家店，给出最实际、最不绕弯子的决定：调多少货、什么时候补、哪家店该盯。',
    },
    p4: {
      label: '04 · 省掉值守',
      title: '异常自己找上门，不用人值守',
      body: '告警分四级：L0 静默记录，L1 / L2 通知，L3 告警，L4 让助理主动开会话要确认。该响的响，不该响的不响，没有人需要整天盯着屏幕。',
    },
    p1: {
      label: '05 · 人只做决定',
      title: '人只做决定，剩下的助理去办',
      body: '业务事件经过分诊，私人助理<strong>主动</strong>把决定送到你面前：一句「同意」，它就创建调拨单、记入日历、写回系统。打扰有预算，助理不会变成噪音。',
    },
    p5: {
      label: '06 · 省掉开会跑腿',
      title: '跨部门的问题，助理之间自己问',
      body: '你的助理可以去问同事的助理，直接查另一个部门的知识库，委托子任务。少开一个会，少跑一趟腿。四道防风暴机制，它们不会自己聊起来。',
    },
    p6: {
      label: '07 · 不换系统',
      title: '不用推翻现有系统，第一天就开始省',
      body: 'POS、爬虫、外部系统按统一的 Addon 协议接进来，核心代码零改动；授权到人，撤销即失效。不换系统、不停业，人效从接入那天起就开始涨。',
    },
    result: '同样的人，管更多的店；同样的店，用更少的人。',
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
      body: 'Let AI be the tireless engine of the company’s growth. Every point below is one job that people still do today and will not have to do tomorrow.',
    },
    layers: {
      label: 'One workbench',
      title: 'Assistant, chat, projects, calendar, alerts, dashboards. All in one place.',
      body: 'Left: where you go. Middle: what is happening. Right: the decisions you and your assistant make together.',
    },
    p2: {
      label: '01 · No more keying and charting',
      title: 'Data comes in by itself, reports write themselves',
      body: 'Every sale and every collection run is an event, and the AI <strong>acts on it</strong>: POS data flows in on its own, today’s revenue and orders replay one by one on a real city map, daily and weekly reports are written on schedule. It never tires, never takes leave, learns as it works and keeps getting sharper. The hours once spent keying, reconciling and charting are gone.',
    },
    p3: {
      label: '02 · No more watching stock',
      title: 'AI watches stock 24×7, logistics on one screen',
      body: 'The AI keeps watch over every store and every SKU around the clock: stock-outs, low levels and overdue shipments are caught the moment they happen. On the warehouse screen, warehouses, stores and suppliers are glass tanks, the liquid level is stock coverage, lanes glow, and every shipment shows how far along it is. Nobody pages through stock sheets every morning.',
    },
    insight: {
      label: '03 · No more guesswork',
      title: 'How much to reorder, and when: the engine works it out',
      body: 'A forecast engine with insight down to every SKU and every store, giving the most practical, no-detour decision: how much to move, when to reorder, which store needs attention.',
    },
    p4: {
      label: '04 · No more standing watch',
      title: 'Problems come to you, nobody stands watch',
      body: 'Alerts have four tiers: L0 logged silently, L1 / L2 notify, L3 alerts, L4 makes the assistant open a conversation and demand confirmation. What should ring, rings; nobody stares at a screen all day.',
    },
    p1: {
      label: '05 · People only decide',
      title: 'People only decide; the assistant does the rest',
      body: 'Business events are triaged, and your assistant <strong>brings the decision to you</strong>: say “approve” and it creates the transfer, books the calendar, writes it back into the system. Interruptions have a budget, so it never becomes noise.',
    },
    p5: {
      label: '06 · No more meetings for answers',
      title: 'Cross-team questions: the assistants ask each other',
      body: 'Your assistant can ask a colleague’s assistant, query another department’s knowledge base, delegate a subtask. One meeting fewer, one errand fewer. Four storm guards keep them from chatting among themselves.',
    },
    p6: {
      label: '07 · Keep your systems',
      title: 'Keep the systems you have; start saving on day one',
      body: 'POS, crawlers and external systems attach through one Addon protocol; the core never changes. Access is granted per person and gone the moment it is revoked. No migration, no downtime: output per person rises from the day you plug in.',
    },
    result: 'The same people run more stores. The same stores need fewer people.',
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
