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
    server_address = ('127.0.0.1', PORT)

    # ThreadingHTTPServer, not HTTPServer.
    #
    # HTTPServer handles one request at a time, so a single browser connection
    # left open blocks every other request — the server keeps LISTENING while
    # nothing gets answered, which reads as "the site is down" rather than as a
    # blocked server. Any page with a handful of assets, or a second tab, is
    # enough to trigger it.
    #
    # Bound to 127.0.0.1 rather than every interface as well. Previously this was
    # '', which published the whole site folder to anyone on the same Wi-Fi. For a
    # local preview of files you are still editing, the loopback address is the
    # right default; pass HOST=0.0.0.0 if you deliberately want to open a page on
    # your phone.
    host = os.environ.get('HOST')
    if host:
        server_address = (host, PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, CleanURLHandler)
    httpd.daemon_threads = True
    print(f"Serving HTTP on http://{server_address[0]}:{PORT} with Clean URL support...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        sys.exit(0)
