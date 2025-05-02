import http.server
import socketserver
import os
import json
import sys
from urllib.parse import parse_qs, urlparse

PORT = 8081

# 将工作目录更改为脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
print(f"工作目录设置为: {os.getcwd()}")

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 设置CORS头以允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        # 处理/list_files API请求，返回word_list目录下的txt文件列表
        if parsed_url.path == '/list_files':
            try:
                word_list_dir = 'word_list'
                if os.path.exists(word_list_dir) and os.path.isdir(word_list_dir):
                    # 获取文件列表
                    files = [f for f in os.listdir(word_list_dir) 
                             if f.endswith('.txt') and os.path.isfile(os.path.join(word_list_dir, f))]
                    
                    # 返回JSON格式的文件列表
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(files).encode())
                else:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "word_list directory not found"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            # 其他请求走默认处理
            return http.server.SimpleHTTPRequestHandler.do_GET(self)


if __name__ == "__main__":
    handler = CORSHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"服务器运行在 http://localhost:{PORT}")
        print(f"可以访问 http://localhost:{PORT}/list_files 获取单词列表文件")
        print(f"可以通过 http://localhost:{PORT}/index_voice.html 访问网页")
        print("按 Ctrl+C 停止服务器")
        httpd.serve_forever() 