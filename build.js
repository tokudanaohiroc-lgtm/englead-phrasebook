const fs = require('fs');
const path = require('path');

const INPUT_FILE = process.argv[2] || './content/01_online-meetings.json';
const OUTPUT_DIR = './output';

const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const { meta, categories, phrases } = data;

const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

function typeLabel(type) {
  if (type === 'idiom') return 'イディオム';
  if (type === 'vocab') return '単語';
  return 'フレーズ';
}

function typeBadgeColor(type) {
  if (type === 'idiom') return '#C0392B';
  if (type === 'vocab') return '#1A6B3A';
  return '#1A3B6B';
}

function highlightEmphasis(text, emphasisList) {
  if (!emphasisList || emphasisList.length === 0) return escapeHtml(text);
  let result = escapeHtml(text);
  for (const em of emphasisList) {
    const escaped = escapeHtml(em);
    result = result.replace(new RegExp(escaped, 'g'), `<span class="em">${escaped}</span>`);
  }
  return result;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function illustrationBar(scene, catColor, catJa, pageNum, totalPages) {
  const imgPath = `./assets/illustrations/${scene}.png`;
  const hasImg = fs.existsSync(imgPath);
  const sceneIcons = {
    'home-office-start': '💻', 'conference-room': '📋',
    'whiteboard-discussion': '💬', 'one-on-one': '🤝',
    'negotiation': '⚖️', 'time-pressure': '⏱️',
    'tech-trouble': '🔧', 'wrap-up': '✅', 'goodbye': '👋',
  };

  if (hasImg) {
    const imgData = fs.readFileSync(imgPath).toString('base64');
    return `
    <div class="illus-bar">
      <img class="illus-img" src="data:image/png;base64,${imgData}" alt="${scene}">
      <div class="illus-overlay">
        <span class="illus-cat" style="background:${catColor};">${catJa}</span>
        <span class="illus-page">P.${pageNum} / ${totalPages}</span>
      </div>
    </div>`;
  }

  return `
    <div class="illus-bar illus-placeholder" style="background:${catColor}22;">
      <span class="illus-icon">${sceneIcons[scene] || '📘'}</span>
      <span class="illus-cat-plain">${catJa}</span>
      <span class="illus-page">P.${pageNum} / ${totalPages}</span>
    </div>`;
}

const PHRASES_PER_PAGE = meta.phrases_per_page || 5;
const pages = [];
for (let i = 0; i < phrases.length; i += PHRASES_PER_PAGE) {
  pages.push(phrases.slice(i, i + PHRASES_PER_PAGE));
}

function renderPhrasePage(pageItems, pageIndex) {
  const cat = categoryMap[pageItems[0].category];
  const catColor = cat ? cat.color : '#1B2A5E';
  const catJa = cat ? cat.ja : '';
  const totalPages = pages.length;

  const rowsHtml = pageItems.map((p, i) => {
    const badge = `<span class="type-badge" style="background:${typeBadgeColor(p.type)}">${typeLabel(p.type)}</span>`;
    const streetNote = p.street_note
      ? `<div class="street-note">💡 ${escapeHtml(p.street_note)}</div>`
      : '';
    return `
    <div class="phrase-row${i < pageItems.length - 1 ? ' has-divider' : ''}">
      <div class="phrase-num">${String(p.num).padStart(2, '0')}</div>
      <div class="phrase-body">
        <div class="phrase-en">${highlightEmphasis(p.phrase_en, p.emphasis)}</div>
        <div class="phrase-katakana">${escapeHtml(p.katakana)}</div>
        <div class="phrase-phonics">${escapeHtml(p.phonics)}</div>
        <div class="phrase-meta">
          ${badge}
          <span class="phrase-scene">${escapeHtml(p.scene)}</span>
        </div>
        ${streetNote}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="page phrase-page">
    <div class="page-header" style="background:${catColor};">
      <span class="header-series">${escapeHtml(meta.title_ja)}</span>
      <span class="header-range">${pageItems[0].num}–${pageItems[pageItems.length-1].num}</span>
    </div>
    ${illustrationBar(pageItems[0].illustration_scene, catColor, catJa, pageIndex + 1, totalPages)}
    <div class="phrases-area">
      ${rowsHtml}
    </div>
    <div class="page-footer">
      <span>ENGLEAD Business English Series No.${meta.number}</span>
      <span style="color:${catColor};font-weight:700;">${catJa}</span>
    </div>
  </div>`;
}

const coverHtml = `
  <div class="page cover-page" style="background:${meta.cover_color};">
    <div class="cover-accent" style="background:${meta.accent_color};"></div>
    <div class="cover-content">
      <div class="cover-series-num" style="color:${meta.accent_color};">Business English Series No.${meta.number}</div>
      <div class="cover-en-title">${escapeHtml(meta.title)}</div>
      <div class="cover-ja-title">${escapeHtml(meta.title_ja)}</div>
      <div class="cover-subtitle">${escapeHtml(meta.subtitle_ja)}</div>
      <div class="cover-desc">${escapeHtml(meta.description_ja)}</div>
      <div class="cover-brand">ENGLEAD</div>
    </div>
    <div class="cover-phrase-count" style="color:${meta.accent_color};">100 Phrases</div>
  </div>`;

const howtoHtml = `
  <div class="page howto-page">
    <div class="page-header" style="background:${meta.cover_color};">
      <span class="header-series">${escapeHtml(meta.title_ja)}</span>
      <span class="header-range">使い方</span>
    </div>
    <div class="howto-content">
      <h2 class="howto-title">このフレーズブックの使い方</h2>
      <div class="howto-section">
        <div class="howto-label" style="background:${meta.cover_color};">ターゲット</div>
        <p>外国人チームとのオンライン会議に日々向き合う30代ビジネスパーソン向けに設計しています。教科書的な正しい英語だけでなく、現場でネイティブが実際に使うカジュアルな表現も掲載しています。</p>
      </div>
      <div class="howto-section">
        <div class="howto-label" style="background:${meta.cover_color};">各フレーズの見方</div>
        <div class="howto-legend">
          <div class="legend-row">
            <span class="legend-key">英文フレーズ</span>
            <span class="legend-val">そのまま使えるフレーズ本体。<span class="em">赤文字</span>が特に重要なポイント。</span>
          </div>
          <div class="legend-row">
            <span class="legend-key">発音記号</span>
            <span class="legend-val">/IPA記号/ で正確な発音を確認できます。</span>
          </div>
          <div class="legend-row">
            <span class="legend-key">カタカナ読み</span>
            <span class="legend-val">発音の目安。ただしカタカナは近似値なので、実際の音声も確認してください。</span>
          </div>
          <div class="legend-row">
            <span class="legend-key"><span style="background:#1A3B6B;color:#fff;padding:1px 6px;border-radius:3px;font-size:0.75em;">フレーズ</span></span>
            <span class="legend-val">汎用的な定型表現</span>
          </div>
          <div class="legend-row">
            <span class="legend-key"><span style="background:#C0392B;color:#fff;padding:1px 6px;border-radius:3px;font-size:0.75em;">イディオム</span></span>
            <span class="legend-val">慣用的な表現。直訳すると意味が通じないもの。</span>
          </div>
          <div class="legend-row">
            <span class="legend-key">シーン説明</span>
            <span class="legend-val">どんな場面で使うか・ニュアンスの解説。</span>
          </div>
          <div class="legend-row">
            <span class="legend-key">💡 Street Note</span>
            <span class="legend-val">ネイティブの現場感覚・語源・使い方のコツ。</span>
          </div>
        </div>
      </div>
      <div class="howto-section">
        <div class="howto-label" style="background:${meta.cover_color};">収録カテゴリ</div>
        <div class="howto-categories">
          ${categories.map(c => `<div class="howto-cat" style="border-left:4px solid ${c.color};">${c.ja} <span>(${c.count}フレーズ)</span></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="page-footer">
      <span>ENGLEAD Business English Series No.${meta.number}</span>
    </div>
  </div>`;

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "Helvetica Neue", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif;
  background: #e8e8e8;
  padding: 20px;
}

.page {
  width: 1123px;
  min-height: 794px;
  background: #fff;
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  page-break-after: always;
}

/* Cover */
.cover-page {
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
}
.cover-accent {
  position: absolute;
  right: 0; top: 0;
  width: 200px; height: 100%;
  opacity: 0.15;
}
.cover-content {
  padding: 80px 60px;
  color: #fff;
  z-index: 1;
}
.cover-series-num {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.cover-en-title {
  font-size: 48px;
  font-weight: 900;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 8px;
}
.cover-ja-title {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  margin-bottom: 24px;
}
.cover-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 40px;
}
.cover-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  line-height: 1.8;
  max-width: 480px;
  border-left: 3px solid rgba(255,255,255,0.3);
  padding-left: 16px;
}
.cover-brand {
  position: absolute;
  bottom: 48px;
  left: 60px;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: rgba(255,255,255,0.5);
}
.cover-phrase-count {
  position: absolute;
  bottom: 48px;
  right: 60px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* How-to */
.howto-page { }
.howto-content {
  padding: 32px 48px;
  flex: 1;
}
.howto-title {
  font-size: 20px;
  font-weight: 800;
  color: #1B2A5E;
  margin-bottom: 28px;
  padding-bottom: 12px;
  border-bottom: 2px solid #1B2A5E;
}
.howto-section {
  margin-bottom: 28px;
}
.howto-label {
  display: inline-block;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 3px;
  margin-bottom: 10px;
}
.howto-section p {
  font-size: 13px;
  line-height: 1.8;
  color: #444;
}
.howto-legend { }
.legend-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.legend-key {
  min-width: 110px;
  font-weight: 700;
  color: #333;
  flex-shrink: 0;
}
.legend-val {
  color: #555;
  line-height: 1.6;
}
.howto-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.howto-cat {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  background: #f8f8f8;
}
.howto-cat span {
  font-size: 11px;
  font-weight: 400;
  color: #888;
  margin-left: 6px;
}

/* Phrase pages */
.phrase-page { }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  color: #fff;
}
.header-series {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  opacity: 0.9;
}
.header-range {
  font-size: 13px;
  font-weight: 800;
}

.illus-bar {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-bottom: 1px solid #eee;
}
.illus-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}
.illus-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.35));
}
.illus-cat {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  padding: 2px 10px;
  border-radius: 3px;
}
.illus-page {
  font-size: 11px;
  color: rgba(255,255,255,0.85);
  font-weight: 600;
}
.illus-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 180px;
}
.illus-icon { font-size: 28px; }
.illus-cat-plain {
  font-size: 15px;
  font-weight: 800;
  color: #555;
}

.phrases-area {
  flex: 1;
  padding: 0 24px;
}

.phrase-row {
  display: flex;
  gap: 16px;
  padding: 14px 0;
}
.phrase-row.has-divider {
  border-bottom: 1px solid #f0f0f0;
}

.phrase-num {
  font-size: 22px;
  font-weight: 900;
  color: #ddd;
  min-width: 36px;
  padding-top: 2px;
  font-variant-numeric: tabular-nums;
}

.phrase-body {
  flex: 1;
}

.phrase-en {
  font-size: 16.5px;
  font-weight: 700;
  color: #111;
  line-height: 1.35;
  margin-bottom: 4px;
}
.em {
  color: #C0392B;
  font-weight: 800;
}

.phrase-phonics {
  font-family: "Courier New", Courier, monospace;
  font-size: 11.5px;
  color: #666;
  margin-bottom: 2px;
}

.phrase-katakana {
  font-size: 12px;
  color: #888;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.phrase-meta {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.type-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  padding: 2px 7px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-top: 1px;
}

.phrase-scene {
  font-size: 11.5px;
  color: #555;
  line-height: 1.6;
}

.phrase-ja {
  font-size: 12px;
  color: #777;
  font-style: italic;
  margin-bottom: 4px;
}

.street-note {
  margin-top: 5px;
  font-size: 11px;
  color: #8B4513;
  background: #FFF8F0;
  border-left: 3px solid #D4A843;
  padding: 4px 8px;
  border-radius: 0 3px 3px 0;
  line-height: 1.5;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 24px;
  border-top: 1px solid #eee;
  font-size: 10px;
  color: #aaa;
}

@media print {
  body { background: none; padding: 0; }
  .page {
    margin: 0;
    box-shadow: none;
    page-break-after: always;
    width: 297mm;
    min-height: 210mm;
  }
  @page { size: A4 landscape; margin: 0; }
}
`;

const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title_ja} - ENGLEAD</title>
  <style>${css}</style>
</head>
<body>
${coverHtml}
${howtoHtml}
${pages.map((pageItems, i) => renderPhrasePage(pageItems, i)).join('\n')}
</body>
</html>`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const outFile = path.join(OUTPUT_DIR, `${meta.id}.html`);
fs.writeFileSync(outFile, fullHtml, 'utf8');

console.log(`Generated: ${outFile}`);
console.log(`  Pages: ${pages.length} phrase pages + cover + how-to = ${pages.length + 2} total`);
console.log(`  Phrases: ${phrases.length}`);
console.log('');
console.log('To view: open output/online-meetings.html in a browser');
console.log('To export PDF: File > Print > Save as PDF (A4, Portrait)');
