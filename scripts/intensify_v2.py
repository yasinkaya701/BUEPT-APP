import json
import os
import re

ROOT_DIR = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp"
DATA_DIR = os.path.join(ROOT_DIR, "data")

ACADEMIC_TRANSFORMATIONS = {
    # Nominalization (Simplistic but effective for this context)
    r"Sleep is very important": "The physiological imperative of nocturnal rest is paramount",
    r"important for university students": "critical for the cognitive maintenance of tertiary-level scholars",
    r"Fast fashion refers to": "The paradigm of rapid-cycle textiles denotes",
    r"the mass production of cheap, trendy clothing": "the large-scale manufacturing of low-cost, ephemeral apparel",
    r"impact on the environment": "ecological externalities",
    r"climate volatility has made": "climatic instability has rendered",
    
    # Connector Escalation (V2)
    r"\bBut\b": "Conversely,",
    r"\bbut\b": "yet",
    r"\bSo\b": "Hence,",
    r"\bso\b": "thereby",
    r"\bAlso\b": "In addition,",
    r"\balso\b": "moreover",
    r"\bBecause\b": "Inasmuch as",
    r"\bbecause\b": "owing to the fact that",
    r"\bLike\b": "Such as",
    r"\blike\b": "notably",
    
    # Lexical Saturation (C2+)
    r"\bshow\b": "elucidate",
    r"\bshows\b": "elucidates",
    r"\bthink\b": "hypothesize",
    r"\bbad\b": "deleterious",
    r"\bgood\b": "salutary",
    r"\bhelp\b": "facilitate",
    r"\bneed\b": "necessitate",
    r"\buse\b": "utilize",
    r"\bmany\b": "a multitude of",
    r"\bvery\b": "exceedingly",
    r"\breal\b": "tangible",
    r"\btrue\b": "verifiable",
}

def beast_mode_transform(text):
    if not text: return text
    transformed = text
    for old, new in ACADEMIC_TRANSFORMATIONS.items():
        transformed = re.sub(old, new, transformed)
    
    # Dynamic syntax shift: "X is Y" -> "X remains Y" or "X constitutes Y"
    transformed = re.sub(r"(\w+) is (\w+)", r"\1 constitutes \2", transformed)
    # "X helps Y" -> "X facilitates Y"
    transformed = re.sub(r"(\w+) helps (\w+)", r"\1 facilitates \2", transformed)
    
    return transformed

def overhaul_vocab():
    path = os.path.join(DATA_DIR, "test_english_vocab_items.json")
    if not os.path.exists(path): return
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for item in data:
        # Extreme definitions
        if 'simple_definition' in item:
            # Shift definition to "academic_definition"
            item['simple_definition'] = beast_mode_transform(item['simple_definition'])
        
        # Institutional Examples
        if 'examples' in item:
            item['examples'] = [beast_mode_transform(ex) for ex in item['examples']]
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Overhauled 200+ Vocab items into Institutional Discourse.")

def rewrite_easy_tasks():
    path = os.path.join(DATA_DIR, "reading_tasks.json")
    if not os.path.exists(path): return
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for task in data:
        if task.get('id') == "r_p1_03": # Sleep
            task['title'] = "Circadian Rhythms and Cognitive Efficacy: A Neuro-Psychological Analysis"
            task['level'] = "C2"
            task['text'] = "The physiological imperative of nocturnal rest constitutes a paramount factor in the cognitive maintenance of tertiary-level scholars. During periods of somnolence, the cerebral cortex engages in complex data consolidation, meticulously organizing mnemonic traces and facilitating the retention of scholarly content. Scholastic performance remains exceedingly compromised in the absence of adequate rest, manifesting as diminished attentional capacity and physiological lethargy. Moreover, chronic sleep deprivation correlates with heightened psychological stress and affective dysregulation."
        
        elif task.get('id') == "r_p2_03": # Fast Fashion
            task['title'] = "The Socio-Ecological Externality of Rapid-Cycle Textiles"
            task['level'] = "C2"
            task['text'] = "The paradigm of rapid-cycle textiles denotes the large-scale manufacturing of low-cost, ephemeral apparel. This industry relies on the precipitous translation of runway trends into accessible commodities. While this model facilitates immediate consumer gratification, its ecological externalities remain profound. The production of cheap textiles necessitates an astronomical expenditure of hydraulic resources and the introduction of toxic chemical effluents into fluvial ecosystems. Furthermore, the transient nature of these garments facilitates an unsustainable global waste trajectory, with millions of tonnes of textile debris accumulating in landfills annually."

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Rewrote 'Sleep' and 'Fashion' tasks into C2 Academic Papers.")

if __name__ == "__main__":
    print("Initiating Beast Mode Intensification...")
    rewrite_easy_tasks()
    overhaul_vocab()
    print("Done.")
