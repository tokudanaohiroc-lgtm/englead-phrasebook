const fs = require('fs');

const logoWhiteB64 = fs.readFileSync('/tmp/logo-white-b64.txt', 'utf8').trim();
const LOGO_WHITE = 'data:image/png;base64,' + logoWhiteB64;

const data = JSON.parse(fs.readFileSync('/Users/naohirotokuda/englead-phrasebook/content/01_online-meetings.json', 'utf8'));

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

function renderPhraseCell(p) {
  var badge = p.type === 'idiom'
    ? '<span class="type-badge" style="background:#C0392B;">イディオム</span>'
    : '<span class="type-badge" style="background:#1A3B6B;">フレーズ</span>';
  var noteHtml = p.street_note
    ? '\n      <div class="street-note">' + esc(p.street_note) + '</div>'
    : '';
  var num = p.num < 10 ? '0' + p.num : String(p.num);
  return '    <div class="phrase-cell">\n' +
    '      <div class="phrase-top"><span class="phrase-num">' + num + '</span><span class="phrase-en">' + applyEmphasis(p.phrase_en, p.emphasis) + '</span></div>\n' +
    '      <div class="phrase-ja">' + esc(p.phrase_ja) + '</div>\n' +
    '      <div class="phrase-katakana">' + esc(p.katakana) + '</div>\n' +
    '      <div class="phrase-phonics">' + esc(p.phonics) + '</div>\n' +
    '      <div class="phrase-meta">' + badge + '<span class="phrase-scene">' + esc(p.scene) + '</span></div>' + noteHtml + '\n' +
    '    </div>\n';
}

