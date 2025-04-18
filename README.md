# 梦泽梗图库生成器

自动生成梗图库网页并部署到GitHub Pages的解决方案。

## 功能特性

✅ 自动扫描图片目录  
✅ 生成响应式网页画廊  
✅ 支持懒加载和灯箱效果  
✅ 自动部署到GitHub Pages  
✅ 支持多种图片格式 (JPG/PNG/GIF/WEBP)

## 使用方法

### 环境要求
- Node.js 18+
- npm/yarn

### 本地生成
1. 将图片放入`./memes`目录（或指定其他目录）
2. 运行生成命令：
```bash
npx node app.js [输入目录] [输出文件]
# 示例（使用默认参数）：
# node app.js ./memes ./index.html
```

### 自动部署
1. 将本仓库推送到GitHub
2. 确保GitHub Pages设置为使用`gh-pages`分支
3. 每次推送到main分支后，Action会自动：
   - 生成最新网页
   - 部署到gh-pages分支

## 文件结构
```
.
├── app.js         # 生成脚本
├── memes/            # 图片目录（默认）
├── index.html        # 生成的网页
└── .github/workflows # 部署配置
```

## 注意事项
1. 图片路径不要包含中文和特殊字符
2. 推荐图片尺寸不超过2000x2000像素
3. 首次部署后需等待1-2分钟生效

## 协议
MIT License | © 梦泽