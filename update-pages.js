var fs = require('fs');

var logoWhiteB64 = fs.readFileSync('/tmp/logo-white-b64.txt', 'utf8').trim();
var LOGO_WHITE = 'data:image/png;base64,' + logoWhiteB64;

var data = JSON.parse(fs.readFileSync('/Users/naohirotokuda/englead-phrasebook/content/01_online-meetings.json', 'utf8'));

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyEmphasis(text, emphasisList) {
  var result = esc(text);
  for (var i = 0; i < emphasisList.length; i++) {
    var em = esc(emphasisList[i]);
    result = result.split(em).join('<span class="em">' + em + '</span>');
  }
  return result;
}

function pad(n) { return n < 10 ? '0' + n : String(n); }

function renderPhraseCell(p) {
  var badge = p.type === 'idiom'
    ? '<span class="type-badge" style="background:#C0392B;">イディオム</span>'
    : '<span class="type-badge" style="background:#1A3B6B;">フレーズ</span>';
  var noteHtml = p.street_note
    ? '\n      <div class="street-note">' + esc(p.street_note) + '</div>'
    : '';
  return '    <div class="phrase-cell">\n' +
    '      <div class="phrase-top"><span class="phrase-num">' + pad(p.num) + '</span><span class="phrase-en">' + applyEmphasis(p.phrase_en, p.emphasis) + '</span></div>\n' +
    '      <div class="phrase-ja">' + esc(p.phrase_ja) + '</div>\n' +
    '      <div class="phrase-katakana">' + esc(p.katakana) + '</div>\n' +
    '      <div class="phrase-phonics">' + esc(p.phonics) + '</div>\n' +
    '      <div class="phrase-meta">' + badge + '<span class="phrase-scene">' + esc(p.scene) + '</span></div>' + noteHtml + '\n' +
    '    </div>\n';
}

function renderBubble(speaker, textHtml, refs) {
  var isRight = speaker !== 'kenta';
  var name = speaker === 'kenta' ? 'Kenta' : (speaker.charAt(0).toUpperCase() + speaker.slice(1));
  var avatarHtml = '<div class="avatar-wrap"><img class="avatar" src="../assets/avatars/' + speaker + '.png" alt="' + name + '" onerror="this.parentNode.outerHTML=\'<div class=&quot;avatar-circle&quot; style=&quot;background:#1B2A5E;&quot;>' + name.charAt(0) + '</div>\'"></div>';
  var refsHtml = '';
  if (refs && refs.length) {
    for (var r = 0; r < refs.length; r++) {
      refsHtml += ' <span class="phrase-ref">' + pad(refs[r]) + '</span>';
    }
  }
  var bubbleClass = speaker === 'kenta' ? 'bubble kenta' : 'bubble other';
  var rowClass = isRight ? 'bubble-row right' : 'bubble-row';
  return '        <div class="' + rowClass + '">\n' +
    '          ' + avatarHtml + '\n' +
    '          <div class="bubble-wrap"><div class="bubble-name">' + name + '</div>\n' +
    '          <div class="' + bubbleClass + '">' + textHtml + refsHtml + '</div></div>\n' +
    '        </div>\n';
}

// ── Category definitions ──────────────────────────────────────────────────────

var catDefs = [
  { idx: 1,  id: 'connection',    ja: '接続・開始',       en: 'Connection & Start',       color: '#2E5896', from: 1,  to: 10  },
  { idx: 2,  id: 'facilitation', ja: '会議の進行',        en: 'Meeting Flow',              color: '#5E3A8E', from: 11, to: 20  },
  { idx: 3,  id: 'opinions',     ja: '意見・提案',        en: 'Opinions & Proposals',      color: '#8E4A1E', from: 21, to: 30  },
  { idx: 4,  id: 'questions',    ja: '質問・確認',        en: 'Questions & Clarification', color: '#1E7A5E', from: 31, to: 40  },
  { idx: 5,  id: 'agreement',    ja: '同意・反対',        en: 'Agreement & Pushback',      color: '#7A1E4E', from: 41, to: 50  },
  { idx: 6,  id: 'time',         ja: '時間管理',              en: 'Time Management',           color: '#4E7A1E', from: 51, to: 60  },
  { idx: 7,  id: 'technical',    ja: '技術トラブル',  en: 'Technical Issues',          color: '#1E5E7A', from: 61, to: 70  },
  { idx: 8,  id: 'wrapup',       ja: 'まとめ・アクション', en: 'Wrap-up & Actions', color: '#6E5E1E', from: 71, to: 80  },
  { idx: 9,  id: 'closing',      ja: 'クロージング',  en: 'Closing',                   color: '#3E5E3E', from: 81, to: 90  },
  { idx: 10, id: 'presentation', ja: 'プレゼン・デモ', en: 'Presenting & Demo',    color: '#8E6B2E', from: 91, to: 100 }
];

// ── Roleplay definitions ──────────────────────────────────────────────────────

