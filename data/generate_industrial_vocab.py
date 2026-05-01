import json
import os

# Paths
VOCAB_FILE = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/test_english_vocab_items.json'

def generate_industrial_vocab():
    # Massive high-quality vocabulary bank aligned with BUEPT/Spring Book standards
    # Focus: Academic verbs, connectors, complex nouns, and common collocations
    
    new_items = [
        # --- B2/C1 Academic Core ---
        {
            "word": "Compelling",
            "word_type": "adjective",
            "level": "C1",
            "topic": "Academic Reasoning",
            "simple_definition": "Evoking interest, attention, or admiration in a powerfully irresistible way.",
            "synonyms": ["convincing", "persuasive", "powerful", "cogent"],
            "antonyms": ["weak", "unconvincing", "dull"],
            "collocations": ["compelling evidence", "compelling argument", "compelling reason"],
            "examples": ["The researchers provided compelling evidence to support their hypothesis.", "The documentary offers a compelling look at the effects of climate change."]
        },
        {
            "word": "Mitigate",
            "word_type": "verb",
            "level": "B2",
            "topic": "Problem Solving",
            "simple_definition": "To make something less severe, serious, or painful.",
            "synonyms": ["alleviate", "reduce", "diminish", "lessen"],
            "antonyms": ["aggravate", "intensify", "worsen"],
            "collocations": ["mitigate the impact", "mitigate risks", "mitigate effects"],
            "examples": ["New technologies are being developed to mitigate the impact of pollution.", "The government implemented measures to mitigate the economic crisis."]
        },
        {
            "word": "Inherent",
            "word_type": "adjective",
            "level": "C1",
            "topic": "Philosophy & Science",
            "simple_definition": "Existing in something as a permanent, essential, or characteristic attribute.",
            "synonyms": ["intrinsic", "innate", "fundamental", "essential"],
            "antonyms": ["extrinsic", "acquired", "superficial"],
            "collocations": ["inherent risk", "inherent danger", "inherent value"],
            "examples": ["There are inherent risks in any investment.", "The right to free speech is inherent in a democratic society."]
        },
        {
            "word": "Substantiate",
            "word_type": "verb",
            "level": "C1",
            "topic": "Research",
            "simple_definition": "To provide evidence to support or prove the truth of something.",
            "synonyms": ["verify", "corroborate", "validate", "confirm"],
            "antonyms": ["disprove", "refute", "contradict"],
            "collocations": ["substantiate claims", "substantiate allegations", "substantiate findings"],
            "examples": ["The witness was unable to substantiate his claims with any physical evidence.", "Further research is needed to substantiate these preliminary findings."]
        },
        {
            "word": "Prevalent",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Society",
            "simple_definition": "Widespread in a particular area or at a particular time.",
            "synonyms": ["common", "widespread", "ubiquitous", "rampant"],
            "antonyms": ["rare", "uncommon", "scant"],
            "collocations": ["prevalent view", "prevalent condition", "highly prevalent"],
            "examples": ["The use of social media is prevalent among teenagers.", "This disease is more prevalent in tropical climates."]
        },
        {
            "word": "Advocate",
            "word_type": "verb",
            "level": "B2",
            "topic": "Politics & Law",
            "simple_definition": "To publicly recommend or support a particular cause or policy.",
            "synonyms": ["support", "champion", "promote", "urge"],
            "antonyms": ["oppose", "criticize", "condemn"],
            "collocations": ["advocate for change", "strongly advocate", "legal advocate"],
            "examples": ["The organization advocates for the rights of refugees.", "Many doctors advocate a healthy diet and regular exercise."]
        },
        {
            "word": "Ambiguous",
            "word_type": "adjective",
            "level": "C1",
            "topic": "Language",
            "simple_definition": "Open to more than one interpretation; not having one obvious meaning.",
            "synonyms": ["equivocal", "vague", "unclear", "obscure"],
            "antonyms": ["clear", "explicit", "unambiguous"],
            "collocations": ["ambiguous statement", "ambiguous meaning", "highly ambiguous"],
            "examples": ["The ending of the movie was deliberately ambiguous.", "His response to the question was rather ambiguous."]
        },
        {
            "word": "Facilitate",
            "word_type": "verb",
            "level": "B2",
            "topic": "Management",
            "simple_definition": "To make an action or process easy or easier.",
            "synonyms": ["ease", "assist", "help", "expedite"],
            "antonyms": ["hinder", "block", "impede"],
            "collocations": ["facilitate learning", "facilitate growth", "facilitate communication"],
            "examples": ["The new software is designed to facilitate communication between departments.", "The teacher's role is to facilitate the learning process."]
        },
        {
            "word": "Plausible",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Logic",
            "simple_definition": "Seeming reasonable or probable.",
            "synonyms": ["credible", "believable", "reasonable", "tenable"],
            "antonyms": ["implausible", "unlikely", "absurd"],
            "collocations": ["plausible explanation", "perfectly plausible", "plausible scenario"],
            "examples": ["The detective dismissed the suspect's story, even though it sounded plausible.", "A plausible explanation for the phenomenon has yet to be found."]
        },
        {
            "word": "Obscure",
            "word_type": "adjective",
            "level": "C1",
            "topic": "General Academic",
            "simple_definition": "Not discovered or known about; uncertain.",
            "synonyms": ["unknown", "hidden", "unclear", "arcane"],
            "antonyms": ["famous", "clear", "obvious"],
            "collocations": ["obscure reference", "obscure origin", "remain obscure"],
            "examples": ["The origins of the manuscript remain obscure.", "He made an obscure reference to a 19th-century philosopher."]
        },
        # Add 20 more BUEPT-essential items
        {
            "word": "Allocate",
            "word_type": "verb",
            "level": "B2",
            "topic": "Economics",
            "simple_definition": "To distribute resources or duties for a particular purpose.",
            "synonyms": ["assign", "distribute", "allot", "apportion"],
            "antonyms": ["withhold", "keep", "collect"],
            "collocations": ["allocate resources", "allocate funds", "allocate time"],
            "examples": ["The government has allocated more funds to education.", "We need to allocate our resources more efficiently."]
        },
        {
            "word": "Conventional",
            "word_type": "adjective",
            "level": "B1",
            "topic": "Culture",
            "simple_definition": "Based on or in accordance with what is generally done or believed.",
            "synonyms": ["traditional", "standard", "normal", "customary"],
            "antonyms": ["unconventional", "radical", "original"],
            "collocations": ["conventional wisdom", "conventional methods", "conventional medicine"],
            "examples": ["She chose a conventional career path in accounting.", "Conventional medicine was unable to help her condition."]
        },
        {
            "word": "Discrepancy",
            "word_type": "noun",
            "level": "C1",
            "topic": "Business/Finance",
            "simple_definition": "An illogical or surprising lack of compatibility or similarity between two or more facts.",
            "synonyms": ["inconsistency", "variance", "difference", "divergence"],
            "antonyms": ["similarity", "consistency", "accord"],
            "collocations": ["huge discrepancy", "financial discrepancy", "noticeable discrepancy"],
            "examples": ["There was a huge discrepancy between the two reports.", "The audit revealed several financial discrepancies."]
        },
        {
            "word": "Empirical",
            "word_type": "adjective",
            "level": "C1",
            "topic": "Science",
            "simple_definition": "Based on, concerned with, or verifiable by observation or experience rather than theory or pure logic.",
            "synonyms": ["observed", "practical", "experimental", "factual"],
            "antonyms": ["theoretical", "speculative", "conjectural"],
            "collocations": ["empirical evidence", "empirical study", "empirical data"],
            "examples": ["The researchers collected empirical data to test their hypothesis.", "There is little empirical evidence to support this claim."]
        },
        {
            "word": "Fluctuate",
            "word_type": "verb",
            "level": "B2",
            "topic": "Economics/Science",
            "simple_definition": "To rise and fall irregularly in number or amount.",
            "synonyms": ["vary", "waver", "oscillate", "shift"],
            "antonyms": ["stabilize", "remain constant", "stay"],
            "collocations": ["fluctuate wildly", "fluctuating prices", "fluctuating temperatures"],
            "examples": ["Oil prices have fluctuated wildly over the past year.", "The temperature fluctuates between day and night."]
        },
        {
            "word": "Hypothesis",
            "word_type": "noun",
            "level": "B2",
            "topic": "Science",
            "simple_definition": "A proposed explanation made on the basis of limited evidence as a starting point for further investigation.",
            "synonyms": ["theory", "thesis", "proposition", "assumption"],
            "antonyms": ["fact", "proof", "certainty"],
            "collocations": ["test a hypothesis", "working hypothesis", "null hypothesis"],
            "examples": ["The scientist developed a hypothesis to explain the results of the experiment.", "We need to conduct more research to test this hypothesis."]
        },
        {
            "word": "Implicit",
            "word_type": "adjective",
            "level": "C1",
            "topic": "Communication",
            "simple_definition": "Suggested though not directly expressed.",
            "synonyms": ["implied", "indirect", "tacit", "unspoken"],
            "antonyms": ["explicit", "direct", "clear"],
            "collocations": ["implicit trust", "implicit meaning", "implicit assumption"],
            "examples": ["There was an implicit agreement between the two companies.", "The speaker's message was implicit rather than explicit."]
        },
        {
            "word": "Levy",
            "word_type": "verb",
            "level": "B2",
            "topic": "Economics/Law",
            "simple_definition": "To impose (a tax, fee, or fine).",
            "synonyms": ["impose", "charge", "tax", "exact"],
            "antonyms": ["waive", "remit", "cancel"],
            "collocations": ["levy a tax", "levy a fine", "heavily levied"],
            "examples": ["The government decided to levy a new tax on luxury goods.", "The company was levied a heavy fine for polluting the river."]
        },
        {
            "word": "Paradigm",
            "word_type": "noun",
            "level": "C1",
            "topic": "Philosophy/Science",
            "simple_definition": "A typical example or pattern of something; a model.",
            "synonyms": ["model", "example", "pattern", "standard"],
            "antonyms": ["anomaly", "exception", "deviation"],
            "collocations": ["paradigm shift", "dominant paradigm", "scientific paradigm"],
            "examples": ["The discovery of DNA led to a paradigm shift in biology.", "This model represents the dominant paradigm in economic theory."]
        },
        {
            "word": "Rigorous",
            "word_type": "adjective",
            "level": "C1",
            "topic": "Academic Standard",
            "simple_definition": "Extremely thorough, exhaustive, or accurate.",
            "synonyms": ["thorough", "strict", "stringent", "meticulous"],
            "antonyms": ["loose", "careless", "superficial"],
            "collocations": ["rigorous testing", "rigorous analysis", "rigorous standards"],
            "examples": ["The new drug underwent rigorous testing before being approved.", "The researchers followed a rigorous methodology."]
        },
        {
            "word": "Abstract",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Logic",
            "simple_definition": "Existing in thought or as an idea but not having a physical or concrete existence.",
            "synonyms": ["theoretical", "conceptual", "notional", "intellectual"],
            "antonyms": ["concrete", "physical", "real"],
            "collocations": ["abstract concept", "abstract idea", "abstract reasoning"],
            "examples": ["Truth and beauty are abstract concepts.", "The theory is too abstract for most people to understand."]
        },
        {
            "word": "Coherent",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Writing",
            "simple_definition": "Logical and consistent.",
            "synonyms": ["logical", "consistent", "rational", "orderly"],
            "antonyms": ["incoherent", "confused", "illogical"],
            "collocations": ["coherent argument", "coherent strategy", "coherent explanation"],
            "examples": ["He proposed a coherent plan for the company's future.", "The essay lacks a coherent structure."]
        },
        {
            "word": "Explicit",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Communication",
            "simple_definition": "Stated clearly and in detail, leaving no room for confusion or doubt.",
            "synonyms": ["clear", "direct", "plain", "overt"],
            "antonyms": ["implicit", "vague", "ambiguous"],
            "collocations": ["explicit instructions", "explicit detail", "make it explicit"],
            "examples": ["The speaker gave explicit instructions on how to proceed.", "The terms of the contract were made explicit."]
        },
        {
            "word": "Fundamental",
            "word_type": "adjective",
            "level": "B1",
            "topic": "General Academic",
            "simple_definition": "Forming a necessary base or core; of central importance.",
            "synonyms": ["basic", "essential", "core", "primary"],
            "antonyms": ["secondary", "minor", "trivial"],
            "collocations": ["fundamental right", "fundamental change", "fundamental principle"],
            "examples": ["Freedom of speech is a fundamental human right.", "The new law will lead to fundamental changes in the legal system."]
        },
        {
            "word": "Infer",
            "word_type": "verb",
            "level": "B2",
            "topic": "Reasoning",
            "simple_definition": "Deduce or conclude (information) from evidence and reasoning rather than from explicit statements.",
            "synonyms": ["deduce", "conclude", "surmise", "gather"],
            "antonyms": ["state", "declare", "misinterpret"],
            "collocations": ["infer from", "reasonably infer", "infer meaning"],
            "examples": ["What can you infer from the author's tone?", "It is possible to infer a lot about a person from their body language."]
        },
        {
            "word": "Liaise",
            "word_type": "verb",
            "level": "C1",
            "topic": "Business/Organization",
            "simple_definition": "Establish a working relationship, typically in order to cooperate on a matter of mutual concern.",
            "synonyms": ["coordinate", "communicate", "collaborate", "connect"],
            "antonyms": ["disconnect", "isolate", "ignore"],
            "collocations": ["liaise with", "directly liaise", "liaison officer"],
            "examples": ["The marketing department needs to liaise closely with sales.", "She will liaise with the local authorities on our behalf."]
        },
        {
            "word": "Manifest",
            "word_type": "verb",
            "level": "C1",
            "topic": "Psychology/Science",
            "simple_definition": "Display or show (a quality or feeling) by one's acts or appearance; demonstrate.",
            "synonyms": ["display", "show", "exhibit", "demonstrate"],
            "antonyms": ["hide", "conceal", "obscure"],
            "collocations": ["manifest itself", "manifest symptoms", "clearly manifest"],
            "examples": ["The disease can manifest itself in various ways.", "His anger manifested itself in his aggressive behavior."]
        },
        {
            "word": "Precise",
            "word_type": "adjective",
            "level": "B1",
            "topic": "General Academic",
            "simple_definition": "Marked by exactness and accuracy of expression or detail.",
            "synonyms": ["exact", "accurate", "specific", "meticulous"],
            "antonyms": ["vague", "imprecise", "approximate"],
            "collocations": ["precise detail", "precise location", "highly precise"],
            "examples": ["We need more precise information before we can make a decision.", "The measurements were extremely precise."]
        },
        {
            "word": "Relevant",
            "word_type": "adjective",
            "level": "A2",
            "topic": "General",
            "simple_definition": "Closely connected or appropriate to what is being done or considered.",
            "synonyms": ["pertinent", "applicable", "related", "germane"],
            "antonyms": ["irrelevant", "unrelated", "inapplicable"],
            "collocations": ["relevant information", "highly relevant", "relevant experience"],
            "examples": ["Please provide any relevant information you may have.", "His experience is highly relevant to the job."]
        },
        {
            "word": "Subsequent",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Time",
            "simple_definition": "Coming after something in time; following.",
            "synonyms": ["following", "later", "successive", "ensuing"],
            "antonyms": ["previous", "prior", "preceding"],
            "collocations": ["subsequent events", "subsequent years", "subsequent to"],
            "examples": ["Subsequent events proved him right.", "In subsequent years, the company expanded rapidly."]
        },
        {
            "word": "Pragmatic",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Logic",
            "simple_definition": "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
            "synonyms": ["practical", "realistic", "sensible", "down-to-earth"],
            "antonyms": ["idealistic", "theoretical", "impractical"],
            "collocations": ["pragmatic approach", "pragmatic solution", "highly pragmatic"],
            "examples": ["We need a pragmatic solution to this problem.", "He took a pragmatic view of the situation."]
        },
        {
            "word": "Resilient",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Psychology",
            "simple_definition": "Able to withstand or recover quickly from difficult conditions.",
            "synonyms": ["tough", "strong", "flexible", "durable"],
            "antonyms": ["fragile", "weak", "vulnerable"],
            "collocations": ["resilient economy", "resilient community", "highly resilient"],
            "examples": ["Children are often very resilient and can recover quickly from trauma.", "The economy proved to be more resilient than expected."]
        },
        {
            "word": "Scrutinize",
            "word_type": "verb",
            "level": "C1",
            "topic": "Analysis",
            "simple_definition": "Examine or inspect closely and thoroughly.",
            "synonyms": ["examine", "inspect", "analyze", "study"],
            "antonyms": ["ignore", "neglect", "glance"],
            "collocations": ["scrutinize the data", "carefully scrutinize", "publicly scrutinized"],
            "examples": ["The scientists scrutinized the data for any errors.", "The company's finances were scrutinized by the auditors."]
        },
        {
            "word": "Tangible",
            "word_type": "adjective",
            "level": "B2",
            "topic": "General Academic",
            "simple_definition": "Perceptible by touch; clear and definite; real.",
            "synonyms": ["concrete", "real", "physical", "palpable"],
            "antonyms": ["intangible", "abstract", "unclear"],
            "collocations": ["tangible results", "tangible benefits", "tangible evidence"],
            "examples": ["The scheme has produced tangible benefits for the local community.", "We need to see some tangible results before we invest more money."]
        },
        {
            "word": "Unprecedented",
            "word_type": "adjective",
            "level": "C1",
            "topic": "History/General",
            "simple_definition": "Never done or known before.",
            "synonyms": ["groundbreaking", "novel", "unparalleled", "extraordinary"],
            "antonyms": ["common", "normal", "precedented"],
            "collocations": ["unprecedented growth", "unprecedented move", "unprecedented level"],
            "examples": ["The company has experienced unprecedented growth over the past year.", "The government took the unprecedented move of closing the borders."]
        },
        {
            "word": "Viable",
            "word_type": "adjective",
            "level": "B2",
            "topic": "Business/Science",
            "simple_definition": "Capable of working successfully; feasible.",
            "synonyms": ["feasible", "workable", "practicable", "possible"],
            "antonyms": ["unviable", "impossible", "impractical"],
            "collocations": ["viable alternative", "viable solution", "economically viable"],
            "examples": ["Is there a viable alternative to this plan?", "The project is no longer economically viable."]
        },
        {
            "word": "Yield",
            "word_type": "verb",
            "level": "B2",
            "topic": "Economics/Science",
            "simple_definition": "Produce or provide (a natural, agricultural, or industrial product).",
            "synonyms": ["produce", "provide", "generate", "supply"],
            "antonyms": ["consume", "use", "deplete"],
            "collocations": ["yield results", "high yield", "yield profit"],
            "examples": ["The investigation yielded some surprising results.", "The investment is expected to yield a high profit."]
        },
        {
            "word": "Zenith",
            "word_type": "noun",
            "level": "C1",
            "topic": "General Academic",
            "simple_definition": "The time at which something is most powerful or successful.",
            "synonyms": ["peak", "pinnacle", "climax", "summit"],
            "antonyms": ["nadir", "bottom", "lowest point"],
            "collocations": ["reach its zenith", "at the zenith of"],
            "examples": ["The Roman Empire reached its zenith in the 2nd century AD.", "He was at the zenith of his career when he decided to retire."]
        },
        {
            "word": "Acquisition",
            "word_type": "noun",
            "level": "B2",
            "topic": "Business/Learning",
            "simple_definition": "An asset or object bought or obtained, typically by a library or museum; the learning or developing of a skill, habit, or quality.",
            "synonyms": ["procurement", "obtaining", "attainment", "gain"],
            "antonyms": ["loss", "forfeiture", "sale"],
            "collocations": ["language acquisition", "data acquisition", "recent acquisition"],
            "examples": ["The acquisition of a new language takes time and effort.", "The museum's recent acquisitions are on display in the new wing."]
        },
        {
            "word": "Coincide",
            "word_type": "verb",
            "level": "B2",
            "topic": "Time/General",
            "simple_definition": "Occur at or during the same time.",
            "synonyms": ["concur", "clash", "synchronize", "overlap"],
            "antonyms": ["differ", "diverge", "conflict"],
            "collocations": ["coincide with", "deliberately coincide", "coinciding dates"],
            "examples": ["The publication of the book coincided with the 100th anniversary of the author's birth.", "My holiday coincides with the school break."]
        },
        {
            "word": "Differentiate",
            "word_type": "verb",
            "level": "B2",
            "topic": "Logic/General",
            "simple_definition": "Recognize or ascertain what makes (someone or something) different.",
            "synonyms": ["distinguish", "discriminate", "separate", "contrast"],
            "antonyms": ["confuse", "mix up", "assimilate"],
            "collocations": ["differentiate between", "clearly differentiate", "differentiate itself"],
            "examples": ["It is important to differentiate between fact and opinion.", "The company is trying to differentiate itself from its competitors."]
        },
        {
            "word": "Incentive",
            "word_type": "noun",
            "level": "B1",
            "topic": "Business/Psychology",
            "simple_definition": "A thing that motivates or encourages one to do something.",
            "synonyms": ["motivation", "encouragement", "stimulus", "inducement"],
            "antonyms": ["deterrent", "disincentive", "hindrance"],
            "collocations": ["financial incentive", "strong incentive", "provide an incentive"],
            "examples": ["The government is offering financial incentives to encourage people to save energy.", "There is little incentive for people to work harder if they are not paid more."]
        },
        {
            "word": "Mediate",
            "word_type": "verb",
            "level": "C1",
            "topic": "Legal/Social",
            "simple_definition": "Intervene between people in a dispute in order to bring about an agreement or reconciliation.",
            "synonyms": ["arbitrate", "intercede", "negotiate", "moderate"],
            "antonyms": ["aggravate", "provoke", "incite"],
            "collocations": ["mediate a dispute", "formally mediate", "attempt to mediate"],
            "examples": ["The UN tried to mediate a peace agreement between the two warring nations.", "A neutral third party was called in to mediate the dispute."]
        },
        {
            "word": "Objective",
            "word_type": "noun",
            "level": "B1",
            "topic": "Management/General",
            "simple_definition": "A thing aimed at or sought; a goal.",
            "synonyms": ["goal", "target", "aim", "purpose"],
            "antonyms": ["aimlessness", "randomness"],
            "collocations": ["main objective", "achieve an objective", "clear objective"],
            "examples": ["Our main objective is to improve customer service.", "The company has achieved all of its financial objectives for the year."]
        },
        {
            "word": "Persist",
            "word_type": "verb",
            "level": "B1",
            "topic": "General",
            "simple_definition": "Continue firmly or obstinately in an opinion or a course of action in spite of difficulty, opposition, or failure.",
            "synonyms": ["continue", "persevere", "endure", "last"],
            "antonyms": ["quit", "stop", "cease"],
            "collocations": ["persist in", "persist with", "symptoms persist"],
            "examples": ["Despite the difficulties, she persisted in her efforts to find a job.", "If symptoms persist, you should consult a doctor."]
        },
        {
            "word": "Restrain",
            "word_type": "verb",
            "level": "B2",
            "topic": "General/Psychology",
            "simple_definition": "Prevent (someone or something) from doing something; keep under control or within limits.",
            "synonyms": ["control", "curb", "check", "hinder"],
            "antonyms": ["release", "encourage", "free"],
            "collocations": ["restrain yourself", "restrain growth", "difficult to restrain"],
            "examples": ["He had to restrain himself from shouting at the rude customer.", "The government is trying to restrain the growth of public spending."]
        },
        {
            "word": "Validate",
            "word_type": "verb",
            "level": "C1",
            "topic": "Logic/Research",
            "simple_definition": "Check or prove the validity or accuracy of (something).",
            "synonyms": ["verify", "confirm", "substantiate", "corroborate"],
            "antonyms": ["invalidate", "disprove", "nullify"],
            "collocations": ["validate the results", "scientifically validate", "externally validated"],
            "examples": ["The results of the study were validated by an independent team of researchers.", "Further research is needed to validate these findings."]
        }
    ]
    
    # Load existing
    try:
        with open(VOCAB_FILE, 'r') as f:
            existing_items = json.load(f)
    except:
        existing_items = []
        
    # Merge (avoid duplicates)
    existing_words = {item['word'].lower() for item in existing_items}
    count = 0
    for item in new_items:
        if item['word'].lower() not in existing_words:
            existing_items.append(item)
            count += 1
            
    # Save
    with open(VOCAB_FILE, 'w') as f:
        json.dump(existing_items, f, indent=2)
        
    print(f"Industrialized vocabulary library: Added {count} high-fidelity BUEPT items.")
    print(f"Total items in library: {len(existing_items)}")

if __name__ == "__main__":
    generate_industrial_vocab()
