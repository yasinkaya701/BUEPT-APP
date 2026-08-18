#!/usr/bin/env python3
"""Lazy-load the bottom-tab screens in TabNavigator so webpack splits them
into per-tab chunks instead of bundling all 8 tabs into the initial app chunk.
Converts `component={XScreen}` into `getComponent={() => React.lazy(...)}`.
"""
import re

FILE = 'src/navigation/TabNavigator.js'
TAB_SCREENS = [
    'HomeScreen', 'WritingScreen', 'VocabScreen', 'ListeningScreen',
    'SpeakingScreen', 'ReadingScreen', 'GrammarScreen', 'DeveloperScreen',
]

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Remove eager imports of tab screens
for name in TAB_SCREENS:
    src = re.sub(r"^import\s+%s\s+from\s+'(\.\./screens/%s[^']*)';\s*\n" % (name, name), '', src, flags=re.M)

# 2. Convert component={XScreen} → getComponent lazy
def repl(m):
    name = m.group(1)
    path = f'../screens/{name}'
    return (
        f"getComponent={{() => React.lazy(() => import("
        f"/* webpackChunkName: \"tab-{name}\" */ '{path}'))}} "
    )

src, count = re.subn(
    r"component=\{(HomeScreen|WritingScreen|VocabScreen|ListeningScreen|SpeakingScreen|ReadingScreen|GrammarScreen|DeveloperScreen)\}",
    repl, src,
)
print(f'converted {count} tab screens')

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
