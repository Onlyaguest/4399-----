// 啊啊啊啊啊啊啊啊 - 资源管理工具
// 用于在代码绘制和图片资源之间切换

class AssetManager {
    constructor() {
        this.config = window.AssetConfig || {};
        this.loader = window.assetLoader || new AssetLoader();
        this.initialized = false;
    }

    // 初始化资源管理器
    async init() {
        if (this.initialized) return;

        console.log('Initializing Asset Manager...');
        
        // 预加载关键资源
        if (this.config.global?.useImages) {
            await this.loader.preloadCritical();
        }

        this.initialized = true;
        console.log('Asset Manager initialized');
    }

    // 获取小鸟渲染数据
    getBirdRenderData(bird) {
        const birdConfig = this.config.game?.bird;
        
        if (birdConfig?.useImage && this.config.global?.useImages) {
            const image = this.loader.getImage(birdConfig.imagePath);
            if (image) {
                return {
                    type: 'image',
                    image: image,
                    x: bird.x,
                    y: bird.y,
                    width: birdConfig.width || bird.width,
                    height: birdConfig.height || bird.height,
                    rotation: bird.rotation
                };
            }
        }

        // 回退到代码绘制
        return {
            type: 'code',
            x: bird.x,
            y: bird.y,
            width: bird.width,
            height: bird.height,
            rotation: bird.rotation,
            color: birdConfig?.codeRender?.color || bird.color,
            outlineColor: birdConfig?.codeRender?.outlineColor || '#DAA520',
            eyeColor: birdConfig?.codeRender?.eyeColor || 'white',
            pupilColor: birdConfig?.codeRender?.pupilColor || 'black',
            beakColor: birdConfig?.codeRender?.beakColor || '#FFA500'
        };
    }

    // 获取背景渲染数据
    getBackgroundRenderData() {
        const bgConfig = this.config.game?.background;
        
        if (bgConfig?.useImage && this.config.global?.useImages) {
            const skyImage = this.loader.getImage(bgConfig.sky?.imagePath);
            const groundImage = this.loader.getImage(bgConfig.ground?.imagePath);
            
            return {
                type: 'image',
                sky: {
                    image: skyImage,
                    fallbackColor: bgConfig.sky?.color || '#70c5ce'
                },
                ground: {
                    image: groundImage,
                    fallbackColor: bgConfig.ground?.color || '#DED895',
                    height: bgConfig.ground?.height || 50
                }
            };
        }

        // 回退到代码绘制
        return {
            type: 'code',
            skyColor: bgConfig?.sky?.color || '#70c5ce',
            groundColor: bgConfig?.ground?.color || '#DED895',
            groundHeight: bgConfig?.ground?.height || 50
        };
    }

    // 获取管道渲染数据
    getPipeRenderData() {
        const pipeConfig = this.config.game?.pipes;
        
        if (pipeConfig?.useImage && this.config.global?.useImages) {
            const topImage = this.loader.getImage(pipeConfig.topPipe);
            const bottomImage = this.loader.getImage(pipeConfig.bottomPipe);
            
            if (topImage && bottomImage) {
                return {
                    type: 'image',
                    topImage: topImage,
                    bottomImage: bottomImage,
                    width: pipeConfig.width || 52
                };
            }
        }

        // 回退到代码绘制
        return {
            type: 'code',
            color: pipeConfig?.codeRender?.color || '#228B22',
            outlineColor: pipeConfig?.codeRender?.outlineColor || '#006400',
            capColor: pipeConfig?.codeRender?.capColor || '#32CD32',
            width: pipeConfig?.width || 52
        };
    }

    // 切换资源模式
    toggleImageMode(useImages = null) {
        if (useImages === null) {
            this.config.global.useImages = !this.config.global.useImages;
        } else {
            this.config.global.useImages = useImages;
        }

        console.log(`Asset mode switched to: ${this.config.global.useImages ? 'Images' : 'Code Rendering'}`);
        
        // 触发重新渲染
        if (typeof window.gameLoop !== 'undefined') {
            window.gameLoop.forceRender();
        }
    }

    // 切换小鸟图片模式
    toggleBirdImages(enabled = null) {
        if (!this.config.game) this.config.game = {};
        if (!this.config.game.bird) this.config.game.bird = {};
        
        if (enabled === null) {
            this.config.game.bird.useImage = !this.config.game.bird.useImage;
        } else {
            this.config.game.bird.useImage = enabled;
        }

        console.log(`Bird images: ${this.config.game.bird.useImage ? 'Enabled' : 'Disabled'}`);
    }

    // 切换背景图片模式
    toggleBackgroundImages(enabled = null) {
        if (!this.config.game) this.config.game = {};
        if (!this.config.game.background) this.config.game.background = {};
        
        if (enabled === null) {
            this.config.game.background.useImage = !this.config.game.background.useImage;
        } else {
            this.config.game.background.useImage = enabled;
        }

        console.log(`Background images: ${this.config.game.background.useImage ? 'Enabled' : 'Disabled'}`);
    }

    // 获取资源状态
    getStatus() {
        return {
            globalImageMode: this.config.global?.useImages || false,
            birdImages: this.config.game?.bird?.useImage || false,
            backgroundImages: this.config.game?.background?.useImage || false,
            pipeImages: this.config.game?.pipes?.useImage || false,
            websiteImages: this.config.website?.decorativeBirds?.useImage || false,
            loadedImages: this.loader.loadedImages.size,
            initialized: this.initialized
        };
    }

    // 预加载指定资源
    async preloadAssets(assetPaths) {
        const promises = assetPaths.map(path => this.loader.loadImage(path));
        const results = await Promise.allSettled(promises);
        
        const loaded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Preloaded ${loaded} assets, ${failed} failed`);
        return { loaded, failed };
    }

    // 清除缓存
    clearCache() {
        this.loader.loadedImages.clear();
        this.loader.loadingPromises.clear();
        console.log('Asset cache cleared');
    }

    // 获取配置信息
    getConfig() {
        return this.config;
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Asset config updated');
    }
}

// 创建全局资源管理器实例
window.assetManager = new AssetManager();

// 开发者控制台工具
window.AssetTools = {
    // 快速切换模式
    useImages: () => window.assetManager.toggleImageMode(true),
    useCode: () => window.assetManager.toggleImageMode(false),
    
    // 切换特定资源
    toggleBird: () => window.assetManager.toggleBirdImages(),
    toggleBackground: () => window.assetManager.toggleBackgroundImages(),
    
    // 获取状态
    status: () => console.table(window.assetManager.getStatus()),
    
    // 预加载资源
    preload: (paths) => window.assetManager.preloadAssets(paths),
    
    // 清除缓存
    clear: () => window.assetManager.clearCache(),
    
    // 帮助信息
    help: () => {
        console.log(`
🎨 Asset Tools - 资源管理工具

基本命令:
  AssetTools.useImages()     - 启用图片模式
  AssetTools.useCode()       - 启用代码绘制模式
  AssetTools.status()        - 查看当前状态
  AssetTools.help()          - 显示帮助信息

切换特定资源:
  AssetTools.toggleBird()    - 切换小鸟图片
  AssetTools.toggleBackground() - 切换背景图片

管理功能:
  AssetTools.preload(['path1', 'path2']) - 预加载指定资源
  AssetTools.clear()         - 清除资源缓存

使用示例:
  1. AssetTools.useImages()  // 启用图片模式
  2. 将图片文件放入 assets/ 对应目录
  3. 刷新页面查看效果
        `);
    }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.assetManager.init();
});
