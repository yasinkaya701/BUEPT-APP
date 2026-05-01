import json
import os

PATHS = [
    '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/test_english_vocab_items.json',
    '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/academic_wordlist.json'
]

# High-fidelity data for top academic words
ENRICHMENT_MAP = {
    "analyze": {
        "word_type": "verb",
        "synonyms": ["examine", "scrutinize", "investigate", "inspect"],
        "antonyms": ["synthesize", "ignore", "neglect"],
        "derivatives": ["analysis (n)", "analyst (n)", "analytical (adj)", "analytically (adv)"],
        "family": {"noun": ["analysis", "analyst"], "verb": ["analyze"], "adjective": ["analytical"], "adverb": ["analytically"]}
    },
    "establish": {
        "word_type": "verb",
        "synonyms": ["found", "institute", "create", "set up"],
        "antonyms": ["abolish", "destroy", "disrupt"],
        "derivatives": ["establishment (n)", "established (adj)"],
        "family": {"noun": ["establishment"], "verb": ["establish"], "adjective": ["established"]}
    },
    "significant": {
        "word_type": "adjective",
        "synonyms": ["important", "substantial", "noteworthy", "considerable"],
        "antonyms": ["insignificant", "trivial", "minor"],
        "derivatives": ["significance (n)", "significantly (adv)"],
        "family": {"noun": ["significance"], "adjective": ["significant"], "adverb": ["significantly"]}
    },
    "approach": {
        "word_type": "noun/verb",
        "synonyms": ["method", "strategy", "perspective", "advance"],
        "antonyms": ["retreat", "departure"],
        "derivatives": ["approachable (adj)"],
        "family": {"noun": ["approach"], "verb": ["approach"], "adjective": ["approachable"]}
    },
    "alleviate": {
        "word_type": "verb",
        "synonyms": ["relieve", "ease", "mitigate", "assuage"],
        "antonyms": ["aggravate", "exacerbate", "worsen"],
        "derivatives": ["alleviation (n)"],
        "family": {"noun": ["alleviation"], "verb": ["alleviate"]}
    },
    "comprehensive": {
        "word_type": "adjective",
        "synonyms": ["complete", "thorough", "exhaustive", "all-inclusive"],
        "antonyms": ["partial", "incomplete", "limited"],
        "derivatives": ["comprehensively (adv)", "comprehension (n)"],
        "family": {"noun": ["comprehension"], "adjective": ["comprehensive"], "adverb": ["comprehensively"]}
    },
    "advocate": {
        "word_type": "noun/verb",
        "synonyms": ["proponent", "supporter", "champion", "uphold"],
        "antonyms": ["opponent", "critic", "oppose"],
        "derivatives": ["advocacy (n)"],
        "family": {"noun": ["advocacy", "advocate"], "verb": ["advocate"]}
    },
    "ambiguous": {
        "word_type": "adjective",
        "synonyms": ["vague", "equivocal", "uncertain", "obscure"],
        "antonyms": ["clear", "explicit", "unambiguous", "lucid"],
        "derivatives": ["ambiguity (n)", "ambiguously (adv)"],
        "family": {"noun": ["ambiguity"], "adjective": ["ambiguous"], "adverb": ["ambiguously"]}
    },
    "arbitrary": {
        "word_type": "adjective",
        "synonyms": ["random", "chance", "capricious", "erratic"],
        "antonyms": ["rational", "logical", "systematic", "consistent"],
        "derivatives": ["arbitrarily (adv)", "arbitrariness (n)"],
        "family": {"noun": ["arbitrariness"], "adjective": ["arbitrary"], "adverb": ["arbitrarily"]}
    },
    "coherent": {
        "word_type": "adjective",
        "synonyms": ["logical", "consistent", "rational", "cogent"],
        "antonyms": ["incoherent", "confused", "muddled"],
        "derivatives": ["coherence (n)", "coherently (adv)"],
        "family": {"noun": ["coherence"], "adjective": ["coherent"], "adverb": ["coherently"]}
    },
    "contradict": {
        "word_type": "verb",
        "synonyms": ["deny", "refute", "counter", "oppose"],
        "antonyms": ["confirm", "agree", "support", "verify"],
        "derivatives": ["contradiction (n)", "contradictory (adj)"],
        "family": {"noun": ["contradiction"], "verb": ["contradict"], "adjective": ["contradictory"]}
    },
    "correlate": {
        "word_type": "verb",
        "synonyms": ["connect", "associate", "relate", "link"],
        "antonyms": ["disconnect", "separate", "differ"],
        "derivatives": ["correlation (n)", "correlated (adj)"],
        "family": {"noun": ["correlation"], "verb": ["correlate"], "adjective": ["correlated"]}
    },
    "depict": {
        "word_type": "verb",
        "synonyms": ["portray", "describe", "illustrate", "represent"],
        "antonyms": ["distort", "misrepresent", "hide"],
        "derivatives": ["depiction (n)"],
        "family": {"noun": ["depiction"], "verb": ["depict"]}
    },
    "deviate": {
        "word_type": "verb",
        "synonyms": ["diverge", "stray", "depart", "digress"],
        "antonyms": ["conform", "adhere", "continue"],
        "derivatives": ["deviation (n)", "deviant (adj/n)"],
        "family": {"noun": ["deviation", "deviant"], "verb": ["deviate"], "adjective": ["deviant"]}
    },
    "disseminate": {
        "word_type": "verb",
        "synonyms": ["spread", "circulate", "distribute", "propagate"],
        "antonyms": ["collect", "gather", "suppress"],
        "derivatives": ["dissemination (n)"],
        "family": {"noun": ["dissemination"], "verb": ["disseminate"]}
    },
    "elucidate": {
        "word_type": "verb",
        "synonyms": ["explain", "clarify", "illuminate", "explicate"],
        "antonyms": ["confuse", "obscure", "muddy"],
        "derivatives": ["elucidation (n)"],
        "family": {"noun": ["elucidation"], "verb": ["elucidate"]}
    },
    "empirical": {
        "word_type": "adjective",
        "synonyms": ["observed", "factual", "experimental", "practical"],
        "antonyms": ["theoretical", "speculative", "abstract"],
        "derivatives": ["empirically (adv)", "empiricism (n)"],
        "family": {"noun": ["empiricism"], "adjective": ["empirical"], "adverb": ["empically"]}
    },
    "facet": {
        "word_type": "noun",
        "synonyms": ["aspect", "feature", "side", "characteristic"],
        "antonyms": ["whole", "totality"],
        "derivatives": ["faceted (adj)"],
        "family": {"noun": ["facet"], "adjective": ["faceted"]}
    },
    "formidable": {
        "word_type": "adjective",
        "synonyms": ["daunting", "intimidating", "impressive", "powerful"],
        "antonyms": ["weak", "frail", "easy", "negligible"],
        "derivatives": ["formidably (adv)"],
        "family": {"adjective": ["formidable"], "adverb": ["formidably"]}
    },
    "implicit": {
        "word_type": "adjective",
        "synonyms": ["implied", "unstated", "tacit", "inherent"],
        "antonyms": ["explicit", "direct", "stated"],
        "derivatives": ["implicitly (adv)", "imply (v)"],
        "family": {"verb": ["imply"], "adjective": ["implicit"], "adverb": ["implicitly"]}
    },
    "manifest": {
        "word_type": "adj/verb/noun",
        "synonyms": ["obvious", "evident", "display", "show"],
        "antonyms": ["hidden", "concealed", "obscure"],
        "derivatives": ["manifestation (n)", "manifestly (adv)"],
        "family": {"noun": ["manifestation"], "verb": ["manifest"], "adjective": ["manifest"], "adverb": ["manifestly"]}
    }
}

def enrich_data(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for item in data:
        word = item.get('word', '').lower()
        if word in ENRICHMENT_MAP:
            enrichment = ENRICHMENT_MAP[word]
            item['word_type'] = enrichment['word_type']
            item['synonyms'] = enrichment.get('synonyms', item.get('synonyms', []))
            item['antonyms'] = enrichment.get('antonyms', item.get('antonyms', []))
            item['derivatives'] = enrichment.get('derivatives', [])
            item['family'] = enrichment.get('family', {})
            # Ensure pronunciation trigger exists (handled by TTS in UI, but we can add IPA if needed)
            item['pronunciation'] = f"/{word}/" 

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"Enriched {os.path.basename(path)}")

if __name__ == "__main__":
    for p in PATHS:
        enrich_data(p)
