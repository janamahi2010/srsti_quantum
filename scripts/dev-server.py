#!/usr/bin/env python3
"""
Local preview server that mimics Render's clean-URL rewrites (_redirects
file, 200-style rewrites) so pages like /about work the same locally as
they will on the deployed site. Regular tools like VS Code Live Server
don't understand _redirects, so use this instead when you need to test
clean URLs. For quick everyday edits, Live Server / double-clicking the
HTML files still works fine (it'll just show .html in the address bar).
"""
import http.server
import os
import threading
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        self._rewrite()
        super().do_GET()

    def do_HEAD(self):
        self._rewrite()
        super().do_HEAD()

    def _rewrite(self):
        base, _, query = self.path.partition('?')
        if base == '/' or base == '':
            return
        fs_path = self.translate_path(base)
        if os.path.exists(fs_path):
            return
        html_fs_path = fs_path + '.html'
        if os.path.exists(html_fs_path):
            self.path = base + '.html' + (('?' + query) if query else '')


def main():
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), CleanURLHandler) as httpd:
        url = 'http://127.0.0.1:%d/' % PORT
        print('Srsti Quantum local preview (clean URLs enabled) running at', url)
        print('Press Ctrl+C to stop.')
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nStopped.')


if __name__ == '__main__':
    main()
