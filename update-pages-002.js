var fs = require('fs');
var path = require('path');

var logoWhiteB64 = fs.readFileSync(path.join(__dirname, 'assets', 'englead-logo-primary-white.png')).toString('base64');
var LOGO_WHITE = 'data:image/png;base64,' + logoWhiteB64;

var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', '02_phone-calls.json'), 'utf8'));

var outDir = path.join(__dirname, 'output-002') + '/';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

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
    : '<span class="type-badge" style="background:#1A3A4E;">フレーズ</span>';
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
  var isRight = speaker !== 'akari';
  var name = speaker.charAt(0).toUpperCase() + speaker.slice(1);
  var avatarSrc = '../assets/avatars/' + speaker + '.png';
  var initials = name.charAt(0);
  var avatarBgColors = {
    akari: '#8E4A1E', sarah: '#2E5896', tom: '#3E5E3E',
    ryan: '#E07A3A', priya: '#6B3A8E', kenta: '#1B2A5E',
    marcus: '#1E5E7A', mei: '#5E3A1E'
  };
  var bg = avatarBgColors[speaker] || '#555';
  var avatarHtml = '<div class="avatar-wrap"><img class="avatar" src="' + avatarSrc + '" alt="' + name + '" onerror="this.parentNode.outerHTML=\'<div class=&quot;avatar-circle&quot; style=&quot;background:' + bg + ';&quot;>' + initials + '</div>\'"></div>';
  var refsHtml = '';
  if (refs && refs.length) {
    for (var r = 0; r < refs.length; r++) {
      refsHtml += ' <span class="phrase-ref">' + pad(refs[r]) + '</span>';
    }
  }
  var bubbleClass = speaker === 'akari' ? 'bubble akari' : 'bubble other';
  var rowClass = isRight ? 'bubble-row right' : 'bubble-row';
  return '        <div class="' + rowClass + '">\n' +
    '          ' + avatarHtml + '\n' +
    '          <div class="bubble-wrap"><div class="bubble-name">' + name + '</div>\n' +
    '          <div class="' + bubbleClass + '">' + textHtml + refsHtml + '</div></div>\n' +
    '        </div>\n';
}

// ── Category definitions ──────────────────────────────────────────────────────

var catDefs = [
  { idx: 1,  id: 'answering',     ja: '電話に出る・取り次ぐ',   en: 'Answering & Transferring',  color: '#2E6B96', from: 1,  to: 10  },
  { idx: 2,  id: 'confirming',    ja: '用件を聞く・確認する',   en: 'Understanding & Confirming', color: '#1E7A6E', from: 11, to: 20  },
  { idx: 3,  id: 'messages',      ja: '伝言を残す・受ける',     en: 'Leaving & Taking Messages',  color: '#6B3A8E', from: 21, to: 30  },
  { idx: 4,  id: 'callbacks',     ja: 'かけ直す・後で連絡する', en: 'Callbacks & Scheduling',     color: '#8E5A1E', from: 31, to: 40  },
  { idx: 5,  id: 'international', ja: '国際電話をかける',       en: 'Making International Calls', color: '#1E4A8E', from: 41, to: 50  },
  { idx: 6,  id: 'urgent',        ja: '急ぎ・緊急の連絡',       en: 'Urgent Communication',       color: '#8E2A1E', from: 51, to: 60  },
  { idx: 7,  id: 'requests',      ja: '頼む・お願いをする',     en: 'Making Requests',             color: '#2A6B3A', from: 61, to: 70  },
  { idx: 8,  id: 'clarity',       ja: '聞き取れないとき',       en: 'When You Can\'t Hear',       color: '#5E4A2E', from: 71, to: 80  },
  { idx: 9,  id: 'offduty',       ja: '休日・手が離せないとき', en: 'Off-duty & Can\'t Talk',     color: '#4A2E6B', from: 81, to: 90  },
  { idx: 10, id: 'closing',       ja: '電話を締める',           en: 'Closing the Call',            color: '#2E5E5E', from: 91, to: 100 }
];

// ── Roleplay definitions ──────────────────────────────────────────────────────

