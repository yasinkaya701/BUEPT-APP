#!/usr/bin/env python3
"""Convert `getComponent={() => require('../screens/X').default}` registrations
to `getComponent={() => React.lazy(() => import(/* webpackChunkName */ '../screens/X'))}`
so webpack can code-split every screen. The @react-native babel preset flattens
require() call expressions, killing code splitting; dynamic import() survives.
"""
import re
import sys

FILE = 'src/navigation/RootNavigator.js'


def main():
    with open(FILE, 'r', encoding='utf-8') as f:
        src = f.read()

    pattern = re.compile(
        r"getComponent=\{\(\) => require\((['\"])(\.\./screens/[\w\-./]+?)\1\)\.default\}"
    )

    seen = set()

    def repl(m):
        quote = m.group(1)
        mod = m.group(2)
        name = mod.split('/')[-1]
        seen.add(name)
        return (
            f"getComponent={{() => React.lazy(() => import("
            f"/* webpackChunkName: \"screen-{name}\" */ {quote}{mod}{quote}"
            f"))}}"
        )

    new_src, count = pattern.subn(repl, src)
    if count == 0:
        print('no matches found — check pattern')
        sys.exit(1)

    # Ensure `const React = require('react')` or import exists. RootNavigator
    # imports react at top: `import React from 'react'` — React.lazy available.

    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(new_src)
    print(f'rewrote {count} getComponent registrations; {len(seen)} screens: {sorted(seen)}')


if __name__ == '__main__':
    main()
