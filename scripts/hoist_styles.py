#!/usr/bin/env python3
"""Move `const styles = StyleSheet.create({...})` blocks to the top of screen files
(after the import block) to avoid TDZ crashes with `export default function` components.
Template-literal-aware brace tracking (handles ${} nesting). Idempotent.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _hoist_core import find_styles_range, hoist_file

SCREENS_DIR = 'src/screens'
COMPONENTS_DIR = 'src/components'
EXTRAS = ['src/navigation/TabNavigator.js']

def walk(p):
    for root, _, files in os.walk(p):
        for fn in sorted(files):
            if fn.endswith('.js'):
                yield os.path.join(root, fn)

def main():
    changed = []
    for path in list(walk(SCREENS_DIR)) + list(walk(COMPONENTS_DIR)) + EXTRAS:
        if hoist_file(path):
            changed.append(path)
    print('hoisted styles in', len(changed), 'files')
    for f in changed:
        print(' -', f)

if __name__ == '__main__':
    main()
