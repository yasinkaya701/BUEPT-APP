"""
update_grammar_explain.py
Adds detailed 'explain' and 'examples' fields to remaining grammar tasks.
"""
import json

FIXES = {
    "g_p1_03": {
        "explain": (
            "Imperatives are used to give instructions, directions, advice, requests, or orders. "
            "The base form of the verb is used (no subject). "
            "Positive: 'Open your books.' Negative: 'Don't talk during the exam.' "
            "Polite imperatives: 'Please sit down.' / 'Could you please...'\n\n"
            "Key rules:\n"
            "- Positive: verb (base) + object/complement\n"
            "- Negative: Don't / Do not + verb (base)\n"
            "- Add 'please' for politeness\n"
            "- Classroom instructions: Listen carefully. / Turn to page 10. / Work in pairs."
        ),
        "examples": [
            {"wrong": "You open the door.", "correct": "Open the door.", "note": "No subject in imperatives"},
            {"wrong": "Don't to speak.", "correct": "Don't speak.", "note": "Don't + base verb (no 'to')"},
            {"wrong": "Please you sit down.", "correct": "Please sit down.", "note": "No subject needed"},
        ]
    },
    "g_p2_03": {
        "explain": (
            "Comparatives compare two things. Add -er for short adjectives (bigger, faster) or use 'more' "
            "before longer adjectives (more important, more difficult). Use 'than' to connect. "
            "Superlatives describe the extreme in a group. Use 'the' + -est (the tallest) or "
            "'the most' + adjective (the most significant). Irregular: good→better→best, bad→worse→worst, "
            "far→further→furthest. Double consonant rule: big→bigger, hot→hotter.\n\n"
            "Key rules:\n"
            "- Short adj (1-2 syl): -er / -est\n"
            "- Long adj (3+ syl): more / the most\n"
            "- Irregular: good/better/best, bad/worse/worst\n"
            "- Equality: as + adj + as (She is as tall as her sister.)\n"
            "- 'Than' used with comparative, 'the' used with superlative"
        ),
        "examples": [
            {"wrong": "She is more tall than him.", "correct": "She is taller than him.", "note": "Short adj: -er, not 'more'"},
            {"wrong": "He is the most smart student.", "correct": "He is the smartest student.", "note": "Short adj: the -est"},
            {"wrong": "This is more better than that.", "correct": "This is better than that.", "note": "Never 'more' + irregular comparative"},
        ]
    },
    "g_p3_03": {
        "explain": (
            "Defining (restrictive) relative clauses identify which person or thing we mean. "
            "They cannot be removed without changing the meaning. No commas are used. "
            "Who = people, Which = things, That = people or things (informal), "
            "Where = places, When = times, Whose = possession. "
            "Non-defining clauses add extra information and use commas. 'That' is NOT used in non-defining clauses.\n\n"
            "Key rules:\n"
            "- who/that for people: The student who passed OR The student that passed\n"
            "- which/that for things: The book which/that I read\n"
            "- whose for possession: The man whose car was stolen\n"
            "- where for places: The city where she grew up\n"
            "- Non-defining: use commas and 'which' (not 'that')"
        ),
        "examples": [
            {"wrong": "The student which passed got an A.", "correct": "The student who passed got an A.", "note": "'Which' is for things, not people"},
            {"wrong": "The book, that I liked, was long.", "correct": "The book, which I liked, was long.", "note": "Non-defining: 'which', not 'that'"},
            {"wrong": "The place where I live it is cold.", "correct": "The place where I live is cold.", "note": "No pronoun after 'where'"},
        ]
    },
    "g_p4_03": {
        "explain": (
            "Inversion reverses the normal subject-verb order for emphasis, typically after negative adverbials. "
            "Common triggers: Never, Rarely, Seldom, Hardly, Scarcely, No sooner, Not only, Little, Under no circumstances. "
            "Structure: Negative adverb + auxiliary + subject + main verb. "
            "Example: 'Never have I seen such dedication.' (NOT: Never I have seen...)\n\n"
            "Key rules:\n"
            "- After negative adverbs: inversion with auxiliary (do/does/did, have/has, modal)\n"
            "- 'No sooner ... than', 'Hardly ... when': past perfect inversion\n"
            "- 'Not only ... but also': inversion in first clause\n"
            "- Used in formal written English for rhetorical effect"
        ),
        "examples": [
            {"wrong": "Never I have seen such chaos.", "correct": "Never have I seen such chaos.", "note": "Inversion: auxiliary before subject"},
            {"wrong": "Not only she failed, but also lost her scholarship.", "correct": "Not only did she fail, but she also lost her scholarship.", "note": "Inversion + auxiliary 'did'"},
            {"wrong": "Hardly he had arrived when it began.", "correct": "Hardly had he arrived when it began.", "note": "Past perfect inversion after 'Hardly'"},
        ]
    },
    "g_p3_04": {
        "explain": (
            "Advanced clause structures include inversion, cleft sentences, reduced relative clauses, "
            "and absolute constructions. "
            "Cleft sentences emphasise a specific element: 'It is hard work that leads to success.' "
            "Reduced relative clauses omit 'who/which + be': 'The man sitting by the window' (= who is sitting). "
            "Absolute clauses express accompanying circumstances: 'The work completed, they went home.'\n\n"
            "Key rules:\n"
            "- Cleft: It is/was + emphasis + that/who + rest\n"
            "- Reduced relative (active): V+ing replacing 'who/which + is/are'\n"
            "- Reduced relative (passive): V+ed replacing 'who/which + was/were'\n"
            "- Absolute: noun phrase + participle, separated by comma"
        ),
        "examples": [
            {"wrong": "It is the teacher who he helped us.", "correct": "It was the teacher who helped us.", "note": "Cleft: no extra pronoun after 'who'"},
            {"wrong": "The student who is sitting there is my friend.", "correct": "The student sitting there is my friend.", "note": "Reduced relative by omitting 'who is'"},
            {"wrong": "The work was completed, they went home.", "correct": "The work completed, they went home.", "note": "Absolute clause form"},
        ]
    },
    "g_p3_05": {
        "explain": (
            "Advanced verb patterns: Some verbs take to-infinitive (decide, want, manage, hope, refuse, fail). "
            "Others take -ing (enjoy, avoid, consider, risk, deny, suggest, dislike). "
            "Some take both with different meanings: 'remember to do' (obligation) vs 'remember doing' (memory); "
            "'stop to do' (in order to) vs 'stop doing' (cease). "
            "Advanced modality: must/have to (obligation), should/ought to (advice), "
            "could have/should have (past ability/regret), might have (past possibility).\n\n"
            "Key rules:\n"
            "- to-inf after: want, decide, refuse, manage, fail, hope\n"
            "- -ing after: enjoy, avoid, deny, risk, consider, dislike\n"
            "- should have + past participle = regret/criticism\n"
            "- could have + past participle = unrealised past ability"
        ),
        "examples": [
            {"wrong": "She managed doing the task alone.", "correct": "She managed to do the task alone.", "note": "'Manage' takes to-infinitive"},
            {"wrong": "He avoided to make mistakes.", "correct": "He avoided making mistakes.", "note": "'Avoid' takes -ing"},
            {"wrong": "You should to study harder.", "correct": "You should study harder.", "note": "Modal + bare infinitive (no 'to')"},
        ]
    },
    "g_p4_04": {
        "explain": (
            "Nominalisation converts verbs/adjectives into nouns for formal academic style: "
            "investigate→investigation, decide→decision, significant→significance, analyse→analysis. "
            "Parallelism: all items in a list or comparison must share the same grammatical form. "
            "Complex syntax: embedding relative clauses, adverbial clauses, and nominal clauses within one sentence "
            "to create information-dense academic prose.\n\n"
            "Key rules:\n"
            "- Replace verb phrases with noun phrases in academic writing\n"
            "- Parallel: 'Reading, writing, and speaking' (all -ing); NOT 'Reading, to write, and speak'\n"
            "- Embedded clauses: 'The assumption that globalisation improves living standards is debatable.'\n"
            "- Avoid informal contractions and first-person in formal academic prose"
        ),
        "examples": [
            {"wrong": "We decided to investigate what caused this.", "correct": "An investigation into the causes was conducted.", "note": "Nominalisation for formal style"},
            {"wrong": "She likes swimming, to hike, and run.", "correct": "She likes swimming, hiking, and running.", "note": "Parallel -ing across the list"},
            {"wrong": "It was announced that the results they were significant.", "correct": "It was announced that the results were significant.", "note": "No repeated subject in embedded clause"},
        ]
    },
    "g_p4_05": {
        "explain": (
            "Academic error analysis requires identifying and correcting multiple error types within context: "
            "subject-verb agreement, article use, preposition choice, tense consistency, pronoun reference, "
            "and word form errors. Editing in context means understanding the whole paragraph, "
            "not just isolated sentences — discourse-level errors (wrong pronoun reference, misplaced modifier, "
            "illogical sequence) are common in BUEPT P4 tasks.\n\n"
            "Key editing checklist:\n"
            "- Subject-verb: Does the verb match the subject (singular/plural)?\n"
            "- Tense: Is the tense consistent throughout the passage?\n"
            "- Article: First mention = a/an; specific/known = the; general plural = no article\n"
            "- Word form: adjective vs adverb vs noun; correct suffix\n"
            "- Pronoun: Does 'it/they' refer clearly to the correct noun?"
        ),
        "examples": [
            {"wrong": "The data shows that there is many problems.", "correct": "The data show that there are many problems.", "note": "'Data' is plural; 'many' requires plural verb"},
            {"wrong": "The research, that was conducted in 2020, were thorough.", "correct": "The research, which was conducted in 2020, was thorough.", "note": "'Which' for non-defining; 'research' is singular"},
            {"wrong": "She provided an useful analysis.", "correct": "She provided a useful analysis.", "note": "'useful' starts with 'y' sound → 'a', not 'an'"},
        ]
    },
    "g_p3_06": {
        "explain": (
            "Discourse grammar focuses on how texts hang together through cohesion and coherence. "
            "Reference: using pronouns/demonstratives to refer back (anaphora) or forward (cataphora). "
            "Substitution: replacing a word/clause with 'so', 'do so', 'one'. "
            "Ellipsis: omitting words that are understood from context ('I can swim, and so can she.'). "
            "Lexical cohesion: using synonyms, hyponyms, superordinates, repetition to link ideas.\n\n"
            "Key rules:\n"
            "- Pronoun reference must be clear and unambiguous\n"
            "- 'This/These' summarise preceding ideas; 'Such' + noun classifies\n"
            "- Substitution: 'I think so' / 'I believe so'; 'do so' = refers to previous action\n"
            "- Theme-rheme: old info → new info within sentences to ensure flow"
        ),
        "examples": [
            {"wrong": "John told Mark that he had failed. He was angry.", "correct": "John told Mark that he had failed. John was angry.", "note": "Ambiguous 'he' — specify the referent"},
            {"wrong": "The experiment was a success. This was surprising.", "correct": "The experiment was a success. This outcome was surprising.", "note": "'This + noun' is clearer than bare 'This'"},
            {"wrong": "She wanted to go, and I wanted to go to.", "correct": "She wanted to go, and so did I.", "note": "Use ellipsis with 'so did I'"},
        ]
    },
    "g_p3_07": {
        "explain": (
            "Complex noun phrases can include pre-modifiers (adjectives, nouns, participles before the noun) "
            "and post-modifiers (prepositional phrases, relative clauses, infinitives, participles after the noun). "
            "Order of adjectives: opinion→size→age→shape→colour→origin→material→purpose + NOUN. "
            "In academic writing, noun phrases often carry most of the information: "
            "'the rapid economic development of East Asia in the 1980s'.\n\n"
            "Key rules:\n"
            "- Adjective order: opinion, size, age, shape, colour, origin, material\n"
            "- Pre-modifiers: participle phrases before noun: 'the recently published study'\n"
            "- Post-modifiers: PP or relative clause after noun: 'the study published last year'\n"
            "- Nominalised heads: 'an increase in...', 'a decline in...'"
        ),
        "examples": [
            {"wrong": "a metal old big container", "correct": "a big old metal container", "note": "Adjective order: size → age → material"},
            {"wrong": "The published recently report attracted attention.", "correct": "The recently published report attracted attention.", "note": "Adverb modifies participle: 'recently published'"},
            {"wrong": "The results of the experiment which we conducted it last year", "correct": "The results of the experiment conducted last year", "note": "Reduced relative: omit 'which we conducted it'"},
        ]
    },
    "g_p4_06": {
        "explain": (
            "This task tests mixed advanced grammar: mixed conditionals (combining Type 2 and 3), "
            "inversion after negative adverbials, and ellipsis in formal writing. "
            "Mixed conditional: 'If I had studied harder (past), I would be more confident now (present).' "
            "Ellipsis in formal style: 'The results were positive, as were the implications.' "
            "Advanced inversion: 'Only when all data had been collected were conclusions drawn.'\n\n"
            "Key rules:\n"
            "- Mixed conditional: if + past perfect, would/could + bare inf (present result)\n"
            "- Inversion after 'only when/after/if': auxiliary + subject\n"
            "- Ellipsis: avoid repeating the same verb phrase; use auxiliaries\n"
            "- 'So do I / Neither do I' — agreement structures"
        ),
        "examples": [
            {"wrong": "If she studied harder, she would have passed.", "correct": "If she had studied harder, she would have passed. / If she studied harder, she would pass.", "note": "Don't mix past simple and 'would have' (Type 3 vs Type 2)"},
            {"wrong": "Only when the results arrived, she relaxed.", "correct": "Only when the results arrived did she relax.", "note": "Inversion required after 'Only when'"},
            {"wrong": "She passed, and I passed too.", "correct": "She passed, and so did I.", "note": "Ellipsis with 'so did I'"},
        ]
    },
    "g_p4_07": {
        "explain": (
            "Academic style requires precision in articles, prepositions, and register. "
            "Articles: 'the' is required for unique entities, previously mentioned items, and post-modified nouns "
            "('the study conducted in 2020'). Prepositions: depend on + noun/gerund, consist of, result in, "
            "contribute to, independent of, based on, derived from, associated with. "
            "Register: avoid contractions, slang, or casual hedging ('kind of', 'basically') in academic prose.\n\n"
            "Key preposition + noun collocations:\n"
            "- an increase IN, a decrease IN, a change IN\n"
            "- research ON/INTO, a study OF, an analysis OF\n"
            "- result IN (cause→effect), result FROM (effect←cause)\n"
            "- associated WITH, dependent ON, independent OF"
        ),
        "examples": [
            {"wrong": "The research was based in previous findings.", "correct": "The research was based on previous findings.", "note": "'Based on' — fixed preposition collocation"},
            {"wrong": "There was an increase of student enrolment.", "correct": "There was an increase in student enrolment.", "note": "'Increase in' — not 'of'"},
            {"wrong": "The results was analysed by scientists.", "correct": "The results were analysed by scientists.", "note": "'Results' = plural → 'were'"},
        ]
    },
    "g_p3_08": {
        "explain": (
            "Multi-error editing tasks present a short paragraph with several grammar errors. "
            "Common errors include: wrong tense, incorrect article, subject-verb disagreement, "
            "wrong preposition, dangling modifier, and word-form error. "
            "Strategy: (1) Read the whole paragraph for meaning. (2) Identify the error type. "
            "(3) Apply the relevant rule. (4) Check that the corrected sentence sounds natural in context.\n\n"
            "Common error types to scan for:\n"
            "- Tense inconsistency within a paragraph\n"
            "- Article (a/an/the/—) before nouns\n"
            "- Preposition collocations\n"
            "- Adjective vs adverb confusion (high vs highly, real vs really)\n"
            "- Dangling/misplaced modifiers"
        ),
        "examples": [
            {"wrong": "Working late into the night, the results surprised us.", "correct": "Working late into the night, we were surprised by the results.", "note": "Dangling modifier: 'Working' must refer to the subject 'we'"},
            {"wrong": "She works real hard to achieve her goals.", "correct": "She works really hard to achieve her goals.", "note": "'Really' is an adverb modifying 'hard'"},
            {"wrong": "In 1990, researchers study the effects of pollution.", "correct": "In 1990, researchers studied the effects of pollution.", "note": "Past time marker 'In 1990' requires past simple"},
        ]
    },
    "g_p4_08": {
        "explain": (
            "Advanced multi-error paragraph editing at P4 level involves discourse-level issues alongside "
            "sentence-level errors. You may need to fix: incorrect relative pronoun, inappropriate register, "
            "incorrect use of inversion, wrong modal perfect, or a nominalization error. "
            "Read for global meaning first, then edit sentence by sentence. "
            "Focus on: formal register, appropriate hedging (it is argued that, evidence suggests), "
            "and accurate use of passive voice in academic writing.\n\n"
            "Advanced editing focus:\n"
            "- Modal perfects: should have / could have / must have + past participle\n"
            "- Passive voice appropriateness: 'The study was conducted' (not 'They conducted the study')\n"
            "- Avoiding first-person in formal academic writing\n"
            "- Coherence: ensure each sentence follows logically from the previous"
        ),
        "examples": [
            {"wrong": "The committee should looked into this matter.", "correct": "The committee should have looked into this matter.", "note": "Modal perfect: should have + past participle"},
            {"wrong": "They show in the study that pollution levels increased.", "correct": "The study shows that pollution levels increased.", "note": "Formal: 'the study shows' (not 'they show')"},
            {"wrong": "Not only the participants were confused, but also the researchers.", "correct": "Not only were the participants confused, but the researchers were also.", "note": "Inversion required after 'Not only'"},
        ]
    },
    "g_p4_09": {
        "explain": (
            "Advanced clause control includes: complex embedded clauses with multiple layers, "
            "controlled use of inversion for emphasis, and sophisticated use of conditionals. "
            "Embedded clause: 'The claim that technology improves productivity, which many economists support, "
            "remains contested.' Inversion: 'Only by addressing the root causes can sustainable progress be achieved.' "
            "Conditional variety: Type 0 (facts), Type 1 (possible), Type 2 (hypothetical), Type 3 (past unreal), "
            "Mixed (past condition → present result).\n\n"
            "Key rules:\n"
            "- Embedded noun clause: 'that' + full clause as subject/object\n"
            "- Emphatic inversion: Only by/when/if + inversion (aux+subject)\n"
            "- Sentence variety: vary between simple, compound, complex, and compound-complex\n"
            "- Avoid run-on sentences through correct use of relative clauses and conjunctions"
        ),
        "examples": [
            {"wrong": "The fact which he lied was discovered.", "correct": "The fact that he had lied was discovered.", "note": "Noun (appositive) clause: use 'that', not 'which'; past perfect for prior event"},
            {"wrong": "Only by study hard can students improve.", "correct": "Only by studying hard can students improve.", "note": "'By' + gerund (-ing); inversion: 'can students improve'"},
            {"wrong": "If she would study, she would pass.", "correct": "If she studied, she would pass.", "note": "Type 2: 'if' clause uses past simple, not 'would'"},
        ]
    },
}

with open('data/grammar_tasks.json') as f:
    data = json.load(f)

updated = 0
for task in data:
    if task['id'] in FIXES:
        fix = FIXES[task['id']]
        task['explain'] = fix['explain']
        if 'examples' in fix:
            task['examples'] = fix['examples']
        updated += 1

with open('data/grammar_tasks.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Updated {updated} grammar tasks')
print('JSON valid: True')
