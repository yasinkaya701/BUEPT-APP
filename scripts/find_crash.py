data = open('web-rnw/dist-odtu/app.450d8e56.js', encoding='utf-8', errors='replace').read()

# Error at 1691078 inside useMemo; caller function at 1691057.
# Walk backwards to find the enclosing function definition (likely an arrow fn
# passed to useMemo) and print context around 1691078.
start = 1691078
chunk = data[start:start+300]
print('AT ERROR:')
print(chunk[:300])
print()
# find previous function head by scanning backwards for 'useMemo('
idx = data.rfind('useMemo(', 1688000, 1691060)
print('nearest useMemo before error:', idx)
if idx != -1:
    # print the function passed: usually useMemo(() => ..., deps)
    seg = data[max(0, idx-600):idx+700]
    print(seg)

# search backwards for 'r=function' or 'function r(' near the error
for label in ['=function', 'const ', 'let ', 'var ']:
    for name in ['r(', 'a(', 'n(', 'e(', 'o(', 't(']:
        pass

# find nearest function definition containing offset 1691078
import re
# minified: component defs like 'function A(' or 'A=function(e){...}'
# scan backwards for '=function(' pattern
pos = 1691057
prev = data.rfind('=function(', max(0, pos-30000), pos)
print('=function( head at', prev)
if prev != -1:
    seg = data[max(0,prev-50):prev+150]
    print(seg)

# also print context around 1691057
print()
print('CONTEXT at 1691000-1691120:')
print(data[1691000:1691120])
