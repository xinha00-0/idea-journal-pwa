import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';

const ROOT_DIR = join(import.meta.dirname, '..', 'www');
const DIST_DIR = join(import.meta.dirname, '..', 'dist');

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getAllFiles(dir, base = '') {
  const results = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relPath = base ? `${base}/${entry}` : entry;
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath, size: stat.size });
    }
  }

  return results;
}

function minifyCSS(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();
}

function minifyJS(content) {
  const singleLineComments = /\/\/.*$/gm;
  const multiLineComments = /\/\*[\s\S]*?\*\//g;
  let result = content;
  result = result.replace(multiLineComments, '');
  result = result.replace(/\s+/g, ' ');
  return result.trim();
}

function optimizeHTML(html, cssMap, jsMap) {
  let result = html;

  for (const [original, optimized] of Object.entries(cssMap)) {
    result = result.replace(
      `href="${original}"`,
      `href="${optimized}"`
    );
  }

  for (const [original, optimized] of Object.entries(jsMap)) {
    result = result.replace(
      `src="${original}"`,
      `src="${optimized}"`
    );
  }

  return result;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

console.log('=== 想法记录 - 资源优化 ===\n');

ensureDir(DIST_DIR);

const files = getAllFiles(ROOT_DIR);
const cssMap = {};
const jsMap = {};
let totalOriginal = 0;
let totalOptimized = 0;

const cssFiles = files.filter(f => extname(f.relPath) === '.css' && !f.relPath.includes('easymde'));
const jsFiles = files.filter(f => extname(f.relPath) === '.js' && !f.relPath.includes('easymde') && !f.relPath.includes('node_modules'));

console.log('优化 CSS:');
for (const file of cssFiles) {
  const content = readFileSync(file.fullPath, 'utf-8');
  const minified = minifyCSS(content);
  const outputDir = join(DIST_DIR, file.relPath);
  const outputRelPath = file.relPath.replace('.css', '.min.css');

  ensureDir(join(DIST_DIR, file.relPath).split('/').slice(0, -1).join('/'));
  writeFileSync(outputDir, minified);

  cssMap[file.relPath] = file.relPath;

  totalOriginal += file.size;
  totalOptimized += Buffer.byteLength(minified);

  const saved = ((1 - minified.length / content.length) * 100).toFixed(1);
  console.log(`  ${file.relPath}: ${formatBytes(file.size)} → ${formatBytes(Buffer.byteLength(minified))} (-${saved}%)`);
}

console.log('\n优化 JS:');
for (const file of jsFiles) {
  const content = readFileSync(file.fullPath, 'utf-8');
  const minified = minifyJS(content);

  ensureDir(join(DIST_DIR, file.relPath).split('/').slice(0, -1).join('/'));
  writeFileSync(join(DIST_DIR, file.relPath), minified);

  jsMap[file.relPath] = file.relPath;

  totalOriginal += file.size;
  totalOptimized += Buffer.byteLength(minified);

  const saved = ((1 - minified.length / content.length) * 100).toFixed(1);
  console.log(`  ${file.relPath}: ${formatBytes(file.size)} → ${formatBytes(Buffer.byteLength(minified))} (-${saved}%)`);
}

const htmlFile = files.find(f => f.relPath === 'index.html');
if (htmlFile) {
  const htmlContent = readFileSync(htmlFile.fullPath, 'utf-8');
  const optimizedHTML = optimizeHTML(htmlContent, cssMap, jsMap);
  writeFileSync(join(DIST_DIR, 'index.html'), optimizedHTML);
  console.log('\n优化 HTML: index.html');
}

const assetFiles = files.filter(f =>
  extname(f.relPath) === '.png' ||
  extname(f.relPath) === '.jpg' ||
  extname(f.relPath) === '.svg' ||
  extname(f.relPath) === '.json' ||
  f.relPath.includes('easymde')
);

for (const file of assetFiles) {
  const content = readFileSync(file.fullPath);
  ensureDir(join(DIST_DIR, file.relPath).split('/').slice(0, -1).join('/'));
  writeFileSync(join(DIST_DIR, file.relPath), content);
}

console.log(`\n复制 ${assetFiles.length} 个资源文件`);
console.log(`\n总计: ${formatBytes(totalOriginal)} → ${formatBytes(totalOptimized)}`);
const totalSaved = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
console.log(`节省: ${totalSaved}%`);
console.log('\n输出目录: dist/');
console.log('=== 优化完成 ===');
