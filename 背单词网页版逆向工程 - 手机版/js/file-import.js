// 显示导入单词弹窗
function showImportModal() {
    const modal = document.getElementById('import-modal');
    const closeBtn = document.querySelector('.close');
    const refreshBtn = document.getElementById('refresh-file-list');
    
    // 加载文件列表
    loadWordListFiles();
    
    // 显示弹窗
    modal.style.display = 'block';
    
    // 刷新按钮事件
    refreshBtn.onclick = function() {
        this.classList.add('loading');
        this.innerHTML = '正在刷新...';
        
        // 强制刷新文件列表
        loadWordListFiles(true).finally(() => {
            this.classList.remove('loading');
            this.innerHTML = '🔄 刷新列表';
        });
    };
    
    // 关闭按钮事件
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // 点击弹窗外部关闭
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// 加载word_list文件夹中的文件
function loadWordListFiles(forceRefresh = false) {
    const fileListElement = document.getElementById('file-list');
    fileListElement.innerHTML = '<p>正在加载单词文件列表...</p>';
    
    // 添加时间戳以避免缓存
    const timestamp = new Date().getTime();
    
    // 强制刷新标志
    const refreshParam = forceRefresh ? '&refresh=1' : '';
    
    // 尝试调用本地服务器的list_files API（如果存在）
    const localServerUrl = `http://localhost:8081/list_files?t=${timestamp}${refreshParam}`;
    
    fetch(localServerUrl)
        .then(response => {
            if (response.ok) {
                return response.json().then(files => {
                    console.log('从本地服务器获取文件列表成功');
                    displayWordFiles(files);
                    // 同时更新filelist.json（如果可能）
                    tryUpdateFilelistJson(files);
                    return true;
                });
            } else {
                // 如果本地API不可用，回退到其他方法
                return tryOtherMethods();
            }
        })
        .catch(error => {
            console.log('本地服务器不可用，尝试其他方法:', error);
            return tryOtherMethods();
        });
        
    // 其他尝试获取文件列表的方法
    function tryOtherMethods() {
        // 首先尝试通过目录列表方法获取
        return fetch(`word_list/?t=${timestamp}${refreshParam}`)
            .then(response => {
                if (!response.ok) {
                    // 如果无法获取目录列表，尝试加载文件列表JSON
                    return fetch(`word_list/filelist.json?t=${timestamp}${refreshParam}`)
                        .then(response => {
                            if (response.ok) {
                                return response.json().then(files => {
                                    console.log('从filelist.json加载文件列表成功');
                                    displayWordFiles(files);
                                });
                            } else {
                                // 如果JSON文件也无法加载，回退到手动检测方法
                                console.log('无法加载filelist.json，尝试手动检测方法');
                                return tryManualFileDetection(forceRefresh);
                            }
                        })
                        .catch(error => {
                            console.error('加载filelist.json失败:', error);
                            return tryManualFileDetection(forceRefresh);
                        });
                }
                return response.text()
                    .then(html => {
                        // 解析目录列表HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        // 获取所有链接
                        const links = Array.from(doc.querySelectorAll('a'));
                        
                        // 过滤出txt文件链接并进行URL解码
                        const txtFiles = links
                            .map(link => link.getAttribute('href'))
                            .filter(href => href && href.toLowerCase().endsWith('.txt') && !href.startsWith('/') && href !== '../')
                            .map(href => decodeURIComponent(href)); // 解码URL编码的文件名，解决中文乱码
                        
                        if (txtFiles.length > 0) {
                            console.log(`从目录列表找到${txtFiles.length}个文件`);
                            
                            // 自动更新filelist.json
                            tryUpdateFilelistJson(txtFiles);
                            
                            displayWordFiles(txtFiles);
                        } else {
                            console.log('目录列表解析失败，尝试手动检测方法');
                            return tryManualFileDetection(forceRefresh);
                        }
                    });
            })
            .catch(error => {
                console.error('加载文件列表失败:', error);
                // 出错时尝试手动检测方法
                return tryManualFileDetection(forceRefresh);
            });
    }
}

// 尝试更新filelist.json文件
function tryUpdateFilelistJson(files) {
    if (!files || files.length === 0) return;
    
    console.log('尝试更新filelist.json...');
    
    // 创建一个表单对象
    const formData = new FormData();
    formData.append('action', 'update_filelist');
    formData.append('files', JSON.stringify(files));
    
    // 发送请求尝试更新filelist.json
    fetch('update_filelist.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log('更新filelist.json结果:', result);
    })
    .catch(error => {
        console.error('更新filelist.json失败:', error);
    });
}