var rpDefs = {
  'answering': {
    sceneTitle: '月曜朝、LAオフィスからの着信',
    sceneTitleEn: 'Monday Morning Call from LA',
    sceneDesc: 'Akariのオフィス。LAのMarcusから突然の電話。<br>担当者が不在のため、Akariが対応して<br>伝言を受け取ることに。',
    imageFile: 'phone-desk.png',
    cultureText: '英語の受電は最初の一言が肝心。会社名と自分の名前を明確に名乗ることで、相手は安心して用件を話せる。日本語で言う「もしもし」は英語には相当するものがなく、名乗りから始めるのが標準。',
    bubbles: [
      { speaker: 'akari',  text: '<strong>Thank you for calling.</strong> This is Akari speaking. <strong>How may I help you today</strong>?', refs: [1, 2] },
      { speaker: 'marcus', text: 'Hey Akari. This is Marcus from the LA office. <strong>Can I ask</strong> — who handles server access requests?', refs: [7] },
      { speaker: 'akari',  text: 'Of course. <strong>Can I ask what this is regarding</strong>?', refs: [7] },
      { speaker: 'marcus', text: 'It\'s about the new VPN setup — some team members can\'t connect.', refs: [] },
      { speaker: 'akari',  text: '<strong>Please hold for a moment</strong> — <strong>I\'ll put you through</strong> to our IT contact right away.', refs: [4, 5] },
      { speaker: 'marcus', text: 'Sure, thanks.', refs: [] },
      { speaker: 'akari',  text: 'Marcus, <strong>I\'m afraid she\'s not available</strong> right now. She\'s in a meeting. <strong>Would you like to leave a message</strong>?', refs: [6, 10] },
      { speaker: 'marcus', text: 'Yes please. Just let her know I called.', refs: [] },
      { speaker: 'akari',  text: 'Got it. <strong>I\'ll make sure she gets the message</strong>.', refs: [24] }
    ],
    keyPoints: [
      { phrase: '"Thank you for calling"', desc: '日本語の「はい、〇〇でございます」にあたる受電の基本フレーズ。会社名と名前とセットで使う。' },
      { phrase: '"put you through"', desc: '電話を転送する・つなぐの意。「I\'ll connect you」とも言えるが「put through」の方がよく使われる。' },
      { phrase: '"I\'m afraid"', desc: '「残念ながら」という前置き。不在・できないことを伝えるときの丁寧な表現の必須パーツ。' }
    ]
  },
  'confirming': {
    sceneTitle: 'シンガポールからの発注確認',
    sceneTitleEn: 'Campaign Order Confirmation from Singapore',
    sceneDesc: 'MeiからAkariへの確認電話。<br>広告素材の仕様・数量・納期を<br>一つずつ丁寧に確認する場面。',
    imageFile: 'phone-desk.png',
    cultureText: '電話での注文確認は、必ず復唱して確認するのがプロのやり方。数字や固有名詞は特に間違いやすいため、「just to make sure」と前置きして確認する習慣をつけることで、後のトラブルを防げる。',
    bubbles: [
      { speaker: 'mei',   text: 'Hi Akari, this is Mei calling from Singapore. <strong>Is now a good time to talk</strong>?', refs: [33] },
      { speaker: 'akari', text: 'Yes, of course! What can I help you with?', refs: [] },
      { speaker: 'mei',   text: '<strong>Just to confirm</strong> — you ordered the digital ad kit, 5 versions in total?', refs: [12] },
      { speaker: 'akari', text: '<strong>Let me make sure I understand correctly.</strong> Yes, 5 versions, to be sent to Singapore by end of month.', refs: [11] },
      { speaker: 'mei',   text: 'Perfect. <strong>Could you spell</strong> the campaign reference code for me?', refs: [13] },
      { speaker: 'akari', text: 'Sure — it\'s T-K-D, dash, 2-0-2.', refs: [] },
      { speaker: 'mei',   text: '<strong>Just to make sure</strong> — T as in Tokyo, K, D, dash, 2-0-2?', refs: [20] },
      { speaker: 'akari', text: 'That\'s correct. <strong>I\'ll make a note of that.</strong>', refs: [15] },
      { speaker: 'mei',   text: 'Great. <strong>What\'s the best number to reach you</strong> if I have questions?', refs: [14] },
      { speaker: 'akari', text: 'It\'s 03-1234-5678. <strong>Is there anything else I can help you with</strong>?', refs: [17] },
      { speaker: 'mei',   text: 'That\'s all. Thank you!', refs: [] }
    ],
    keyPoints: [
      { phrase: '"Just to confirm"', desc: '確認の前置き。情報を復唱する前に使うことで「念を押している」という誠実さが伝わる。' },
      { phrase: '"Let me make sure I understand correctly"', desc: '複雑な情報を整理するときの一言。特に数量・日程など重要な内容に使う。' },
      { phrase: '"Just to make sure — [content]?"', desc: '復唱確認の定番フォーム。間違いが多い場合はアルファベットを「T as in Tokyo」と音声記号で補足する。' }
    ]
  },
  'messages': {
    sceneTitle: '不在の同僚への伝言',
    sceneTitleEn: 'Taking a Message for a Colleague',
    sceneDesc: 'MarcusからSarahへの電話。<br>Sarahが不在のため、AkariがMarcusの<br>伝言を丁寧に受け取る場面。',
    imageFile: 'phone-message.png',
    cultureText: '伝言を受けるときは「誰から」「何について」「折り返し先」の3点を必ず確認する。英語では最後に復唱して確認するのがプロフェッショナルな対応。「I\'ll pass it along」の一言が信頼を作る。',
    bubbles: [
      { speaker: 'marcus', text: 'Hello, could I speak to Sarah?', refs: [] },
      { speaker: 'akari',  text: '<strong>I\'m afraid she\'s not available</strong> right now. <strong>Can I take a message</strong>?', refs: [6, 27] },
      { speaker: 'marcus', text: 'Yes please. This is Marcus from the LA office. <strong>Could you ask her to call me back</strong> when she\'s free?', refs: [22] },
      { speaker: 'akari',  text: 'Of course. <strong>What\'s the best number to reach you at</strong>?', refs: [14] },
      { speaker: 'marcus', text: 'It\'s plus 1-310-555-9876.', refs: [] },
      { speaker: 'akari',  text: '<strong>Let me read that back</strong> — plus 1, 310, 555, 9876?', refs: [79] },
      { speaker: 'marcus', text: 'That\'s right.', refs: [] },
      { speaker: 'akari',  text: 'And <strong>what\'s this regarding</strong>, so I can pass that along?', refs: [7] },
      { speaker: 'marcus', text: 'It\'s about the system migration next week.', refs: [] },
      { speaker: 'akari',  text: 'Got it. <strong>I\'ll pass your message along right away.</strong>', refs: [29] }
    ],
    keyPoints: [
      { phrase: '"Can I take a message?"', desc: '伝言を受ける意思を示すフレーズ。「Would you like to leave a message?」とセットで覚える。' },
      { phrase: '"read that back"', desc: '番号など重要情報を復唱して確認すること。ミスが許されない情報には必ず使う。' },
      { phrase: '"pass your message along"', desc: '伝言を届けると約束するフレーズ。「relay」より口語的で自然。' }
    ]
  },
  'callbacks': {
    sceneTitle: 'マーカスへの折り返し',
    sceneTitleEn: 'Returning Marcus\'s Call',
    sceneDesc: 'MarcusからのメッセージにAkariが折り返す場面。<br>遅れたことへの謝罪から始まり、<br>次のコールのスケジュールを調整する。',
    imageFile: 'phone-mobile.png',
    cultureText: '折り返し電話は「returning your call」で始めると相手がすぐ状況を理解できる。謝罪は手短に一言で済ませ、すぐ本題に入るのがビジネス英語のマナー。折り返しの遅れが長くなるほど謝罪の言葉も丁寧にする。',
    bubbles: [
      { speaker: 'marcus', text: 'Marcus speaking.', refs: [] },
      { speaker: 'akari',  text: 'Hi Marcus, this is Akari. <strong>I\'m returning your call.</strong> <strong>I\'m sorry I missed you earlier.</strong>', refs: [31, 32] },
      { speaker: 'marcus', text: 'Hey Akari! Thanks for calling back. <strong>Is now a good time</strong> on your end?', refs: [33] },
      { speaker: 'akari',  text: 'Yes, perfect. <strong>I tried to reach you a couple of times</strong>, actually.', refs: [39] },
      { speaker: 'marcus', text: 'Yeah, sorry — I was deep in a migration run. Could we <strong>schedule a call for tomorrow</strong>?', refs: [37] },
      { speaker: 'akari',  text: 'Of course. <strong>When is a convenient time for you</strong>?', refs: [34] },
      { speaker: 'marcus', text: 'How about 9 AM LA time? That\'s 1 AM Tokyo, so maybe 5 PM on your side?', refs: [] },
      { speaker: 'akari',  text: '<strong>I\'ll be available after</strong> 17:00, so 5 PM Tokyo works perfectly.', refs: [36] },
      { speaker: 'marcus', text: 'Perfect. So 1 AM here, 5 PM there. I\'ll set a reminder.', refs: [] },
      { speaker: 'akari',  text: 'Great. <strong>Let me give you a call first thing</strong> at 5 PM Tokyo time.', refs: [40] }
    ],
    keyPoints: [
      { phrase: '"I\'m returning your call"', desc: '折り返しの第一声。相手がすぐにコンテキストを理解できる。「calling you back」とも言える。' },
      { phrase: '"Is now a good time?"', desc: 'お互いに確認し合う習慣をつけると丁寧さが増す。折り返し・急な電話の両方で使える。' },
      { phrase: '"let me give you a call first thing"', desc: '「一番に電話する」という強い約束の表現。「first thing」で翌朝の優先度が伝わる。' }
    ]
  },
  'international': {
    sceneTitle: 'シンガポールへの国際発信',
    sceneTitleEn: 'Calling Singapore: Campaign Follow-up',
    sceneDesc: 'AkariがMeiに国際電話をかける。<br>先週のメールのフォローアップと<br>キャンペーン素材の確認をする場面。',
    imageFile: 'phone-international.png',
    cultureText: '国際電話では時差への配慮が欠かせない。「I know it\'s early there」の一言が相手への気遣いを示す。また用件を電話で話したあと「confirm in writing」と言って書面で残すことが国際ビジネスの標準プロセス。',
    bubbles: [
      { speaker: 'akari', text: 'Hello, <strong>this is Akari calling from Tokyo</strong>. Could I speak with Mei?', refs: [41] },
      { speaker: 'mei',   text: 'Akari! Speaking. Good morning!', refs: [] },
      { speaker: 'akari', text: '<strong>I know it\'s early there</strong> — I hope I\'m not catching you at a bad time.', refs: [44] },
      { speaker: 'mei',   text: 'Not at all! Just got in. What\'s up?', refs: [] },
      { speaker: 'akari', text: '<strong>I\'m calling regarding</strong> the campaign materials. <strong>I\'m just following up on my email</strong> from last week.', refs: [42, 45] },
      { speaker: 'mei',   text: 'Yes, I was going to reply. We\'re <strong>working against a tight deadline</strong> on the launch too.', refs: [48] },
      { speaker: 'akari', text: '<strong>I\'ll keep this brief.</strong> Could you send me the updated banner specs by end of day?', refs: [50] },
      { speaker: 'mei',   text: 'Of course. <strong>I\'ll confirm everything in writing</strong> and send it over.', refs: [47] },
      { speaker: 'akari', text: 'Perfect. <strong>Thank you for taking my call</strong>, Mei. I really appreciate it.', refs: [49] },
      { speaker: 'mei',   text: 'Anytime! We\'ll talk soon.', refs: [] }
    ],
    keyPoints: [
      { phrase: '"this is [name] calling from [city]"', desc: '国際電話の自己紹介の型。会社名・都市名を加えると相手がすぐ状況を把握できる。' },
      { phrase: '"I know it\'s early/late there"', desc: '時差への配慮を示す一言。言うか言わないかで、相手の印象が大きく変わる。' },
      { phrase: '"confirm everything in writing"', desc: '電話での口約束を書面で残す意思を示す。国際取引では特に重要なプロセス。' }
    ]
  },
  'urgent': {
    sceneTitle: '東京出張中のトム、緊急事態',
    sceneTitleEn: 'Crisis Call: Tom in Tokyo',
    sceneDesc: 'ベルリンから東京に出張中のTomが<br>急いでAkariに連絡。ベルリン発の<br>荷物が遅延し、クライアント対応が必要に。',
    imageFile: 'phone-urgent.png',
    cultureText: '緊急電話では用件を最初に短く伝え、解決策をすぐに示すのが大切。「I\'ll get back to you shortly」の言葉は相手を安心させる。「ASAP」は会話では「as soon as possible」と言った方が明瞭。',
    bubbles: [
      { speaker: 'tom',   text: 'Akari, <strong>something\'s come up</strong> — <strong>I need your help.</strong>', refs: [58] },
      { speaker: 'akari', text: 'Tom, what happened? <strong>This is urgent</strong> — tell me quickly.', refs: [51] },
      { speaker: 'tom',   text: 'The Berlin shipment is delayed. <strong>We need to sort this out right away.</strong>', refs: [54] },
      { speaker: 'akari', text: '<strong>I\'ll look into it right now.</strong> <strong>Is there any way to speed this up</strong> on your end?', refs: [19, 55] },
      { speaker: 'tom',   text: 'There\'s also <strong>been a change of plans</strong> — the client needs delivery by Thursday, not Friday.', refs: [53] },
      { speaker: 'akari', text: 'Understood. <strong>I\'ll need a response from logistics by end of day.</strong>', refs: [56] },
      { speaker: 'tom',   text: 'Can we <strong>jump on a quick call</strong> with the team in 30 minutes?', refs: [57] },
      { speaker: 'akari', text: 'Yes. <strong>I apologize for the short notice</strong>, but I\'ll get everyone together now.', refs: [59] },
      { speaker: 'tom',   text: 'And could you <strong>take a look at the updated specs as soon as possible</strong>?', refs: [60] },
      { speaker: 'akari', text: 'I\'m on it. <strong>I\'ll get back to you shortly.</strong>', refs: [90] }
    ],
    keyPoints: [
      { phrase: '"Something\'s come up"', desc: '急な問題が発生したことを伝える定番フレーズ。「There\'s been a problem」より口語的で自然。' },
      { phrase: '"sort this out right away"', desc: '「今すぐ解決する」の意。「sort out」は問題を整理・解決するという意味のイディオム。' },
      { phrase: '"jump on a quick call"', desc: '短い電話・ビデオ通話を急いで設定することを提案するフレーズ。テキストでもよく使われる。' }
    ]
  },
  'requests': {
    sceneTitle: '締め切り延長をお願いする',
    sceneTitleEn: 'Requesting a Deadline Extension',
    sceneDesc: 'AkariがMeiに対し、<br>素材提出の締め切りを<br>1週間延長してほしいとお願いする場面。',
    imageFile: 'phone-office.png',
    cultureText: '英語で依頼するときは、「Would it be possible to...?」のように相手に選択肢を渡す形が礼儀正しい。依頼の理由を一言添えると断られにくくなる。また相手が社内承認を必要とすることも多いため、タイムラインの確認も忘れずに。',
    bubbles: [
      { speaker: 'akari', text: 'Hi Mei, I\'m calling about the submission deadline. <strong>Is now a good time</strong>?', refs: [33] },
      { speaker: 'mei',   text: 'Sure, go ahead.', refs: [] },
      { speaker: 'akari', text: '<strong>I\'ll keep this brief.</strong> <strong>Would it be possible to extend the deadline</strong> by one week?', refs: [50, 65] },
      { speaker: 'mei',   text: 'Hmm. Can you tell me the reason?', refs: [] },
      { speaker: 'akari', text: 'We\'re <strong>working against a tight deadline</strong> on another project. <strong>I\'d appreciate it</strong> if you could consider it.', refs: [48, 64] },
      { speaker: 'mei',   text: 'I understand. <strong>I\'ll need to get approval</strong> before I can commit to that.', refs: [67] },
      { speaker: 'akari', text: 'Of course. <strong>Could you give me a rough estimate</strong> of when you\'ll know?', refs: [68] },
      { speaker: 'mei',   text: 'I\'ll check and get back to you by tomorrow.', refs: [] },
      { speaker: 'akari', text: 'That would be great. And <strong>could you put the decision in writing</strong> once you\'ve decided?', refs: [66] },
      { speaker: 'mei',   text: '<strong>I\'m hoping we can work something out</strong>. Leave it with me.', refs: [69] },
      { speaker: 'akari', text: 'Thank you so much, Mei. <strong>I really appreciate it.</strong>', refs: [91] }
    ],
    keyPoints: [
      { phrase: '"Would it be possible to...?"', desc: '依頼の中でも最も断りやすい形を相手に渡す表現。Yes/Noで答えられるため心理的負担が少ない。' },
      { phrase: '"I\'d appreciate it if you could..."', desc: '条件付きの感謝フレーズ。丁寧さが最大限に出る表現で、目上の人や初めての相手に向く。' },
      { phrase: '"work something out"', desc: '「何とかまとめる・折り合いをつける」の意。両者が譲歩して解決策を探すニュアンスがある。' }
    ]
  },
  'clarity': {
    sceneTitle: '回線不良の電話',
    sceneTitleEn: 'Struggling Through a Bad Line',
    sceneDesc: 'MarcusからAkariへの電話。<br>回線状態が悪く音声が途切れ途切れ。<br>聞き返しフレーズを駆使して乗り切る場面。',
    imageFile: 'phone-clarity.png',
    cultureText: '英語の電話で聞き取れなかったとき、黙ってしまうのが最悪の選択。「I didn\'t catch that」「say that again」などをすぐに使えることが大切。聞き返すことは失礼ではなく、むしろ誠実さの表れとして評価される。',
    bubbles: [
      { speaker: 'marcus', text: 'Akari, it\'s Marcus. I\'m calling about the server — [static]', refs: [] },
      { speaker: 'akari',  text: 'Marcus? <strong>I\'m sorry, I didn\'t quite catch that.</strong> <strong>The line isn\'t very clear.</strong>', refs: [71, 74] },
      { speaker: 'marcus', text: 'Can you hear me now? I said — [static] — the update.', refs: [] },
      { speaker: 'akari',  text: '<strong>You\'re cutting in and out.</strong> <strong>Could you speak a little more slowly</strong>, please?', refs: [75, 72] },
      { speaker: 'marcus', text: 'How about now? The SER-VER. UP-DATE.', refs: [] },
      { speaker: 'akari',  text: '<strong>I can barely hear you.</strong> <strong>Could you say that again</strong>?', refs: [76, 73] },
      { speaker: 'marcus', text: 'THE SERVER UPDATE!', refs: [] },
      { speaker: 'akari',  text: 'Ah — the server update! Got it. <strong>Did you say</strong> the restart is Tuesday or Thursday?', refs: [78] },
      { speaker: 'marcus', text: 'THURSDAY.', refs: [] },
      { speaker: 'akari',  text: '<strong>Let me read that back</strong> — server update, scheduled Thursday?', refs: [79] },
      { speaker: 'marcus', text: 'Exactly. <strong>Would you mind if I texted you</strong> the details?', refs: [80] },
      { speaker: 'akari',  text: 'Please do — that would be much easier. Thank you!', refs: [] }
    ],
    keyPoints: [
      { phrase: '"I didn\'t quite catch that"', desc: '聞き取れなかったときの最もナチュラルなフレーズ。「catch」は口語で「受け取る・聞き取る」の意。' },
      { phrase: '"You\'re cutting in and out"', desc: '音声が断続的に途切れている状態を表す表現。電話・ビデオ通話でよく使われる定番フレーズ。' },
      { phrase: '"Did you say X or Y?"', desc: '2択で確認する聞き返し方。TuesdayとThursdayのように混同しやすい単語のときに特に有効。' }
    ]
  },
  'offduty': {
    sceneTitle: '日曜の午後、仕事の電話',
    sceneTitleEn: 'A Work Call on a Sunday Afternoon',
    sceneDesc: 'Akariが休日の午後に外出中。<br>SarahからAkariに電話がかかってきて、<br>うまく折り合いをつける場面。',
    imageFile: 'phone-offduty.png',
    cultureText: '休日の電話は断るか出るかの二択ではない。状況を説明して折り返すか、緊急度を確認して判断するかという第三の選択がある。「Is this an emergency?」と聞くことで相手にも優先度を考えてもらえる。',
    bubbles: [
      { speaker: 'sarah', text: 'Hi Akari! It\'s Sarah. Sorry to bother you on a Sunday.', refs: [] },
      { speaker: 'akari', text: 'Hi Sarah! <strong>I\'m afraid I can\'t talk right now</strong> — I\'m outside.', refs: [81] },
      { speaker: 'sarah', text: 'Oh! <strong>Is this an emergency, or can it wait</strong>?', refs: [88] },
      { speaker: 'akari', text: 'Can you tell me quickly? <strong>I\'m in the middle of something.</strong>', refs: [83] },
      { speaker: 'sarah', text: 'It\'s about Monday\'s presentation — just a small thing.', refs: [] },
      { speaker: 'akari', text: '<strong>Is this something that can wait until Monday</strong>?', refs: [84] },
      { speaker: 'sarah', text: 'Yes, totally. No rush at all.', refs: [] },
      { speaker: 'akari', text: 'Great. <strong>Could you send me a quick email with the details</strong>? I\'ll check it tonight.', refs: [89] },
      { speaker: 'sarah', text: 'Of course! Sorry for calling on your day off.', refs: [] },
      { speaker: 'akari', text: 'No worries at all. <strong>Thanks for reaching out</strong>. <strong>I\'ll get back to you shortly.</strong>', refs: [90] }
    ],
    keyPoints: [
      { phrase: '"I\'m afraid I can\'t talk right now"', desc: '「I\'m afraid」で丁寧さを保ちながら電話に出られない状況を伝えるフレーズ。' },
      { phrase: '"Is this an emergency, or can it wait?"', desc: '緊急度を相手自身に判断させる質問。休日・外出中の着信に使える合理的なフレーズ。' },
      { phrase: '"Thanks for reaching out"', desc: '「連絡してくれてありがとう」のビジネス英語定番表現。メールでもよく使われる。' }
    ]
  },
  'closing': {
    sceneTitle: '電話を気持ちよく締めくくる',
    sceneTitleEn: 'Wrapping Up a Successful Call',
    sceneDesc: 'AkariとTomが打ち合わせ後の<br>電話を締めくくる場面。<br>確認・感謝・挨拶の流れを一通り練習する。',
    imageFile: 'phone-closing.png',
    cultureText: '電話の締めは単なる「さようなら」ではなく、信頼関係を積み上げるチャンス。行動確認・感謝・次の連絡の予告をセットで入れると、プロフェッショナルな印象を残せる。',
    bubbles: [
      { speaker: 'akari', text: 'So to summarize — 200 units, shipped by the 15th, to Tokyo?', refs: [] },
      { speaker: 'tom',   text: 'Exactly. <strong>I\'ll look into it</strong> on my end and send you an update.', refs: [19] },
      { speaker: 'akari', text: 'Perfect. <strong>I\'ll confirm everything in writing</strong> and send it over this afternoon.', refs: [47] },
      { speaker: 'tom',   text: 'Great. <strong>I\'ll be in touch.</strong>', refs: [95] },
      { speaker: 'akari', text: '<strong>It was great speaking with you</strong>, Tom.', refs: [94] },
      { speaker: 'tom',   text: 'Likewise! <strong>I\'ll get right on that</strong> from my side.', refs: [92] },
      { speaker: 'akari', text: '<strong>Please don\'t hesitate to call</strong> if you need anything at all.', refs: [93] },
      { speaker: 'tom',   text: 'Will do. <strong>Have a good rest of your day.</strong>', refs: [96] },
      { speaker: 'akari', text: 'You too. <strong>Thanks again for your help.</strong>', refs: [99] },
      { speaker: 'tom',   text: '<strong>Take care.</strong> Goodbye!', refs: [100] }
    ],
    keyPoints: [
      { phrase: '"I\'ll get right on that"', desc: '「すぐに取り掛かります」の意。電話を切ったあとすぐに行動するという意思表示。' },
      { phrase: '"Please don\'t hesitate to call"', desc: '窓口を開放する締めの言葉。「何かあれば遠慮なく」という温かいニュアンスを英語で表現。' },
      { phrase: '"Have a good rest of your day"', desc: '「残りの一日も良い時間を」という締めの挨拶。アメリカで非常によく使われる温かい一言。' }
    ]
  }
};

