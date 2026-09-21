#!/usr/bin/env python3
"""Check every public URL on researcher profiles; used locally and by weekly CI."""
import concurrent.futures
import json
import subprocess
import socket
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
expression = "import('./data/researchers-data.js').then(({researchers})=>console.log(JSON.stringify([...new Set(researchers.flatMap(r=>[r.institutionUrl,...Object.values(r.links||{}),...(r.recentPapers||[]).map(p=>p.url),...(r.interviewClips||[]).map(c=>c.url)]).filter(Boolean))])))"
urls = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', expression], cwd=ROOT, text=True))


def check(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; ReincarnatedAI-LinkCheck/1.0; +https://reincarnatedai.com/researchers)'})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            final = response.url
            if any(marker in final.lower() for marker in ('/login', '/signin', '/challenge', '/dam/?next=')):
                return 'BROKEN', url, f'redirected to {final}'
            return 'OK', url, str(response.status)
    except urllib.error.HTTPError as error:
        if error.code in (404, 410):
            return 'BROKEN', url, f'HTTP {error.code}'
        return 'REVIEW', url, f'HTTP {error.code}'
    except urllib.error.URLError as error:
        if isinstance(error.reason, socket.gaierror):
            return 'BROKEN', url, f'DNS error: {error.reason}'
        return 'REVIEW', url, f'Connection error: {error.reason}'
    except Exception as error:
        return 'REVIEW', url, f'{type(error).__name__}: {error}'


with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(check, urls))
for status, url, detail in results:
    if status != 'OK':
        print(f'{status}: {url} — {detail}')
counts = {status: sum(result[0] == status for result in results) for status in ('OK', 'BROKEN', 'REVIEW')}
print(f"Checked {len(urls)} unique URLs: {counts['OK']} OK, {counts['BROKEN']} broken, {counts['REVIEW']} require review.")
raise SystemExit(1 if counts['BROKEN'] else 0)
