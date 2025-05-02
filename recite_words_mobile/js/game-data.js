// 默认单词列表
let wordsList = [
    { word: "eraser", meaning: "橡皮" },
    { word: "find", meaning: "找到；找回" },
    { word: "ruler", meaning: "直尺" },
    { word: "pen", meaning: "钢笔" },
    { word: "pencil", meaning: "铅笔" },
    { word: "book", meaning: "书；书籍" }
];

// 游戏状态变量
let currentWordIndex = 0;
let totalAttempts = 0;
let correctAttempts = 0;
let wrongWords = [];
let activeBubbles = [];
let bubbleAnimating = false;
let gameStarted = false;
let currentDifficulty = "easy";
let hintsUsed = 0;
let gameStats = {
    gamesPlayed: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    lastPlayDate: null
};

// 连续答对计数和奖励系统
let correctStreak = 0;
const rewardLevels = {
    3: { text: "Nice!", sound: "nice" },
    7: { text: "Great!", sound: "great" },
    11: { text: "Brilliant!", sound: "brilliant" },
    16: { text: "Excellent!", sound: "excellent" },
    20: { text: "Perfect!", sound: "perfect" }
};

// 从本地存储加载游戏数据
function loadFromLocalStorage() {
    try {
        // 加载单词列表
        const savedWordsList = localStorage.getItem('wordsList');
        if (savedWordsList) {
            wordsList = JSON.parse(savedWordsList);
        }
        
        // 加载游戏统计数据
        const savedStats = localStorage.getItem('gameStats');
        if (savedStats) {
            gameStats = JSON.parse(savedStats);
        }
        
        // 加载难度设置
        const savedDifficulty = localStorage.getItem('difficulty');
        if (savedDifficulty) {
            currentDifficulty = savedDifficulty;
            updateDifficultyUI();
        }
        
        console.log('从本地存储加载数据成功');
    } catch (error) {
        console.error('加载本地存储数据失败:', error);
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    try {
        // 保存单词列表
        localStorage.setItem('wordsList', JSON.stringify(wordsList));
        
        // 保存游戏统计数据
        localStorage.setItem('gameStats', JSON.stringify(gameStats));
        
        // 保存难度设置
        localStorage.setItem('difficulty', currentDifficulty);
        
        console.log('保存数据到本地存储成功');
    } catch (error) {
        console.error('保存数据到本地存储失败:', error);
    }
}

// 更新难度UI
function updateDifficultyUI() {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        if (btn.dataset.difficulty === currentDifficulty) {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
}

// 处理单词列表内容
function processWordListContent(content, filePath) {
    try {
        // 单词导入逻辑
        let importedWords = [];
        const lines = content.split('\n');
        
        // 改进的解析逻辑
        lines.forEach(line => {
            if (!line.trim()) return; // 跳过空行
            
            let word = '';
            let meaning = '';
            let phonetic = '';
            let partOfSpeech = '';
            
            // 尝试不同的格式
            
            // 1. 检测制表符格式: "word [phonetic] pos. meaning"
            // 例如: "exchange [ɪksˈtʃendʒ] n. 交换；交流 vt. 交换；交流；交易；兑换"
            if (line.includes('\t')) {
                const parts = line.split('\t');
                word = parts[0].trim();
                
                // 提取剩余部分
                let remainingPart = parts[1] || '';
                
                // 提取音标 [...]
                const phoneticMatch = remainingPart.match(/\[(.*?)\]/);
                if (phoneticMatch) {
                    phonetic = phoneticMatch[0];
                    remainingPart = remainingPart.replace(phoneticMatch[0], '').trim();
                }
                
                // 提取词性 n./vt.等
                const posMatch = remainingPart.match(/^([\w\.\s&]+\.)/);
                if (posMatch) {
                    partOfSpeech = posMatch[0].trim();
                    remainingPart = remainingPart.replace(posMatch[0], '').trim();
                }
                
                meaning = remainingPart.trim();
            }
            // 2. 检测破折号格式: "word - meaning"
            else if (line.includes(' - ')) {
                const parts = line.split(' - ');
                word = parts[0].trim();
                meaning = parts.slice(1).join(' - ').trim();
            }
            // 3. 检测冒号格式: "word: meaning"
            else if (line.includes(':')) {
                const parts = line.split(':');
                word = parts[0].trim();
                meaning = parts.slice(1).join(':').trim();
            }
            // 4. 检测等号格式: "word = meaning"
            else if (line.includes('=')) {
                const parts = line.split('=');
                word = parts[0].trim();
                meaning = parts.slice(1).join('=').trim();
            }
            // 5. 检测空格分隔的中英文: "word 中文解释"
            else {
                const match = line.match(/^([a-zA-Z\s]+)\s+([\u4e00-\u9fa5].*)$/);
                if (match) {
                    word = match[1].trim();
                    meaning = match[2].trim();
                } else {
                    // 如果都不匹配，就把整行当作单词
                    word = line.trim();
                }
            }
            
            // 确保单词和含义有效
            if (word) {
                importedWords.push({
                    word: word,
                    phonetic: phonetic,
                    partOfSpeech: partOfSpeech,
                    meaning: meaning || '(无释义)'
                });
            }
        });
        
        if (importedWords.length > 0) {
            wordsList = importedWords;
            saveToLocalStorage(); // 保存到本地存储
            alert(`成功从文件 "${filePath}" 导入 ${importedWords.length} 个单词！`);
            startNewGame();
            return true;
        } else {
            alert('导入的文件格式不正确或无法识别。请尝试以下格式：\n1. 词典格式："单词 [音标] 词性. 释义"\n2. 制表符分隔格式\n3. 每行格式为"单词 - 意思"');
            return false;
        }
    } catch (error) {
        alert('导入单词时出错：' + error.message);
        console.error('导入单词时出错：', error);
        return false;
    }
}

// 导出学习报告
function exportLearningReport() {
    const today = new Date();
    const date = today.toLocaleDateString('zh-CN');
    
    let reportContent = `单词学习报告\n`;
    reportContent += `=====================================\n`;
    reportContent += `生成日期: ${date}\n\n`;
    
    reportContent += `【本次学习数据】\n`;
    reportContent += `答题总数: ${totalAttempts}\n`;
    reportContent += `正确数量: ${correctAttempts}\n`;
    reportContent += `正确率: ${(totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(1) : 0)}%\n`;
    reportContent += `使用提示次数: ${hintsUsed}\n\n`;
    
    reportContent += `【总体学习数据】\n`;
    reportContent += `游戏次数: ${gameStats.gamesPlayed}\n`;
    reportContent += `总答题数: ${gameStats.totalAttempts}\n`;
    reportContent += `总正确数: ${gameStats.totalCorrect}\n`;
    reportContent += `总体正确率: ${(gameStats.totalAttempts > 0 ? (gameStats.totalCorrect / gameStats.totalAttempts * 100).toFixed(1) : 0)}%\n`;
    reportContent += `上次学习日期: ${gameStats.lastPlayDate ? new Date(gameStats.lastPlayDate).toLocaleDateString('zh-CN') : '无'}\n\n`;
    
    reportContent += `【需要复习的单词】\n`;
    
    if (wrongWords.length > 0) {
        wrongWords.forEach(word => {
            const wordObj = wordsList.find(w => w.word === word);
            if (wordObj) {
                reportContent += `${wordObj.word} - ${wordObj.meaning}\n`;
            }
        });
    } else {
        reportContent += `没有需要复习的单词，太棒了！\n`;
    }
    
    reportContent += `\n=====================================\n`;
    reportContent += `迪士尼风格单词学习游戏 - 祝您学习愉快！`;
    
    return reportContent;
}

// 获取当前难度
function getCurrentDifficulty() {
    return currentDifficulty;
}

// 设置当前难度
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    saveToLocalStorage();
    updateDifficultyUI();
}

// 更新正确率显示
function updateAccuracy() {
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(1) : 0;
    const accuracyDisplay = document.getElementById('accuracy');
    if (accuracyDisplay) {
        accuracyDisplay.textContent = `正确率: ${accuracy}%`;
    }
}

// 生成随机颜色
function getRandomColor() {
    const colors = [
        '#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1', 
        '#00d2d3', '#54a0ff', '#5f27cd', '#ff9f43', '#c8d6e5'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
} 