var rpDefs = {
  'connection': {
    sceneTitle: '月曜朝の定例MTG',
    sceneTitleEn: 'Monday Morning Standup',
    sceneDesc: 'Kenjiが主催。チームは米国・欧州に分散。<br>開始直後に次々トラブルが起きるが、<br>身についたフレーズで冷静に対処する。',
    imageFile: 'home-office-start.png',
    cultureText: '米国のオンライン会議では、ホストが音声確認から始めるのが慣例。全員に「聴こえてる？」と問いかけることで共通のスタートラインを作る。録音の事前告知もエチケットとして定着しており、無告知の録音は信頼関係を損ねることがある。',
    bubbles: [
      { speaker: 'kenta', text: 'Hey, can everyone <strong>hear me okay</strong>?', refs: [1] },
      { speaker: 'sarah', text: 'Loud and clear! Tom — <strong>you\'re on mute</strong>.', refs: [2] },
      { speaker: 'tom',   text: 'Sorry about that! Can you hear me now?', refs: [] },
      { speaker: 'kenta', text: 'Perfect. Let\'s <strong>go ahead and get started</strong>. I\'ll <strong>drop the agenda in the chat</strong>.', refs: [3, 7] },
      { speaker: 'sarah', text: 'Got it. <strong>Can you see my screen</strong>? I want to pull up the deck.', refs: [6] },
      { speaker: 'kenta', text: 'Yep, all good. <strong>Just a heads-up</strong> — I\'m <strong>recording this call</strong>.', refs: [8] },
      { speaker: 'sarah', text: 'No problem. Everyone, <strong>feel free to use the chat</strong> for questions!', refs: [9] },
      { speaker: 'tom',   text: 'Thanks. <strong>I\'m going to share my screen</strong> for the Berlin numbers — just getting it ready.', refs: [5] },
      { speaker: 'kenta', text: 'Take your time. <strong>We\'ll give it another minute</strong>.', refs: [4] }
    ],
    keyPoints: [
      { phrase: '"hear me okay?"', desc: '"Can you hear me?" より全員への問いかけ感が強い。会議開始直後の定番確認。' },
      { phrase: '"go ahead and"', desc: '「では〜しましょう」と踏み出す印象を与える。"let\'s start" より積極的なニュアンス。' },
      { phrase: '"heads-up"', desc: '事前告知の万能フレーズ。録音・遅延・変更など何でも前置きできる。単独でも使える。' }
    ]
  },
  'facilitation': {
    sceneTitle: 'Q3週次チームシンク',
    sceneTitleEn: 'Q3 Weekly Team Sync',
    sceneDesc: 'Kentaがファシリテーター。<br>議題3項目だが議論が脱線しがち。<br>フレーズを駆使して会議を舵取りする。',
    imageFile: 'conference-room.png',
    cultureText: 'ファシリテーターの役割は議論に参加するだけでなく、時間内に全議題を終わらせる管理者としての責任も大きい。話が脱線しそうになる前に積極的に軸修正できる素早さが、引き締まった会議を作る。',
    bubbles: [
      { speaker: 'kenta', text: 'OK everyone. Let\'s <strong>kick things off</strong> with the Q3 update.', refs: [11] },
      { speaker: 'kenta', text: '<strong>Today\'s agenda</strong> has three <strong>items</strong>.', refs: [12] },
      { speaker: 'tom',   text: 'Before we start — I have a quick update on Berlin.', refs: [] },
      { speaker: 'kenta', text: '<strong>Can we hold that thought</strong>, Tom? We\'ve got a lot to cover. We\'ve got 30 minutes, so let\'s <strong>dive right in</strong>.', refs: [19, 16] },
      { speaker: 'kenta', text: '<strong>Take it away</strong>, Sarah.', refs: [17] },
      { speaker: 'sarah', text: 'Thanks. So Q3 revenue came in at 112% of target...', refs: [] },
      { speaker: 'tom',   text: 'That connects to the Berlin rollout issue, actually —', refs: [] },
      { speaker: 'kenta', text: 'I want to <strong>keep us on track</strong>. Let\'s <strong>park that and come back to it</strong>.', refs: [14, 18] },
      { speaker: 'kenta', text: '<strong>Moving on to</strong> item two.', refs: [13] },
      { speaker: 'kenta', text: 'OK, let\'s <strong>circle back</strong> to Tom\'s point now. And then I\'d like to <strong>open it up for discussion</strong>.', refs: [15, 20] }
    ],
    keyPoints: [
      { phrase: '"kick things off"', desc: '開始の宣言に使う定番。スポーツ由来で動きのある言い出し。' },
      { phrase: '"park that / circle back"', desc: '保留（park）して後で戻る（circle back）のセット。会議の流れを止めずに撑ける技。' },
      { phrase: '"open it up for discussion"', desc: '説明から全員議論への転換点。意見を求めるサイン。' }
    ]
  },
  'opinions': {
    sceneTitle: '市場参入戦略議論',
    sceneTitleEn: 'Market Entry Strategy',
    sceneDesc: '新規市場参入の提案をめぐり、<br>Kentaが見解を示し、Sarahが反論、<br>Tomが折衷案を出す場面。',
    imageFile: 'whiteboard-discussion.png',
    cultureText: '英語ネイティブは「反対」と思っても直接言わないことが多い。「その立場はわかる、だが…」のように「認めつつ推す」形式は日本語より浸透している。「反論」より「別の角度を加える」という姿勢で挑んでみよう。',
    bubbles: [
      { speaker: 'kenta', text: '<strong>From my perspective</strong>, we should target the mid-market segment first.', refs: [21] },
      { speaker: 'sarah', text: 'I\'d like to <strong>add something here</strong>. That\'s valid, but we need to consider risk.', refs: [22] },
      { speaker: 'tom',   text: 'Just to <strong>throw it out there</strong> — what if we piloted one city first?', refs: [23] },
      { speaker: 'kenta', text: '<strong>Here\'s my take on it</strong>: the data actually supports a phased approach.', refs: [24] },
      { speaker: 'sarah', text: '<strong>To be honest with you</strong>, I think we\'re underestimating the competition.', refs: [25] },
      { speaker: 'kenta', text: 'I think we need to <strong>push back on that</strong> timeline. It\'s too aggressive.', refs: [26] },
      { speaker: 'tom',   text: '<strong>That\'s a fair point</strong>. Speed vs. stability is the real trade-off here.', refs: [27] },
      { speaker: 'kenta', text: '<strong>Off the top of my head</strong>, a pilot could save us around 20% in launch costs.', refs: [28] },
      { speaker: 'sarah', text: '<strong>This is just my gut feeling</strong>, but I think the timing is actually right.', refs: [29] },
      { speaker: 'tom',   text: '<strong>Building on what</strong> Kenta said, let\'s propose a 3-city pilot to the board.', refs: [30] }
    ],
    keyPoints: [
      { phrase: '"from my perspective"', desc: '意見の前置き。「私の立場では」と明示できる。"my take on it" も同じ用途。' },
      { phrase: '"push back on that"', desc: '建設的な反論。"disagree" よりニュアンスが柔らか。' },
      { phrase: '"building on what [Name] said"', desc: '前の発言を踏まえた引き継ぎ。チームで考えている感が出る。' }
    ]
  },
  'questions': {
    sceneTitle: '予算レビューミーティング',
    sceneTitleEn: 'Q4 Budget Review',
    sceneDesc: 'Sarahが予算案を発表。<br>KenjiとTomが確認質問を重ねて、<br>認識をすり合わせる場面。',
    imageFile: 'one-on-one.png',
    cultureText: '英語会議では、理解したつもりで進めるより、こまめに確認する方が好評される。曖昧なまま流すと後で認識のズレが生じるリスクがある。「私の理解では」と言いながら確認するこまめさは信頼の証。',
    bubbles: [
      { speaker: 'sarah', text: 'So we\'re proposing a 15% budget increase for APAC in Q4.', refs: [] },
      { speaker: 'kenta', text: '<strong>Could you elaborate on that</strong>? What\'s driving the 15%?', refs: [31] },
      { speaker: 'sarah', text: '<strong>Just to clarify</strong> — this covers Q4 only, not the full year.', refs: [32] },
      { speaker: 'tom',   text: '<strong>Can you walk me through</strong> the regional breakdown one more time?', refs: [33] },
      { speaker: 'kenta', text: 'I want to <strong>make sure I\'m following you</strong> — the bulk is Japan market?', refs: [34] },
      { speaker: 'sarah', text: 'Exactly, Japan is 60% of the proposed increase.', refs: [] },
      { speaker: 'tom',   text: '<strong>So if I understand correctly</strong>, we\'d hit the ceiling by end of March?', refs: [35] },
      { speaker: 'kenta', text: '<strong>Are we on the same page</strong> then — pilot Japan, review in Q1?', refs: [36] },
      { speaker: 'sarah', text: 'Yes. <strong>What\'s the timeline looking like</strong> for board approval?', refs: [37] },
      { speaker: 'kenta', text: '<strong>What\'s the blocker</strong> on our side right now?', refs: [38] },
      { speaker: 'tom',   text: 'Legal sign-off. Sarah, <strong>what\'s your bandwidth like</strong> this week?', refs: [40] }
    ],
    keyPoints: [
      { phrase: '"walk me through"', desc: 'ステップごとに説明してもらうイメージ。「もう一回」より柔らかい。' },
      { phrase: '"are we on the same page?"', desc: '認識共有の確認。同じページを読んでいる？という比喩。' },
      { phrase: '"what\'s the blocker?"', desc: 'ITプロジェクト発祥の言葉が一般ビジネスに洸透。途中で止まっている原因を聞く。' }
    ]
  },
  'agreement': {
    sceneTitle: 'プロジェクト期日交渉',
    sceneTitleEn: 'Deadline Negotiation',
    sceneDesc: '納期を2週間前倒しにする提案が出て、<br>各メンバーが立場を表明する場面。<br>譲歩と確認を繰り返して典型的な著地点を探る。',
    imageFile: 'negotiation.png',
    cultureText: '英語の交渉では「完全拒否」でなく「条件付き許容」の形でまとめるのがプロフェッショナル。「これは受け入れられない」と「これなら許容できる」を明確に伝えることが大切。',
    bubbles: [
      { speaker: 'kenta', text: 'We\'re proposing to move the launch up by two weeks. Thoughts?', refs: [] },
      { speaker: 'sarah', text: '<strong>That makes total sense</strong> from a competitive standpoint.', refs: [42] },
      { speaker: 'tom',   text: '<strong>I see your point</strong>, but <strong>I have some reservations</strong> about the dev timeline.', refs: [43, 44] },
      { speaker: 'kenta', text: 'Tom, is a two-week pull-forward workable at all?', refs: [] },
      { speaker: 'tom',   text: 'Honestly, two weeks is <strong>a no-go for me</strong>.', refs: [45] },
      { speaker: 'sarah', text: 'What about one week? <strong>I can live with</strong> one week.', refs: [46] },
      { speaker: 'tom',   text: 'One week... <strong>I\'m not sold on it yet</strong>, but I\'m open to discussing.', refs: [47] },
      { speaker: 'sarah', text: 'Kenji, <strong>you\'ve convinced me</strong> on the urgency angle.', refs: [48] },
      { speaker: 'kenta', text: 'If we can\'t land on a number now, let\'s <strong>agree to disagree</strong> and loop in the VP.', refs: [49] },
      { speaker: 'tom',   text: 'No, no — one week, <strong>I\'m on board with that</strong>. And <strong>I\'m with you on this one</strong>, Kenji.', refs: [41, 50] }
    ],
    keyPoints: [
      { phrase: '"no-go"', desc: '完全に受け入れられないことを明確に伝える。使いすぎには注意が必要。' },
      { phrase: '"I can live with that"', desc: '完璧ではないが許容できるという妛協の言葉。交渉の定番フレーズ。' },
      { phrase: '"agree to disagree"', desc: '対立を残さず認識の相違を認めて先に進む。拒否でなく着地点を探すフレーズ。' }
    ]
  },
  'time': {
    sceneTitle: '時間超過の週次シンク',
    sceneTitleEn: 'Running-Long Weekly Sync',
    sceneDesc: 'アジェンダが多く、残り5分で議题が3つ。<br>Kenjiが時間管理フレーズを驱使いして<br>会議をのらしにける。',
    imageFile: 'time-pressure.png',
    cultureText: 'オンライン会議で時間遵守は特別重要。次の予定がある参加者への配慮がプロとしての姿勢を示す。時間切れを自然に伝えられるフレーズを持っておくだけで会議のクオリティが上がる。',
    bubbles: [
      { speaker: 'kenta', text: 'Everyone — <strong>we\'re running short on time</strong>. Three items left, five minutes.', refs: [51] },
      { speaker: 'tom',   text: 'Should we <strong>table</strong> the compliance update <strong>for now</strong>?', refs: [52] },
      { speaker: 'sarah', text: 'The vendor issue — <strong>can we take that offline</strong>? Just you and me, Kenji.', refs: [53] },
      { speaker: 'kenta', text: 'Good idea. <strong>Let\'s try to wrap up</strong> in the next three minutes.', refs: [54] },
      { speaker: 'tom',   text: 'I want to <strong>be mindful of everyone\'s time</strong>, so I\'ll keep this brief.', refs: [55] },
      { speaker: 'sarah', text: '<strong>Can we fast-track</strong> the budget approval? It\'s blocking the team.', refs: [56] },
      { speaker: 'kenta', text: '<strong>We\'re going a little over</strong> — does anyone need to drop at the hour?', refs: [57] },
      { speaker: 'kenta', text: '<strong>Can we get a quick show of hands</strong> on the Q1 revenue target?', refs: [58] },
      { speaker: 'sarah', text: '<strong>Let\'s keep it brief</strong> — yes or no on the proposal, please.', refs: [59] },
      { speaker: 'tom',   text: 'The vendor contract details are <strong>a conversation for another time</strong>.', refs: [60] }
    ],
    keyPoints: [
      { phrase: '"running short on time"', desc: '時間切迫の定番表現。焦らず自然に全員へ共有できる。' },
      { phrase: '"take this offline"', desc: '全体会議でなく個別に話す提案。ビジネス英語の定番。' },
      { phrase: '"show of hands"', desc: '振り分けや簡易投票に。オンラインではリアクションボタンで代用することも。' }
    ]
  },
  'technical': {
    sceneTitle: 'トラブル続出のMTG',
    sceneTitleEn: 'Connection Nightmare Meeting',
    sceneDesc: '次々と技術トラブルが起きる中、<br>Kenjiが冷静に対処しながら<br>会議を進める場面。',
    imageFile: 'tech-trouble.png',
    cultureText: 'トラブルを動じずに報告できることが重要。「接続が切れている」「エコーが出ている」をすぐに伝えられると会議の流れが止まらない。トラブル対応をサラッとこなせる落ち着きもプロの証明。',
    bubbles: [
      { speaker: 'kenta', text: 'So as I was saying, the Q3 forecast shows—', refs: [] },
      { speaker: 'tom',   text: 'Kenji, <strong>you\'re breaking up</strong> a little. Can you hear us?', refs: [61] },
      { speaker: 'kenta', text: '<strong>Can you repeat that</strong>? Tom, <strong>you cut out</strong> for a second.', refs: [62] },
      { speaker: 'sarah', text: '<strong>There\'s a bit of an echo on my end</strong> — let me mute for a sec.', refs: [63] },
      { speaker: 'tom',   text: '<strong>Could you turn off your video</strong>? <strong>The connection seems slow</strong>.', refs: [64] },
      { speaker: 'kenta', text: '<strong>Sorry, I was on mute</strong>. Starting again—', refs: [65] },
      { speaker: 'tom',   text: '<strong>Let me try reconnecting</strong> — back in a sec.', refs: [66] },
      { speaker: 'kenta', text: 'Welcome back, Tom. <strong>Can everyone still see my screen</strong>?', refs: [67] },
      { speaker: 'sarah', text: '<strong>Sorry about the background noise</strong> — construction outside.', refs: [68] },
      { speaker: 'tom',   text: '<strong>My connection is a bit spotty today</strong> — I\'m at the airport. <strong>Can someone else take over the screen share</strong>?', refs: [69, 70] }
    ],
    keyPoints: [
      { phrase: '"you\'re breaking up"', desc: '音声が途切れているときの定番。電話でも同じ表現。' },
      { phrase: '"you cut out"', desc: '突然通信が途切れたことを伝える。「聴こえなかった」の最短表現。' },
      { phrase: '"spotty"', desc: '接続が不安定なことを伝える口語表現。名詞として使うことが多い。' }
    ]
  },
  'wrapup': {
    sceneTitle: 'プロジェクト計画を締める',
    sceneTitleEn: 'Project Planning Wrap-up',
    sceneDesc: 'プロジェクト計画ミーティングの最後10分。<br>アクションアイテムの整理と<br>担当割り当てを行う場面。',
    imageFile: 'wrap-up.png',
    cultureText: '英語会議の「アクションアイテム」は議事録の核心。誰がいつまでに何をするかを確認して会議を終わる文化が浸透している。担当者の名前と期限を必ずセットで確認すること。',
    bubbles: [
      { speaker: 'kenta', text: 'OK, let me <strong>recap</strong> what we discussed today.', refs: [71] },
      { speaker: 'kenta', text: 'Let me <strong>summarize the action items</strong>: design mock-up by Friday, dev build by Monday EOD.', refs: [72] },
      { speaker: 'kenta', text: '<strong>Who\'s taking the lead</strong> on the design mock-up?', refs: [73] },
      { speaker: 'sarah', text: 'I\'ll <strong>own that</strong>.', refs: [74] },
      { speaker: 'kenta', text: 'Great. <strong>Let\'s put a deadline on</strong> the dev task — Monday EOD, Tom?', refs: [75] },
      { speaker: 'tom',   text: 'Works for me. I\'ll <strong>send out a follow-up email</strong> with all the details.', refs: [76] },
      { speaker: 'kenta', text: 'Sarah, <strong>can you share</strong> the budget breakdown <strong>in writing after the call</strong>?', refs: [77] },
      { speaker: 'kenta', text: 'We\'ll need to <strong>reconvene</strong> on the legal review next week.', refs: [78] },
      { speaker: 'kenta', text: '<strong>Any final questions</strong> before we <strong>wrap up</strong>?', refs: [79] },
      { speaker: 'tom',   text: 'All good. I\'ll <strong>put together the meeting notes</strong>.', refs: [80] }
    ],
    keyPoints: [
      { phrase: '"recap"', desc: 'recapitulateの略。会議内容を整理する定番の導入詞。' },
      { phrase: '"own that"', desc: 'タスクの責任を受け持つ。「担当する」より責任感が強い表現。' },
      { phrase: '"put a deadline on that"', desc: '期限のないタスクは完了しない。アクションアイテムの期限固定に使える一言。' }
    ]
  },
  'closing': {
    sceneTitle: '四半期レビューのクロージング',
    sceneTitleEn: 'Quarterly Review Close',
    sceneDesc: 'Q3レビューMTGの最終盤。<br>全員で次のステップを確認し、<br>温かく会議を締めくくる場面。',
    imageFile: 'goodbye.png',
    cultureText: '会議の締めにも文化的ニュアンスがある。単なる「さようなら」でなく、次のコンタクトや感謝を残す言葉を使うことで信頼関係を積み重ねられる。',
    bubbles: [
      { speaker: 'kenta', text: 'Alright, <strong>thanks everyone for joining</strong> today.', refs: [81] },
      { speaker: 'sarah', text: '<strong>Great discussion</strong> — really productive session.', refs: [82] },
      { speaker: 'tom',   text: '<strong>Looking forward to our next sync</strong> on this topic.', refs: [83] },
      { speaker: 'kenta', text: '<strong>Same time next week</strong>?', refs: [88] },
      { speaker: 'sarah', text: 'Works for me. I\'ll <strong>send around a meeting summary</strong> by EOD.', refs: [87] },
      { speaker: 'kenta', text: 'If there are any loose ends, <strong>we\'ll pick this up next time</strong>.', refs: [90] },
      { speaker: 'tom',   text: 'Sounds good. <strong>Have a good rest of your day</strong>, everyone.', refs: [84] },
      { speaker: 'sarah', text: '<strong>Talk soon</strong>!', refs: [85] },
      { speaker: 'kenta', text: '<strong>Let\'s touch base</strong> if anything comes up before next week.', refs: [86] },
      { speaker: 'tom',   text: '<strong>Take care</strong>, everyone. Good work today.', refs: [89] }
    ],
    keyPoints: [
      { phrase: '"great discussion"', desc: '参加者の努力を認める一言。気持よく会議を終われる。' },
      { phrase: '"let\'s touch base"', desc: '野球由来の惑用句。メールでも「I\'ll touch base with you」とよく使われる。' },
      { phrase: '"pick this up next time"', desc: '継続予定の話顔を次回に持ち越すときの軽い宣言。' }
    ]
  },
  'presentation': {
    sceneTitle: 'Q4レポートとプロダクトデモ',
    sceneTitleEn: 'Q4 Report & Product Demo',
    sceneDesc: 'Kenjiがグローバルステークホルダーへ<br>四半期レポートとプロダクトデモを<br>プレゼンする場面。',
    imageFile: 'presentation.png',
    cultureText: '英語プレゼンは「足し算で話す」のが基本。資料の説明中に聴き手への確認を挟み込み、一方的に話す時間を最小化する。「ここで詳しく」と「ここで短く」の両方が使い分けられると強い。',
    bubbles: [
      { speaker: 'kenta', text: 'Thanks for joining. I\'d like to <strong>walk you through</strong> this slide on Q4 performance.', refs: [91] },
      { speaker: 'kenta', text: '<strong>As you can see here</strong>, conversion is up 18% quarter-on-quarter.', refs: [92] },
      { speaker: 'tom',   text: 'Can you zoom in? The numbers are quite small on my screen.', refs: [] },
      { speaker: 'kenta', text: 'Sure. <strong>Let me zoom in on that</strong>.', refs: [93] },
      { speaker: 'kenta', text: '<strong>This chart shows</strong> the regional breakdown across APAC and EMEA.', refs: [94] },
      { speaker: 'kenta', text: 'I\'ll <strong>pause here for questions</strong> — anyone want to jump in?', refs: [95] },
      { speaker: 'sarah', text: 'All good, keep going.', refs: [] },
      { speaker: 'kenta', text: '<strong>Bear with me</strong> while I <strong>pull this up</strong> — switching to the demo environment.', refs: [96] },
      { speaker: 'kenta', text: 'Before we dive into the demo, let me <strong>take you back to the big picture</strong>.', refs: [97] },
      { speaker: 'kenta', text: '<strong>Does anyone have questions so far</strong>? Then: <strong>the key takeaway here is</strong> that retention improved across all regions. I\'ll <strong>leave this link in the chat</strong> for the full report.', refs: [98, 99, 100] }
    ],
    keyPoints: [
      { phrase: '"walk you through"', desc: 'ステップごとに説明するイメージ。プレゼンの導入に最適。' },
      { phrase: '"key takeaway"', desc: '「持ち帰る最重要ポイント」の意。プレゼン終籂にも使える。' },
      { phrase: '"bear with me"', desc: '操作中に待ってもらうときの定番表現。指示がないと仸りもなく沈黙になりがち。' }
    ]
  }
};

