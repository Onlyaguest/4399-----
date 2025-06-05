// 咖啡大师 - 游戏脚本

// 游戏配置
const gameConfig = {
    idiotMode: {
        name: "白痴模式",
        gameDuration: 180, // 3分钟游戏时长
        customerInterval: [8, 15], // 顾客出现间隔（秒）
        maxCustomers: 3, // 最大同时顾客数
        patience: [60, 90], // 顾客耐心范围（秒）
        orderComplexity: 1, // 订单复杂度（1-3）
        tipMultiplier: 1.5, // 小费倍率
        startingCoins: 500
    },
    hellMode: {
        name: "地狱模式",
        gameDuration: 120, // 2分钟游戏时长
        customerInterval: [3, 8], // 顾客出现间隔（秒）
        maxCustomers: 6, // 最大同时顾客数
        patience: [20, 40], // 顾客耐心范围（秒）
        orderComplexity: 3, // 订单复杂度（1-3）
        tipMultiplier: 1.0, // 小费倍率
        startingCoins: 200
    }
};

// 咖啡配方
const coffeeRecipes = {
    "美式咖啡": ["coffee", "water"],
    "拿铁": ["coffee", "milk"],
    "卡布奇诺": ["coffee", "milk", "milk"],
    "摩卡": ["coffee", "milk", "sugar"],
    "浓缩咖啡": ["coffee", "coffee"],
    "焦糖玛奇朵": ["coffee", "milk", "sugar", "sugar"],
    "冰咖啡": ["coffee", "water", "water"]
};

// 顾客名字
const customerNames = [
    "张先生", "李女士", "王经理", "赵同学", 
    "陈医生", "刘老师", "杨工程师", "黄总监",
    "周设计师", "吴经理", "郑博士", "孙律师"
];

// 游戏状态
let gameState = {
    mode: null,
    timer: 0,
    score: 0,
    reputation: 100,
    customers: [],
    currentOrder: null,
    currentIngredients: [],
    gameInterval: null,
    customerInterval: null
};

