const fs = require('fs');
const path = require('path');

require('fs').readFileSync('.env', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
});

const OUT_DIR = './assets/illustrations-002';
fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE = `
Style: clean flat vector illustration with bold outlines and solid color fills. Color palette is natural and soft — not overly saturated. The character has light, natural East Asian skin tone (fair, not orange). Overall palette is balanced: muted navy, soft gray, natural wood tones, gentle ambient light. Premium business book illustration quality. Mature and confident tone — absolutely no cute or cartoonish elements. Wide landscape composition, subject positioned in the upper-center to upper-left area of the frame.
`.trim();

const SCENES = [
  {
    id: 'phone-desk',
    desc: 'A Japanese woman in her early 30s in smart business casual sits at a tidy office desk, holding a landline telephone receiver to her ear with a calm and professional expression. A notepad and pen are nearby. Clean, modern office environment with soft natural light.'
  },
  {
    id: 'phone-message',
    desc: 'A Japanese woman in her early 30s in smart business casual holds a telephone receiver and writes notes on a notepad with her free hand. Expression is attentive and focused, carefully capturing information. Desk setting with soft light.'
  },
  {
    id: 'phone-mobile',
    desc: 'A Japanese woman in her early 30s in smart business casual holds a smartphone to her ear, standing near a window in an office. Expression is polite and composed, initiating a return call. Calm office background with soft daylight.'
  },
  {
    id: 'phone-international',
    desc: 'A Japanese woman in her early 30s in smart business casual sits at her office desk making an international phone call, a small world desk globe visible in the background. Expression is thoughtful and professionally warm. Clean, organized desk environment.'
  },
  {
    id: 'phone-urgent',
    desc: 'A Japanese woman in her early 30s in smart business casual holds a phone receiver with a focused, alert expression, pen in hand ready to write. Posture is upright and attentive — clearly handling an urgent matter with composure. Office setting.'
  },
  {
    id: 'phone-office',
    desc: 'A Japanese woman in her early 30s in smart business casual sits at her desk on a phone call, expression thoughtful and slightly formal, as if carefully making a polite request. A document or form is visible on the desk in front of her. Clean office setting.'
  },
  {
    id: 'phone-clarity',
    desc: 'A Japanese woman in her early 30s in smart business casual holds a phone receiver close to her ear with a slightly puzzled, focused expression — straining to hear through a bad connection. One hand raised slightly near her ear. Office setting.'
  },
  {
    id: 'phone-offduty',
    desc: 'A Japanese woman in her early 30s in casual-smart attire holds a smartphone, standing outdoors or in a relaxed indoor space — clearly off duty. Expression is slightly surprised but composed, handling an unexpected work call gracefully. Soft natural light.'
  },
  {
    id: 'phone-closing',
    desc: 'A Japanese woman in her early 30s in smart business casual sits at her desk, just ending a phone call with a calm, satisfied expression. The receiver is being gently lowered, a completed notepad beside her. Expression is warm and professionally accomplished. Office setting.'
  }
];

async function generateImage(scene) {
  const outPath = path.join(OUT_DIR, `${scene.id}.png`);

  if (fs.existsSync(outPath)) {
    console.log(`  skip (already exists): ${scene.id}.png`);
    return;
  }

  const prompt = `Flat vector illustration in a modern editorial style. ${scene.desc}\n\n${STYLE}`;

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size: '1536x1024',
      output_format: 'png'
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  fs.writeFileSync(outPath, Buffer.from(data.data[0].b64_json, 'base64'));
  console.log(`  OK: ${scene.id}.png`);
}

(async () => {
  console.log(`Generating ${SCENES.length} illustrations for Vol.002...\n`);
  for (const scene of SCENES) {
    process.stdout.write(`[${SCENES.indexOf(scene) + 1}/${SCENES.length}] ${scene.id} ... `);
    try {
      await generateImage(scene);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
  }
  console.log('\nDone. illustrations saved to assets/illustrations-002/');
})();