// ── CSS strings ────────────────────────────────────────────────────────────────

var PHRASE_CSS = '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
'.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
'.header { background: #1B2A5E; flex-shrink: 0; height: 128px; border-top: 5px solid #D4A843; position: relative; overflow: hidden; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
'.header::before { content: "ONLINE MEETINGS"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
'.header-left { display: flex; flex-direction: column; gap: 4px; }\n' +
'.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
'.header-logo { height: 20px; width: auto; }\n' +
'.header-series { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; color: rgba(255,255,255,0.35); }\n' +
'.header-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
'.header-title2 { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 0.01em; }\n' +
'.header-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; z-index: 1; }\n' +
'.header-category { color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; white-space: nowrap; }\n' +
'.header-range { font-size: 38px; font-weight: 900; color: rgba(255,255,255,0.35); letter-spacing: 0.02em; line-height: 1; }\n' +
'.phrase-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(5, 1fr); min-height: 0; }\n' +
'.phrase-cell { padding: 7px 18px 5px 14px; border-right: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8; display: flex; flex-direction: column; gap: 2px; overflow: hidden; position: relative; }\n' +
'.phrase-cell:nth-child(even) { border-right: none; }\n' +
'.phrase-cell:nth-child(9), .phrase-cell:nth-child(10) { border-bottom: none; }\n' +
'.phrase-cell::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 0 2px 2px 0; }\n' +
'.phrase-top { display: flex; align-items: baseline; gap: 8px; }\n' +
'.phrase-num { font-size: 11px; font-weight: 900; flex-shrink: 0; min-width: 22px; line-height: 1; }\n' +
'.phrase-en { font-size: 16px; font-weight: 700; color: #0d0d0d; line-height: 1.25; }\n' +
'.em { color: #C0392B; font-weight: 800; }\n' +
'.phrase-ja { font-size: 11px; color: #444; line-height: 1.3; padding-left: 30px; }\n' +
'.phrase-katakana { font-size: 10px; color: #888; letter-spacing: 0.06em; padding-left: 30px; }\n' +
'.phrase-phonics { font-family: "Courier New", monospace; font-size: 9.5px; color: #b0b0b0; padding-left: 30px; }\n' +
'.phrase-meta { display: flex; align-items: flex-start; gap: 5px; padding-left: 30px; flex-wrap: wrap; margin-top: 1px; }\n' +
'.type-badge { font-size: 9px; font-weight: 700; color: #fff; padding: 1px 6px; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }\n' +
'.phrase-scene { font-size: 10px; color: #666; line-height: 1.5; }\n' +
'.street-note { font-size: 9.5px; color: #7a3a0a; background: #FFF8F0; border-left: 2px solid #D4A843; padding: 2px 7px; border-radius: 0 2px 2px 0; line-height: 1.4; margin-left: 30px; }\n' +
'.footer { height: 24px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 18px; font-size: 9px; color: #c0c0c0; }\n';

