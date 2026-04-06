import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/academic_wordlist.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Common academic collocations/examples mapping
ENRICHMENTS = {
    "analyze": {"collocations": ["analyze data", "analyze results", "analyze trends"], "example": "Researchers must carefully analyze the data before drawing any conclusions."},
    "approach": {"collocations": ["modern approach", "theoretical approach", "practical approach"], "example": "The study adopts a multi-disciplinary approach to urban development."},
    "assess": {"collocations": ["assess impact", "assess performance", "assess risk"], "example": "It is difficult to assess the long-term impact of the new policy."},
    "available": {"collocations": ["readily available", "widely available", "publicly available"], "example": "The information is readily available on the university's website."},
    "benefit": {"collocations": ["mutual benefit", "significant benefit", "derive benefit"], "example": "The new trade agreement will bring significant benefits to both nations."},
    "concept": {"collocations": ["abstract concept", "key concept", "foundational concept"], "example": "Understanding this key concept is essential for mastering the subject."},
    "consist": {"collocations": ["consist of", "consist primarily", "consist essentially"], "example": "The committee consists of ten members from different departments."},
    "context": {"collocations": ["historical context", "social context", "provide context"], "example": "It is important to examine the event within its historical context."},
    "data": {"collocations": ["collect data", "raw data", "statistical data"], "example": "The scientists are still collecting raw data from the field experiments."},
    "economy": {"collocations": ["global economy", "stable economy", "market economy"], "example": "The global economy is currently facing unprecedented challenges."},
    "establish": {"collocations": ["establish facts", "establish relationship", "well-established"], "example": "The researchers aim to establish a clear relationship between diet and health."},
    "estimate": {"collocations": ["rough estimate", "conservative estimate", "reliable estimate"], "example": "This is a conservative estimate of the total project costs."},
    "factor": {"collocations": ["deciding factor", "contributing factor", "key factor"], "example": "Economic instability was a key factor in the company's downfall."},
    "identify": {"collocations": ["identify problems", "identify gaps", "correctly identify"], "example": "The audit helped identify several gaps in the security protocol."},
    "indicate": {"collocations": ["clearly indicate", "results indicate", "provide indication"], "example": "Recent studies clearly indicate a significant shift in consumer behavior."},
    "interpret": {"collocations": ["interpret results", "data interpretation", "misinterpret"], "example": "It is crucial not to misinterpret the findings of the preliminary report."},
    "issue": {"collocations": ["key issue", "address issue", "controversial issue"], "example": "The conference will address several key issues in climate science."},
    "method": {"collocations": ["effective method", "scientific method", "research method"], "example": "The scientific method requires rigorous testing and peer review."},
    "policy": {"collocations": ["public policy", "economic policy", "implement policy"], "example": "Developing an effective public policy takes years of research and debate."},
    "process": {"collocations": ["natural process", "complex process", "ongoing process"], "example": "Learning a new language is a complex and ongoing process."},
    "research": {"collocations": ["conduct research", "extensive research", "empirical research"], "example": "Extensive research has been conducted on the effects of sleep deprivation."},
    "significant": {"collocations": ["significant impact", "significant difference", "statistically significant"], "example": "The new drug has shown a statistically significant improvement in patients."},
    "theory": {"collocations": ["scientific theory", "theoretical framework", "prove theory"], "example": "The experiment was designed to test Einstein's scientific theory."},
}

# Apply enrichments and provide defaults for others
for item in data:
    word = item['word'].lower()
    if word in ENRICHMENTS:
        item.update(ENRICHMENTS[word])
    else:
        # Generic fill for others to ensure no 'empty' fields
        item['collocations'] = [f"use {word}", f"study {word}"] if 'collocations' not in item else item['collocations']
        item['example'] = f"The term '{word}' is frequently used in academic literature." if 'example' not in item else item['example']

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Enriched {len(data)} AWL words with collocations and example sentences.")
