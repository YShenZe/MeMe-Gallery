const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const ejs = require('ejs');

const [,, inputDir = './memes', outputFile = './index.html'] = process.argv;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

// 默认配置
const defaultConfig = {
  perPage: 10,
  site: {
    title: '梦泽梗图库',
    description: '共收录 ${total} 张精彩梗图'
  },
  footer: '© 2024 梦泽梗图库 保留所有权利',
  custom_css: [],
  custom_js: []
};

// 加载配置
let config = {...defaultConfig};
try {
  const configFile = fs.readFileSync('./_config.yml', 'utf8');
  const loadedConfig = yaml.load(configFile);
  config = {
    ...defaultConfig,
    ...loadedConfig,
    site: {...defaultConfig.site, ...loadedConfig.site}
  };
} catch (e) {
  if (e.code !== 'ENOENT') console.error('配置加载错误:', e.message);
}

function collectImages(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? collectImages(full) 
           : IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

function getPageFilename(outputPath, page) {
  const ext = path.extname(outputPath);
  const base = path.basename(outputPath, ext);
  const dir = path.dirname(outputPath);
  return page === 1 ? 
    path.join(dir, `${base}${ext}`) : 
    path.join(dir, `${base}-${page}${ext}`);
}

async function generatePages(imagePaths, outputPath) {
  const perPage = config.perPage;
  const totalPages = Math.ceil(imagePaths.length / perPage);
  const outputDir = path.dirname(outputPath);
  const template = fs.readFileSync(path.join(__dirname, 'template.ejs'), 'utf-8');

  // 添加统计信息
  console.log('\n' + '='.repeat(50));
  console.log(`开始生成，共 ${imagePaths.length} 张图片`);
  console.log(`分页配置：每页 ${perPage} 张，共 ${totalPages} 页`);
  console.log('='.repeat(50) + '\n');

  for (let page = 1; page <= totalPages; page++) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageImages = imagePaths.slice(start, end);
    
    const outputFile = getPageFilename(outputPath, page);
    const absoluteOutputPath = path.resolve(outputFile);

    // 添加分页生成日志
    console.log(`📄 正在生成第 ${page.toString().padEnd(2)}/${totalPages} 页: `);
    console.log(`   ├─ 包含图片: ${start + 1}-${Math.min(end, imagePaths.length)}`);
    console.log(`   └─ 输出路径: ${absoluteOutputPath}`);

    const pageData = {
      path: require('path'),
      images: pageImages,
      currentPage: page,
      totalPages,
      prevPage: page > 1 ? getPageFilename(outputPath, page - 1) : null,
      nextPage: page < totalPages ? getPageFilename(outputPath, page + 1) : null,
      site: {
        ...config.site,
        description: config.site.description.replace('${total}', imagePaths.length)
      },
      footer: config.footer,
      custom_css: config.custom_css,
      custom_js: config.custom_js,
      getPageUrl: p => path.basename(getPageFilename(outputPath, p))
    };

    const html = ejs.render(template, pageData);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFile, html);
  }

  // 添加结束统计
  console.log('\n' + '='.repeat(50));
  console.log(`✅ 生成完成！共生成 ${totalPages} 个页面`);
  console.log(`📂 输出目录: ${path.resolve(outputDir)}`);
  console.log('='.repeat(50) + '\n');
}

// 主程序
try {
  if (!fs.existsSync(inputDir)) throw new Error(`目录不存在: ${inputDir}`);
  
  const absoluteImages = collectImages(inputDir).sort((a, b) => a.localeCompare(b));
  if (!absoluteImages.length) throw new Error('没有找到图片文件');
  
  const outputDir = path.dirname(outputFile);
  const relativeImages = absoluteImages.map(img => 
    path.relative(outputDir, img).replace(/\\/g, '/')
  );

  generatePages(relativeImages, outputFile);
  console.log(`成功生成 ${Math.ceil(relativeImages.length/config.perPage)} 个页面`);

} catch (e) {
  console.error('错误:', e.message);
  process.exit(1);
}