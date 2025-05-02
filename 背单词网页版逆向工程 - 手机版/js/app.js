// DOM 元素
const meaningContainer = document.getElementById('current-meaning');
const bubbleContainer = document.getElementById('bubble-container');
const accuracyDisplay = document.getElementById('accuracy');
const resetButton = document.getElementById('reset');
const startButton = document.getElementById('start-game');
const importButton = document.getElementById('import-words');
const fileInput = document.getElementById('file-input');
const exportButton = document.getElementById('export-report');
const charactersContainer = document.querySelector('.characters');
const progressText = document.getElementById('progress-text');
const progressBar = document.querySelector('.progress-bar');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const pronunciationButton = document.getElementById('pronunciation-btn');
const hintButton = document.getElementById('hint-btn');
const tooltip = document.getElementById('tooltip');

// 检测是否为移动设备
const isMobile = window.innerWidth <= 768;

// 添加迪士尼角色图片，移动设备上显示更少
const characterImages = [
    'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png', // Mickey
    'https://upload.wikimedia.org/wikipedia/en/1/19/Minnie_Mouse.png', // Minnie
    'https://upload.wikimedia.org/wikipedia/en/a/a5/Donald_Duck_angry.png' // Donald
];

// 只在非移动设备上添加更多角色
if (!isMobile) {
    characterImages.push(
        'https://upload.wikimedia.org/wikipedia/en/9/9e/DaisyDuck.png', // Daisy
        'https://upload.wikimedia.org/wikipedia/en/5/50/Goofy_Dingo.png'  // Goofy
    );
}

characterImages.forEach((imgUrl, index) => {
    const charDiv = document.createElement('div');
    charDiv.className = 'character';
    charDiv.style.left = `${(index * (isMobile ? 30 : 20))}%`; // 移动设备上间距更大
    charDiv.style.animationDelay = `${index * 0.5}s`;
    charDiv.style.backgroundImage = `url('${imgUrl}')`;
    charDiv.style.backgroundSize = 'contain';
    charDiv.style.backgroundRepeat = 'no-repeat';
    charactersContainer.appendChild(charDiv);
});

// 选择难度
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        setDifficulty(button.dataset.difficulty);
        
        if (gameStarted) {
            startNewGame();
        }
    });
});

// 为提示按钮添加事件
hintButton.addEventListener('click', () => {
    if (gameStarted && currentWordIndex < wordsList.length) {
        hintsUsed++;
        
        // 高亮显示当前单词的气泡
        const currentWord = wordsList[currentWordIndex].word;
        let hintFound = false;
        
        activeBubbles.forEach(bubble => {
            if (bubble.dataset.word === currentWord) {
                // 应用高亮效果
                const originalColor = bubble.style.backgroundColor;
                bubble.style.animation = 'none';
                bubble.style.backgroundColor = '#55efc4';
                bubble.style.boxShadow = '0 0 15px #55efc4, 0 0 30px #55efc4';
                
                // 3秒后恢复
                setTimeout(() => {
                    bubble.style.backgroundColor = originalColor;
                    bubble.style.boxShadow = '';
                    bubble.style.animation = 'float 3s ease-in-out infinite';
                    bubble.style.animationDelay = `${Math.random() * 3}s`;
                }, 3000);
                
                hintFound = true;
            }
        });
        
        if (hintFound) {
            // 播放提示音效
            playSound('nice');
        }
    }
});

// 词汇发音功能
pronunciationButton.addEventListener('click', () => {
    if (currentWordIndex < wordsList.length) {
        speak(wordsList[currentWordIndex].word);
    }
});

// 开始游戏
startButton.addEventListener('click', startNewGame);

// 重置游戏
resetButton.addEventListener('click', startNewGame);

// 导入单词
importButton.addEventListener('click', showImportModal);

// 文件输入处理
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleFileImport(file);
    }
});

// 导出报告
exportButton.addEventListener('click', () => {
    const reportContent = exportLearningReport();
    
    // 创建并下载报告文件
    const today = new Date();
    const date = today.toLocaleDateString('zh-CN').replace(/\//g, '-');
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `单词学习报告_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 添加工具提示 - 移动设备上使用触摸开始/结束事件
if (isMobile) {
    // 移动设备上使用触摸事件
    document.querySelectorAll('.btn, .bubble, .pronunciation-btn').forEach(element => {
        element.addEventListener('touchstart', event => {
            element.classList.add('active');
        });
        
        element.addEventListener('touchend', event => {
            element.classList.remove('active');
        });
    });
} else {
    // 桌面设备上使用鼠标悬停事件
    document.querySelectorAll('.btn, .bubble, .pronunciation-btn').forEach(element => {
        element.addEventListener('mouseenter', event => {
            let tooltipText = '';
            
            if (event.target.id === 'start-game') {
                tooltipText = '开始新游戏';
            } else if (event.target.id === 'import-words') {
                tooltipText = '导入单词列表';
            } else if (event.target.id === 'export-report') {
                tooltipText = '导出学习报告';
            } else if (event.target.id === 'reset') {
                tooltipText = '重置游戏';
            } else if (event.target.id === 'pronunciation-btn') {
                tooltipText = '听单词发音';
            } else if (event.target.id === 'hint-btn') {
                tooltipText = '获取提示';
            } else if (event.target.classList.contains('bubble')) {
                tooltipText = event.target.textContent;
            }
            
            if (tooltipText) {
                tooltip.textContent = tooltipText;
                tooltip.style.left = `${event.clientX + 10}px`;
                tooltip.style.top = `${event.clientY + 10}px`;
                tooltip.style.opacity = '1';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
    // 更新是否为移动设备
    const wasMobile = isMobile;
    const isMobileNow = window.innerWidth <= 768;
    
    // 如果设备类型改变，重新创建气泡
    if (wasMobile !== isMobileNow && gameStarted) {
        setTimeout(() => {
            createBubbles();
        }, 300);
    }
});

// 初始化
window.addEventListener('load', () => {
    // 预初始化音频系统
    initAudio();
    
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 游戏开始前只显示指引消息
    meaningContainer.textContent = "点击\"开始游戏\"按钮开始游戏";
    // 初始隐藏发音按钮
    pronunciationButton.style.display = 'none';
    updateProgress();
    // 初始显示占位符
    createBubbles();
    
    // 检测是否存在sounds目录
    console.log("检查音效文件夹是否存在，若不存在则使用内置音效");
    
    // 移动设备优化
    if (isMobile) {
        // 隐藏提示工具
        tooltip.style.display = 'none';
    }
});

// 在用户首次点击页面时，初始化音频（解决部分浏览器需要用户交互才能创建AudioContext的问题）
document.addEventListener('click', function initUserAudio() {
    // 初始化音频系统
    initAudio();
    // 只执行一次，初始化后移除事件监听器
    document.removeEventListener('click', initUserAudio);
}, { once: true }); 