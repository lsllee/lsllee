// 创建全局音频上下文，用于所有音效播放
let audioContext;
// 是否已初始化音频上下文
let audioInitialized = false;

// 初始化音频系统
function initAudio() {
    if (!audioInitialized) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
            console.log("音频系统初始化成功");
        } catch (e) {
            console.error("无法初始化音频系统:", e);
        }
    }
}

// 播放单词发音
function speak(word) {
    // 使用SpeechSynthesis API来发音
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US'; // 设置为英语发音
        utterance.rate = 0.8; // 稍微放慢语速
        utterance.pitch = 1; // 音调
        utterance.volume = 1; // 音量

        // 尝试找到更好的声音
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            // 优先使用英语女声
            const preferredVoice = voices.find(voice => 
                voice.lang.includes('en-US') && voice.name.includes('Female'));
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }

        window.speechSynthesis.speak(utterance);
    } else {
        console.log('当前浏览器不支持语音合成');
    }
}

// 播放音效
function playSound(type) {
    // 如果音频系统未初始化，先初始化
    if (!audioInitialized) {
        initAudio();
    }
    
    // 如果初始化失败，直接返回
    if (!audioContext) {
        console.error("音频系统未就绪，无法播放音效");
        return;
    }
    
    // 在某些浏览器中，音频上下文可能被暂停，需要恢复
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    try {
        // 首先尝试播放本地音效文件
        playLocalSound(type);
    } catch (error) {
        console.error("播放本地音效失败，使用生成的音效:", error);
        // 如果本地音效播放失败，使用生成的音效
        playGeneratedSound(type);
    }
}

// 播放本地音效文件
function playLocalSound(type) {
    const audio = new Audio(`sounds/${type}.mp3`);
    
    // 设置加载超时
    const loadTimeout = setTimeout(() => {
        console.log(`音效文件 ${type}.mp3 加载超时，使用生成的音效`);
        playGeneratedSound(type);
    }, 1000);
    
    // 音频加载成功时取消超时并播放
    audio.oncanplaythrough = function() {
        clearTimeout(loadTimeout);
        
        // 根据音效类型设置音量
        switch (type) {
            case 'correct':
                audio.volume = 0.7;
                break;
            case 'wrong':
                audio.volume = 0.5;
                break;
            case 'pop':
                audio.volume = 0.6;
                break;
            case 'explosion':
                audio.volume = 0.4;
                break;
            // 奖励音效音量
            case 'nice':
            case 'great':
            case 'brilliant':
            case 'excellent':
            case 'perfect':
                audio.volume = 0.9; // 提高奖励音效音量
                break;
            default:
                audio.volume = 0.6;
        }
        
        // 播放音频
        const playPromise = audio.play();
        
        // 处理可能的播放错误
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("播放本地音效失败:", error);
                playGeneratedSound(type);
            });
        }
    };
    
    // 加载错误时使用生成的音效
    audio.onerror = function() {
        clearTimeout(loadTimeout);
        console.error(`音效文件 ${type}.mp3 加载失败`);
        playGeneratedSound(type);
    };
}

// 使用Web Audio API生成音效
function playGeneratedSound(type) {
    switch (type) {
        case 'correct':
            createCorrectSound(audioContext);
            break;
        case 'wrong':
            createWrongSound(audioContext);
            break;
        case 'pop':
            createPopSound(audioContext);
            break;
        case 'explosion':
            createExplosionSound(audioContext);
            break;
        case 'nice':
            createRewardSound(audioContext, 1);
            break;
        case 'great':
            createRewardSound(audioContext, 2);
            break;
        case 'brilliant':
            createRewardSound(audioContext, 3);
            break;
        case 'excellent':
            createRewardSound(audioContext, 4);
            break;
        case 'perfect':
            createRewardSound(audioContext, 5);
            break;
        default:
            createCorrectSound(audioContext);
    }
}