// ── ROLEPLAY PAGE ──────────────────────────────────────────────────────
const roleplayHtml = '<!DOCTYPE html>\n' +
'<html lang="ja">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<title>Role Play Page</title>\n' +
'<style>\n' +
'* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'body {\n' +
'  font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif;\n' +
'  background: #b8b8b8;\n' +
'  padding: 30px;\n' +
'}\n' +
'.page {\n' +
'  width: 1123px;\n' +
'  height: 794px;\n' +
'  background: #fff;\n' +
'  display: flex;\n' +
'  flex-direction: column;\n' +
'  box-shadow: 0 6px 32px rgba(0,0,0,0.28);\n' +
'  overflow: hidden;\n' +
'}\n' +
'.header {\n' +
'  background: #1B2A5E;\n' +
'  flex-shrink: 0;\n' +
'  height: 118px;\n' +
'  border-top: 5px solid #D4A843;\n' +
'  position: relative;\n' +
'  overflow: hidden;\n' +
'  padding: 16px 28px 14px;\n' +
'  display: flex;\n' +
'  align-items: center;\n' +
'  justify-content: space-between;\n' +
'  gap: 24px;\n' +
'}\n' +
'.header::before {\n' +
'  content: "ROLE PLAY";\n' +
'  position: absolute;\n' +
'  right: -10px; bottom: -18px;\n' +
'  font-size: 88px; font-weight: 900;\n' +
'  letter-spacing: -0.02em;\n' +
'  color: rgba(255,255,255,0.04);\n' +
'  white-space: nowrap; pointer-events: none; line-height: 1;\n' +
'}\n' +
'.header-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }\n' +
'.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
'.header-logo { height: 18px; width: auto; }\n' +
'.header-series { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; }\n' +
'.header-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
'.header-title2 { font-size: 17px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.02em; line-height: 1.2; }\n' +
'.header-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; z-index: 1; }\n' +
'.header-badge { background: #D4A843; color: #1B2A5E; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; white-space: nowrap; }\n' +
'.header-type { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; }\n' +
'.body { flex: 1; display: flex; gap: 0; overflow: hidden; min-height: 0; }\n' +
'.left-col { width: 288px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e8e8e8; overflow: hidden; }\n' +
'.scene-illus { height: 235px; overflow: hidden; position: relative; flex-shrink: 0; background: linear-gradient(150deg, #1a2750 0%, #253980 100%); }\n' +
'.scene-illus img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; }\n' +
'.scene-illus-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 50%, rgba(27,42,94,0.6)); }\n' +
'.scene-box { flex: 1; background: #F4F6FB; padding: 11px 13px; display: flex; flex-direction: column; gap: 7px; overflow: hidden; }\n' +
'.scene-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; color: #D4A843; text-transform: uppercase; }\n' +
'.scene-title { font-size: 13px; font-weight: 800; color: #1B2A5E; line-height: 1.3; }\n' +
'.scene-desc { font-size: 11px; color: #555; line-height: 1.65; }\n' +
'.characters { display: flex; flex-direction: column; gap: 6px; }\n' +
'.char-row { display: flex; align-items: center; gap: 8px; }\n' +
'.char-photo { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; object-position: center top; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }\n' +
'.char-avatar-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; }\n' +
'.char-name { font-size: 11px; font-weight: 700; color: #222; }\n' +
'.char-role { font-size: 9px; color: #888; }\n' +
'.culture-note { margin-top: 2px; background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 8px 10px; flex: 1; overflow: hidden; }\n' +
'.culture-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.12em; color: #2E5896; text-transform: uppercase; margin-bottom: 4px; }\n' +
'.culture-text { font-size: 10px; color: #444; line-height: 1.5; }\n' +
'.right-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; }\n' +
'.convo-area { flex: 1; padding: 10px 18px 6px; display: flex; flex-direction: column; gap: 4px; overflow: hidden; }\n' +
'.convo-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.14em; color: #999; text-transform: uppercase; margin-bottom: 2px; }\n' +
'.bubble-row { display: flex; gap: 8px; align-items: flex-start; }\n' +
'.bubble-row.right { flex-direction: row-reverse; }\n' +
'.avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; object-position: center top; flex-shrink: 0; margin-top: 2px; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }\n' +
'.avatar-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; margin-top: 2px; }\n' +
'.bubble-wrap { display: flex; flex-direction: column; gap: 1px; max-width: 66%; }\n' +
'.bubble-row.right .bubble-wrap { align-items: flex-end; }\n' +
'.bubble-name { font-size: 9px; font-weight: 700; color: #888; padding: 0 4px; }\n' +
'.bubble { padding: 6px 11px; border-radius: 12px; font-size: 14px; font-weight: 500; line-height: 1.45; color: #111; }\n' +
'.bubble.kenji { background: #EEF2FB; border-radius: 4px 12px 12px 12px; }\n' +
'.bubble.other { background: #F5F5F5; border-radius: 12px 4px 12px 12px; }\n' +
'.bubble .em { color: #C0392B; font-weight: 800; }\n' +
'.phrase-ref { display: inline-flex; align-items: center; background: #D4A843; color: #fff; font-size: 8.5px; font-weight: 800; padding: 1px 5px; border-radius: 10px; margin-left: 5px; vertical-align: middle; white-space: nowrap; }\n' +
'' +
'.key-points { flex-shrink: 0; border-top: 1px solid #e8e8e8; padding: 9px 20px; background: #FAFBFD; }\n' +
'.key-points-label { font-size: 8.5px; font-weight: 800; letter-spacing: 0.12em; color: #2E5896; text-transform: uppercase; margin-bottom: 6px; }\n' +
'.key-points-grid { display: flex; flex-direction: column; gap: 7px; }\n' +
'.key-point-item { display: flex; flex-direction: row; align-items: baseline; gap: 12px; background: #EEF2FB; border-left: 3px solid #2E5896; border-radius: 0 4px 4px 0; padding: 7px 12px; }\n' +
'.kp-phrase { font-size: 13px; font-weight: 800; color: #1B2A5E; flex-shrink: 0; min-width: 150px; }\n' +
'.kp-desc { font-size: 12px; color: #444; line-height: 1.45; }\n' +
'.footer { height: 22px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; font-size: 9px; color: #c0c0c0; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="page">\n' +
'  <div class="header">\n' +
'    <div class="header-left">\n' +
'      <div class="header-logo-row">\n' +
'        <img class="header-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
'        <span class="header-series">Business English Series &nbsp;#001</span>\n' +
'      </div>\n' +
'      <div class="header-title">オンライン会議の接続・開始のフレーズ</div>\n' +
'      <div class="header-title2">ロールプレイをしてみよう</div>\n' +
'    </div>\n' +
'    <div class="header-right">\n' +
'      <span class="header-badge">ROLE PLAY</span>\n' +
'      <span class="header-type">接続・開始</span>\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="body">\n' +
'    <div class="left-col">\n' +
'      <div class="scene-illus">\n' +
'        <img src="../assets/illustrations/home-office-start.png" alt="">\n' +
'        <div class="scene-illus-overlay"></div>\n' +
'      </div>\n' +
'      <div class="scene-box">\n' +
'        <div class="scene-label">Scene</div>\n' +
'        <div class="scene-title">月曜朝の定例ミーティング<br>Monday Morning Standup</div>\n' +
'        <div class="scene-desc">健二が主催。チームは米国・欧州に分散。<br>開始直後に次々トラブルが起きるが、<br>身についたフレーズで冷静に対処する。</div>\n' +
'        <div class="characters">\n' +
'          <div class="char-row">\n' +
'            <div class="char-avatar-circle" style="background:#1B2A5E;">健</div>\n' +
'            <div><div class="char-name">Kenji（健二）</div><div class="char-role">シカゴ駐在・チームリード</div></div>\n' +
'          </div>\n' +
'          <div class="char-row">\n' +
'            <img class="char-photo" src="../assets/avatars/sarah.png" alt="Sarah">\n' +
'            <div><div class="char-name">Sarah</div><div class="char-role">NY オフィス</div></div>\n' +
'          </div>\n' +
'          <div class="char-row">\n' +
'            <img class="char-photo" src="../assets/avatars/tom.png" alt="Tom">\n' +
'            <div><div class="char-name">Tom</div><div class="char-role">ベルリン リモート</div></div>\n' +
'          </div>\n' +
'        </div>\n' +
'        <div class="culture-note">\n' +
'          <div class="culture-label">Note</div>\n' +
'          <div class="culture-text">米国のオンライン会議では、ホストが音声確認から始めるのが慣例。全員に「聞こえてる？」と問いかけることで共通のスタートラインを作る。録音の事前告知もエチケットとして定着しており、無告知での録音は信頼関係を損ねることがある。チャット欄も積極的に活用され、声で割り込みにくい場面でも質問やリアクションを気軽に送れるのが特徴だ。</div>\n' +
'        </div>\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="right-col">\n' +
'      <div class="convo-area">\n' +
'        <div class="convo-label">Conversation</div>\n' +
'        <div class="bubble-row">\n' +
'          <div class="avatar-circle" style="background:#1B2A5E;">健</div>\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Kenji</div>\n' +
'          <div class="bubble kenji">Hey, can everyone <strong>hear me okay</strong>? <span class="phrase-ref">01</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row right">\n' +
'          <img class="avatar" src="../assets/avatars/sarah.png" alt="Sarah">\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Sarah</div>\n' +
'          <div class="bubble other">Yep, loud and clear! But Tom &#8212; <strong>you\'re on mute</strong>. <span class="phrase-ref">02</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row right">\n' +
'          <img class="avatar" src="../assets/avatars/tom.png" alt="Tom">\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Tom</div>\n' +
'          <div class="bubble other">Sorry about that! Can you hear me now?</div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row">\n' +
'          <div class="avatar-circle" style="background:#1B2A5E;">健</div>\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Kenji</div>\n' +
'          <div class="bubble kenji">Perfect. Let\'s <strong>go ahead and get started</strong>. <span class="phrase-ref">03</span><br>I\'ll <strong>drop the agenda in the chat</strong>. <span class="phrase-ref">08</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row right">\n' +
'          <img class="avatar" src="../assets/avatars/sarah.png" alt="Sarah">\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Sarah</div>\n' +
'          <div class="bubble other">Got it. <strong>Can you see my screen</strong>? I want to pull up the deck. <span class="phrase-ref">09</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row">\n' +
'          <div class="avatar-circle" style="background:#1B2A5E;">健</div>\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Kenji</div>\n' +
'          <div class="bubble kenji">Yep, all good. Oh &#8212; <strong>just a heads-up</strong>, I\'m <strong>recording this call</strong>. <span class="phrase-ref">06</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row right">\n' +
'          <img class="avatar" src="../assets/avatars/sarah.png" alt="Sarah">\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Sarah</div>\n' +
'          <div class="bubble other">No problem. Everyone, <strong>feel free to use the chat</strong> for questions! <span class="phrase-ref">07</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row right">\n' +
'          <img class="avatar" src="../assets/avatars/tom.png" alt="Tom">\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Tom</div>\n' +
'          <div class="bubble other">Thanks. <strong>I\'m going to share my screen</strong> for the Berlin numbers — just getting it ready. <span class="phrase-ref">05</span></div></div>\n' +
'        </div>\n' +
'        <div class="bubble-row">\n' +
'          <div class="avatar-circle" style="background:#1B2A5E;">健</div>\n' +
'          <div class="bubble-wrap"><div class="bubble-name">Kenji</div>\n' +
'          <div class="bubble kenji">Take your time. <strong>We\'ll give it another minute</strong>. <span class="phrase-ref">04</span></div></div>\n' +
'        </div>\n' +
'      </div>\n' +
'      <div class="key-points">\n' +
'        <div class="key-points-label">使い方のポイント</div>\n' +
'        <div class="key-points-grid">\n' +
'          <div class="key-point-item">\n' +
'            <div class="kp-phrase">"hear me okay?"</div>\n' +
'            <div class="kp-desc">"Can you hear me?" より全員への問いかけ感が強い。会議開始直後の定番確認。</div>\n' +
'          </div>\n' +
'          <div class="key-point-item">\n' +
'            <div class="kp-phrase">"go ahead and"</div>\n' +
'            <div class="kp-desc">「では〜しましょう」と踏み出す印象を与える。"let\'s start" より積極的なニュアンス。</div>\n' +
'          </div>\n' +
'          <div class="key-point-item">\n' +
'            <div class="kp-phrase">"heads-up"</div>\n' +
'            <div class="kp-desc">事前告知の万能フレーズ。録音・遅延・変更など何でも前置きできる。単独でも使える。</div>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="footer">\n' +
'    <span>ENGLEAD Business English Series #001</span>\n' +
'    <span style="color:#1B2A5E;font-weight:700;">接続・開始 / Role Play</span>\n' +
'  </div>\n' +
'</div>\n' +
'</body>\n' +
'</html>';

fs.writeFileSync('/Users/naohirotokuda/englead-phrasebook/output/prototype-roleplay.html', roleplayHtml);
console.log('Roleplay page updated');

// ── PHRASE PAGE ──────────────────────────────────────────────────────
var phraseCellsHtml = data.phrases
  .filter(function(p) { return p.category === 'connection'; })
  .slice(0, 10)
  .map(renderPhraseCell)
  .join('');

const phraseHtml = '<!DOCTYPE html>\n' +
'<html lang="ja">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<title>Phrase Page</title>\n' +
'<style>\n' +
'* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'body { font-family: "Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif; background: #b8b8b8; padding: 30px; }\n' +
'.page { width: 1123px; height: 794px; background: #fff; display: flex; flex-direction: column; box-shadow: 0 6px 32px rgba(0,0,0,0.28); overflow: hidden; }\n' +
'.header { background: #1B2A5E; flex-shrink: 0; height: 128px; border-top: 5px solid #D4A843; position: relative; overflow: hidden; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }\n' +
'.header::before { content: "ONLINE MEETINGS"; position: absolute; right: -10px; bottom: -18px; font-size: 88px; font-weight: 900; letter-spacing: -0.02em; color: rgba(255,255,255,0.04); white-space: nowrap; pointer-events: none; line-height: 1; }\n' +
'.header-left { display: flex; flex-direction: column; gap: 4px; }\n' +
'.header-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }\n' +
'.header-logo { height: 20px; width: auto; }\n' +
'.header-series { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; color: rgba(255,255,255,0.35); }\n' +
'.header-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.01em; line-height: 1.2; white-space: nowrap; }\n' +
'.header-title2 { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 0.01em; }\n' +
'.header-right { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; z-index: 1; }\n' +
'.header-category { background: #D4A843; color: #1B2A5E; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; white-space: nowrap; }\n' +
'.header-range { font-size: 38px; font-weight: 900; color: rgba(255,255,255,0.18); letter-spacing: -0.03em; line-height: 1; }\n' +
'.phrase-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(5, 1fr); min-height: 0; }\n' +
'.phrase-cell { padding: 7px 18px 5px 14px; border-right: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8; display: flex; flex-direction: column; gap: 2px; overflow: hidden; position: relative; }\n' +
'.phrase-cell:nth-child(even) { border-right: none; }\n' +
'.phrase-cell:nth-child(9), .phrase-cell:nth-child(10) { border-bottom: none; }\n' +
'.phrase-cell::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; background: #2E5896; border-radius: 0 2px 2px 0; }\n' +
'.phrase-top { display: flex; align-items: baseline; gap: 8px; }\n' +
'.phrase-num { font-size: 11px; font-weight: 900; color: #2E5896; flex-shrink: 0; min-width: 22px; line-height: 1; }\n' +
'.phrase-en { font-size: 16px; font-weight: 700; color: #0d0d0d; line-height: 1.25; }\n' +
'.em { color: #C0392B; font-weight: 800; }\n' +
'.phrase-ja { font-size: 11px; color: #444; line-height: 1.3; padding-left: 30px; }\n' +
'.phrase-katakana { font-size: 10px; color: #888; letter-spacing: 0.06em; padding-left: 30px; }\n' +
'.phrase-phonics { font-family: "Courier New", monospace; font-size: 9.5px; color: #b0b0b0; padding-left: 30px; }\n' +
'.phrase-meta { display: flex; align-items: flex-start; gap: 5px; padding-left: 30px; flex-wrap: wrap; margin-top: 1px; }\n' +
'.type-badge { font-size: 9px; font-weight: 700; color: #fff; padding: 1px 6px; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }\n' +
'.phrase-scene { font-size: 10px; color: #666; line-height: 1.5; }\n' +
'.street-note { font-size: 9.5px; color: #7a3a0a; background: #FFF8F0; border-left: 2px solid #D4A843; padding: 2px 7px; border-radius: 0 2px 2px 0; line-height: 1.4; margin-left: 30px; }\n' +
'.footer { height: 24px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 18px; font-size: 9px; color: #c0c0c0; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="page">\n' +
'  <div class="header">\n' +
'    <div class="header-left">\n' +
'      <div class="header-logo-row">\n' +
'        <img class="header-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
'        <span class="header-series">Business English Series &nbsp;#001</span>\n' +
'      </div>\n' +
'      <div class="header-title">オンライン会議の接続・開始に使えるフレーズ</div>\n' +
'      <div class="header-title2">100 Essential Phrases for Virtual Meetings</div>\n' +
'    </div>\n' +
'    <div class="header-right">\n' +
'      <span class="header-category">接続・開始 &nbsp;/&nbsp; Connection &amp; Start</span>\n' +
'      <span class="header-range">01&#8211;10</span>\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="phrase-grid">\n' +
phraseCellsHtml +
'  </div>\n' +
'  <div class="footer">\n' +
'    <span>ENGLEAD Business English Series #001</span>\n' +
'    <span style="color:#1B2A5E; font-weight:700;">接続・開始 / Connection &amp; Start</span>\n' +
'  </div>\n' +
'</div>\n' +
'</body>\n' +
'</html>';

fs.writeFileSync('/Users/naohirotokuda/englead-phrasebook/output/prototype-B-v2.html', phraseHtml);
console.log('Phrase page updated');

// ── COVER PAGE ────────────────────────────────────────────────────
const coverHtml = '<!DOCTYPE html>\n' +
'<html lang="ja">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<title>Cover</title>\n' +
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
'.cover-right { flex-shrink: 0; width: 400px; height: 420px; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; }\n' +
'.illus-ph { background: rgba(255,255,255,0.05); border: 1.5px dashed rgba(212,168,67,0.3); border-radius: 4px; display: flex; align-items: center; justify-content: center; }\n' +
'.illus-ph-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: rgba(212,168,67,0.35); text-transform: uppercase; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="page">\n' +
'  <div class="cover-body">\n' +
'    <div class="cover-left">\n' +
'      <div class="cover-top">\n' +
'        <img class="cover-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
'        <span class="cover-series">Business English Series &nbsp;#001</span>\n' +
'      </div>\n' +
'      <div class="cover-en-title">Online Meetings</div>\n' +
'      <div class="cover-ja-title">オンライン会議で使える英語</div>\n' +
'      <div class="cover-tagline">テレカンを制する 100 フレーズ</div>\n' +
'      <div class="cover-desc">外国人チームとのオンライン会議で、もう「えーっと...」と詰まらないために。<br>駐在員が現場で本当に使うフレーズだけを厳選しました。</div>\n' +
'    </div>\n' +
'    <div class="cover-right">\n' +
'      <div class="illus-ph"><span class="illus-ph-label">Illustration</span></div>\n' +
'      <div class="illus-ph"><span class="illus-ph-label">Illustration</span></div>\n' +
'      <div class="illus-ph"><span class="illus-ph-label">Illustration</span></div>\n' +
'      <div class="illus-ph"><span class="illus-ph-label">Illustration</span></div>\n' +
'    </div>\n' +
'  </div>\n' +
'</div>\n' +
'</body>\n' +
'</html>';

fs.writeFileSync('/Users/naohirotokuda/englead-phrasebook/output/prototype-cover.html', coverHtml);
console.log('Cover page updated');

// ── HOW-TO PAGE ───────────────────────────────────────────────────
const howtoHtml = '<!DOCTYPE html>\n' +
'<html lang="ja">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<title>How To Use</title>\n' +
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
'.header-badge { background: #D4A843; color: #1B2A5E; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 2px; white-space: nowrap; }\n' +
'.content { flex: 1; padding: 20px 40px 16px; overflow: hidden; }\n' +
'.page-title { font-size: 20px; font-weight: 800; color: #1B2A5E; padding-bottom: 10px; border-bottom: 2px solid #1B2A5E; margin-bottom: 16px; }\n' +
'.section { margin-bottom: 18px; }\n' +
'.section-label { display: inline-block; background: #1B2A5E; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 3px 10px; border-radius: 2px; margin-bottom: 8px; }\n' +
'.section-text { font-size: 13px; line-height: 1.75; color: #444; }\n' +
'.legend { display: flex; flex-direction: column; }\n' +
'.legend-row { display: flex; align-items: baseline; gap: 20px; padding: 7px 0; border-bottom: 1px solid #f0f0f0; }\n' +
'.legend-row:last-child { border-bottom: none; }\n' +
'.legend-key { min-width: 150px; font-size: 12px; font-weight: 700; color: #222; flex-shrink: 0; }\n' +
'.legend-val { font-size: 12px; color: #555; line-height: 1.5; }\n' +
'.em { color: #C0392B; font-weight: 800; }\n' +
'.categories { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }\n' +
'.cat-item { padding: 8px 12px; font-size: 12px; font-weight: 600; color: #333; background: #f8f8f8; }\n' +
'.cat-count { font-size: 10px; font-weight: 400; color: #999; margin-left: 5px; }\n' +
'.footer { height: 24px; flex-shrink: 0; border-top: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; padding: 0 18px; font-size: 9px; color: #c0c0c0; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="page">\n' +
'  <div class="header">\n' +
'    <div class="header-left">\n' +
'      <div class="header-logo-row">\n' +
'        <img class="header-logo" src="' + LOGO_WHITE + '" alt="ENGLEAD">\n' +
'        <span class="header-series">Business English Series &nbsp;#001</span>\n' +
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
'        <div class="legend-row"><span class="legend-key">シーン説明</span><span class="legend-val">どんな場面で使うか・ニュアンスの解説。</span></div>\n' +
'        <div class="legend-row"><span class="legend-key">&#x1F4A1; Street Note</span><span class="legend-val">ネイティブの現場感覚・使い方のコツ。</span></div>\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="section">\n' +
'      <div class="section-label">収録カテゴリ</div>\n' +
'      <div class="categories">\n' +
'        <div class="cat-item" style="border-left:3px solid #2E5896;">接続・開始<span class="cat-count">10フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #5E3A8E;">進行・議題管理<span class="cat-count">15フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #8E4A1E;">意見・主張<span class="cat-count">15フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #1E7A5E;">質問・確認<span class="cat-count">15フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #7A1E4E;">同意・反対<span class="cat-count">10フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #4E7A1E;">時間管理<span class="cat-count">10フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #1E5E7A;">技術トラブル対応<span class="cat-count">10フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #6E5E1E;">まとめ・アクション確認<span class="cat-count">10フレーズ</span></div>\n' +
'        <div class="cat-item" style="border-left:3px solid #3E5E3E;">クロージング<span class="cat-count">5フレーズ</span></div>\n' +
'      </div>\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="footer">\n' +
'    <span>ENGLEAD Business English Series #001</span>\n' +
'    <span style="color:#1B2A5E;font-weight:700;">使い方ガイド</span>\n' +
'  </div>\n' +
'</div>\n' +
'</body>\n' +
'</html>';

fs.writeFileSync('/Users/naohirotokuda/englead-phrasebook/output/prototype-howto.html', howtoHtml);
console.log('How-to page updated');
console.log('All done!');
