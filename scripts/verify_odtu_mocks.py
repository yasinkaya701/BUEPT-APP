import re

src = open('src/data/offlineMocksOdtu.js', encoding='utf-8').read()

for m in re.finditer(r'const odtu(\d)\s*=\s*\{', src):
    n = m.group(1)
    start = m.end()
    depth = 1
    i = start
    while i < len(src) and depth > 0:
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
        i += 1
    body = src[start:i]
    # sections: objects with id field inside exam sections array
    sections = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"]', body)
    mc = len(re.findall(r'type:\s*[\'"]multiple_choice[\'"]', body))
    sa = len(re.findall(r'type:\s*[\'"]short_answer[\'"]', body))
    print(f"odtu{n}: fields={sections[:12]}... mc={mc} sa={sa}")