var ROLEPLAY_CSS = '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
'.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
'.header { background: #1B2A5E; flex-shrink: 0; height: 118px; border-top: 5px solid #D4A843; position: relative; overflow: hidden; padding: 16px 28px 14px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
'.header::before { content: "ROLE PLAY"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
'.header-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }\n' +
'.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
'.header-logo { height: 18px; width: auto; }\n' +
'.header-series { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; }\n' +
'.header-title { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
'.header-title2 { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.02em; line-height: 1.2; }\n' +
'.header-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; z-index: 1; }\n' +
'.header-badge { background: #D4A843; color: #1B2A5E; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; white-space: nowrap; }\n' +
'.header-type { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; }\n' +
'.body { flex: 1; display: flex; gap: 0; overflow: hidden; min-height: 0; }\n' +
'.left-col { width: 288px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e8e8e8; overflow: hidden; }\n' +
'.scene-illus { height: 210px; overflow: hidden; position: relative; flex-shrink: 0; background: linear-gradient(150deg, #1a2750 0%, #253980 100%); }\n' +
'.scene-illus img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; position: absolute; inset: 0; }\n' +
'.scene-illus-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(27,42,94,0.75)); }\n' +
'.scene-illus-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 14px 10px; z-index: 2; }\n' +
'.scene-illus-cat { font-size: 9px; font-weight: 800; letter-spacing: 0.18em; color: #D4A843; text-transform: uppercase; margin-bottom: 3px; }\n' +
'.scene-illus-title { font-size: 13px; font-weight: 800; color: #fff; line-height: 1.3; }\n' +
'.scene-box { flex: 1; background: #F4F6FB; padding: 10px 13px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }\n' +
'.scene-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; color: #D4A843; text-transform: uppercase; }\n' +
'.scene-title { font-size: 12px; font-weight: 800; color: #1B2A5E; line-height: 1.3; }\n' +
'.scene-desc { font-size: 10.5px; color: #555; line-height: 1.6; }\n' +
'.characters { display: flex; flex-direction: column; gap: 5px; }\n' +
'.char-row { display: flex; align-items: center; gap: 8px; }\n' +
'.char-photo-wrap { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; clip-path: circle(50% at center); flex-shrink: 0; }\n' +
'.char-photo { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }\n' +
'.char-avatar-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; }\n' +
'.char-name { font-size: 10px; font-weight: 700; color: #222; }\n' +
'.char-role { font-size: 9px; color: #888; }\n' +
'.culture-note { margin-top: 2px; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 7px 10px; flex: 1; overflow: hidden; }\n' +
'.culture-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.12em; color: #2E5896; text-transform: uppercase; margin-bottom: 3px; }\n' +
'.culture-text { font-size: 9.5px; color: #444; line-height: 1.5; }\n' +
'.right-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; }\n' +
'.convo-area { flex: 1; padding: 6px 14px 4px; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }\n' +
'.convo-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; color: #999; text-transform: uppercase; margin-bottom: 2px; }\n' +
'.bubble-row { display: flex; gap: 8px; align-items: flex-start; }\n' +
'.bubble-row.right { flex-direction: row-reverse; }\n' +
'.avatar-wrap { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; clip-path: circle(50% at center); flex-shrink: 0; margin-top: 2px; }\n' +
'.avatar { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }\n' +
'.avatar-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; margin-top: 2px; }\n' +
'.bubble-wrap { display: flex; flex-direction: column; gap: 1px; max-width: 68%; }\n' +
'.bubble-row.right .bubble-wrap { align-items: flex-end; }\n' +
'.bubble-name { font-size: 9px; font-weight: 700; color: #888; padding: 0 4px; }\n' +
'.bubble { padding: 5px 10px; border-radius: 12px; font-size: 13px; font-weight: 500; line-height: 1.45; color: #111; }\n' +
'.bubble.kenta { background: #EEF2FB; border-radius: 4px 12px 12px 12px; }\n' +
'.bubble.other { background: #F5F5F5; border-radius: 12px 4px 12px 12px; }\n' +
'.bubble strong { color: #C0392B; font-weight: 800; }\n' +
'.phrase-ref { display: inline-flex; align-items: center; background: #D4A843; color: #fff; font-size: 8.5px; font-weight: 800; padding: 1px 5px; border-radius: 10px; margin-left: 4px; vertical-align: middle; white-space: nowrap; }\n' +
'.key-points { flex-shrink: 0; border-top: 1px solid #e8e8e8; padding: 6px 16px; background: #FAFBFD; }\n' +
'.key-points-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.12em; color: #2E5896; text-transform: uppercase; margin-bottom: 4px; }\n' +
'.key-points-grid { display: flex; flex-direction: column; gap: 4px; }\n' +
'.key-point-item { display: flex; flex-direction: row; align-items: baseline; gap: 12px; background: #EEF2FB; border-left: 3px solid #2E5896; border-radius: 0 4px 4px 0; padding: 4px 10px; }\n' +
'.kp-phrase { font-size: 12px; font-weight: 800; color: #1B2A5E; flex-shrink: 0; min-width: 160px; }\n' +
'.kp-desc { font-size: 11px; color: #444; line-height: 1.45; }\n' +
'.footer { height: 22px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; font-size: 9px; color: #c0c0c0; }\n';