// 尝试手动检测word_list目录下的文件
function tryManualFileDetection(forceRefresh = false) {
    console.log("使用手动检测方法查找文件...");
    
    // 添加时间戳以避免缓存
    const timestamp = new Date().getTime();
    
    // 强制刷新标志
    const refreshParam = forceRefresh ? '&refresh=1' : '';
    
    // 创建一个检测更广泛文件名的函数
    function generatePossibleFilePatterns() {
        let patterns = [];
        
        // 基础词汇文件
        patterns.push('简单单词.txt', '水果单词.txt', '动物单词.txt', '颜色单词.txt');
        
        // 必修和选必单元的各种可能格式
        for (let book = 1; book <= 5; book++) {
            for (let unit = 1; unit <= 5; unit++) {
                // 不同格式的单元文件名
                patterns.push(`必修${book}unit${unit}_converted.txt`);
                patterns.push(`必修${book}Unit${unit}_converted.txt`);
                patterns.push(`${book}必修${unit}_converted.txt`);
                patterns.push(`${book*5+unit}必修${book}unit${unit}_converted.txt`);
                patterns.push(`${book*5+unit-5}必修${book}unit${unit}_converted.txt`);
            }
        }
        
        // 选修必修单元
        for (let book = 1; book <= 4; book++) {
            for (let unit = 1; unit <= 5; unit++) {
                patterns.push(`选必${book}unit${unit}_converted.txt`);
                patterns.push(`${book*10+unit+15}选必${book}unit${unit}_converted.txt`);
            }
        }
        
        // 额外检查列表里已知存在的文件
        patterns.push('1.必修1welcomeunit_converted.txt');
        patterns.push('11必修2uni5_converted.txt'); // 注意这里的typo
        
        return patterns;
    }
    
    // 获取可能的文件模式
    const possibleFiles = generatePossibleFilePatterns();
    
    // 并行检查所有可能的文件
    let validFiles = [];
    let checkPromises = [];
    
    possibleFiles.forEach(fileName => {
        const encodedFileName = encodeURIComponent(fileName);
        const promise = fetch(`word_list/${encodedFileName}?t=${timestamp}${refreshParam}`)
            .then(response => {
                if (response.ok) {
                    validFiles.push(fileName);
                }
                return null; // 避免返回response对象
            })
            .catch(() => null); // 忽略错误
        checkPromises.push(promise);
    });
    
    // 等待所有检查完成
    return Promise.allSettled(checkPromises)
        .then(() => {
            if (validFiles.length > 0) {
                console.log(`手动检测找到${validFiles.length}个文件`);
                
                // 自动更新filelist.json
                tryUpdateFilelistJson(validFiles);
                
                displayWordFiles(validFiles);
                return true;
            } else {
                displayNoFilesMessage();
                return false;
            }
        });
}

// 显示单词文件列表
function displayWordFiles(files) {
    const fileListElement = document.getElementById('file-list');
    
    // 清空加载信息
    fileListElement.innerHTML = '';
    
    // 对文件名进行排序
    files.sort((a, b) => {
        // 尝试提取数字前缀进行排序
        const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999');
        const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999');
        
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b, 'zh-CN'); // 使用中文排序规则
    });
    
    // 显示文件列表
    files.forEach(fileName => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // 格式化显示名称 - 移除_converted后缀，美化显示
        let displayName = fileName.replace('_converted.txt', '').replace('.txt', '');
        
        // 添加图标
        const icon = document.createElement('span');
        icon.className = 'file-icon';
        icon.innerHTML = '📝';
        fileItem.appendChild(icon);
        
        // 添加文件名
        const nameSpan = document.createElement('span');
        nameSpan.textContent = displayName;
        fileItem.appendChild(nameSpan);
        
        // 添加点击事件
        fileItem.addEventListener('click', function() {
            // 清除之前的选择
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // 标记当前选择
            this.classList.add('selected');
            
            // 加载所选文件
            loadSelectedFile(fileName);
        });
        
        fileListElement.appendChild(fileItem);
    });
}

