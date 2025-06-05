// 啊啊啊啊啊啊啊啊 - 资源配置文件
// 用于管理游戏和官网的所有视觉资源

const AssetConfig = {
    // 全局设置
    global: {
        useImages: false,  // 是否使用图片资源 (false = 使用代码绘制)
        basePath: 'assets/', // 资源基础路径
        fallbackToCode: true, // 图片加载失败时是否回退到代码绘制
    },

    // 游戏资源配置
    game: {
        // 小鸟资源
        bird: {
            useImage: false,
            imagePath: 'images/birds/bird-default.png',
            width: 30,
            height: 20,
            // 动画帧 (如果使用精灵图)
            animation: {
                enabled: false,
                frameCount: 3,
                frameWidth: 30,
                frameHeight: 20,
                frameDuration: 100, // 毫秒
                spritePath: 'sprites/bird-frames/bird-sprite.png'
            },
            // 不同状态的小鸟图片
            states: {
                normal: 'images/birds/bird-default.png',
                flapping: 'images/birds/bird-flap.png',
                falling: 'images/birds/bird-fall.png'
            },
            // 代码绘制配置 (当useImage为false时使用)
            codeRender: {
                color: '#FFD700',
                outlineColor: '#DAA520',
                eyeColor: 'white',
                pupilColor: 'black',
                beakColor: '#FFA500'
            }
        },

        // 背景资源
        background: {
            useImage: false,
            // 天空背景
            sky: {
                imagePath: 'backgrounds/game/sky.jpg',
                color: '#70c5ce' // 代码绘制时的颜色
            },
            // 地面背景
            ground: {
                imagePath: 'backgrounds/game/ground.png',
                color: '#DED895',
                height: 50
            },
            // 云朵装饰
            clouds: {
                useImage: false,
                imagePath: 'backgrounds/game/clouds.png',
                opacity: 0.8
            }
        },

        // 管道资源
        pipes: {
            useImage: false,
            topPipe: 'images/pipes/pipe-top.png',
            bottomPipe: 'images/pipes/pipe-bottom.png',
            width: 52,
            // 代码绘制配置
            codeRender: {
                color: '#228B22',
                outlineColor: '#006400',
                capColor: '#32CD32'
            }
        },

        // UI元素
        ui: {
            // 按钮
            buttons: {
                useImage: false,
                playButton: 'ui/buttons/play-btn.png',
                pauseButton: 'ui/buttons/pause-btn.png',
                restartButton: 'ui/buttons/restart-btn.png'
            },
            // 分数显示
            score: {
                useImage: false,
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                color: 'white',
                strokeColor: 'black'
            }
        }
    },

    // 官网资源配置
    website: {
        // 装饰小鸟
        decorativeBirds: {
            useImage: false,
            // 浮动装饰小鸟
            floating: {
                red: {
                    imagePath: 'ui/decorations/angry-bird-red.png',
                    size: '64x64'
                },
                yellow: {
                    imagePath: 'ui/decorations/angry-bird-yellow.png',
                    size: '48x48'
                },
                green: {
                    imagePath: 'ui/decorations/angry-bird-green.png',
                    size: '40x40'
                }
            },
            // 主角展示小鸟
            hero: {
                imagePath: 'ui/decorations/hero-bird.png',
                size: '96x96',
                animationEnabled: true
            }
        },

        // 背景图片
        backgrounds: {
            useImage: false,
            // 首页背景
            hero: {
                imagePath: 'backgrounds/website/hero-bg.jpg',
                fallbackGradient: 'linear-gradient(to bottom, #60a5fa, #34d399)'
            },
            // 特色页面背景
            features: {
                imagePath: 'backgrounds/website/features-bg.jpg',
                fallbackGradient: 'linear-gradient(to bottom, #a855f7, #ec4899, #3b82f6)'
            },
            // 玩法页面背景
            gameplay: {
                imagePath: 'backgrounds/website/gameplay-bg.jpg',
                fallbackGradient: 'linear-gradient(to bottom, #10b981, #06b6d4, #3b82f6)'
            }
        },

        // UI图标
        icons: {
            useImage: false,
            // 功能图标
            microphone: 'ui/icons/microphone.png',
            gamepad: 'ui/icons/gamepad.png',
            palette: 'ui/icons/palette.png',
            users: 'ui/icons/users.png'
        }
    },

    // 预加载配置
    preload: {
        enabled: true,
        // 需要预加载的关键资源
        critical: [
            'images/birds/bird-default.png',
            'backgrounds/game/sky.jpg',
            'ui/decorations/hero-bird.png'
        ],
        // 可延迟加载的资源
        deferred: [
            'backgrounds/website/hero-bg.jpg',
            'ui/decorations/angry-bird-red.png',
            'ui/decorations/angry-bird-yellow.png',
            'ui/decorations/angry-bird-green.png'
        ]
    },

    // 性能优化配置
    performance: {
        // 图片压缩质量 (0.1 - 1.0)
        imageQuality: 0.8,
        // 最大文件大小 (KB)
        maxFileSize: 100,
        // 是否启用图片缓存
        enableCache: true,
        // 缓存过期时间 (毫秒)
        cacheExpiry: 24 * 60 * 60 * 1000 // 24小时
    }
};

// 资源加载器
class AssetLoader {
    constructor() {
        this.loadedImages = new Map();
        this.loadingPromises = new Map();
    }

    // 加载单个图片
    async loadImage(path) {
        const fullPath = AssetConfig.global.basePath + path;
        
        if (this.loadedImages.has(fullPath)) {
            return this.loadedImages.get(fullPath);
        }

        if (this.loadingPromises.has(fullPath)) {
            return this.loadingPromises.get(fullPath);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedImages.set(fullPath, img);
                this.loadingPromises.delete(fullPath);
                resolve(img);
            };
            img.onerror = () => {
                this.loadingPromises.delete(fullPath);
                if (AssetConfig.global.fallbackToCode) {
                    console.warn(`Failed to load image: ${fullPath}, falling back to code rendering`);
                    resolve(null);
                } else {
                    reject(new Error(`Failed to load image: ${fullPath}`));
                }
            };
            img.src = fullPath;
        });

        this.loadingPromises.set(fullPath, promise);
        return promise;
    }

    // 预加载关键资源
    async preloadCritical() {
        if (!AssetConfig.preload.enabled) return;

        const promises = AssetConfig.preload.critical.map(path => 
            this.loadImage(path).catch(err => console.warn('Preload failed:', path, err))
        );

        await Promise.all(promises);
        console.log('Critical assets preloaded');
    }

    // 获取已加载的图片
    getImage(path) {
        const fullPath = AssetConfig.global.basePath + path;
        return this.loadedImages.get(fullPath) || null;
    }
}

// 全局资源加载器实例
window.assetLoader = new AssetLoader();

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetConfig;
} else {
    window.AssetConfig = AssetConfig;
}
