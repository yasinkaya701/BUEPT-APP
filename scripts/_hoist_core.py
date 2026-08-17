"""JS-aware brace tracker: handles strings (single/double/template) and
${...} nesting inside template literals."""
import re

def find_styles_range(src):
    m = re.search(r'^([ \t]*)const styles = StyleSheet\.create\(\s*\{', src, re.M)
    if not m:
        return None
    start = m.start()
    brace_start = src.index('{', m.end() - 1)
    depth = 0
    mode = None  # 'q' double, 's' single, 't' template
    tpl_stack = 0
    j = brace_start
    while j < len(src):
        ch = src[j]
        if mode == 'q':
            if ch == '\\':
                j += 2
                continue
            if ch == '"':
                mode = None
        elif mode == 's':
            if ch == '\\':
                j += 2
                continue
            if ch == "'":
                mode = None
        elif mode == 't':
            if ch == '\\':
                j += 2
                continue
            if ch == '`':
                tpl_stack -= 1
                mode = tpl_stack if tpl_stack else None
            elif ch == '$' and j + 1 < len(src) and src[j + 1] == '{':
                depth += 1
        else:
            if ch == '"':
                mode = 'q'
            elif ch == "'":
                mode = 's'
            elif ch == '`':
                tpl_stack += 1
                mode = 't'
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return (start, j + 1, m.group(1))
        j += 1
    return None

def hoist_file(path):
    src = open(path).read()
    r = find_styles_range(src)
    if r is None:
        return False
    start, end, indent = r
    block = src[start:end]
    before, after = src[:start], src[end:]
    import_pattern = re.compile(r"^import .*?$", re.M)
    last_import = None
    for m in import_pattern.finditer(before):
        last_import = m.end()
    if last_import is None:
        return False
    stripped = block.rstrip('\n')
    new_src = (before[:last_import] + '\n\n' + stripped + '\n'
               + before[last_import:] + after)
    new_src = re.sub(r'\n{3,}', '\n\n', new_src)
    open(path, 'w').write(new_src)
    return True
