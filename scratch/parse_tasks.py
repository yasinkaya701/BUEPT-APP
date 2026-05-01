import re
import json

def parse_docx_script(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    tasks = []
    current_task = None
    
    # Regex for sectionHeader("R1", 1, "THE PSYCHOLOGY OF PROCRASTINATION")
    header_pattern = re.compile(r'sectionHeader\("([^"]+)",\s*(\d+),\s*"([^"]+)"\)')
    
    # Split by sectionHeader to isolate tasks
    parts = header_pattern.split(content)
    
    # parts[0] is everything before the first task
    # parts[1:] will be [type, num, title, task_content, type, num, title, task_content, ...]
    
    for i in range(1, len(parts), 4):
        r_type = parts[i]
        r_num = parts[i+1]
        title = parts[i+2]
        task_content = parts[i+3]
        
        task_id = f"READ_{r_type}_{r_num.zfill(2)}"
        
        # Extract Paragraphs
        # paraNum("1", "Text content...")
        para_pattern = re.compile(r'paraNum\("(\d+)",\s*"([^"]+)"\)')
        paragraphs = para_pattern.findall(task_content)
        full_text = ""
        for p_num, p_text in paragraphs:
            full_text += f"[Paragraph {p_num}] {p_text}\n\n"
        
        # Extract Questions
        # qLine("1", "What is...?")
        # option("A", "Text", true)
        # answerBox("Answer", "C — explanation")
        
        questions = []
        
        # Split by qLine to isolate questions
        q_split_pattern = re.compile(r'qLine\("(\d+)",\s*"([^"]+)"\)')
        q_parts = q_split_pattern.split(task_content)
        
        for j in range(1, len(q_parts), 3):
            q_num = q_parts[j]
            q_text = q_parts[j+1]
            q_body = q_parts[j+2]
            
            # Identify question type
            # If it has options, it's MC
            # If it only has answerBox, it's short_answer
            
            opt_pattern = re.compile(r'option\("([^"]+)",\s*"([^"]+)"(?:,\s*true)?\)')
            options = opt_pattern.findall(q_body)
            
            # Find correct option (the one with true at the end)
            correct_opt_pattern = re.compile(r'option\("([^"]+)",\s*"([^"]+)",\s*true\)')
            correct_opt_match = correct_opt_pattern.search(q_body)
            
            # Find answerBox content
            ans_box_pattern = re.compile(r'answerBox\("([^"]+)",\s*"([^"]+)"\)')
            ans_boxes = ans_box_pattern.findall(q_body)
            
            q_type = "short_answer"
            answers = []
            
            if options:
                q_type = "multiple_choice"
                if correct_opt_match:
                    answers = [correct_opt_match.group(1)] # Just the letter A, B, C
                
                # Append options to question text for rendering if needed, 
                # but the app might expect them in a different field.
                # Actually, our reading_tasks.json format doesn't have an 'options' field 
                # for multiple_choice in the snippet I saw. 
                # Let's re-check the format.
                
                # Re-checking format from previous view_file:
                # { "type": "short_answer", "q": "...", "answer": ["..."], "skill": "..." }
                
                # If I want to support MC, I should include the options in the 'q' or add an 'options' field.
                # The existing JSON only showed short_answer.
                
                q_text_with_opts = q_text + "\n"
                for o_let, o_text in options:
                    q_text_with_opts += f"{o_let}) {o_text}\n"
                q_text = q_text_with_opts.strip()

            # For short_answer or explanation in answerBox
            if ans_boxes:
                # Usually ans_boxes[0][1] is the correct answer string
                # For MC, it might be "C — Explanation". We want "C" if it's MC.
                ans_str = ans_boxes[0][1]
                if q_type == "multiple_choice":
                    # Extract the first letter if it's like "C — ..."
                    match = re.match(r'^([A-D])\s*—', ans_str)
                    if match:
                        answers = [match.group(1)]
                    elif not answers:
                        answers = [ans_str]
                else:
                    answers = [ans_str]

            questions.append({
                "type": "short_answer", # Forcing short_answer for now as per current schema, 
                                      # but including options in the question text.
                "q": q_text,
                "answer": answers,
                "skill": "reading_comprehension"
            })
            
        tasks.append({
            "id": task_id,
            "title": title,
            "level": "B2" if r_type == "R1" else "C1",
            "sub_type": "careful_reading",
            "is_pro_book_style": True,
            "time": "45 min" if r_type == "R1" else "55 min",
            "text": full_text.strip(),
            "questions": questions
        })
        
    return tasks

if __name__ == "__main__":
    extracted_tasks = parse_docx_script("/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/scratch/user_docx_script.js")
    print(json.dumps(extracted_tasks, indent=4))
