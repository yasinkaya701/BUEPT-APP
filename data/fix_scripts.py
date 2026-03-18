import json

def fix_and_run(script_name, json_file):
    with open(script_name, 'r') as f:
        code = f.read()
    
    code = code.replace("existing_ids = {item['id'] for item in data}", "existing_ids = {item.get('id') for item in data if item.get('id') is not None}")
    
    with open(script_name, 'w') as f:
        f.write(code)

    import subprocess
    result = subprocess.run(["python3", script_name], capture_output=True, text=True)
    print(f"{script_name}:\n{result.stdout}\n{result.stderr}")

fix_and_run('expand_writing.py', 'writing_prompts.json')
fix_and_run('expand_grammar.py', 'grammar_tasks.json')
fix_and_run('expand_reading.py', 'reading_tasks.json')
