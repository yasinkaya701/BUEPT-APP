#!/usr/bin/env python3
"""Verify every .js file under src/ parses as valid JS using node --check."""
import os
import subprocess
import sys

bad = []
for root, _, files in os.walk('src'):
    for fn in sorted(files):
        if not fn.endswith('.js'):
            continue
        path = os.path.join(root, fn)
        rc = subprocess.run(['node', '--check', path], capture_output=True).returncode
        if rc != 0:
            bad.append(path)
            print('INVALID:', path)
print('checked; invalid:', len(bad))
sys.exit(1 if bad else 0)
