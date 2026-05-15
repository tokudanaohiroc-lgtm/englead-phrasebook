const { execSync } = require('child_process');
const path = require('path');

function run(script, label) {
  console.log('\n' + '-'.repeat(50));
  console.log('  ' + label);
  console.log('-'.repeat(50));
  try {
    execSync('node ' + path.join(__dirname, script), { stdio: 'inherit' });
  } catch (e) {
    console.error('\n[build] ' + script + ' でエラーが発生しました。');
    process.exit(1);
  }
}

console.log('ENGLEAD Phrasebook Builder');
console.log('==========================');

run('generate-avatars.js',       'Step 1/3  キャラクターアバター生成');
run('generate-illustrations.js', 'Step 2/3  シーンイラスト生成 (10枚)');
run('update-pages.js',           'Step 3/3  HTMLページ生成 (22ページ)');

console.log('\n' + '='.repeat(50));
console.log('  ビルド完了！ output/viewer.html を開いて確認してください。');
console.log('='.repeat(50) + '\n');