// DOM 元素
const elements = {
    mainMenu: document.getElementById('main-menu'),
    gameScreen: document.getElementById('game-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    gameMode: document.getElementById('game-mode'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    reputation: document.getElementById('reputation'),
    customerQueue: document.getElementById('customer-queue'),
    orderDisplay: document.getElementById('order-display'),
    progressText: document.getElementById('progress-text'),
    makeCoffeeBtn: document.getElementById('make-coffee'),
    finalScore: document.getElementById('final-score')
};

// 事件监听器
document.getElementById('start-idiot-mode').addEventListener('click', () => startGame('idiotMode'));
document.getElementById('start-hell-mode').addEventListener('click', () => startGame('hellMode'));
document.getElementById('back-to-menu').addEventListener('click', backToMenu);
document.getElementById('restart-game').addEventListener('click', () => {
    hideElement(elements.gameOverScreen);
    startGame(gameState.mode);
});
document.getElementById('main-menu-from-over').addEventListener('click', () => {
    hideElement(elements.gameOverScreen);
    showElement(elements.mainMenu);
});

// 为所有原料按钮添加事件监听
document.querySelectorAll('.ingredient').forEach(btn => {
    btn.addEventListener('click', () => addIngredient(btn.dataset.ingredient));
});

// 制作咖啡按钮
document.getElementById('make-coffee').addEventListener('click', makeCoffee);

// 游戏初始化
function startGame(mode) {
    gameState = {
        mode: mode,
        timer: gameConfig[mode].gameDuration,
        score: gameConfig[mode].startingCoins,
        reputation: 100,
        customers: [],
        currentOrder: null,
        currentIngredients: [],
        gameInterval: null,
        customerInterval: null
    };
    
    // 更新界面
    elements.gameMode.textContent = gameConfig[mode].name;
    elements.score.textContent = gameState.score;
    elements.reputation.textContent = gameState.reputation;
    updateTimer();
    
    // 清空顾客队列
    elements.customerQueue.innerHTML = '';
    
    // 隐藏主菜单，显示游戏界面
    hideElement(elements.mainMenu);
    showElement(elements.gameScreen);
    
    // 开始游戏循环
    gameState.gameInterval = setInterval(gameLoop, 1000);
    
    // 开始生成顾客
    scheduleNextCustomer();
}

// 游戏主循环
function gameLoop() {
    // 更新计时器
    gameState.timer--;
    updateTimer();
    
    // 更新顾客耐心
    updateCustomers();
    
    // 检查游戏是否结束
    if (gameState.timer <= 0) {
        endGame();
    }
}

// 更新计时器显示
function updateTimer() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 安排下一个顾客到来
function scheduleNextCustomer() {
    const config = gameConfig[gameState.mode];
    const interval = Math.floor(Math.random() * (config.customerInterval[1] - config.customerInterval[0] + 1)) + config.customerInterval[0];
    
    gameState.customerInterval = setTimeout(() => {
        if (gameState.customers.length < config.maxCustomers) {
            addCustomer();
        }
        scheduleNextCustomer();
    }, interval * 1000);
}

// 添加顾客
function addCustomer() {
    const config = gameConfig[gameState.mode];
    
    // 随机选择咖啡类型
    const coffeeTypes = Object.keys(coffeeRecipes);
    let availableCoffees;
    
    if (config.orderComplexity === 1) {
        // 白痴模式只提供简单咖啡
        availableCoffees = coffeeTypes.filter(type => coffeeRecipes[type].length <= 2);
    } else if (config.orderComplexity === 2) {
        // 普通模式提供中等复杂度咖啡
        availableCoffees = coffeeTypes;
    } else {
        // 地狱模式偏向复杂咖啡
        const simpleCoffees = coffeeTypes.filter(type => coffeeRecipes[type].length <= 2);
        const complexCoffees = coffeeTypes.filter(type => coffeeRecipes[type].length > 2);
        availableCoffees = [...simpleCoffees, ...complexCoffees, ...complexCoffees]; // 增加复杂咖啡权重
    }
    
    const coffeeType = availableCoffees[Math.floor(Math.random() * availableCoffees.length)];
    
    // 随机顾客名字
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    
    // 随机耐心值
    const patience = Math.floor(Math.random() * (config.patience[1] - config.patience[0] + 1)) + config.patience[0];
    
    // 创建顾客对象
    const customer = {
        id: Date.now(),
        name: customerName,
        order: coffeeType,
        patience: patience,
        maxPatience: patience,
        tip: Math.floor(10 + (coffeeRecipes[coffeeType].length * 5))
    };
    
    // 添加到顾客列表
    gameState.customers.push(customer);
    
    // 更新界面
    renderCustomers();
}

// 渲染顾客队列
function renderCustomers() {
    elements.customerQueue.innerHTML = '';
    
    if (gameState.customers.length === 0) {
        elements.customerQueue.innerHTML = '<div class="no-customers">没有顾客，请稍等...</div>';
        return;
    }
    
    gameState.customers.forEach(customer => {
        const customerEl = document.createElement('div');
        customerEl.className = 'customer';

        // 检查是否是当前选中的订单
        if (gameState.currentOrder && gameState.currentOrder.id === customer.id) {
            customerEl.classList.add('selected');
        }

        // 检查是否紧急
        if (customer.patience < customer.maxPatience * 0.3) {
            customerEl.classList.add('urgent');
        }

        customerEl.innerHTML = `
            <div class="customer-name">${customer.name}</div>
            <div class="customer-order">订单: ${customer.order}</div>
            <div class="customer-patience" style="width: ${(customer.patience / customer.maxPatience) * 100}%"></div>
        `;

        customerEl.addEventListener('click', () => selectOrder(customer));

        elements.customerQueue.appendChild(customerEl);
    });
}

// 更新顾客状态
function updateCustomers() {
    let reputationChange = 0;
    
    gameState.customers = gameState.customers.filter(customer => {
        customer.patience--;
        
        // 顾客耐心耗尽
        if (customer.patience <= 0) {
            reputationChange -= 5;
            return false;
        }
        
        return true;
    });
    
    // 更新声誉值
    if (reputationChange !== 0) {
        gameState.reputation = Math.max(0, Math.min(100, gameState.reputation + reputationChange));
        elements.reputation.textContent = gameState.reputation;
    }
    
    // 重新渲染顾客
    renderCustomers();
}

// 选择订单
function selectOrder(customer) {
    gameState.currentOrder = customer;
    gameState.currentIngredients = [];
    elements.orderDisplay.textContent = `当前订单: ${customer.name} 的 ${customer.order}`;
    elements.progressText.textContent = '准备中 (0%)';
    elements.makeCoffeeBtn.disabled = true;

    // 重置原材料视觉状态
    updateIngredientVisuals();

    // 重新渲染顾客队列以更新选中状态
    renderCustomers();
}

// 更新原材料按钮的视觉状态
function updateIngredientVisuals() {
    // 统计每种原材料的数量
    const ingredientCounts = {};
    gameState.currentIngredients.forEach(ingredient => {
        ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + 1;
    });

    // 更新每个按钮的状态
    document.querySelectorAll('.ingredient').forEach(btn => {
        const ingredient = btn.dataset.ingredient;
        const count = ingredientCounts[ingredient] || 0;

        // 移除所有状态类
        btn.classList.remove('selected', 'selected-multiple');
        btn.removeAttribute('data-count');

        if (count > 0) {
            if (count === 1) {
                btn.classList.add('selected');
            } else {
                btn.classList.add('selected-multiple');
                btn.setAttribute('data-count', count);
            }
        }
    });
}

// 添加原料
function addIngredient(ingredient) {
    if (!gameState.currentOrder) {
        showNotification('请先选择一个订单！', 'warning');
        return;
    }

    gameState.currentIngredients.push(ingredient);

    // 更新视觉状态
    updateIngredientVisuals();

    // 更新进度显示
    const recipe = coffeeRecipes[gameState.currentOrder.order];
    const progress = Math.min(100, Math.floor((gameState.currentIngredients.length / recipe.length) * 100));
    elements.progressText.textContent = `准备中 (${progress}%)`;

    // 检查是否可以制作咖啡
    if (gameState.currentIngredients.length >= recipe.length) {
        elements.makeCoffeeBtn.disabled = false;
    }
}

// 制作咖啡
function makeCoffee() {
    if (!gameState.currentOrder) {
        return;
    }
    
    const recipe = coffeeRecipes[gameState.currentOrder.order];
    const currentRecipe = [...gameState.currentIngredients];
    
    // 检查配方是否正确
    let isCorrect = true;
    
    // 检查长度
    if (recipe.length !== currentRecipe.length) {
        isCorrect = false;
    } else {
        // 检查每种原料数量是否匹配
        const recipeCount = {};
        const currentCount = {};
        
        recipe.forEach(ing => {
            recipeCount[ing] = (recipeCount[ing] || 0) + 1;
        });
        
        currentRecipe.forEach(ing => {
            currentCount[ing] = (currentCount[ing] || 0) + 1;
        });
        
        for (const ing in recipeCount) {
            if (recipeCount[ing] !== currentCount[ing]) {
                isCorrect = false;
                break;
            }
        }
    }
    
    // 处理结果
    if (isCorrect) {
        // 计算小费
        const tip = Math.floor(gameState.currentOrder.tip * gameConfig[gameState.mode].tipMultiplier);
        
        // 更新分数
        gameState.score += tip;
        elements.score.textContent = gameState.score;
        
        // 更新声誉
        gameState.reputation = Math.min(100, gameState.reputation + 1);
        elements.reputation.textContent = gameState.reputation;
        
        // 显示成功通知
        showNotification(`成功完成订单！获得 ${tip} 金币`, 'success');
        
        // 从顾客队列中移除
        gameState.customers = gameState.customers.filter(c => c.id !== gameState.currentOrder.id);
        renderCustomers();
    } else {
        // 扣除分数
        gameState.score = Math.max(0, gameState.score - 10);
        elements.score.textContent = gameState.score;
        
        // 更新声誉
        gameState.reputation = Math.max(0, gameState.reputation - 2);
        elements.reputation.textContent = gameState.reputation;
        
        // 显示失败通知
        showNotification('配方错误！扣除 10 金币', 'error');
    }
    
    // 重置当前订单
    gameState.currentOrder = null;
    gameState.currentIngredients = [];
    elements.orderDisplay.textContent = '当前订单: 无';
    elements.progressText.textContent = '空闲';
    elements.makeCoffeeBtn.disabled = true;

    // 重置原材料视觉状态
    updateIngredientVisuals();

    // 重新渲染顾客队列以清除选中状态
    renderCustomers();
}

// 显示通知
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 结束游戏
function endGame() {
    // 清除所有定时器
    clearInterval(gameState.gameInterval);
    clearTimeout(gameState.customerInterval);
    
    // 显示最终得分
    elements.finalScore.textContent = gameState.score;
    
    // 隐藏游戏界面，显示结束界面
    hideElement(elements.gameScreen);
    showElement(elements.gameOverScreen);
}

// 返回主菜单
function backToMenu() {
    // 清除所有定时器
    clearInterval(gameState.gameInterval);
    clearTimeout(gameState.customerInterval);
    
    // 隐藏游戏界面，显示主菜单
    hideElement(elements.gameScreen);
    showElement(elements.mainMenu);
}

// 辅助函数：隐藏元素
function hideElement(element) {
    element.classList.add('hidden');
}

// 辅助函数：显示元素
function showElement(element) {
    element.classList.remove('hidden');
}

// 添加通知样式
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    padding: 10px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.notification.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}

.notification.success {
    background-color: var(--green);
}

.notification.error {
    background-color: var(--red);
}

.notification.warning {
    background-color: var(--orange);
}
`;
document.head.appendChild(style);
