import http.server
import os
import sys

PORT = 8000

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        translated = super().translate_path(path)
        # If the file/folder doesn't exist, check if adding .html exists
        if not os.path.exists(translated):
            base, ext = os.path.splitext(translated)
            if not ext:
                html_path = translated + '.html'
                if os.path.exists(html_path):
                    return html_path
        return translated

if __name__ == '__main__':
    # Ensure working directory is the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, CleanURLHandler)
    print(f"Serving HTTP on port {PORT} with Clean URL support...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        sys.exit(0)
