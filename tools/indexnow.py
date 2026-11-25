#!/usr/bin/env python3
"""Tell Bing (and Yandex, Seznam, Naver) that the site changed, via IndexNow.

Bing's index feeds Microsoft Copilot and part of ChatGPT search, so this speeds
up how fast AI assistants see new content. Run it AFTER the site is live:

    python3 tools/indexnow.py
"""
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from build import INDEXNOW_KEY, LANGS, RENDER, SITE, Page  # noqa: E402

urls = [Page(l, s).url(s, l) for s in RENDER for l in LANGS]
urls += [f"{SITE}/llms.txt", f"{SITE}/llms-full.txt"]
body = json.dumps({"host": SITE.split("//")[1], "key": INDEXNOW_KEY,
                   "keyLocation": f"{SITE}/{INDEXNOW_KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                             headers={"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req, timeout=30) as r:
    print(f"IndexNow: HTTP {r.status} for {len(urls)} URLs")