// 创建奖励音效
function createRewardSound(audioContext, level) {
    // 奖励音效使用连续的音阶上升音，级别越高音符越多
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 使用三和弦音效
    oscillator.type = 'sine';
    
    // 设置基础频率和持续时间 - 提高基础频率
    const baseFrequency = 523.25; // C5，比原来的A4(440Hz)高
    const noteDuration = 0.15;
    const totalDuration = noteDuration * (level + 2);
    
    // 设置初始音量 - 提高音量
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // 从0.3提高到0.5
    
    // 根据级别创建不同的音阶
    const notes = [];
    
    // 基于级别选择不同的音阶
    switch(level) {
        case 1: // 简单三音阶
            notes.push({ freq: baseFrequency, time: 0 });
            notes.push({ freq: baseFrequency * 1.25, time: noteDuration });
            notes.push({ freq: baseFrequency * 1.5, time: noteDuration * 2 });
            break;
        case 2: // 四音阶
            notes.push({ freq: baseFrequency, time: 0 });
            notes.push({ freq: baseFrequency * 1.25, time: noteDuration });
            notes.push({ freq: baseFrequency * 1.5, time: noteDuration * 2 });
            notes.push({ freq: baseFrequency * 2, time: noteDuration * 3 });
            break;
        case 3: // 五音阶
            notes.push({ freq: baseFrequency, time: 0 });
            notes.push({ freq: baseFrequency * 1.25, time: noteDuration });
            notes.push({ freq: baseFrequency * 1.5, time: noteDuration * 2 });
            notes.push({ freq: baseFrequency * 1.66, time: noteDuration * 3 });
            notes.push({ freq: baseFrequency * 2, time: noteDuration * 4 });
            break;
        case 4: // 六音阶
            notes.push({ freq: baseFrequency, time: 0 });
            notes.push({ freq: baseFrequency * 1.25, time: noteDuration });
            notes.push({ freq: baseFrequency * 1.5, time: noteDuration * 2 });
            notes.push({ freq: baseFrequency * 1.66, time: noteDuration * 3 });
            notes.push({ freq: baseFrequency * 2, time: noteDuration * 4 });
            notes.push({ freq: baseFrequency * 2.5, time: noteDuration * 5 });
            break;
        case 5: // 华丽的七音阶，包括和弦
            notes.push({ freq: baseFrequency, time: 0 });
            notes.push({ freq: baseFrequency * 1.25, time: noteDuration });
            notes.push({ freq: baseFrequency * 1.5, time: noteDuration * 2 });
            notes.push({ freq: baseFrequency * 1.66, time: noteDuration * 3 });
            notes.push({ freq: baseFrequency * 2, time: noteDuration * 4 });
            notes.push({ freq: baseFrequency * 2.5, time: noteDuration * 5 });
            notes.push({ freq: baseFrequency * 3, time: noteDuration * 6 });
            break;
        default:
            notes.push({ freq: baseFrequency, time: 0 });
            notes.push({ freq: baseFrequency * 1.25, time: noteDuration });
            notes.push({ freq: baseFrequency * 1.5, time: noteDuration * 2 });
    }
    
    // 安排音符序列
    notes.forEach(note => {
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.time);
    });
    
    // 在最后一个音符后淡出
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + notes[notes.length - 1].time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + totalDuration);
    
    // 连接节点并播放
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + totalDuration + 0.1); // 添加小延迟确保所有音符播放完成
}

// 创建正确音效
function createCorrectSound(audioContext) {
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 设置振荡器类型和频率
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1); // B5
    oscillator.frequency.setValueAtTime(1318, audioContext.currentTime + 0.2); // E6
    
    // 设置音量控制
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    // 连接节点并播放
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
}

// 创建错误音效
function createWrongSound(audioContext) {
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 设置振荡器类型和频率，使用矩形波产生更刺耳的声音
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
    oscillator.frequency.setValueAtTime(196, audioContext.currentTime + 0.1); // G3
    
    // 设置音量控制
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // 连接节点并播放
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 创建泡泡音效
function createPopSound(audioContext) {
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 设置振荡器类型和频率，使用正弦波产生清脆的声音
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.1);
    
    // 设置音量控制
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    // 连接节点并播放
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// 创建爆炸音效
function createExplosionSound(audioContext) {
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const bandpass = audioContext.createBiquadFilter();
    
    // 设置滤波器
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 600;
    bandpass.Q.value = 1;
    
    // 设置振荡器类型和频率
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
    
    // 添加噪声效果
    const noiseBuffer = createNoiseBuffer(audioContext);
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    // 设置音量控制
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    // 连接节点并播放
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    
    oscillator.start();
    noiseSource.start();
    oscillator.stop(audioContext.currentTime + 0.2);
    noiseSource.stop(audioContext.currentTime + 0.2);
}

// 创建白噪声缓冲区
function createNoiseBuffer(audioContext) {
    const bufferSize = audioContext.sampleRate * 0.5; // 0.5秒
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
} 