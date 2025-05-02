// 生成泡泡
function createBubbles() {
    const bubbleContainer = document.getElementById('bubble-container');
    bubbleContainer.innerHTML = '';
    activeBubbles = [];

    if (!gameStarted) {
        // 显示占位文本
        const placeholder = document.createElement('div');
        placeholder.className = 'bubble-placeholder';
        placeholder.textContent = '请先导入单词或点击"开始游戏"按钮开始';
        bubbleContainer.appendChild(placeholder);
        return;
    }

    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768;

    // 基于难度确定显示的单词数量，移动设备上仅调整中高难度的气泡数量
    let numWordsToShow;
    if (isMobile) {
        // 移动设备上简单难度保持原来的5个，仅减少中等和困难难度的数量
        switch (currentDifficulty) {
            case "easy": numWordsToShow = 5; break; // 保持原有数量
            case "medium": numWordsToShow = 6; break;
            case "hard": numWordsToShow = 8; break;
            default: numWordsToShow = 5;
        }
    } else {
        // 桌面设备保持原样
        switch (currentDifficulty) {
            case "easy": numWordsToShow = 5; break;
            case "medium": numWordsToShow = 8; break;
            case "hard": numWordsToShow = 12; break;
            default: numWordsToShow = 5;
        }
    }

    // 确保不超过实际单词数量
    numWordsToShow = Math.min(numWordsToShow, wordsList.length);
    
    // 获取当前单词和一些随机单词
    const currentWord = wordsList[currentWordIndex];
    
    // 从除当前单词外的单词列表中随机选择单词
    const otherWords = wordsList
        .filter((_, index) => index !== currentWordIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, numWordsToShow - 1);
    
    // 合并当前单词和其他随机单词，然后打乱顺序
    const wordsToShow = [currentWord, ...otherWords].sort(() => Math.random() - 0.5);
    
    // 创建一个临时数组，用于存储每个气泡及其单词显示区域
    const bubbleInfoArray = [];
    
    wordsToShow.forEach((wordObj, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 判断是否是长单词，超过8个字母的使用椭圆形
        const isLongWord = wordObj.word.length > 8;
        if (isLongWord) {
            bubble.classList.add('long-word');
        }
        
        // 计算单个字母的平均宽度（像素）- 假设一个字母平均约14px
        const letterWidth = 14;
        
        // 根据单词长度调整泡泡大小
        let size, width, height;
        const letterCount = wordObj.word.length;
        
        if (isLongWord) {
            // 椭圆形气泡，宽度根据字母数调整，两侧各留一个字母宽度
            if (isMobile) {
                // 计算长单词所需宽度：字母数 * 字母宽度 + 两端各留一个字母宽度
                width = letterCount * letterWidth + 2 * letterWidth;
                height = 70; // 降低高度使气泡更小
            } else {
                width = letterCount * letterWidth + 2 * letterWidth;
                height = 100;
            }
        } else {
            // 计算圆形气泡所需尺寸：字母数 * 字母宽度 + 两侧各留一个字母空间
            const bubbleSize = letterCount * letterWidth + 2 * letterWidth;
            
            // 根据难度适当调整尺寸
            let sizeAdjustment;
            if (isMobile) {
                // 移动设备上的尺寸
                switch (currentDifficulty) {
                    case "easy": 
                        sizeAdjustment = 10;
                        break;
                    case "medium": 
                        sizeAdjustment = 0;
                        break;
                    case "hard": 
                        sizeAdjustment = -10;
                        break;
                    default: 
                        sizeAdjustment = 0;
                }
            } else {
                // 桌面设备上的尺寸调整
                switch (currentDifficulty) {
                    case "easy": 
                        sizeAdjustment = 20;
                        break;
                    case "medium": 
                        sizeAdjustment = 0;
                        break;
                    case "hard": 
                        sizeAdjustment = -20;
                        break;
                    default: 
                        sizeAdjustment = 0;
                }
            }
            
            // 根据单词长度和难度确定最终尺寸
            size = bubbleSize + sizeAdjustment;
            width = size;
            height = size;
        }
        
        bubble.style.width = `${width}px`;
        bubble.style.height = `${height}px`;
        
        // 确保字体大小最小28px，基于单词长度适当调整
        const fontSize = isLongWord ? 
            Math.max(28, 40 - letterCount * 0.5) : // 长单词字体
            Math.max(28, 45 - letterCount); // 短单词字体
            
        bubble.style.fontSize = `${fontSize}px`;
        bubble.style.fontWeight = 'bold';
        
        // 计算单词实际占用空间区域
        // 圆形气泡中单词区域约为气泡直径的70%
        // 椭圆形气泡中单词区域约为气泡宽度的85%
        const wordWidth = isLongWord ? width * 0.85 : width * 0.7;
        const wordHeight = isLongWord ? height * 0.7 : height * 0.7;
        
        // 随机背景色
        bubble.style.backgroundColor = getRandomColor();
        
        // 随机动画延迟，使泡泡浮动看起来更自然
        bubble.style.animationDelay = `${Math.random() * 3}s`;
        
        bubble.textContent = wordObj.word;
        bubble.dataset.word = wordObj.word;
        
        bubble.addEventListener('click', handleBubbleClick);
        
        // 设置基本z-index
        bubble.style.zIndex = '1';
        bubble.style.opacity = '1';
        
        // 将气泡信息存储到临时数组，稍后再放置到容器中
        bubbleInfoArray.push({
            bubble: bubble,
            width: width,
            height: height,
            wordWidth: wordWidth,
            wordHeight: wordHeight,
            isLongWord: isLongWord
        });
    });
    
    // 随机位置 (确保不超出容器边界且单词区域不重叠)
    const containerWidth = bubbleContainer.clientWidth;
    const containerHeight = bubbleContainer.clientHeight;
    
    // 安全尝试次数限制
    const maxAttempts = 100;
    
    // 尝试为每个气泡找到合适的位置
    bubbleInfoArray.forEach(bubbleInfo => {
        const { bubble, width, height, wordWidth, wordHeight, isLongWord } = bubbleInfo;
        
        const maxX = containerWidth - width;
        const maxY = containerHeight - height;
        let posX, posY;
        let attempts = 0;
        let positionFound = false;
        
        // 设置最大允许重叠宽度为15px
        const maxAllowedOverlap = 15;
        
        // 循环尝试找到合适位置
        while (!positionFound && attempts < maxAttempts) {
            posX = Math.random() * maxX;
            posY = Math.random() * maxY;
            positionFound = true;
            
            // 计算当前气泡单词区域的中心点
            const centerX = posX + width / 2;
            const centerY = posY + height / 2;
            
            // 计算当前气泡单词区域的边界
            const wordLeft = centerX - wordWidth / 2;
            const wordRight = centerX + wordWidth / 2;
            const wordTop = centerY - wordHeight / 2;
            const wordBottom = centerY + wordHeight / 2;
            
            // 检查与已放置气泡的单词区域是否重叠
            for (const existingBubble of activeBubbles) {
                const existingX = parseFloat(existingBubble.style.left);
                const existingY = parseFloat(existingBubble.style.top);
                const existingWidth = parseFloat(existingBubble.style.width);
                const existingHeight = parseFloat(existingBubble.style.height);
                
                // 计算已存在气泡的中心点
                const existingCenterX = existingX + existingWidth / 2;
                const existingCenterY = existingY + existingHeight / 2;
                
                // 判断已存在气泡是否为长单词
                const existingIsLong = existingBubble.classList.contains('long-word');
                
                // 计算已存在气泡的单词区域
                const existingWordWidth = existingIsLong ? existingWidth * 0.85 : existingWidth * 0.7;
                const existingWordHeight = existingIsLong ? existingHeight * 0.7 : existingHeight * 0.7;
                
                // 计算已存在气泡单词区域的边界
                const existingWordLeft = existingCenterX - existingWordWidth / 2;
                const existingWordRight = existingCenterX + existingWordWidth / 2;
                const existingWordTop = existingCenterY - existingWordHeight / 2;
                const existingWordBottom = existingCenterY + existingWordHeight / 2;
                
                // 计算两个单词区域的重叠宽度
                const overlapX = Math.max(0, Math.min(wordRight, existingWordRight) - Math.max(wordLeft, existingWordLeft));
                const overlapY = Math.max(0, Math.min(wordBottom, existingWordBottom) - Math.max(wordTop, existingWordTop));
                
                // 如果水平重叠超过允许的最大值且垂直有重叠，则认为位置不合适
                if (overlapX > maxAllowedOverlap && overlapY > 0) {
                    positionFound = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        // 如果尝试了最大次数还没找到合适位置，则强制使用最后一次尝试的位置
        bubble.style.left = `${posX}px`;
        bubble.style.top = `${posY}px`;
        
        // 添加到文档并记录到活动气泡数组
        bubbleContainer.appendChild(bubble);
        activeBubbles.push(bubble);
    });
    
    // 调整容器高度以适应所有泡泡，移动设备上高度更小
    bubbleContainer.style.minHeight = isMobile ? '300px' : '400px';
    
    // 添加：检查气泡重叠并设置透明度
    setTimeout(checkBubbleOverlap, 100); // 延迟一点执行，确保所有气泡已正确渲染
}

// 检查气泡重叠并设置透明度
function checkBubbleOverlap() {
    // 如果活动气泡少于2个，无需检查重叠
    if (activeBubbles.length < 2) return;
    
    // 首先移除之前的所有遮罩
    document.querySelectorAll('.overlap-mask').forEach(mask => mask.remove());
    
    // 首先将所有气泡透明度重置为1
    activeBubbles.forEach(bubble => {
        bubble.style.opacity = '1';
        bubble.style.zIndex = '1'; // 设置基本z-index
    });
    
    // 创建一个数组，记录每个气泡的重叠次数
    const overlapCounts = new Array(activeBubbles.length).fill(0);
    
    // 记录每个气泡的重叠关系
    const overlapRelations = [];
    
    // 设置最大允许重叠宽度为15px
    const maxAllowedOverlap = 15;
    
    // 检查每对气泡的重叠情况
    for (let i = 0; i < activeBubbles.length; i++) {
        for (let j = i + 1; j < activeBubbles.length; j++) {
            const bubble1 = activeBubbles[i];
            const bubble2 = activeBubbles[j];
            
            // 获取气泡1的位置和尺寸
            const rect1 = {
                left: parseFloat(bubble1.style.left),
                top: parseFloat(bubble1.style.top),
                width: parseFloat(bubble1.style.width),
                height: parseFloat(bubble1.style.height)
            };
            
            // 获取气泡2的位置和尺寸
            const rect2 = {
                left: parseFloat(bubble2.style.left),
                top: parseFloat(bubble2.style.top),
                width: parseFloat(bubble2.style.width),
                height: parseFloat(bubble2.style.height)
            };
            
            // 计算重叠区域
            const overlapX = Math.max(0, Math.min(rect1.left + rect1.width, rect2.left + rect2.width) - Math.max(rect1.left, rect2.left));
            const overlapY = Math.max(0, Math.min(rect1.top + rect1.height, rect2.top + rect2.height) - Math.max(rect1.top, rect2.top));
            
            // 只有当重叠宽度超过15px时才视为真正重叠
            if (overlapX > maxAllowedOverlap && overlapY > 0) {
                const overlapArea = overlapX * overlapY;
                
                overlapCounts[i]++;
                overlapCounts[j]++;
                
                // 确定哪个气泡在上方
                // 使用简单的启发式：后添加的气泡在上方（DOM顺序）
                const topBubbleIndex = j; // j总是比i大，即后添加
                const bottomBubbleIndex = i;
                
                overlapRelations.push({
                    topIndex: topBubbleIndex,
                    bottomIndex: bottomBubbleIndex,
                    overlapArea: overlapArea
                });
            }
        }
    }
    
    // 计算最大重叠层数(单个气泡被多少其他气泡重叠)
    let maxOverlapLayers = 0;
    overlapCounts.forEach(count => {
        maxOverlapLayers = Math.max(maxOverlapLayers, count);
    });
    
    // 为每个气泡分配z-index，确保多次重叠时z-index正确
    overlapRelations.forEach(relation => {
        const topBubble = activeBubbles[relation.topIndex];
        const bottomBubble = activeBubbles[relation.bottomIndex];
        
        // 如果还没设置z-index，则设置
        if (!topBubble.style.zIndex || topBubble.style.zIndex === '1') {
            topBubble.style.zIndex = '3';
        }
        
        if (!bottomBubble.style.zIndex || bottomBubble.style.zIndex === '1') {
            bottomBubble.style.zIndex = '2';
        } else if (bottomBubble.style.zIndex === '3') {
            // 如果底部气泡已经是顶层，则当前顶部气泡要更高
            topBubble.style.zIndex = '4';
        }
    });
    
    // 根据z-index和重叠次数设置透明度
    activeBubbles.forEach((bubble, index) => {
        if (overlapCounts[index] > 0) {
            const zIndex = parseInt(bubble.style.zIndex);
            
            if (maxOverlapLayers >= 2) { // 至少有三层重叠
                // 根据z-index设置透明度
                if (zIndex >= 4) {
                    // 处于最顶层，30%透明度
                    bubble.style.opacity = '0.7';
                } else if (zIndex === 3) {
                    // 处于中间层，60%透明度
                    bubble.style.opacity = '0.4';
                } else if (zIndex === 2) {
                    // 处于底层，完全不透明
                    bubble.style.opacity = '1';
                }
            } else { // 只有两层重叠
                if (zIndex >= 3) {
                    // 处于上层，60%透明度
                    bubble.style.opacity = '0.4';
                } else {
                    // 处于下层，完全不透明
                    bubble.style.opacity = '1';
                }
            }
        }
    });
}

// 当气泡动画结束后重新检查重叠
// 将这段代码添加到现有的浮动动画结束事件监听器中
// 或者通过setInterval周期性检查
setInterval(() => {
    if (gameStarted && activeBubbles.length > 0) {
        // 检查新的重叠
        checkBubbleOverlap();
    }
}, 1000); // 每秒检查一次重叠状态

// 当窗口大小改变时，也需要重新检查气泡重叠
window.addEventListener('resize', () => {
    if (gameStarted && activeBubbles.length > 0) {
        // 检查新的重叠
        setTimeout(checkBubbleOverlap, 300); // 延迟执行，确保布局稳定
    }
});

// 开始新游戏
function startNewGame() {
    gameStarted = true;
    currentWordIndex = 0;
    totalAttempts = 0;
    correctAttempts = 0;
    wrongWords = [];
    hintsUsed = 0;
    correctStreak = 0; // 重置连续答对计数
    
    // 更新游戏统计
    gameStats.gamesPlayed++;
    gameStats.lastPlayDate = new Date().toISOString();
    saveToLocalStorage();
    
    updateAccuracy();
    createBubbles();
    showNextWord();
    updateProgress();
}

// 显示下一个单词的意思
function showNextWord() {
    const meaningContainer = document.getElementById('current-meaning');
    meaningContainer.innerHTML = ''; // 清空容器，防止任何残留

    if (currentWordIndex < wordsList.length) {
        const currentWord = wordsList[currentWordIndex];
        let phoneticHtml = '';
        let partOfSpeechHtml = '';
        let meaningHtml = '';

        // 1. 处理音标
        if (currentWord.phonetic && currentWord.phonetic.trim() && currentWord.phonetic.startsWith('[')) {
             phoneticHtml = `<span class="phonetic">${currentWord.phonetic.trim()}</span> `;
        }

        // 2. 处理词性
        if (currentWord.partOfSpeech && currentWord.partOfSpeech.trim()) {
            partOfSpeechHtml = `${currentWord.partOfSpeech.trim()} `;
        }

        // 3. 处理意思 (确保意思存在)
        if (currentWord.meaning && currentWord.meaning.trim()){
             meaningHtml = currentWord.meaning.trim();
             // 尝试从意思中移除可能重复的音标 (作为最后手段)
             if(phoneticHtml){
                const phoneticText = currentWord.phonetic.trim();
                meaningHtml = meaningHtml.replace(phoneticText, '').trim();
             }
        }

        // 组合最终显示内容
        meaningContainer.innerHTML = phoneticHtml + partOfSpeechHtml + meaningHtml;

        document.getElementById('pronunciation-btn').style.display = 'flex';
    } else {
        meaningContainer.textContent = "恭喜你完成了所有单词！点击\"重置\"开始新游戏。";
        document.getElementById('pronunciation-btn').style.display = 'none';
        createConfetti();
    }
    updateProgress();
}

// 更新进度条
function updateProgress() {
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    const progressTextElem = document.getElementById('progress-text');
    const progressBar = document.querySelector('.progress-bar');
    
    if (wordsList.length === 0) {
        progressTextElem.textContent = '0/0';
        progressBar.style.width = '0%';
        return;
    }
    
    const total = wordsList.length;
    const current = currentWordIndex;
    const percentage = Math.floor((current / total) * 100);
    
    progressTextElem.textContent = `${current}/${total}`;
    
    // 水平进度条
    progressBar.style.width = `${percentage}%`;
    
    // 更新特效
    updateSparkleEffect();
}

// 处理泡泡点击事件
function handleBubbleClick(event) {
    if (bubbleAnimating || currentWordIndex >= wordsList.length) return;

    const clickedBubble = event.currentTarget;
    const clickedWord = clickedBubble.dataset.word;
    
    totalAttempts++;
    
    if (clickedWord === wordsList[currentWordIndex].word) {
        // 正确
        correctAttempts++;
        bubbleAnimating = true;
        
        // 更新总体统计
        gameStats.totalCorrect++;
        gameStats.totalAttempts++;
        saveToLocalStorage();
        
        // 更新连续答对计数
        correctStreak++;
        
        // 立即播放音效，不使用setTimeout延迟
        playSound('pop');
        playSound('correct');
        
        // 检查是否达到奖励级别
        checkReward();
        
        // 创建爆炸效果取代原来的动画
        createBubbleExplosion(clickedBubble);
        
        // 获取当前单词，稍后用于播放发音
        const currentWord = wordsList[currentWordIndex].word;
        
        // 动画完成后移除泡泡和进入下一单词
        setTimeout(() => {
            clickedBubble.remove();
            
            // 在爆炸效果结束后播放单词发音
            speak(currentWord);
            
            currentWordIndex++;
            showNextWord();
            if (currentWordIndex < wordsList.length) {
                createBubbles(); // 为下一个单词创建新的泡泡
            }
            bubbleAnimating = false;
        }, 1000); // 爆炸效果动画时间
    } else {
        // 错误
        // 更新总体统计
        gameStats.totalAttempts++;
        saveToLocalStorage();
        
        // 重置连续答对计数
        correctStreak = 0;
        
        // 立即播放错误音效
        playSound('wrong');
        
        clickedBubble.style.animation = 'wrong 0.5s';
        
        // 将错误单词添加到错误列表
        if (!wrongWords.includes(wordsList[currentWordIndex].word)) {
            wrongWords.push(wordsList[currentWordIndex].word);
        }
        
        // 动画结束后重置
        setTimeout(() => {
            clickedBubble.style.animation = 'float 3s infinite ease-in-out';
        }, 500);
    }
    
    updateAccuracy();
}

// 检查是否达到奖励级别并显示奖励
function checkReward() {
    // 检查连续答对数是否达到奖励级别
    for (const [level, reward] of Object.entries(rewardLevels)) {
        if (correctStreak === parseInt(level)) {
            // 显示奖励文本
            showRewardText(reward.text);
            
            // 播放奖励音效
            playSound(reward.sound);
            
            // 如果达到最高级别，重置连续答对计数
            if (parseInt(level) === 20) {
                correctStreak = 0;
            }
            
            break;
        }
    }
}

// 创建单词气泡
function createWordBubbles(wordObjs) {
    const bubbleContainer = document.getElementById('bubble-container');
    // 清空容器
    bubbleContainer.innerHTML = '';
    activeBubbles = [];
    
    // 如果没有单词，显示提示
    if (!wordObjs || wordObjs.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.textContent = '请先导入单词或点击"开始游戏"按钮开始';
        bubbleContainer.appendChild(placeholder);
        return;
    }
    
    // 根据难度设置显示的单词数量
    const difficulty = getCurrentDifficulty();
    let numWordsToShow = 0;
    
    switch(difficulty) {
        case 'easy':
            numWordsToShow = Math.min(10, wordObjs.length);
            break;
        case 'medium':
            numWordsToShow = Math.min(15, wordObjs.length);
            break;
        case 'hard':
            numWordsToShow = Math.min(20, wordObjs.length);
            break;
        default:
            numWordsToShow = Math.min(10, wordObjs.length);
    }
    
    // 随机选择单词
    const shuffledWords = [...wordObjs].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, numWordsToShow);
    
    // 创建气泡
    selectedWords.forEach(wordObj => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 设置泡泡尺寸，大小根据单词长度稍微调整
        const baseSize = 70; // 基础尺寸
        const sizeAdjustment = Math.min(wordObj.word.length * 2, 30); // 根据单词长度调整，但最多增加30px
        const width = baseSize + sizeAdjustment;
        const height = width;
        
        bubble.style.width = `${width}px`;
        bubble.style.height = `${height}px`;
        
        // 随机位置，但避免重叠
        let posX, posY;
        let overlapping = true;
        let attempts = 0;
        
        // 设置最大允许重叠宽度为15px
        const maxAllowedOverlap = 15;
        
        // 获取容器尺寸
        const containerWidth = bubbleContainer.offsetWidth;
        const containerHeight = Math.max(400, bubbleContainer.offsetHeight);
        
        do {
            // 生成随机位置，但确保完全在容器内
            posX = Math.random() * (containerWidth - width);
            posY = Math.random() * (containerHeight - height);
            
            overlapping = false;
            
            // 检查与现有泡泡的重叠
            for (const existingBubble of activeBubbles) {
                const existingWidth = parseInt(existingBubble.style.width);
                const existingHeight = parseInt(existingBubble.style.height);
                const existingPosX = parseInt(existingBubble.style.left);
                const existingPosY = parseInt(existingBubble.style.top);
                
                // 计算两个泡泡的边界
                const rect1 = {
                    left: posX,
                    right: posX + width,
                    top: posY,
                    bottom: posY + height
                };
                
                const rect2 = {
                    left: existingPosX,
                    right: existingPosX + existingWidth,
                    top: existingPosY,
                    bottom: existingPosY + existingHeight
                };
                
                // 计算重叠宽度
                const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
                const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
                
                // 如果水平重叠超过允许的最大值且垂直有重叠，则认为位置不合适
                if (overlapX > maxAllowedOverlap && overlapY > 0) {
                    overlapping = true;
                    break;
                }
            }
            
            attempts++;
            // 避免无限循环，如果尝试太多次还找不到位置，就接受一定程度的重叠
            if (attempts > 50) break;
        } while (overlapping);
        
        bubble.style.left = `${posX}px`;
        bubble.style.top = `${posY}px`;
        
        // 随机背景色
        bubble.style.backgroundColor = getRandomColor();
        
        // 随机动画延迟，使泡泡浮动看起来更自然
        bubble.style.animationDelay = `${Math.random() * 3}s`;
        
        // 确保单词内容不溢出气泡
        const wordText = document.createElement('span');
        wordText.className = 'word-text';
        wordText.textContent = wordObj.word;
        
        // 将单词添加到气泡
        bubble.appendChild(wordText);
        bubble.dataset.word = wordObj.word;
        
        bubble.addEventListener('click', handleBubbleClick);
        
        bubbleContainer.appendChild(bubble);
        activeBubbles.push(bubble);
    });
    
    // 调整容器高度以适应所有泡泡
    bubbleContainer.style.minHeight = '400px';
} 