// ── CSS strings ────────────────────────────────────────────────────────────────

var PHRASE_CSS = '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
'.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
'.header { background: #1A3A4E; flex-shrink: 0; height: 128px; border-top: 5px solid #E07A3A; position: relative; overflow: hidden; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
'.header::before { content: "PHONE CALLS"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
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
'.street-note { font-size: 9.5px; color: #7a3a0a; background: #FFF8F0; border-left: 2px solid #E07A3A; padding: 2px 7px; border-radius: 0 2px 2px 0; line-height: 1.4; margin-left: 30px; }\n' +
'.footer { height: 24px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 18px; font-size: 9px; color: #c0c0c0; }\n';

var ROLEPLAY_CSS = '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
'.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
'.header { background: #1A3A4E; flex-shrink: 0; height: 118px; border-top: 5px solid #E07A3A; position: relative; overflow: hidden; padding: 16px 28px 14px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
'.header::before { content: "ROLE PLAY"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
'.header-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }\n' +
'.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
'.header-logo { height: 18px; width: auto; }\n' +
'.header-series { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; }\n' +
'.header-title { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
'.header-title2 { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.02em; line-height: 1.2; }\n' +
'.header-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; z-index: 1; }\n' +
'.header-badge { background: #E07A3A; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; white-space: nowrap; }\n' +
'.header-type { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; }\n' +
'.body { flex: 1; display: flex; gap: 0; overflow: hidden; min-height: 0; }\n' +
'.left-col { width: 288px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e8e8e8; overflow: hidden; }\n' +
'.scene-illus { height: 210px; overflow: hidden; position: relative; flex-shrink: 0; background: linear-gradient(150deg, #1A3A4E 0%, #2A5A6E 100%); }\n' +
'.scene-illus img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; position: absolute; inset: 0; }\n' +
'.scene-illus-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(26,58,78,0.75)); }\n' +
'.scene-illus-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 14px 10px; z-index: 2; }\n' +
'.scene-illus-cat { font-size: 9px; font-weight: 800; letter-spacing: 0.18em; color: #E07A3A; text-transform: uppercase; margin-bottom: 3px; }\n' +
'.scene-illus-title { font-size: 13px; font-weight: 800; color: #fff; line-height: 1.3; }\n' +
'.scene-box { flex: 1; background: #F4F6FB; padding: 10px 13px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }\n' +
'.scene-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; color: #E07A3A; text-transform: uppercase; }\n' +
'.scene-title { font-size: 12px; font-weight: 800; color: #1A3A4E; line-height: 1.3; }\n' +
'.scene-desc { font-size: 10.5px; color: #555; line-height: 1.6; }\n' +
'.characters { display: flex; flex-direction: column; gap: 5px; }\n' +
'.char-row { display: flex; align-items: center; gap: 8px; }\n' +
'.char-photo-wrap { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; clip-path: circle(50% at center); flex-shrink: 0; }\n' +
'.char-photo { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }\n' +
'.char-avatar-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; }\n' +
'.char-name { font-size: 10px; font-weight: 700; color: #222; }\n' +
'.char-role { font-size: 9px; color: #888; }\n' +
'.culture-note { margin-top: 2px; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 7px 10px; flex: 1; overflow: hidden; }\n' +
'.culture-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.12em; color: #2E6B96; text-transform: uppercase; margin-bottom: 3px; }\n' +
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
'.bubble.akari { background: #EEF2FB; border-radius: 4px 12px 12px 12px; }\n' +
'.bubble.other { background: #F5F5F5; border-radius: 12px 4px 12px 12px; }\n' +
'.bubble strong { color: #C0392B; font-weight: 800; }\n' +
'.phrase-ref { display: inline-flex; align-items: center; background: #E07A3A; color: #fff; font-size: 8.5px; font-weight: 800; padding: 1px 5px; border-radius: 10px; margin-left: 4px; vertical-align: middle; white-space: nowrap; }\n' +
'.key-points { flex-shrink: 0; border-top: 1px solid #e8e8e8; padding: 6px 16px; background: #FAFBFD; }\n' +
'.key-points-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.12em; color: #2E6B96; text-transform: uppercase; margin-bottom: 4px; }\n' +
'.key-points-grid { display: flex; flex-direction: column; gap: 4px; }\n' +
'.key-point-item { display: flex; flex-direction: row; align-items: baseline; gap: 12px; background: #EEF2FB; border-left: 3px solid #2E6B96; border-radius: 0 4px 4px 0; padding: 4px 10px; }\n' +
'.kp-phrase { font-size: 12px; font-weight: 800; color: #1A3A4E; flex-shrink: 0; min-width: 160px; }\n' +
'.kp-desc { font-size: 11px; color: #444; line-height: 1.45; }\n' +
'.footer { height: 22px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; font-size: 9px; color: #c0c0c0; }\n';