// 显示无文件消息
function displayNoFilesMessage() {
    const fileListElement = document.getElementById('file-list');
    fileListElement.innerHTML = '<p>没有找到可用的单词文件。请确保word_list文件夹中包含TXT文件。</p>' +
        '<button id="local-import-btn" class="btn">从本地导入单词</button>';
    
    document.getElementById('local-import-btn').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'none';
        document.getElementById('file-input').click();
    });
}

// 加载选定的单词文件
function loadSelectedFile(fileName) {
    // 构建完整的文件路径，并确保URL编码文件名以正确处理中文
    const encodedFileName = encodeURIComponent(fileName);
    const filePath = `word_list/${encodedFileName}`;
    
    // 调用现有的selectWordFile函数处理文件
    selectWordFile(filePath, fileName);
}

// 选择并加载单词文件
function selectWordFile(filePath, originalFileName) {
    // 关闭弹窗
    document.getElementById('import-modal').style.display = 'none';
    
    // 显示加载状态
    const meaningContainer = document.getElementById('current-meaning');
    meaningContainer.textContent = '正在加载单词文件...';
    
    // 使用相对路径fetch加载选中的文件
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`无法加载文件: ${originalFileName || filePath}`);
            }
            return response.text();
        })
        .then(content => {
            // 处理文件内容并导入单词
            const fileName = originalFileName || filePath.split('/').pop();
            processWordListContent(content, fileName);
        })
        .catch(error => {
            console.error('加载单词文件失败:', error);
            
            // 提供更具针对性的错误信息和备用导入方式
            alert(`加载单词文件失败: ${error.message}\n您可以使用"从本地导入"按钮手动选择文件导入。`);
            
            // 显示"从本地导入"按钮
            meaningContainer.innerHTML = `
            <p>加载文件失败。</p>
            <button id="local-import-btn" class="btn">从本地导入单词</button>
            `;
            
            // 添加从本地导入按钮事件
            document.getElementById('local-import-btn').addEventListener('click', () => {
                document.getElementById('file-input').click();
            });
        });
}

// 处理导入的单词文件
function handleFileImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            // 检测文件类型
            const fileExt = file.name.split('.').pop().toLowerCase();
            
            let importedWords = [];
            
            if (fileExt === 'csv') {
                // 处理CSV文件
                const lines = content.split('\n');
                
                lines.forEach(line => {
                    // 尝试支持不同的CSV格式
                    let parts;
                    if (line.includes(',')) {
                        parts = line.split(',');
                    } else if (line.includes('\t')) {
                        parts = line.split('\t');
                    } else if (line.includes('|')) {
                        parts = line.split('|');
                    } else {
                        parts = [line]; // 单一列
                    }
                    
                    if (parts.length >= 2) {
                        // 确保只有一个phonetic字段
                        let word = parts[0].trim();
                        let phonetic = parts.length > 1 ? parts[1].trim() : '';
                        let partOfSpeech = parts.length > 2 ? parts[2].trim() : '';
                        let meaning = parts.length > 3 ? parts[3].trim() : parts[1].trim();
                        
                        // 检查并清理音标字段
                        if (phonetic && !phonetic.startsWith('[')) {
                            // 这不是音标，可能是词性或含义
                            if (!partOfSpeech) {
                                partOfSpeech = phonetic;
                                phonetic = '';
                            } else {
                                meaning = phonetic + ' ' + meaning;
                                phonetic = '';
                            }
                        }
                        
                        importedWords.push({
                            word: word,
                            phonetic: phonetic, // 可能为空
                            partOfSpeech: partOfSpeech,
                            meaning: meaning
                        });
                    }
                });
            } else {
                // 处理TXT文件，尝试智能识别格式
                processPlainTextWordFile(content, importedWords);
            }
            
            if (importedWords.length > 0) {
                wordsList = importedWords;
                saveToLocalStorage(); // 保存到本地存储
                alert(`成功导入 ${importedWords.length} 个单词！`);
                startNewGame();
            } else {
                alert('导入的文件格式不正确或无法识别。请尝试以下格式：\n1. 词典格式："单词 [音标] 词性. 释义"\n2. 制表符分隔格式\n3. 每行格式为"单词 - 意思"');
            }
        } catch (error) {
            alert('导入单词时出错：' + error.message);
            console.error('导入单词时出错：', error);
        }
    };
    reader.readAsText(file);
}

