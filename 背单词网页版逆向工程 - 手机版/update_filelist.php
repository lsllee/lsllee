<?php
// 设置响应类型为JSON
header('Content-Type: application/json');

// 检查是否是POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => '只接受POST请求']);
    exit;
}

// 检查是否接收到action和files参数
if (!isset($_POST['action']) || $_POST['action'] !== 'update_filelist' || !isset($_POST['files'])) {
    echo json_encode(['success' => false, 'message' => '缺少必要参数']);
    exit;
}

try {
    // 解析接收到的文件列表
    $files = json_decode($_POST['files'], true);
    
    if (!is_array($files)) {
        throw new Exception('无效的文件列表格式');
    }
    
    // 文件路径
    $filePath = __DIR__ . '/word_list/filelist.json';
    
    // 确保word_list目录存在
    $dirPath = __DIR__ . '/word_list';
    if (!is_dir($dirPath)) {
        if (!mkdir($dirPath, 0755, true)) {
            throw new Exception('无法创建word_list目录');
        }
    }
    
    // 检查文件是否可写
    if (file_exists($filePath) && !is_writable($filePath)) {
        throw new Exception('filelist.json文件不可写');
    }
    
    // 将数组编码为JSON并写入文件
    $jsonContent = json_encode($files, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($jsonContent === false) {
        throw new Exception('JSON编码失败: ' . json_last_error_msg());
    }
    
    // 写入文件
    if (file_put_contents($filePath, $jsonContent) === false) {
        throw new Exception('写入文件失败');
    }
    
    // 返回成功消息
    echo json_encode(['success' => true, 'message' => '文件列表已更新', 'count' => count($files)]);
} catch (Exception $e) {
    // 捕获并返回错误信息
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 