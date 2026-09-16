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
    p2: {
      label: '01 · 省掉录数与做表',
      title: '数据自己进来，报表自己写好',
      body: 'Fortbrain成熟的事件总线机制保证数据采集的事无巨细, 过去点灯熬油的写报告变成自动推送, 连点按钮都省了. ',
      },
    p3: {
      label: '02 · 省掉盯数据',
      title: 'AI 7×24 盯着数据变化，省掉一整个监控室的成本',
      body: 'AI 全天候盯着每一家店、每一个 SKU：缺货、偏低、在途逾期，第一时间通知需要知道的人. Fortbrain特有的鹰眼引擎, 在不放过任何重要节点的同时, 省掉大量的无效token消耗',
    },
    insight: {
      label: '03 · 省掉盘算',
      title: '人算不如天算, 天算不如Fortbrain算',
      body: 'Fortbrain的零售预测引擎洞察到每一个 SKU、每一家店，给出最直接、最不绕弯子的决定：调多少货、什么时候补、哪家店该盯。',
    },
    p4: {
      label: '04 · 有迹可循',
      title: '每一个动作、每一分消耗，都有迹可循',
      body: 'AI 做过什么、为什么做、花了多少：每一次调用、每一条决定、每一笔 token 消耗都记录在案，可查、可审、可回放。授权到人，撤销即失效。这才是企业敢放心交出去的 AI。',
    },
    p1: {
      label: '05 · 人只做决定',
      title: '人只做决定，剩下的助理去办',
      body: '业务事件经过分诊，私人助理<strong>主动</strong>把决定送到你面前：一句「同意」，它就创建调拨单、记入日历、写回系统。打扰有预算，助理不会变成噪音。同时助理持续自我进化, 越用越懂你.',
    },
    p5: {
      label: '06 · 省掉开会跑腿',
      title: '跨部门的问题，助理之间自己问',
      body: '你的助理可以去问同事的助理，直接查另一个部门的知识库，委托子任务。少开一个会，少跑一趟腿。四道防风暴机制，目标把事情做好, 而不是聊闲篇儿。',
    },
    p6: {
      label: '07 · 不换系统',
      title: '不用推翻现有系统，第一天就开始省',
      body: 'POS、爬虫、外部系统按统一的 Addon 协议接进来，核心代码零改动。不换系统、不停业，人效从接入那天起就开始涨。',
    },
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
    p2: {
      label: '01 · No more keying and charting',
      title: 'Data comes in by itself, reports write themselves',
      body: 'Fortbrain’s mature event bus captures every detail as data comes in. Reports that once meant late nights now arrive on their own. You don’t even press a button.',
    },
    p3: {
      label: '02 · No more watching the numbers',
      title: 'AI watches the data 24×7. Save the cost of an entire monitoring room.',
      body: 'The AI keeps watch over every store and every SKU around the clock: stock-outs, low levels and overdue shipments reach the people who need to know, the moment they happen. Fortbrain’s own Hawkeye engine misses no important signal while sparing a great deal of wasted token spend.',
    },
    insight: {
      label: '03 · No more guesswork',
      title: 'People guess, fate decides, Fortbrain calculates.',
      body: 'Fortbrain’s retail forecast engine sees down to every SKU and every store and gives the most direct, no-detour decision: how much to move, when to reorder, which store needs attention.',
    },
    p4: {
      label: '04 · Fully traceable',
      title: 'Every action and every cost leaves a trail',
      body: 'What the AI did, why, and what it cost: every call, every decision and every token spent is on record, searchable, auditable, replayable. Access is granted per person and gone the moment it is revoked. That is what makes an AI a company can trust with real work.',
    },
    p1: {
      label: '05 · People only decide',
      title: 'People only decide; the assistant does the rest',
      body: 'Business events are triaged, and your assistant <strong>brings the decision to you</strong>: say “approve” and it creates the transfer, books the calendar, writes it back into the system. Interruptions have a budget, so it never becomes noise. And the assistant keeps evolving: the more you use it, the better it knows you.',
    },
    p5: {
      label: '06 · No more meetings for answers',
      title: 'Cross-team questions: the assistants ask each other',
      body: 'Your assistant can ask a colleague’s assistant, query another department’s knowledge base, delegate a subtask. One meeting fewer, one errand fewer. Four storm guards keep them on getting the work done, not on idle chatter.',
    },
    p6: {
      label: '07 · Keep your systems',
      title: 'Keep the systems you have; start saving on day one',
      body: 'POS, crawlers and external systems attach through one Addon protocol; the core never changes. No migration, no downtime: output per person rises from the day you plug in.',
    },
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
