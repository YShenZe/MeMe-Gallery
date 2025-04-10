const fs = require('fs');
const path = require('path');

const [,, inputDir = './memes', outputFile = './index.html'] = process.argv;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function escapeHtml(unsafe) {
  return unsafe.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function collectImages(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes:true});
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? collectImages(full) 
           : IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

function generateHTML(imagePaths) {
  return `<!DOCTYPE html><html lang=zh-CN><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>梦泽梗图库 | ${imagePaths.length}张精彩图片</title><style>
:root{--primary-color:#2c3e50;--accent-color:#3498db;--transition-speed:.3s}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Segoe UI,system-ui,sans-serif;background:#f8f9fa;line-height:1.6}.container{max-width:1440px;margin:2rem auto;padding:0 1rem}
.header{text-align:center;margin-bottom:3rem;padding:2rem 0;background:linear-gradient(135deg,var(--primary-color),#34495e);color:#fff;
border-radius:12px;box-shadow:0 4px 6px #0000001a}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;padding:1rem}
.card{background:#fff;border-radius:12px;overflow:hidden;transition:transform var(--transition-speed),box-shadow var(--transition-speed);cursor:pointer}
.card:hover{transform:translateY(-5px);box-shadow:0 12px 24px #00000026}.card-img{width:100%;height:250px;object-fit:cover;border-bottom:1px solid #eee;
transition:opacity var(--transition-speed)}.card:hover .card-img{opacity:.9}.card-info{padding:1rem;background:rgba(255,255,255,.9);backdrop-filter:blur(5px)}
.filename{color:var(--primary-color);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lightbox{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:#000000f2;z-index:1000;justify-content:center;align-items:center}
.lightbox.active{display:flex;animation:fadeIn .3s}.lightbox-img{max-width:90%;max-height:90%;object-fit:contain;border-radius:8px;transform:scale(.95);
animation:zoomIn .3s forwards}.lightbox-close{position:absolute;top:2rem;right:2rem;color:#fff;font-size:2.5rem;cursor:pointer;transition:opacity .2s}
.lightbox-close:hover{opacity:.8}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes zoomIn{to{transform:scale(1)}}
@media (max-width:768px){.gallery{grid-template-columns:1fr}.card-img{height:200px}}</style></head>
<body><div class=container><header class=header><h1>专业梗图收藏</h1><p>共收录 ${imagePaths.length} 张高清图片</p></header>
<div class=gallery>${imagePaths.map(p=>`<div class=card onclick=showLightbox(${JSON.stringify(p)})>
<img src=${p} class=card-img alt="梗图" loading=lazy onload="this.style.opacity=1"><div class=card-info>
<div class=filename>${escapeHtml(path.basename(p))}</div></div></div>`).join('')}</div>
<div class=lightbox onclick=closeLightbox()><span class=lightbox-close>&times;</span><img class=lightbox-img id=lightbox-img></div></div>
<script>function showLightbox(e){document.querySelector('.lightbox').classList.add('active'),document.body.style.overflow='hidden',
document.getElementById('lightbox-img').src=e}function closeLightbox(){document.querySelector('.lightbox').classList.remove('active'),
document.body.style.overflow=''}document.addEventListener('keydown',e=>'Escape'===e.key&&closeLightbox()),document.querySelectorAll('.card-img').forEach(e=>{
e.style.opacity='0',e.style.transition='opacity .5s ease-out'});</script></body></html>`;
}

try {
  if (!fs.existsSync(inputDir)) throw new Error(`目录不存在: ${inputDir}`);
  if (!fs.statSync(inputDir).isDirectory()) throw new Error(`不是目录: ${inputDir}`);
  
  const imageFiles = collectImages(inputDir).sort((a,b)=>a.localeCompare(b));
  if (!imageFiles.length) { console.log('没有图片'); process.exit(0); }
  
  const relativePaths = imageFiles.map(f=>path.relative(path.dirname(outputFile),f).replace(/\\/g,'/'));
  fs.writeFileSync(outputFile, generateHTML(relativePaths));
  console.log(`成功生成，本次 ${imageFiles.length} 张图片\n文件路径: ${path.resolve(outputFile)}`);

} catch(e) {
  console.error('发生错误:',e.message);
  process.exit(1);
}