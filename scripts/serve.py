#!/usr/bin/env python3
"""Local preview server with caching disabled.

`python3 -m http.server` sends no Cache-Control, so Chrome heuristically caches the ES modules and
you can end up testing a stale scene.js. This one sends `Cache-Control: no-store` on everything.

    python3 scripts/serve.py            # http://127.0.0.1:8931/
    python3 scripts/serve.py 8080
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quiet
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8931
    ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
