import json
import random
import os

FILE_PATH = "BUEPTApp/data/test_english_vocab_items.json"
OUTPUT_PATH = "BUEPTApp/data/test_english_vocab_items_enhanced.json"

# Advanced Academic Synonyms and Collocations to inject
ACADEMIC_SYNONYMS = {
    "budget": ["financial allocation", "funding plan", "monetary quota", "expenditure model"],
    "afford": ["sustain financially", "bear the cost of", "underwrite", "finance"],
    "debt": ["financial liability", "outstanding obligation", "arrears", "fiscal deficit"],
    "income": ["revenue stream", "yield", "gross earnings", "financial intake"],
    "salary": ["remuneration", "compensation package", "stipend", "base wage"],
    "expense": ["expenditure", "outlay", "overhead", "disbursement"],
    "bargain": ["cost-effective acquisition", "advantageous transaction", "negotiated discount"],
    "refund": ["reimbursement", "financial restitution", "rebate", "recompense"],
    "borrow": ["acquire temporarily", "draw upon", "leverage funds", "incur a loan"],
    "lend": ["advance funds", "extend credit", "provide financing", "allocate resources"],
    "fee": ["tariff", "surcharge", "tuition premium", "service exactment"],
    "discount": ["price deduction", "markdown", "promotional concession", "rebate"],
    "deadline": ["time constraint", "submission cutoff", "target date", "temporal limit"],
    "revise": ["amend", "modify rigorously", "reevaluate", "refine"],
    "assignment": ["academic undertaking", "designated task", "coursework objective"],
    "attend": ["participate in", "be present at", "frequent", "engage with"],
    "participate": ["contribute actively", "engage collaboratively", "take part in", "cooperate"],
    "improve": ["ameliorate", "enhance significantly", "refine", "optimize"],
    "confident": ["self-assured", "poised", "certain", "resolute"],
    "feedback": ["constructive critique", "evaluative response", "appraisal", "assessment"],
    "commute": ["transit routine", "daily traversal", "regular journey", "travel pattern"],
    "delay": ["postponement", "deferral", "temporary suspension", "hiatus"],
    "platform": ["transit terminal", "departure stage", "station concourse"],
    "schedule": ["itinerary", "temporal framework", "timetable", "agenda"],
    "reliable": ["dependable", "trustworthy", "consistent", "infallible", "steadfast"],
    "efficient": ["streamlined", "optimized", "highly productive", "resourceful"],
    "available": ["accessible", "on hand", "obtainable", "at one's disposal"],
    "apply": ["submit credentials", "petition", "request formally", "exercise"],
    "qualify": ["meet prerequisites", "be eligible for", "fulfill criteria", "certify"],
    "promote": ["advocate", "foster", "elevate", "endorse", "champion"],
    "requirement": ["prerequisite", "stipulation", "mandatory condition", "imperative"],
    "estimate": ["projection", "approximate valuation", "forecast", "assessment"],
    "withdraw": ["retract", "extract funds", "disengage", "remove"],
    "deposit": ["lodge funds", "bank contribution", "financial placement"],
    "purchase": ["procure", "acquire", "obtain", "invest in"],
    "charge": ["levy", "exact payment", "impose a fee", "bill"],
    "value": ["intrinsic worth", "significance", "utility", "merit"],
    "profit": ["net gain", "financial return", "yield", "surplus"],
}

ACADEMIC_SENTENCES = {
    "budget": [
        "The university's annual budget strictly caps discretionary spending to prioritize research funding.",
        "A rigorous budget allocation is necessary to sustain long-term infrastructural growth."
    ],
    "afford": [
        "The current economic model cannot afford the inherent systemic inefficiencies of legacy infrastructure.",
        "To afford highly sophisticated diagnostic tools, the hospital requires substantial external investments."
    ],
    "debt": [
        "Accumulating immense national debt inevitably suppresses future macroeconomic mobility.",
        "The corporate restructuring was largely driven by an unsustainable ratio of mounting debt."
    ],
    "income": [
        "Diversifying income streams significantly mitigates vulnerability to sudden market fluctuations.",
        "A substantial drop in median household income often correlates with reduced consumer confidence."
    ],
    "revise": [
        "The author was compelled to rigorously revise the manuscript to address the peer reviewers' extensive critiques.",
        "In light of new evidence, scientists must constantly revise their prevailing theoretical models."
    ],
    "estimate": [
        "Conservative estimates suggest that sea levels could rise by over a meter within the next century.",
        "It is challenging to accurately estimate the multifaceted socio-economic impacts of rapid urbanization."
    ],
    "requirement": [
        "Mastery of advanced statistical analysis is a fundamental requirement for this macroeconomic research position.",
        "Meeting the stringent safety requirements was the paramount concern of the engineering consortium."
    ]
}

def enhance_data():
    if not os.path.exists(FILE_PATH):
        print(f"Error: Could not find {FILE_PATH}")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    enhancement_count = 0

    for idx, item in enumerate(data):
        word = item.get("word", "").lower()
        
        # Upgrade Level
        if item.get("level") == "A1" or item.get("level") == "A2":
             item["level"] = "B2"
        elif item.get("level") == "B1":
             item["level"] = "C1"
             
        # Enhance Synonyms
        existing_synonyms = item.get("synonyms", [])
        advanced_synonyms = ACADEMIC_SYNONYMS.get(word, [])
        if advanced_synonyms:
            # Merge and deduplicate
            merged_synonyms = list(set(existing_synonyms + advanced_synonyms))
            item["synonyms"] = merged_synonyms
            enhancement_count += 1
            
        # Enhance Examples
        existing_examples = item.get("examples", [])
        advanced_examples = ACADEMIC_SENTENCES.get(word, [])
        
        if advanced_examples:
            # Replace simple examples with advanced ones, or prepend them
            item["examples"] = advanced_examples + existing_examples
            # Cap at top 4 best examples
            item["examples"] = item["examples"][:4]
            enhancement_count += 1
            
        # Generic sentence escalator if not explicitly defined
        if not advanced_examples and word:
             generic_advanced = [
                 f"The comprehensive analysis explicitly demonstrated the profound impact of {word} within the contemporary academic framework.",
                 f"It is imperative to address the nuances of {word} when evaluating long-term systemic sustainability.",
                 f"Scholars have historically debated the precise utility of {word} in mitigating extraneous variables."
             ]
             # Only inject if the word looks like a noun/concept for the generic template to work relatively well
             if len(word) > 4:
                 item["examples"] = [generic_advanced[idx % len(generic_advanced)]] + existing_examples
                 item["examples"] = item["examples"][:3]

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully enhanced {len(data)} vocabulary items with {enhancement_count} explicit advanced dictionary injections.")

if __name__ == "__main__":
    enhance_data()
