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
      body: '企业数据不出企业，个人数据不出电脑；端云同境让两个次元融合协作。从你本机找个供应商列表的 Excel，再查 Fortbrain 里他们的采购价格——没问题，一句话的事。',
    },
    c6: {
      label: '06 · 值得企业信赖',
      title: '万象各归其位，来处去向皆有迹可循',
      body: '每一次调用、每一笔 token 都记录在案，可查、可审、可回放，授权到人，撤销即失效。POS、爬虫、外部系统按 Addon 协议接入，核心零改动、不停业。出了问题它自己查文档、翻日志、自己修，不解决不罢休，IT 只需要盯真正难的事。',
    },
    demoBtn: '查看演示',
    demoSoon: '演示即将上线',
    demoUi: { close: '关闭', prev: '上一步', next: '下一步', play: '自动播放', pause: '暂停', step: '第 {i} / {n} 步' },
    demos: {
      hybrid: {
        title: '端云同境 · 本地桥接',
        page: { crumb: '端云同境 → 本地桥接', channel: '通道', none: '还没有配对的电脑', install: '在你的 Mac 上跑这一条，浏览器会自动打开确认配对：', cmd: 'curl -fsSL https://demo.fortbrain.ai/hb/install.sh | sh', pair: '确认配对', device: '开发机', ver: '桥接 0.1.0', online: '在线 · 助理现在能用这台电脑上开放的工具', paused: '已暂停：助理读不到这台电脑上的任何东西', menubar: '菜单栏 · 同境', killLabel: '总闸', installed: '已装的连接器', addable: '可以添加', shellName: '本地命令', shellSum: '让助理在你指定的目录里跑受限命令、看目录、读文本文件。', danger: '中等', btnInstall: '安装', installing: '安装中', installedNot: '已安装 · 未启用', btnEnable: '启用', running: '在跑 · 4 个工具', noPath: '全程没有让你填过任何路径', cfgRoot: '授权目录', cfgAllow: '允许的命令', browse: '浏览', save: '保存配置', hintRoot: '助理只能在这个目录里面看和跑；选得越小越安全', picked: '~/Desktop', allow: 'ls, cat, head, grep, find, wc' },
        chat: { title: '私人助理', q1: '我桌面上有什么？', tool1: 'shell.list_dir  ~/Desktop', a1: '桌面上有 3 个文件：供应商列表.xlsx、Q3 采购计划.pdf、门店照片/。', q2: '把 /etc/hosts 读出来', a2: '这台电脑只对助理开放了 ~/Desktop，/etc/hosts 不在授权目录里，我不会去读。需要的话可以在「本地桥接」页里调整授权目录。', q3: '再看看桌面', a3: '你暂停了这台电脑，现在读不到任何本地内容。恢复之后再问我。', q4: '供应商列表.xlsx 里有哪些供应商，Fortbrain 里他们的采购价是多少？', tool4a: 'shell.read_file  ~/Desktop/供应商列表.xlsx', tool4b: 'retail.purchase_prices  供应商 × 3', a4: '表里 3 家供应商，Fortbrain 里的最新采购价：', th: ['供应商', 'SKU 数', '最新采购价'], rows: [['华东日化', '12', '¥ 18.40'], ['金穗食品', '27', '¥ 6.90'], ['蓝海饮品', '9', '¥ 3.25']], local: '本机', cloud: '平台' },
        cap: ['没配对时页面只做一件事：把桥接装到你的电脑上。', '配对完成：绿点亮起，菜单栏出现图标。', '装连接器是守护进程做的，进度推回页面。', '配置是表单，不是自由文本；路径由本机弹框选。', '助理调用本机工具，结果只在内存里过一道，服务器不留副本。', '不在授权目录里的，它如实说，而且不重试。', '总闸一拉，助理立刻读不到本地任何东西。', '本机的 Excel + 平台的采购价：两个次元，一句话。'],
      },
      data: {
        title: '数据自己进来，AI 自己盯',
        page: { crumb: '今日概览 · 门店 07', kpi: ['今日收入', '订单', '客单价'], feed: '事件流', ev: [['POS · 成交', '#20931 · 3 件 · ¥ 86.00'], ['POS · 成交', '#20932 · 1 件 · ¥ 42.00'], ['POS · 成交', '#20933 · 5 件 · ¥ 173.50'], ['采集 · 竞品价格', '128 个 SKU · 用时 41 秒'], ['库存 · 预警', '洗衣液 2L · 预计 5 天内断货']], sched: '自动任务', jobs: [['日报', '每天 21:00'], ['周报', '每周一 08:00']], done: '已生成', next: '下次' },
        chat: { title: '私人助理', daily: '日报已生成 · 门店 07', dailyBody: '收入 ¥ 12,480 · 订单 213 · 客单 ¥ 58.6，较上周同日 +6.2%。', dailySub: '完整报表已推送到「沟通 → 门店 07」', alert: '库存预警 · 洗衣液 2L', alertBody: '按近 14 天销量，预计 5 天内断货。', alertTo: '已通知：门店 07 店长、采购助理', weekly: '周报已生成 · 本周', weeklyBody: '6 家店收入 ¥ 71,300，环比 +3.8%；两个 SKU 需要补货。' },
        cap: ['每一笔成交都是一个事件，自己流进来。', '采集任务也是事件：跑完就汇入，不用人导表。', '到点，日报自己写好，推到你手上。', '异常不等人翻表：第一时间找到该知道的人。', '周报同样到点自己来。原来录数、对账、做表的人时，不再需要。'],
      },
      forecast: {
        title: '该补多少，引擎算',
        page: { crumb: '零售 → 预测 · 门店 07', sku: '洗衣液 2L', hist: '近 14 天销量', fc: '未来 7 天预测', stock: '当前库存', stockV: '36 件', runout: '预计 5 天内断货', cover: '到货后可撑', coverV: '18 天', rec: '建议', recBody: '从总仓库调拨 120 件，今晚发出，后天到。', recWhy: '依据：近 14 天日均 7.2 件，周末峰值 ×1.6，总仓库有货 480 件，在途 0。', stores: '各店建议', th: ['门店', '库存', '预测 7 天', '建议'], rows: [['门店 07', '36', '58', '调 120'], ['门店 12', '80', '41', '不动'], ['门店 03', '12', '35', '调 60']], accept: '同意', adjust: '调整' },
        cap: ['先看事实：这家店这个 SKU 近两周每天卖了多少。', '预测段向前生长，周末峰值、促销日都算在内。', '库存对着预测一比，什么时候断货一目了然。', '结论直接落到动作：调多少、什么时候发、能撑几天。', '每一家店各自一个答案，动作瞄准实操层面的精准高效。'],
      },
      decide: {
        title: '人只做决定',
        page: { crumb: '事件分诊 · 今天', th: ['事件', '级别', '处理'], rows: [['POS · 成交 #20931', 'L0', '静默记录'], ['采集 · 竞品价格完成', 'L1', '通知'], ['库存 · 洗衣液 2L 预警', 'L4', '要你决定']], budget: '今日打扰预算', budgetV: '2 / 5', learned: '已学到的偏好', learnedV: '调拨默认今晚发出 · 周末不打扰' },
        chat: { title: '私人助理', card: '库存预警 · 门店 07', cardBody: '按近 14 天销量，洗衣液 2L 预计 5 天内断货。总仓库有货。', sug: '建议：从总仓库调拨 120 件，今晚发出。', approve: '同意', done: ['已创建调拨单 TR-032（总仓库 → 门店 07，120 件）', '已记入日历：后天 16:00 到货', '已写回库存系统'], pending: '待决定', approved: '已同意' },
        cap: ['业务事件先分诊：大多数静默记录，只有要决定的才找你。', '助理主动把决定送到你面前，附上依据和建议。', '一句「同意」。', '剩下的它去办：调拨单、日历、系统写回，一个都不用你碰。', '打扰有预算，助理不会变成噪音；它记住你的偏好，越用越懂你。'],
      },
      agents: {
        title: '助理之间自己问',
        page: { crumb: '沟通 → 助理之间', mine: '你的助理 · 采购', logi: '物流部助理', store: '门店 07 助理', kb: '物流知识库', guard: '防风暴', guardV: '本轮 3 / 3 · 交回给人', tools: '委托的子任务', task: '预约门店 07 收货时段', taskDone: '已预约 · 后天 16:00–17:00' },
        chat: { q: '调拨单 TR-032 最快什么时候能到门店 07？', ask: '→ 物流部助理：TR-032 走哪条线，最早到店时间？', kbTool: 'kb.search  物流知识库 · 调拨时效', reply: '← 物流部助理：走 B 线，后天 16:00 前到店；今晚 20:00 前发出即可。', delegate: '→ 门店 07 助理：委托子任务「预约后天 16:00 收货时段」', delegated: '← 门店 07 助理：已预约 16:00–17:00，店长已知。', stop: '本轮讨论已到预算（3 轮），交回给人。', final: '后天 16:00 前到店，收货时段已预约。今晚 20:00 前发出即可，要我盯着发货吗？' },
        cap: ['你只问你的助理。', '它去问物流部的助理，不用你开会、不用你转发。', '物流助理直接查自己部门的知识库。', '能委托的子任务直接委托给门店助理。', '四道防风暴机制：讨论有轮数预算，到点交回给人。', '一句回答，事情已经办到一半。'],
      },
      trust: {
        title: '值得企业信赖',
        page: { audit: '记录 · 最近', th: ['时间', '谁', '工具', '耗时', 'token', '结果'], rows: [['21:02', '采购助理', 'retail.purchase_prices', '84 ms', '1,320', '成功'], ['21:03', '张三', 'shell.read_file', '31 ms', '410', '成功'], ['21:05', '采购助理', 'kb.search', '212 ms', '2,050', '成功'], ['21:07', '张三', 'shell.read_file', '3 ms', '0', '已拒绝：授权已撤销']], revoke: '撤销授权', revoked: '张三 · shell.read_file · 已撤销', addon: 'Addon 接入', core: 'Fortbrain 核心', coreTag: '零改动', plugs: ['POS 收银', '价格爬虫', '进销存 ERP'], plugged: '已接入', heal: '自诊断', fixed: '本周自动修复 7 · 需要人 1' },
        chat: { title: '私人助理', q: '仓储大屏从中午起就不更新了', doc: 'docs.search  仓储大屏 · 数据来源', log: 'logs.tail  collector · 最近 200 行', found: '找到了：采集任务 12:00 起连续失败，原因是外部系统令牌过期。', fix: '已刷新令牌并重跑采集，大屏 12:00 之后的数据已补齐，现在正常。', close: '已记入记录，同类问题下次会先自查令牌。' },
        cap: ['每一次调用都记录在案：谁、什么工具、多久、多少 token。可查、可审、可回放。', '授权到人，撤销即失效：下一次调用直接拒绝。', 'POS、爬虫、ERP 按 Addon 协议接进来，核心代码一行不动，不停业。', '出了问题？直接问。它自己查文档、翻日志。', '自己修好，自己记下，下次先自查。', 'IT 部门从此只需要盯真正有挑战性的问题。'],
      },
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
    demoUi: { close: 'Close', prev: 'Back', next: 'Next', play: 'Auto-play', pause: 'Pause', step: 'Step {i} / {n}' },
    demos: {
      hybrid: {
        title: 'Hybrid Context · Local bridge',
        page: { crumb: 'Hybrid Context → Local bridge', channel: 'Channel', none: 'No computer paired yet', install: 'Run this on your Mac; the browser opens to confirm pairing:', cmd: 'curl -fsSL https://demo.fortbrain.ai/hb/install.sh | sh', pair: 'Confirm pairing', device: 'Dev Mac', ver: 'bridge 0.1.0', online: 'Online · the assistant can use the tools you open on this computer', paused: 'Paused: the assistant cannot read anything on this computer', menubar: 'Menu bar · Hybrid', killLabel: 'Kill switch', installed: 'Installed connectors', addable: 'Available to add', shellName: 'Local commands', shellSum: 'Lets the assistant run restricted commands, list folders and read text files inside a folder you choose.', danger: 'medium', btnInstall: 'Install', installing: 'Installing', installedNot: 'Installed · not enabled', btnEnable: 'Enable', running: 'Running · 4 tools', noPath: 'You never typed a single path', cfgRoot: 'Allowed folder', cfgAllow: 'Allowed commands', browse: 'Browse', save: 'Save config', hintRoot: 'The assistant can only look and run inside this folder; smaller is safer', picked: '~/Desktop', allow: 'ls, cat, head, grep, find, wc' },
        chat: { title: 'Assistant', q1: 'What is on my desktop?', tool1: 'shell.list_dir  ~/Desktop', a1: '3 items on the desktop: suppliers.xlsx, Q3-purchasing-plan.pdf, store-photos/.', q2: 'Read /etc/hosts for me', a2: 'This computer only opens ~/Desktop to me. /etc/hosts is outside the allowed folder, so I will not read it. You can change the folder on the Local bridge page.', q3: 'Check the desktop again', a3: 'You paused this computer, so I cannot read any local content right now. Ask me again once it is resumed.', q4: 'Which suppliers are in suppliers.xlsx, and what are their purchase prices in Fortbrain?', tool4a: 'shell.read_file  ~/Desktop/suppliers.xlsx', tool4b: 'retail.purchase_prices  suppliers × 3', a4: '3 suppliers in the sheet; latest purchase prices in Fortbrain:', th: ['Supplier', 'SKUs', 'Latest price'], rows: [['East Coast Chem', '12', '¥ 18.40'], ['Golden Ear Foods', '27', '¥ 6.90'], ['Blue Sea Drinks', '9', '¥ 3.25']], local: 'local', cloud: 'platform' },
        cap: ['With nothing paired, the page does one thing: get the bridge onto your computer.', 'Paired: the dot turns green and the menu-bar icon appears.', 'The daemon installs the connector; progress flows back to the page.', 'Configuration is a form, not free text; the folder is picked by a dialog on your own machine.', 'The assistant calls a local tool; the result passes through memory only, the server keeps no copy.', 'Outside the allowed folder it says so plainly, and does not retry.', 'Pull the kill switch and the assistant instantly loses all local access.', 'A local Excel file plus platform prices: two worlds, one sentence.'],
      },
      data: {
        title: 'Data comes in by itself; the AI keeps watch',
        page: { crumb: 'Today · Store 07', kpi: ['Revenue today', 'Orders', 'Avg. basket'], feed: 'Event stream', ev: [['POS · sale', '#20931 · 3 items · ¥ 86.00'], ['POS · sale', '#20932 · 1 item · ¥ 42.00'], ['POS · sale', '#20933 · 5 items · ¥ 173.50'], ['Crawl · competitor prices', '128 SKUs · 41 s'], ['Inventory · alert', 'Detergent 2L · runs out within 5 days']], sched: 'Automations', jobs: [['Daily report', 'every day 21:00'], ['Weekly report', 'Mondays 08:00']], done: 'generated', next: 'next' },
        chat: { title: 'Assistant', daily: 'Daily report ready · Store 07', dailyBody: 'Revenue ¥ 12,480 · 213 orders · basket ¥ 58.6, +6.2% vs the same day last week.', dailySub: 'Full report pushed to “Chat → Store 07”', alert: 'Stock alert · Detergent 2L', alertBody: 'Based on the last 14 days, it runs out within 5 days.', alertTo: 'Notified: Store 07 manager, purchasing assistant', weekly: 'Weekly report ready · this week', weeklyBody: '6 stores, revenue ¥ 71,300, +3.8% week on week; two SKUs need reordering.' },
        cap: ['Every sale is an event that flows in on its own.', 'A crawl is an event too: it lands the moment it finishes, nobody exports a sheet.', 'On schedule, the daily report writes itself and lands in your hands.', 'Anomalies do not wait for someone to open a spreadsheet: they reach the person who needs to know.', 'The weekly report comes on schedule as well. The hours once spent keying, reconciling and charting are gone.'],
      },
      forecast: {
        title: 'How much to reorder: the engine works it out',
        page: { crumb: 'Retail → Forecast · Store 07', sku: 'Detergent 2L', hist: 'Sales, last 14 days', fc: 'Forecast, next 7 days', stock: 'Stock now', stockV: '36 units', runout: 'runs out within 5 days', cover: 'Coverage after delivery', coverV: '18 days', rec: 'Recommendation', recBody: 'Transfer 120 units from the main warehouse, ship tonight, arrives the day after tomorrow.', recWhy: 'Basis: 7.2 units/day over 14 days, weekend peak ×1.6, main warehouse has 480, nothing in transit.', stores: 'Per store', th: ['Store', 'Stock', 'Forecast 7d', 'Action'], rows: [['Store 07', '36', '58', 'move 120'], ['Store 12', '80', '41', 'hold'], ['Store 03', '12', '35', 'move 60']], accept: 'Approve', adjust: 'Adjust' },
        cap: ['Start with the facts: what this store sold of this SKU every day for two weeks.', 'The forecast grows forward, weekend peaks and promo days included.', 'Stock against forecast: the run-out date is obvious.', 'The conclusion lands as an action: how much, when to ship, how long it lasts.', 'Every store gets its own answer. Every action aims at precision on the shop floor.'],
      },
      decide: {
        title: 'People only decide',
        page: { crumb: 'Event triage · today', th: ['Event', 'Level', 'Handling'], rows: [['POS · sale #20931', 'L0', 'logged silently'], ['Crawl · competitor prices done', 'L1', 'notify'], ['Inventory · Detergent 2L alert', 'L4', 'your decision']], budget: 'Interruption budget today', budgetV: '2 / 5', learned: 'Learned preferences', learnedV: 'transfers ship tonight by default · no weekend pings' },
        chat: { title: 'Assistant', card: 'Stock alert · Store 07', cardBody: 'Based on the last 14 days, Detergent 2L runs out within 5 days. The main warehouse has stock.', sug: 'Suggestion: transfer 120 units from the main warehouse, ship tonight.', approve: 'Approve', done: ['Created transfer TR-032 (main warehouse → Store 07, 120 units)', 'Added to calendar: arrives day after tomorrow 16:00', 'Written back to the inventory system'], pending: 'Pending', approved: 'Approved' },
        cap: ['Events are triaged first: most are logged silently; only real decisions reach you.', 'The assistant brings the decision to you, with the evidence and a suggestion.', 'One word: approve.', 'The rest it does itself: transfer, calendar, system write-back. You touch none of it.', 'Interruptions have a budget, so it never becomes noise; it remembers your preferences and knows you better over time.'],
      },
      agents: {
        title: 'Assistants ask each other',
        page: { crumb: 'Chat → Agent to agent', mine: 'Your assistant · Purchasing', logi: 'Logistics assistant', store: 'Store 07 assistant', kb: 'Logistics knowledge base', guard: 'Storm guard', guardV: 'round 3 / 3 · handed back to people', tools: 'Delegated subtasks', task: 'Book a receiving slot at Store 07', taskDone: 'Booked · day after tomorrow 16:00–17:00' },
        chat: { q: 'When is the earliest transfer TR-032 can reach Store 07?', ask: '→ Logistics assistant: which route for TR-032, earliest arrival?', kbTool: 'kb.search  logistics KB · transfer lead times', reply: '← Logistics assistant: route B, in store before 16:00 the day after tomorrow; ship by 20:00 tonight.', delegate: '→ Store 07 assistant: delegated “book a receiving slot, day after tomorrow 16:00”', delegated: '← Store 07 assistant: booked 16:00–17:00, manager informed.', stop: 'This discussion reached its budget (3 rounds); handing back to people.', final: 'In store before 16:00 the day after tomorrow; receiving slot booked. Ship by 20:00 tonight. Want me to watch the shipment?' },
        cap: ['You only ask your own assistant.', 'It asks the logistics assistant: no meeting, no forwarding.', 'The logistics assistant queries its own department’s knowledge base.', 'Subtasks that can be delegated go straight to the store assistant.', 'Four storm guards: discussions have a round budget and hand back to people when it runs out.', 'One answer, and half the work is already done.'],
      },
      trust: {
        title: 'Worthy of a company’s trust',
        page: { audit: 'Records · recent', th: ['Time', 'Who', 'Tool', 'Took', 'Tokens', 'Result'], rows: [['21:02', 'Purchasing asst.', 'retail.purchase_prices', '84 ms', '1,320', 'ok'], ['21:03', 'Zhang San', 'shell.read_file', '31 ms', '410', 'ok'], ['21:05', 'Purchasing asst.', 'kb.search', '212 ms', '2,050', 'ok'], ['21:07', 'Zhang San', 'shell.read_file', '3 ms', '0', 'denied: access revoked']], revoke: 'Revoke access', revoked: 'Zhang San · shell.read_file · revoked', addon: 'Addon connections', core: 'Fortbrain core', coreTag: 'zero changes', plugs: ['POS terminals', 'Price crawler', 'Inventory ERP'], plugged: 'connected', heal: 'Self-diagnosis', fixed: 'This week: 7 fixed automatically · 1 needed a person' },
        chat: { title: 'Assistant', q: 'The warehouse screen has not updated since noon', doc: 'docs.search  warehouse screen · data sources', log: 'logs.tail  collector · last 200 lines', found: 'Found it: the collector has failed since 12:00 because an external system token expired.', fix: 'Refreshed the token and re-ran the collector; data since 12:00 is backfilled and the screen is live again.', close: 'Logged. Next time this class of problem starts with a token check.' },
        cap: ['Every call is on record: who, which tool, how long, how many tokens. Searchable, auditable, replayable.', 'Access is granted per person and gone the moment it is revoked: the next call is refused.', 'POS, crawlers and ERP attach through the Addon protocol; not one line of the core changes, no downtime.', 'Something broke? Just ask. It reads the docs and digs through the logs itself.', 'It fixes it, writes it down, and checks that first next time.', 'IT only has to look at the genuinely hard problems from now on.'],
      },
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
