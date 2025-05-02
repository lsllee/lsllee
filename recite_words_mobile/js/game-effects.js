// 创建气泡爆破效果
function createBubbleExplosion(bubble) {
    // 获取泡泡位置和尺寸
    const rect = bubble.getBoundingClientRect();
    const bubbleWidth = rect.width;
    const bubbleHeight = rect.height;
    
    // 获取泡泡的背景颜色
    const bubbleColor = window.getComputedStyle(bubble).backgroundColor;
    
    // 泡泡中心坐标（相对于视口）
    const centerX = rect.left + bubbleWidth / 2;
    const centerY = rect.top + bubbleHeight / 2;
    
    // 立即播放爆炸音效，不使用setTimeout延迟
    playSound('explosion');
    
    // 立即隐藏原始气泡，防止闪现
    bubble.style.opacity = '0';
    bubble.style.visibility = 'hidden';
    
    // 创建扩散波效果
    const shockwave = document.createElement('div');
    shockwave.style.position = 'absolute';
    shockwave.style.left = `${centerX}px`;
    shockwave.style.top = `${centerY}px`;
    shockwave.style.width = '10px';
    shockwave.style.height = '10px';
    shockwave.style.borderRadius = '50%';
    shockwave.style.backgroundColor = 'transparent';
    shockwave.style.border = `3px solid ${bubbleColor}`;
    shockwave.style.transform = 'translate(-50%, -50%)';
    shockwave.style.zIndex = '99';
    shockwave.style.boxShadow = `0 0 15px ${bubbleColor}, 0 0 5px white`;
    shockwave.style.animation = 'shockwave 0.6s ease-out forwards';
    document.body.appendChild(shockwave);
    
    // 添加扩散波动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shockwave {
            0% { width: 10px; height: 10px; opacity: 1; border-width: 3px; }
            100% { width: ${Math.max(bubbleWidth, bubbleHeight) * 1.8}px; height: ${Math.max(bubbleWidth, bubbleHeight) * 1.8}px; opacity: 0; border-width: 1px; }
        }
    `;
    document.head.appendChild(style);
    
    // 定时删除扩散波
    setTimeout(() => {
        shockwave.remove();
        style.remove();
    }, 600);
    
    // 气泡颜色和彩色粒子
    const colors = [
        '#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1', 
        '#00d2d3', '#54a0ff', '#5f27cd', '#ff9f43', '#c8d6e5'
    ];
    
    // 提取气泡颜色的rgb值，用于粒子颜色
    let bubbleRgb = bubbleColor;
    if (bubbleColor.startsWith('rgb')) {
        bubbleRgb = bubbleColor.match(/\d+/g).slice(0, 3).join(',');
    }
    
    // 创建爆炸粒子
    const particleCount = 80; // 增加粒子数量
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 使用气泡颜色和彩色混合
        if (i % 3 === 0) {
            // 使用气泡原始颜色
            particle.style.backgroundColor = bubbleColor;
        } else {
            // 使用彩色
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }
        
        // 计算泡泡表面的随机点作为粒子起始位置
        const angle = Math.random() * Math.PI * 2; // 0-2π的随机角度
        
        // 为椭圆形气泡调整边缘计算
        let radius;
        if (bubble.classList.contains('long-word')) {
            // 对于椭圆形，考虑不同方向的半径
            const a = bubbleWidth / 2; // 椭圆长轴
            const b = bubbleHeight / 2; // 椭圆短轴
            // 椭圆方程计算半径
            radius = (a * b) / Math.sqrt(b * b * Math.cos(angle) * Math.cos(angle) + a * a * Math.sin(angle) * Math.sin(angle));
            radius *= 0.98; // 确保在表面
        } else {
            // 圆形气泡
            radius = Math.max(bubbleWidth, bubbleHeight) / 2 * 0.98; // 确保在表面
        }
        
        // 初始位置：泡泡边缘
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        // 计算爆炸方向和距离，从泡泡边缘向外发散
        const distance = Math.random() * 150 + 100; // 100-250像素的随机距离
        
        // 计算目标位置的x和y偏移量，从边缘继续向外
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // 设置CSS变量用于动画
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        
        // 随机大小，边缘粒子小，中间粒子大
        const size = Math.random() * 15 + 6; // 6-21像素
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 设置动画
        particle.style.animation = `explode ${Math.random() * 0.8 + 0.7}s cubic-bezier(0.165, 0.84, 0.44, 1) forwards`;
        
        // 添加到文档
        document.body.appendChild(particle);
        
        // 动画结束后删除粒子
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
}

// 创建游戏完成后的庆祝特效
function createConfetti() {
    const colors = ['#ff6b6b', '#48dbfb', '#feca57', '#1dd1a1', '#54a0ff', '#ff9ff3'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.setProperty('--color', color);
        
        // 随机位置和大小
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        
        // 随机延迟
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        
        // 随机形状
        const shapeType = Math.floor(Math.random() * 3);
        if (shapeType === 0) {
            confetti.style.borderRadius = '50%'; // 圆形
        } else if (shapeType === 1) {
            confetti.style.borderRadius = '0'; // 方形
        } else {
            confetti.style.width = '8px';
            confetti.style.height = '15px';
            confetti.style.borderRadius = '2px'; // 长条形
        }
        
        document.body.appendChild(confetti);
        
        // 动画结束后移除元素
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// 显示奖励文本
function showRewardText(text) {
    const rewardDiv = document.createElement('div');
    rewardDiv.className = 'reward-text';
    rewardDiv.textContent = text;
    
    // 添加到气泡容器中
    const bubbleContainer = document.getElementById('bubble-container');
    if (bubbleContainer) {
        bubbleContainer.appendChild(rewardDiv);
    }
    
    // 播放语音
    speak(text);
    
    // 动画结束后移除元素
    setTimeout(() => {
        rewardDiv.remove();
    }, 2500);
}

// 生成并管理电花效果
function updateSparkleEffect() {
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    const progressBar = document.querySelector('.progress-bar');
    
    // 确保容器存在
    let sparkleContainer = document.querySelector('.sparkle-container');
    if (!sparkleContainer) {
        sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'sparkle-container';
        progressBar.appendChild(sparkleContainer);
    }
    
    // 定位到进度条右侧
    sparkleContainer.style.right = '0';
    
    // 确保有核心发光效果
    let coreGlow = sparkleContainer.querySelector('.core-glow');
    if (!coreGlow) {
        coreGlow = document.createElement('div');
        coreGlow.className = 'core-glow';
        sparkleContainer.appendChild(coreGlow);
    }
    
    // 移动设备上减少火花粒子
    if (!isMobile || Math.random() > 0.5) {
        // 创建新火花
        createSparkles(sparkleContainer);
    }
    
    // 清理旧火花
    cleanupSparkles();
}

// 创建火花粒子
function createSparkles(container) {
    // 每次创建2-4个火花
    const particleCount = Math.floor(Math.random() * 3) + 2;
    
    // 火花颜色列表
    const colors = [
        '#fff', // 白色
        '#44bd32', // 绿色
        '#e1b12c', // 金黄色
        '#7bed9f', // 浅绿色
        '#2ed573' // 翠绿色
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // 随机位置（相对于容器中心）
        const posX = 10 + (Math.random() * 10) - 5; // 中心±5px
        
        // 设置初始位置（从中心向各方向发散）
        sparkle.style.left = `${posX}px`;
        sparkle.style.bottom = '0';
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.backgroundColor = color;
        
        // 随机大小
        const size = Math.random() * 3 + 2; // 2-5px
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // 添加发光效果
        sparkle.style.boxShadow = `0 0 ${Math.floor(size*2)}px ${color}`;
        
        // 设置创建时间戳
        sparkle.dataset.created = Date.now();
        
        // 添加到容器
        container.appendChild(sparkle);
        
        // 应用动画
        animateSparkle(sparkle);
    }
}

// 为火花添加动画
function animateSparkle(sparkle) {
    // 随机动画参数
    const angle = (Math.random() * 160 - 80) * (Math.PI / 180); // -80到80度
    const distance = Math.random() * 30 + 15; // 15-45px
    const duration = Math.random() * 0.8 + 0.5; // 0.5-1.3秒
    
    // 计算终点位置
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;
    
    // 使用Web Animation API创建动画
    sparkle.animate([
        { transform: 'translate(0, 0)', opacity: 0 }, // 开始
        { transform: 'translate(0, 0)', opacity: 1, offset: 0.1 }, // 快速淡入
        { transform: `translate(${endX}px, ${endY}px)`, opacity: 0 } // 淡出
    ], {
        duration: duration * 1000,
        easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)', // 先快后慢
        fill: 'forwards'
    });
}

// 清理旧火花
function cleanupSparkles() {
    const sparkles = document.querySelectorAll('.sparkle');
    const now = Date.now();
    const maxLifetime = 1500; // 最长1.5秒
    
    sparkles.forEach(sparkle => {
        const created = parseInt(sparkle.dataset.created || '0');
        if (now - created > maxLifetime) {
            sparkle.remove();
        }
    });
}

// 清除所有火花
function clearAllSparkles() {
    const container = document.querySelector('.sparkle-container');
    if (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
}

// 持续创建进度条效果粒子
function createContinuousEffectParticles() {
    const effectContainer = document.querySelector('.progress-effect-container');
    if (!effectContainer) return;

    // 每次更新创建 1-2 个粒子
    const particleCount = Math.floor(Math.random() * 2) + 1;
    const particleColors = ['#fdcb6e', '#ffbe76', '#ffdd59', '#fffa65', '#fff200'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'effect-particle';

        // 初始位置在效果容器的顶部中心
        particle.style.position = 'absolute';
        particle.style.left = '50%';
        particle.style.top = '0'; // 相对于效果容器顶部
        particle.style.transform = 'translateX(-50%)';
        particle.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
        particle.dataset.startTime = Date.now(); // 记录创建时间

        // 随机动画参数
        const angle = (Math.random() * 160 - 80) * (Math.PI / 180); // 更宽的角度范围 (-80到80度)
        const distance = Math.random() * 25 + 10; // 10-35px距离
        const duration = Math.random() * 0.5 + 0.3; // 0.3-0.8秒
        const endX = Math.sin(angle) * distance;
        const endY = -Math.cos(angle) * distance - 5; // 主要向上移动
        const finalScale = Math.random() * 0.5 + 0.2; // 结束时缩小

        // 应用动画
        particle.animate([
            { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${endX}px), ${endY}px) scale(${finalScale})`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'ease-out',
            fill: 'forwards'
        });

        effectContainer.appendChild(particle);
    }
}

// 清理过期的效果粒子
function cleanupEffectParticles(forceClear = false) {
    const effectContainer = document.querySelector('.progress-effect-container');
    if (!effectContainer) return;

    const particles = effectContainer.querySelectorAll('.effect-particle');
    const now = Date.now();
    const maxLifetime = 800; // 粒子最大存活时间 (毫秒)

    particles.forEach(particle => {
        const startTime = parseInt(particle.dataset.startTime || '0');
        if (forceClear || (startTime && now - startTime > maxLifetime)) {
            particle.remove();
        }
    });
} 