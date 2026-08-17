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
    mode = None  # 'q' double, 's' single, 't' template, 'x' nested ${} expr
    tpl_stack = 0
    x_depth = 0
    x_depth_at = 0
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
                x_depth_at = depth
                x_depth = 0
                mode = 'x'
                j += 2
                continue
        elif mode == 'x':
            if ch == '\\':
                j += 2
                continue
            if ch == '{':
                x_depth += 1
            elif ch == '}':
                x_depth -= 1
                if x_depth == 0:
                    mode = 't'
            elif ch == '"':
                mode = 'xq'
            elif ch == "'":
                mode = 'xs'
            elif ch == '`':
                mode = 'xt'
        elif mode == 'xq':
            if ch == '\\':
                j += 2
                continue
            if ch == '"':
                mode = 'x'
        elif mode == 'xs':
            if ch == '\\':
                j += 2
                continue
            if ch == "'":
                mode = 'x'
        elif mode == 'xt':
            if ch == '\\':
                j += 2
                continue
            if ch == '`':
                mode = 'x'
            elif ch == '$' and j + 1 < len(src) and src[j + 1] == '{':
                x_depth += 1
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
                    # consume trailing whitespace + the `);` that closes StyleSheet.create({...});
                    k = j + 1
                    while k < len(src) and src[k] in ' \t':
                        k += 1
                    if k + 1 < len(src) and src[k:k + 2] == ');':
                        k += 2
                    elif k < len(src) and src[k] == ';':
                        k += 1
                    return (start, k, m.group(1))
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
    last_import = None
    pos = 0
    for line_m in re.finditer(r'^import .*?$', before, re.M):
        # start of a (possibly multi-line) import statement
        k = line_m.end()
        # consume continuation lines until the statement ends with `;` (strings aware)
        depth = 0
        in_str = None
        while k < len(before) and before[k] != ';':
            ch = before[k]
            if in_str:
                if ch == '\\':
                    k += 2
                    continue
                if ch == in_str:
                    in_str = None
                elif ch == '`' and in_str == 't':
                    in_str = None
            elif ch in '"\'`':
                in_str = 't' if ch == '`' else ch
            elif in_str is None and ch in '{([':
                depth += 1
            elif in_str is None and ch in '})]':
                depth -= 1
            elif in_str is None and ch == '\n':
                pass
            k += 1
        k += 1  # include the `;`
        last_import = k
    if last_import is None:
        return False
    stripped = block.rstrip('\n')
    new_src = (before[:last_import] + '\n\n' + stripped + '\n'
               + before[last_import:] + after)
    new_src = re.sub(r'\n{3,}', '\n\n', new_src)
    open(path, 'w').write(new_src)
    return True