// 处理纯文本格式的单词文件
function processPlainTextWordFile(content, importedWords) {
    const lines = content.split('\n');
    
    // 尝试检测文件格式
    // 检查第一行，判断格式
    let sampleLine = lines[0] ? lines[0].trim() : '';
    
    // 词典格式1: cholera [ˈkɒlərə] n. 霍乱
    // 词典格式正则: 单词 [音标] 词性. 释义
    const dictFormat1 = /^(\w+)\s+\[(.*?)\]\s+([\w\.\s&]+)\.\s+(.+)$/;
    // 词典格式2: severe [sɪˈvɪə(r)] adj. 极为恶劣的；十分严重的；严厉的
    const dictFormat2 = /^(\w+)\s+\[(.*?)\]\s+([\w\.\s&]+)\.\s+(.+)$/;
    
    if (dictFormat1.test(sampleLine) || dictFormat2.test(sampleLine)) {
        // 词典格式处理
        lines.forEach(line => {
            if (line.trim()) {
                let match = line.match(dictFormat1) || line.match(dictFormat2);
                if (match && match.length >= 5) {
                    importedWords.push({
                        word: match[1].trim(),
                        phonetic: match[2].trim(),
                        partOfSpeech: match[3].trim(),
                        meaning: match[4].trim()
                    });
                } else {
                    // 尝试简单的制表符分隔格式
                    processSimpleFormatLine(line, importedWords);
                }
            }
        });
    } else if (sampleLine.includes('\t')) {
        // 制表符分隔格式处理
        lines.forEach(line => {
            if (line.trim()) {
                const parts = line.split('\t');
                if (parts.length >= 2) {
                    processTabSeparatedLine(parts, importedWords);
                }
            }
        });
    } else if (sampleLine.includes(' - ') || sampleLine.includes(':') || sampleLine.includes('=')) {
        // 每行一个词的格式："单词 - 意思" 或 "单词:意思"
        lines.forEach(line => {
            if (line.trim()) {
                processSeparatorLine(line, importedWords);
            }
        });
    } else {
        // 传统隔行格式：一行单词，一行意思
        for (let i = 0; i < lines.length; i += 2) {
            if (lines[i] && lines[i + 1]) {
                processAlternatingLines(lines[i], lines[i + 1], importedWords);
            }
        }
    }
}

// 处理简单格式的行
function processSimpleFormatLine(line, importedWords) {
    const parts = line.split('\t');
    if (parts.length >= 2) {
        // 尝试找出中文部分
        let word = parts[0].trim();
        let phonetic = '';
        let partOfSpeech = '';
        let meaning = '';
        
        // 提取音标 [...]
        let phoneticMatch = parts.join(' ').match(/\[(.*?)\]/);
        if (phoneticMatch) {
            phonetic = phoneticMatch[0];
        }
        
        // 提取词性 n. adj. v. 等
        let posMatch = parts.join(' ').match(/\b([n|v|adj|adv|prep|conj|pron|art|num|int|aux][\w]*\.)\b/);
        if (posMatch) {
            partOfSpeech = posMatch[0];
        }
        
        // 提取中文释义
        let meaningMatch = parts.join(' ').match(/[\u4e00-\u9fa5].+$/);
        if (meaningMatch) {
            meaning = meaningMatch[0].trim();
        } else if (parts.length > 1) {
            // 如果没找到中文，就用最后一列
            meaning = parts[parts.length - 1].trim();
        }
        
        if (word && meaning) {
            importedWords.push({
                word: word,
                phonetic: phonetic,
                partOfSpeech: partOfSpeech,
                meaning: meaning
            });
        }
    }
}