// ── Page generators ────────────────────────────────────────────────────────────

function renderPhrasePage(cat, phrases) {
  var cells = phrases.map(renderPhraseCell).join('');
  var catColorStyle = 'background:' + cat.color + ';';
  var accentStyle = 'color:' + cat.color + ';';
  var borderStyle = 'border-color:' + cat.color + ';';
  // inject per-category color via inline override
  var cellColorOverride = '<style>.phrase-cell::before { background: ' + cat.color + '; } .phrase-num { color: ' + cat.color + '; }</style>\n';
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n' +
    '<title>Phrase Page ' + pad(cat.idx) + '</title>\n' +
    '<style>\n' + PHRASE_CSS + '</style>\n' +
    cellColorOverride +
    '</head>\n<body>\n' +
    '<div class="page">\n' +
    '  <div class="header">\n' +
    '    <div class="header-left">\n' +
    '      <div class="header-logo-row">\n' +
    '        <img class="header-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
    '        <span class="header-series">Phrasebook No.001 &nbsp;Online Meetings</span>\n' +
    '      </div>\n' +
    '      <div class="header-title">オンライン会議の' + cat.ja + 'に使えるフレーズ</div>\n' +
    '      <div class="header-title2">100 Essential Phrases for Virtual Meetings</div>\n' +
    '    </div>\n' +
    '    <div class="header-right">\n' +
    '      <span class="header-category" style="' + catColorStyle + '">' + cat.ja + ' &nbsp;/&nbsp; ' + cat.en + '</span>\n' +
    '      <span class="header-range">' + pad(cat.from) + '&#8211;' + pad(cat.to) + '</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="phrase-grid">\n' + cells + '  </div>\n' +
    '  <div class="footer">\n' +
    '    <span>ENGLEAD Phrasebook No.001: Online Meetings</span>\n' +
    '    <span style="color:#1B2A5E;font-weight:700;">' + cat.ja + ' / ' + cat.en + '</span>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

function renderRoleplayPage(cat, rp) {
  var bubblesHtml = '';
  for (var b = 0; b < rp.bubbles.length; b++) {
    var bubble = rp.bubbles[b];
    bubblesHtml += renderBubble(bubble.speaker, bubble.text, bubble.refs);
  }
  var kpHtml = '';
  for (var k = 0; k < rp.keyPoints.length; k++) {
    var kp = rp.keyPoints[k];
    kpHtml += '          <div class="key-point-item">\n' +
      '            <div class="kp-phrase">' + esc(kp.phrase) + '</div>\n' +
      '            <div class="kp-desc">' + kp.desc + '</div>\n' +
      '          </div>\n';
  }
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n' +
    '<title>Role Play ' + pad(cat.idx) + '</title>\n' +
    '<style>\n' + ROLEPLAY_CSS + '</style>\n' +
    '</head>\n<body>\n' +
    '<div class="page">\n' +
    '  <div class="header">\n' +
    '    <div class="header-left">\n' +
    '      <div class="header-logo-row">\n' +
    '        <img class="header-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
    '        <span class="header-series">Phrasebook No.001 &nbsp;Online Meetings</span>\n' +
    '      </div>\n' +
    '      <div class="header-title">オンライン会議の' + cat.ja + 'のフレーズ</div>\n' +
    '      <div class="header-title2">ロールプレイをしてみよう</div>\n' +
    '    </div>\n' +
    '    <div class="header-right">\n' +
    '      <span class="header-badge">ROLE PLAY</span>\n' +
    '      <span class="header-type">' + cat.ja + '</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="body">\n' +
    '    <div class="left-col">\n' +
    '      <div class="scene-illus">\n' +
    '        <img src="../assets/illustrations/' + rp.imageFile + '" alt="" onerror="this.style.display=\'none\'">\n' +
    '        <div class="scene-illus-overlay"></div>\n' +
    '        <div class="scene-illus-text">\n' +
    '          <div class="scene-illus-cat">Scene &mdash; ' + cat.en + '</div>\n' +
    '          <div class="scene-illus-title">' + rp.sceneTitle + '</div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="scene-box">\n' +
    '        <div class="scene-label">Scene</div>\n' +
    '        <div class="scene-title">' + rp.sceneTitle + '<br>' + rp.sceneTitleEn + '</div>\n' +
    '        <div class="scene-desc">' + rp.sceneDesc + '</div>\n' +
    '        <div class="characters">\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/kenta.png" alt="Kenta" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#1B2A5E;&quot;>K</div>\'"></div>\n' +
    '            <div><div class="char-name">Kenta</div><div class="char-role">シカゴ駐在・チームリード</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/akari.png" alt="Akari" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#8E4A1E;&quot;>A</div>\'"></div>\n' +
    '            <div><div class="char-name">Akari</div><div class="char-role">東京本社・マーケター</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/sarah.png" alt="Sarah"></div>\n' +
    '            <div><div class="char-name">Sarah</div><div class="char-role">NY オフィス</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/marcus.png" alt="Marcus" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#1E5E7A;&quot;>M</div>\'"></div>\n' +
    '            <div><div class="char-name">Marcus</div><div class="char-role">LA・ITエンジニア</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/tom.png" alt="Tom"></div>\n' +
    '            <div><div class="char-name">Tom</div><div class="char-role">ベルリン リモート</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/mei.png" alt="Mei" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#3E5E3E;&quot;>M</div>\'"></div>\n' +
    '            <div><div class="char-name">Mei</div><div class="char-role">シンガポール・マーケター</div></div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '        <div class="culture-note">\n' +
    '          <div class="culture-label">Note</div>\n' +
    '          <div class="culture-text">' + rp.cultureText + '</div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '    <div class="right-col">\n' +
    '      <div class="convo-area">\n' +
    '        <div class="convo-label">Conversation</div>\n' +
    bubblesHtml +
    '      </div>\n' +
    '      <div class="key-points">\n' +
    '        <div class="key-points-label">使い方のポイント</div>\n' +
    '        <div class="key-points-grid">\n' + kpHtml +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="footer">\n' +
    '    <span>ENGLEAD Phrasebook No.001: Online Meetings</span>\n' +
    '    <span style="color:#1B2A5E;font-weight:700;">' + cat.ja + ' / Role Play</span>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

function renderCoverPage() {
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>Cover</title>\n' +
    '<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
    '.page { width: 1123px; height: 794px; background: #1B2A5E; display: flex; flex-direction: column; position: relative; overflow: hidden; box-shadow: 0 6px 32px rgba(0,0,0,0.28); border-top: 5px solid #D4A843; }\n' +
    '.cover-body { flex: 1; display: flex; flex-direction: row; align-items: center; padding: 48px 64px 48px 72px; gap: 52px; z-index: 1; }\n' +
    '.cover-left { flex: 1; display: flex; flex-direction: column; }\n' +
    '.cover-top { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }\n' +
    '.cover-logo { height: 22px; width: auto; }\n' +
    '.cover-series { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: #D4A843; }\n' +
    '.cover-en-title { font-size: 56px; font-weight: 900; color: #fff; letter-spacing: -0.02em; line-height: 1.0; margin-bottom: 8px; }\n' +
    '.cover-ja-title { font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.75); margin-bottom: 20px; }\n' +
    '.cover-tagline { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; margin-bottom: 36px; }\n' +
    '.cover-desc { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.85; border-left: 3px solid rgba(212,168,67,0.4); padding-left: 18px; }\n' +
    '.cover-right { flex-shrink: 0; width: 400px; height: 420px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; }\n' +
    '.illus-tile { position: relative; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.06); border: 1px solid rgba(212,168,67,0.2); }\n' +
    '.illus-tile img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block; }\n' +
    '.illus-tile-label { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.6)); padding: 14px 10px 7px; font-size: 11px; font-weight: 800; color: #fff; letter-spacing: 0.04em; }\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="page">\n' +
    '  <div class="cover-body">\n' +
    '    <div class="cover-left">\n' +
    '      <div class="cover-top">\n' +
    '        <img class="cover-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
    '        <span class="cover-series">Phrasebook No.001 &nbsp;Online Meetings</span>\n' +
    '      </div>\n' +
    '      <div class="cover-en-title">Online Meetings</div>\n' +
    '      <div class="cover-ja-title">オンライン会議で使える英語</div>\n' +
    '      <div class="cover-tagline">テレカンを制する 100 フレーズ</div>\n' +
    '      <div class="cover-desc">外国人チームとのオンライン会議で、もう「えーっと...」と詰まらないために。<br>駐在員が現場で本当に使うフレーズだけを厳選しました。</div>\n' +
    '    </div>\n' +
    '    <div class="cover-right">\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations/home-office-start.png" alt="接続・開始"><div class="illus-tile-label">接続・開始</div></div>\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations/conference-room.png" alt="会議の進行"><div class="illus-tile-label">会議の進行</div></div>\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations/whiteboard-discussion.png" alt="意見・提案"><div class="illus-tile-label">意見・提案</div></div>\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations/goodbye.png" alt="クロージング"><div class="illus-tile-label">クロージング</div></div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

function renderHowtoPage() {
  var catRows = '';
  var catColors = ['#2E5896','#5E3A8E','#8E4A1E','#1E7A5E','#7A1E4E','#4E7A1E','#1E5E7A','#6E5E1E','#3E5E3E','#8E6B2E'];
  var catJa = ['接続・開始','会議の進行','意見・提案','質問・確認','同意・反対','時間管理','技術トラブル','まとめ・アクション','クロージング','プレゼン・デモ'];
  for (var ci = 0; ci < catJa.length; ci++) {
    catRows += '        <div class="cat-item" style="border-left:3px solid ' + catColors[ci] + ';">' + catJa[ci] + '<span class="cat-count">10フレーズ</span></div>\n';
  }
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>How To Use</title>\n' +
    '<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
    '.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
    '.header { background: #1B2A5E; flex-shrink: 0; height: 118px; border-top: 5px solid #D4A843; position: relative; overflow: hidden; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
    '.header::before { content: "HOW TO USE"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
    '.header-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }\n' +
    '.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
    '.header-logo { height: 18px; width: auto; }\n' +
    '.header-series { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; }\n' +
    '.header-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
    '.header-title2 { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.6); }\n' +
    '.header-right { flex-shrink: 0; z-index: 1; }\n' +
    '.header-badge { background: #D4A843; color: #1B2A5E; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; }\n' +
    '.content { flex: 1; padding: 18px 40px 14px; overflow: hidden; }\n' +
    '.page-title { font-size: 20px; font-weight: 800; color: #1B2A5E; padding-bottom: 10px; border-bottom: 2px solid #1B2A5E; margin-bottom: 14px; }\n' +
    '.section { margin-bottom: 16px; }\n' +
    '.section-label { display: inline-block; background: #1B2A5E; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 3px 10px; border-radius: 2px; margin-bottom: 7px; }\n' +
    '.section-text { font-size: 13px; line-height: 1.75; color: #444; }\n' +
    '.legend { display: flex; flex-direction: column; }\n' +
    '.legend-row { display: flex; align-items: baseline; gap: 20px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }\n' +
    '.legend-row:last-child { border-bottom: none; }\n' +
    '.legend-key { min-width: 150px; font-size: 12px; font-weight: 700; color: #222; flex-shrink: 0; }\n' +
    '.legend-val { font-size: 12px; color: #555; line-height: 1.5; }\n' +
    '.em { color: #C0392B; font-weight: 800; }\n' +
    '.categories { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }\n' +
    '.cat-item { padding: 7px 12px; font-size: 12px; font-weight: 600; color: #333; background: #f8f8f8; }\n' +
    '.cat-count { font-size: 10px; font-weight: 400; color: #999; margin-left: 5px; }\n' +
    '.footer { height: 24px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 18px; font-size: 9px; color: #c0c0c0; }\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="page">\n' +
    '  <div class="header">\n' +
    '    <div class="header-left">\n' +
    '      <div class="header-logo-row">\n' +
    '        <img class="header-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
    '        <span class="header-series">Phrasebook No.001 &nbsp;Online Meetings</span>\n' +
    '      </div>\n' +
    '      <div class="header-title">フレーズブックの使い方</div>\n' +
    '      <div class="header-title2">How to Use This Phrasebook</div>\n' +
    '    </div>\n' +
    '    <div class="header-right"><span class="header-badge">使い方ガイド</span></div>\n' +
    '  </div>\n' +
    '  <div class="content">\n' +
    '    <div class="page-title">このフレーズブックの使い方</div>\n' +
    '    <div class="section">\n' +
    '      <div class="section-label">ターゲット</div>\n' +
    '      <p class="section-text">外国人チームとのオンライン会議に日々向き合うビジネスパーソン向けに設計しています。教科書英語だけでなく、現場でネイティブが実際に使うカジュアルな表現も掲載しています。</p>\n' +
    '    </div>\n' +
    '    <div class="section">\n' +
    '      <div class="section-label">各フレーズの見方</div>\n' +
    '      <div class="legend">\n' +
    '        <div class="legend-row"><span class="legend-key">英文フレーズ</span><span class="legend-val">そのまま使えるフレーズ本体。<span class="em">赤文字</span>が特に重要なポイント。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key">発音記号</span><span class="legend-val">/IPA記号/ で正確な発音を確認できます。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key">カタカナ読み</span><span class="legend-val">発音の目安。実際の音声とあわせて確認してください。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key"><span style="background:#1A3B6B;color:#fff;padding:1px 6px;border-radius:2px;font-size:10px;">フレーズ</span></span><span class="legend-val">汎用的な定型表現</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key"><span style="background:#C0392B;color:#fff;padding:1px 6px;border-radius:2px;font-size:10px;">イディオム</span></span><span class="legend-val">慣用的な表現。直訳すると意味が通じないもの。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key">💡 Street Note</span><span class="legend-val">ネイティブの現場感覚・使い方のコツ。</span></div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '    <div class="section">\n' +
    '      <div class="section-label">収録カテゴリ</div>\n' +
    '      <div class="categories">\n' +
    catRows +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="footer">\n' +
    '    <span>ENGLEAD Phrasebook No.001: Online Meetings</span>\n' +
    '    <span style="color:#1B2A5E;font-weight:700;">使い方ガイド</span>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

// ── Generate all pages ────────────────────────────────────────────────────────

var outDir = '/Users/naohirotokuda/englead-phrasebook/output/';

fs.writeFileSync(outDir + 'cover.html', renderCoverPage());
console.log('cover.html');

fs.writeFileSync(outDir + 'howto.html', renderHowtoPage());
console.log('howto.html');

for (var ci = 0; ci < catDefs.length; ci++) {
  var cat = catDefs[ci];
  var phrases = data.phrases.filter(function(p) { return p.category === cat.id; });
  var numStr = pad(cat.idx);

  var phraseHtml = renderPhrasePage(cat, phrases);
  fs.writeFileSync(outDir + 'phrase-' + numStr + '.html', phraseHtml);
  console.log('phrase-' + numStr + '.html');

  var rp = rpDefs[cat.id];
  var roleplayHtml = renderRoleplayPage(cat, rp);
  fs.writeFileSync(outDir + 'roleplay-' + numStr + '.html', roleplayHtml);
  console.log('roleplay-' + numStr + '.html');
}

console.log('Done. 22 pages generated.');
