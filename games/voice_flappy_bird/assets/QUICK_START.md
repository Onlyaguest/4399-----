# 🚀 快速开始 - 资源替换指南

这是一个简单的指南，帮助您快速替换游戏和官网中的图片资源。

## 📁 目录概览

```
assets/
├── 📄 README.md              # 详细说明文档
├── 📄 QUICK_START.md         # 本快速指南
├── 📄 config.js              # 资源配置文件
├── 📄 asset-manager.js       # 资源管理工具
├── 🖼️ images/               # 游戏图片资源
│   ├── birds/               # 🐦 小鸟图片
│   ├── pipes/               # 🟢 管道图片
│   └── ui/                  # 🎮 UI界面图片
├── 🎨 sprites/              # 精灵图和动画帧
├── 🌅 backgrounds/          # 背景图片
│   ├── game/               # 游戏背景
│   └── website/            # 官网背景
└── 🎯 ui/                   # UI元素
    ├── buttons/            # 按钮图片
    ├── icons/              # 图标
    └── decorations/        # 🐦 官网装饰小鸟
```

## ⚡ 3分钟快速替换

### 1️⃣ 替换游戏中的小鸟 (最常用)

1. **准备图片**: 制作一个 30x20 像素的PNG图片
2. **放置文件**: 将图片命名为 `bird-default.png`，放入 `images/birds/` 目录
3. **启用图片**: 在浏览器控制台输入：
   ```javascript
   AssetTools.toggleBird()
   AssetTools.useImages()
   ```
4. **查看效果**: 刷新游戏页面

### 2️⃣ 替换官网装饰小鸟

1. **准备图片**: 制作三个不同尺寸的PNG图片：
   - `angry-bird-red.png` (64x64px)
   - `angry-bird-yellow.png` (48x48px) 
   - `angry-bird-green.png` (40x40px)
2. **放置文件**: 放入 `ui/decorations/` 目录
3. **修改官网**: 编辑官网HTML文件，将SVG替换为img标签
4. **查看效果**: 刷新官网页面

### 3️⃣ 替换游戏背景

1. **准备图片**: 制作背景图片：
   - `sky.jpg` (800x600px 或更高)
   - `ground.png` (800x50px)
2. **放置文件**: 放入 `backgrounds/game/` 目录
3. **启用背景**: 在控制台输入：
   ```javascript
   AssetTools.toggleBackground()
   ```
4. **查看效果**: 刷新游戏页面

## 🛠️ 开发者工具

在浏览器控制台中可以使用以下命令：

### 基本命令
```javascript
AssetTools.help()          // 显示帮助信息
AssetTools.status()        // 查看当前状态
AssetTools.useImages()     // 启用图片模式
AssetTools.useCode()       // 启用代码绘制模式
```

### 切换特定资源
```javascript
AssetTools.toggleBird()       // 切换小鸟图片
AssetTools.toggleBackground() // 切换背景图片
```

### 管理功能
```javascript
AssetTools.clear()         // 清除缓存
AssetTools.preload(['images/birds/bird-default.png']) // 预加载
```

## 📋 常用文件清单

### 🎮 游戏资源 (优先级高)
- `images/birds/bird-default.png` - 默认小鸟 (30x20px)
- `backgrounds/game/sky.jpg` - 天空背景 (800x600px)
- `backgrounds/game/ground.png` - 地面纹理 (800x50px)

### 🌐 官网资源
- `ui/decorations/angry-bird-red.png` - 红色装饰小鸟 (64x64px)
- `ui/decorations/angry-bird-yellow.png` - 黄色装饰小鸟 (48x48px)
- `ui/decorations/angry-bird-green.png` - 绿色装饰小鸟 (40x40px)
- `ui/decorations/hero-bird.png` - 主角展示小鸟 (96x96px)

## 🎨 设计建议

### 像素艺术风格
- 使用清晰的边缘，避免抗锯齿
- 采用饱和度较高的颜色
- 保持简洁的设计，细节不宜过多

### 文件优化
- 单个文件不超过100KB
- 使用PNG格式保持透明效果
- 压缩图片以提高加载速度

## 🔧 故障排除

### 图片不显示？
1. 检查文件路径和命名是否正确
2. 确认图片格式是否支持 (PNG/JPG)
3. 在控制台查看是否有加载错误
4. 尝试清除缓存：`AssetTools.clear()`

### 性能问题？
1. 检查图片文件大小
2. 使用适当的压缩比例
3. 避免使用过大的图片

### 恢复默认？
```javascript
AssetTools.useCode()  // 切换回代码绘制模式
```

## 📞 需要帮助？

1. 查看详细文档：`README.md`
2. 检查配置文件：`config.js`
3. 使用开发者工具：`AssetTools.help()`

---

💡 **提示**: 建议先从替换小鸟图片开始，这是最简单也是效果最明显的修改！