// ── Page generators ────────────────────────────────────────────────────────────

function renderPhrasePage(cat, phrases) {
  var cells = phrases.map(renderPhraseCell).join('');
  var catColorStyle = 'background:' + cat.color + ';';
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
    '        <span class="header-series">Phrasebook No.002 &nbsp;Business Phone Calls</span>\n' +
    '      </div>\n' +
    '      <div class="header-title">英語電話の' + cat.ja + 'に使えるフレーズ</div>\n' +
    '      <div class="header-title2">100 Essential Phrases for International Business Calls</div>\n' +
    '    </div>\n' +
    '    <div class="header-right">\n' +
    '      <span class="header-category" style="' + catColorStyle + '">' + cat.ja + ' &nbsp;/&nbsp; ' + cat.en + '</span>\n' +
    '      <span class="header-range">' + pad(cat.from) + '&#8211;' + pad(cat.to) + '</span>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="phrase-grid">\n' + cells + '  </div>\n' +
    '  <div class="footer">\n' +
    '    <span>ENGLEAD Phrasebook No.002: Business Phone Calls</span>\n' +
    '    <span style="color:#1A3A4E;font-weight:700;">' + cat.ja + ' / ' + cat.en + '</span>\n' +
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
  var charHtml =
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/akari.png" alt="Akari" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#8E4A1E;&quot;>A</div>\'"></div>\n' +
    '            <div><div class="char-name">Akari</div><div class="char-role">東京本社・主人公</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/sarah.png" alt="Sarah" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#2E5896;&quot;>S</div>\'"></div>\n' +
    '            <div><div class="char-name">Sarah</div><div class="char-role">NY オフィス</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/tom.png" alt="Tom" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#3E5E3E;&quot;>T</div>\'"></div>\n' +
    '            <div><div class="char-name">Tom</div><div class="char-role">ベルリン リモート</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/marcus.png" alt="Marcus" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#1E5E7A;&quot;>M</div>\'"></div>\n' +
    '            <div><div class="char-name">Marcus</div><div class="char-role">LAオフィス・ITエンジニア</div></div>\n' +
    '          </div>\n' +
    '          <div class="char-row">\n' +
    '            <div class="char-photo-wrap"><img class="char-photo" src="../assets/avatars/mei.png" alt="Mei" onerror="this.parentNode.outerHTML=\'<div class=&quot;char-avatar-circle&quot; style=&quot;background:#5E3A1E;&quot;>M</div>\'"></div>\n' +
    '            <div><div class="char-name">Mei</div><div class="char-role">シンガポール・マーケター</div></div>\n' +
    '          </div>\n';

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
    '        <span class="header-series">Phrasebook No.002 &nbsp;Business Phone Calls</span>\n' +
    '      </div>\n' +
    '      <div class="header-title">英語電話の' + cat.ja + 'のフレーズ</div>\n' +
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
    '        <img src="../assets/illustrations-002/' + rp.imageFile + '" alt="" onerror="this.style.display=\'none\'">\n' +
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
    charHtml +
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
    '        <div class="key-points-label">Key Points</div>\n' +
    '        <div class="key-points-grid">\n' +
    kpHtml +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="footer">\n' +
    '    <span>ENGLEAD Phrasebook No.002: Business Phone Calls</span>\n' +
    '    <span style="color:#1A3A4E;font-weight:700;">' + cat.ja + ' / ' + cat.en + '</span>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

// ── Cover page generator ──────────────────────────────────────────────────────

function renderCoverPage() {
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>Cover</title>\n' +
    '<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
    '.page { width: 1123px; height: 794px; background: #1A3A4E; display: flex; flex-direction: column; position: relative; overflow: hidden; box-shadow: 0 6px 32px rgba(0,0,0,0.28); border-top: 5px solid #E07A3A; }\n' +
    '.cover-body { flex: 1; display: flex; flex-direction: row; align-items: center; padding: 48px 64px 48px 72px; gap: 52px; z-index: 1; }\n' +
    '.cover-left { flex: 1; display: flex; flex-direction: column; }\n' +
    '.cover-top { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }\n' +
    '.cover-logo { height: 22px; width: auto; }\n' +
    '.cover-series { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: #E07A3A; }\n' +
    '.cover-en-title { font-size: 48px; font-weight: 900; color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 8px; }\n' +
    '.cover-ja-title { font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.75); margin-bottom: 20px; }\n' +
    '.cover-tagline { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; margin-bottom: 36px; }\n' +
    '.cover-desc { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.85; border-left: 3px solid rgba(224,122,58,0.5); padding-left: 18px; }\n' +
    '.cover-right { flex-shrink: 0; width: 400px; height: 420px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; }\n' +
    '.illus-tile { position: relative; border-radius: 6px; overflow: hidden; background: rgba(255,255,255,0.06); border: 1px solid rgba(224,122,58,0.2); }\n' +
    '.illus-tile img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block; }\n' +
    '.illus-tile-label { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.6)); padding: 14px 10px 7px; font-size: 11px; font-weight: 800; color: #fff; letter-spacing: 0.04em; }\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="page">\n' +
    '  <div class="cover-body">\n' +
    '    <div class="cover-left">\n' +
    '      <div class="cover-top">\n' +
    '        <img class="cover-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
    '        <span class="cover-series">Phrasebook No.002 &nbsp;Business Phone Calls</span>\n' +
    '      </div>\n' +
    '      <div class="cover-en-title">Business<br>Phone Calls</div>\n' +
    '      <div class="cover-ja-title">英語電話で使えるフレーズ</div>\n' +
    '      <div class="cover-tagline">電話を制する 100 フレーズ</div>\n' +
    '      <div class="cover-desc">海外拠点との電話で、もう「あの...」と詰まらないために。<br>受電・発信・伝言・緊急対応まで、実務で今日から使える<br>フレーズだけを厳選しました。</div>\n' +
    '    </div>\n' +
    '    <div class="cover-right">\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations-002/phone-desk.png" alt="電話に出る"><div class="illus-tile-label">電話に出る</div></div>\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations-002/phone-international.png" alt="国際電話"><div class="illus-tile-label">国際電話</div></div>\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations-002/phone-urgent.png" alt="緊急の連絡"><div class="illus-tile-label">緊急の連絡</div></div>\n' +
    '      <div class="illus-tile"><img src="../assets/illustrations-002/phone-closing.png" alt="電話を締める"><div class="illus-tile-label">電話を締める</div></div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

// ── Howto & CTA page generators ───────────────────────────────────────────────

function renderHowtoPage() {
  var catRows = '';
  for (var ci = 0; ci < catDefs.length; ci++) {
    catRows += '        <div class="cat-item" style="border-left:3px solid ' + catDefs[ci].color + ';">' + catDefs[ci].ja + '<span class="cat-count">10フレーズ</span></div>\n';
  }
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>How To Use</title>\n' +
    '<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
    '.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
    '.header { background: #1A3A4E; flex-shrink: 0; height: 118px; border-top: 5px solid #E07A3A; position: relative; overflow: hidden; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
    '.header::before { content: "HOW TO USE"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
    '.header-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }\n' +
    '.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
    '.header-logo { height: 18px; width: auto; }\n' +
    '.header-series { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; }\n' +
    '.header-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
    '.header-title2 { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.6); }\n' +
    '.header-right { flex-shrink: 0; z-index: 1; }\n' +
    '.header-badge { background: #E07A3A; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; }\n' +
    '.content { flex: 1; padding: 18px 40px 14px; overflow: hidden; }\n' +
    '.page-title { font-size: 20px; font-weight: 800; color: #1A3A4E; padding-bottom: 10px; border-bottom: 2px solid #1A3A4E; margin-bottom: 14px; }\n' +
    '.section { margin-bottom: 16px; }\n' +
    '.section-label { display: inline-block; background: #1A3A4E; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 3px 10px; border-radius: 2px; margin-bottom: 7px; }\n' +
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
    '        <span class="header-series">Phrasebook No.002 &nbsp;Business Phone Calls</span>\n' +
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
    '      <p class="section-text">外国人チームとのビジネス電話に日々向き合うビジネスパーソン向けに設計しています。教科書英語だけでなく、現場でネイティブが実際に使うカジュアルな表現も掲載しています。</p>\n' +
    '    </div>\n' +
    '    <div class="section">\n' +
    '      <div class="section-label">各フレーズの見方</div>\n' +
    '      <div class="legend">\n' +
    '        <div class="legend-row"><span class="legend-key">英文フレーズ</span><span class="legend-val">そのまま使えるフレーズ本体。<span class="em">赤文字</span>が特に重要なポイント。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key">発音記号</span><span class="legend-val">/IPA記号/ で正確な発音を確認できます。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key">カタカナ読み</span><span class="legend-val">発音の目安。実際の音声とあわせて確認してください。</span></div>\n' +
    '        <div class="legend-row"><span class="legend-key"><span style="background:#1A3A4E;color:#fff;padding:1px 6px;border-radius:2px;font-size:10px;">フレーズ</span></span><span class="legend-val">汎用的な定型表現</span></div>\n' +
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
    '    <span>ENGLEAD Phrasebook No.002: Business Phone Calls</span>\n' +
    '    <span style="color:#1A3A4E;font-weight:700;">使い方ガイド</span>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

function renderCtaPage() {
  var illustSrc = '../assets/cta/banner.png';
  var cardIllus = function(n) { return '../assets/cta/card-0' + n + '.png'; };
  return '<!DOCTYPE html>\n' +
    '<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<title>無料カウンセリング</title>\n' +
    '<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
    '.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 6px 32px rgba(0,0,0,0.22); border-top: 5px solid #E07A3A; }\n' +
    '.hdr { background: #1A3A4E; flex-shrink: 0; height: 40px; display: flex; align-items: center; padding: 0 28px; gap: 10px; }\n' +
    '.hdr-logo { height: 15px; width: auto; }\n' +
    '.hdr-sep { width: 1px; height: 11px; background: rgba(255,255,255,0.2); }\n' +
    '.hdr-series { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; color: rgba(255,255,255,0.35); }\n' +
    '.hdr-badge { margin-left: auto; background: #E07A3A; color: #fff; font-size: 8.5px; font-weight: 800; letter-spacing: 0.1em; padding: 3px 10px; border-radius: 2px; }\n' +
    '.hl { flex-shrink: 0; padding: 11px 0 10px; text-align: center; border-bottom: 1px solid #eee; }\n' +
    '.hl-eyebrow { font-size: 8.5px; font-weight: 800; letter-spacing: 0.22em; color: #E07A3A; text-transform: uppercase; margin-bottom: 3px; }\n' +
    '.hl-title { font-size: 18px; font-weight: 900; color: #1A3A4E; line-height: 1.35; }\n' +
    '.img-sec { flex-shrink: 0; padding: 9px 24px 7px; }\n' +
    '.img-inner { position: relative; border-radius: 10px; overflow: hidden; height: 220px; }\n' +
    '.img-inner img { width: 100%; height: 100%; object-fit: cover; display: block; }\n' +
    '.stats-bar { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(26,58,78,0.9); display: flex; }\n' +
    '.stat { flex: 1; padding: 7px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid rgba(255,255,255,0.12); gap: 1px; }\n' +
    '.stat:last-child { border-right: none; }\n' +
    '.stat-n { font-size: 20px; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -0.02em; }\n' +
    '.stat-n .u { font-size: 11px; font-weight: 700; }\n' +
    '.stat-l { font-size: 8px; font-weight: 600; color: rgba(255,255,255,0.7); letter-spacing: 0.04em; }\n' +
    '.cards-sec { flex: 1; display: flex; flex-direction: column; padding: 10px 20px 0; min-height: 0; }\n' +
    '.cards-lbl { font-size: 13px; font-weight: 800; color: #1A3A4E; border-left: 3px solid #E07A3A; padding-left: 9px; margin-bottom: 8px; flex-shrink: 0; }\n' +
    '.cards-row { display: flex; gap: 12px; flex: 1; min-height: 0; padding-bottom: 8px; }\n' +
    '.card { flex: 1; border: 1px solid #e0e6f0; border-radius: 8px; background: #fff; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 2px 8px rgba(26,58,78,0.06); }\n' +
    '.card-il { width: 100%; flex-shrink: 0; overflow: hidden; aspect-ratio: 5/3; }\n' +
    '.card-il img { width: 100%; height: 100%; object-fit: cover; display: block; }\n' +
    '.card-body { padding: 9px 13px 10px; display: flex; flex-direction: column; gap: 5px; flex: 1; overflow: hidden; }\n' +
    '.card-head { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }\n' +
    '.card-num { width: 20px; height: 20px; border-radius: 50%; background: #1A3A4E; color: #fff; font-size: 8.5px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n' +
    '.card-title { font-size: 12px; font-weight: 800; color: #1A3A4E; line-height: 1.3; }\n' +
    '.card-desc { font-size: 11px; color: #555; line-height: 1.65; overflow: hidden; }\n' +
    '.bottom { flex-shrink: 0; height: 66px; border-top: 1px solid #e0e0e0; display: flex; }\n' +
    '.promo { flex: 1; background: #FFF8E8; border-right: 1px solid #F0D880; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 0 18px; }\n' +
    '.promo-main { display: flex; align-items: center; gap: 8px; }\n' +
    '.promo-tag { background: #C0392B; color: #fff; font-size: 8px; font-weight: 800; padding: 3px 8px; border-radius: 2px; letter-spacing: 0.06em; flex-shrink: 0; }\n' +
    '.promo-price { display: flex; align-items: baseline; gap: 3px; }\n' +
    '.promo-label { font-size: 12px; font-weight: 700; color: #C0392B; line-height: 1; }\n' +
    '.promo-amount { font-size: 23px; font-weight: 900; color: #C0392B; line-height: 1; font-family: "Helvetica Neue", Arial, sans-serif; letter-spacing: -0.02em; }\n' +
    '.promo-off { font-size: 14px; font-weight: 900; color: #C0392B; line-height: 1; font-family: "Helvetica Neue", Arial, sans-serif; }\n' +
    '.promo-sub { font-size: 8.5px; color: #888; margin-top: 3px; }\n' +
    '.cta { flex: 1; background: #06C755; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0 32px; }\n' +
    '.cta-row { display: flex; align-items: center; gap: 10px; }\n' +
    '.cta-badge { background: #fff; border-radius: 4px; padding: 2px 9px; font-size: 10px; font-weight: 900; color: #06C755; flex-shrink: 0; }\n' +
    '.cta-main { font-size: 15px; font-weight: 900; color: #fff; }\n' +
    '.cta-sub { font-size: 10.5px; color: rgba(255,255,255,0.88); }\n' +
    '.footer { flex-shrink: 0; height: 22px; border-top: 1px solid #eee; background: #fafafa; display: flex; align-items: center; justify-content: center; gap: 8px; }\n' +
    '.fi { font-size: 8.5px; color: #bbb; }\n' +
    '.fd { width: 2px; height: 2px; border-radius: 50%; background: #ddd; }\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="page">\n' +
    '  <div class="hdr">\n' +
    '    <img class="hdr-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
    '    <div class="hdr-sep"></div>\n' +
    '    <span class="hdr-series">Phrasebook No.002 &nbsp;Business Phone Calls</span>\n' +
    '    <span class="hdr-badge">FREE COUNSELING</span>\n' +
    '  </div>\n' +
    '  <div class="hl">\n' +
    '    <div class="hl-eyebrow">Next Step</div>\n' +
    '    <div class="hl-title">フレーズブックを活かすために、無料カウンセリングを受けてみませんか？</div>\n' +
    '  </div>\n' +
    '  <div class="img-sec">\n' +
    '    <div class="img-inner">\n' +
    '      <img src="' + illustSrc + '" alt="counseling">\n' +
    '      <div class="stats-bar">\n' +
    '        <div class="stat"><div class="stat-n">97<span class="u">%</span></div><div class="stat-l">カウンセリング満足度</div></div>\n' +
    '        <div class="stat"><div class="stat-n">10,000<span class="u">人+</span></div><div class="stat-l">学習相談の累計人数</div></div>\n' +
    '        <div class="stat"><div class="stat-n">0<span class="u">円</span></div><div class="stat-l">カウンセリング費用</div></div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="cards-sec">\n' +
    '    <div class="cards-lbl">カウンセリングでできること</div>\n' +
    '    <div class="cards-row">\n' +
    '      <div class="card">\n' +
    '        <div class="card-il"><img src="' + cardIllus(1) + '" alt=""></div>\n' +
    '        <div class="card-body">\n' +
    '          <div class="card-head"><div class="card-num">01</div><div class="card-title">フレーズブックの使い方レクチャー</div></div>\n' +
    '          <div class="card-desc">このフレーズブックを最大限に活かす学習法を、専属コーチがマンツーマンで解説します。「どのフレーズから覚えるべき？」「実際の電話でどう使えばいい？」その場で疑問を解消できます。</div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="card">\n' +
    '        <div class="card-il"><img src="' + cardIllus(2) + '" alt=""></div>\n' +
    '        <div class="card-body">\n' +
    '          <div class="card-head"><div class="card-num">02</div><div class="card-title">英語力診断</div></div>\n' +
    '          <div class="card-desc">現在の英語力を正確に把握する診断を実施します。リスニング・スピーキング・語彙力など強みと弱点が一目でわかる「レベルチャート」をプレゼント。今後の学習方針が明確になります。</div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="card">\n' +
    '        <div class="card-il"><img src="' + cardIllus(3) + '" alt=""></div>\n' +
    '        <div class="card-body">\n' +
    '          <div class="card-head"><div class="card-num">03</div><div class="card-title">学習相談</div></div>\n' +
    '          <div class="card-desc">「何から始めればいい？」「どうすれば続けられる？」「仕事で使える英語を最短で身につけるには？」英語に関することなら何でも相談できます。あなただけのプランをご提案します。</div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="bottom">\n' +
    '    <div class="promo">\n' +
    '      <div class="promo-main">\n' +
    '        <div class="promo-tag">今だけ限定</div>\n' +
    '        <div class="promo-price">\n' +
    '          <span class="promo-label">入会金</span>\n' +
    '          <span class="promo-amount">¥20,000</span>\n' +
    '          <span class="promo-off">OFF</span>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="promo-sub">カウンセリング受講者への特別割引</div>\n' +
    '    </div>\n' +
    '    <div class="cta">\n' +
    '      <div class="cta-row">\n' +
    '        <div class="cta-badge">LINE</div>\n' +
    '        <div class="cta-main">公式LINEのトーク画面からご予約いただけます</div>\n' +
    '      </div>\n' +
    '      <div class="cta-sub">LINEを開いて、スタッフへ「カウンセリングを予約したい」とメッセージを送ってください。</div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '  <div class="footer">\n' +
    '    <span class="fi">完全無料</span><span class="fd"></span>\n' +
    '    <span class="fi">完全オンライン（Zoom）</span><span class="fd"></span>\n' +
    '    <span class="fi">国内・海外どこからでも参加可能</span><span class="fd"></span>\n' +
    '    <span class="fi">englead.jp</span>\n' +
    '  </div>\n' +
    '</div>\n</body>\n</html>';
}

// ── Generate all pages ────────────────────────────────────────────────────────

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

fs.writeFileSync(outDir + 'cta.html', renderCtaPage());
console.log('cta.html');

console.log('Done. 23 pages generated in output-002/');