// 处理制表符分隔的行
function processTabSeparatedLine(parts, importedWords) {
    // 假设格式为 单词 音标 词性 释义
    // 或者 单词 音标+词性+释义
    let word = parts[0].trim();
    let restOfLine = parts.slice(1).join(' ');
    
    // 尝试提取音标 [...]
    let phonetic = '';
    let phoneticMatch = restOfLine.match(/\[(.*?)\]/);
    if (phoneticMatch) {
        phonetic = phoneticMatch[0];
    }
    
    // 尝试提取词性 n./v./adj. 等
    let partOfSpeech = '';
    let posMatch = restOfLine.match(/\b([n|v|adj|adv|prep|conj|pron|art|num|int|aux][\w]*\.)\b/);
    if (posMatch) {
        partOfSpeech = posMatch[0];
    }
    
    // 尝试提取中文释义
    let meaning = '';
    let meaningMatch = restOfLine.match(/[\u4e00-\u9fa5].+$/);
    if (meaningMatch) {
        meaning = meaningMatch[0].trim();
    } else {
        // 如果没找到中文，使用剩余部分
        // 移除音标和词性
        meaning = restOfLine.replace(/\[.*?\]/, '').replace(/\b([n|v|adj|adv|prep|conj|pron|art|num|int|aux][\w]*\.)\b/, '').trim();
    }
    
    if (word && meaning) {
        importedWords.push({
            word: word,
            phonetic: phonetic,
            partOfSpeech: partOfSpeech,
            meaning: meaning
        });
    }
}

// 处理带分隔符的行
function processSeparatorLine(line, importedWords) {
    let parts;
    let separator = '';
    
    if (line.includes(' - ')) {
        parts = line.split(' - ');
        separator = ' - ';
    } else if (line.includes(':')) {
        parts = line.split(':');
        separator = ':';
    } else if (line.includes('=')) {
        parts = line.split('=');
        separator = '=';
    }
    
    if (parts && parts.length >= 2) {
        let word = parts[0].trim();
        let meaningPart = parts.slice(1).join(separator);
        
        // 尝试从后半部分提取音标和词性
        let phonetic = '';
        let phoneticMatch = meaningPart.match(/\[(.*?)\]/);
        if (phoneticMatch) {
            phonetic = phoneticMatch[0];
            meaningPart = meaningPart.replace(phoneticMatch[0], '');
        }
        
        let partOfSpeech = '';
        let posMatch = meaningPart.match(/\b([n|v|adj|adv|prep|conj|pron|art|num|int|aux][\w]*\.)\b/);
        if (posMatch) {
            partOfSpeech = posMatch[0];
            meaningPart = meaningPart.replace(posMatch[0], '');
        }
        
        let meaning = meaningPart.trim();
        
        importedWords.push({
            word: word,
            phonetic: phonetic,
            partOfSpeech: partOfSpeech,
            meaning: meaning
        });
    }
}

// 处理隔行格式
function processAlternatingLines(wordLine, meaningLine, importedWords) {
    let word = wordLine.trim();
    
    // 尝试从第二行提取音标和词性
    let phonetic = '';
    let phoneticMatch = meaningLine.match(/\[(.*?)\]/);
    if (phoneticMatch) {
        phonetic = phoneticMatch[0];
        meaningLine = meaningLine.replace(phoneticMatch[0], '');
    }
    
    let partOfSpeech = '';
    let posMatch = meaningLine.match(/\b([n|v|adj|adv|prep|conj|pron|art|num|int|aux][\w]*\.)\b/);
    if (posMatch) {
        partOfSpeech = posMatch[0];
        meaningLine = meaningLine.replace(posMatch[0], '');
    }
    
    importedWords.push({
        word: word,
        phonetic: phonetic,
        partOfSpeech: partOfSpeech,
        meaning: meaningLine.trim()
    });
} 