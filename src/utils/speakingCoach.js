/**
 * speakingCoach.js
 * Offline analysis of a written speaking response.
 * Returns band estimate, strengths, improvements, connector suggestions.
 */

const DISCOURSE_CONNECTORS = [
    'firstly', 'secondly', 'thirdly', 'finally', 'furthermore',
    'in addition', 'moreover', 'however', 'nevertheless', 'on the other hand',
    'in contrast', 'although', 'whereas', 'despite', 'as a result',
    'therefore', 'consequently', 'for example', 'for instance',
    'in conclusion', 'to sum up', 'overall', 'in my opinion',
    'it could be argued', 'evidence suggests', 'to a large extent',
    'on balance', 'in particular', 'specifically', 'notably',
    'this demonstrates', 'this suggests', 'it is worth noting', 'due to', 'owing to'
];

const ACADEMIC_WORDS = [
    'significant', 'substantial', 'evident', 'crucial', 'facilitate',
    'demonstrate', 'illustrate', 'indicate', 'suggest', 'emphasise',
    'analyse', 'evaluate', 'consider', 'examine', 'investigate',
    'argument', 'perspective', 'approach', 'aspect', 'impact',
    'contribute', 'influence', 'challenge', 'opportunity', 'consequence',
    'fundamental', 'contemporary', 'diverse', 'complex', 'effective',
    'inevitable', 'subsequently', 'pervasive', 'phenomenon', 'rationale',
    'framework', 'implication'
];

const WEAK_PHRASES = [
    'i think', 'i believe', 'i guess', 'kind of', 'sort of',
    'you know', 'like', 'basically', 'actually', 'i mean',
    'good', 'bad', 'big', 'small', 'a lot of', 'nowadays'
];

const CONNECTOR_CATEGORIES = {
    addition: ['furthermore', 'in addition', 'moreover', 'also'],
    contrast: ['however', 'nevertheless', 'on the other hand', 'whereas'],
    cause_effect: ['therefore', 'consequently', 'as a result', 'thus'],
    example: ['for example', 'for instance', 'specifically'],
    conclusion: ['in conclusion', 'to sum up', 'overall', 'on balance'],
};

// Check for complex structures (relative clauses, conditionals)
const COMPLEX_STRUCTURES = [
    'which', 'who', 'that', 'whose', 'where', // relative
    'if', 'unless', 'provided that', // conditional
    'because', 'since', 'although', 'even though' // subordinating
];

export function analyzeSpeakingResponse(text, promptItem) {
    const lower = text.toLowerCase();
    const words = lower.match(/\b[a-z']+\b/g) || [];
    const wordCount = words.length;

    // Improved sentence boundary check
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
    const sentenceCount = sentences.length;

    // Length check: rough target based on time
    const timeMinutes = parseFloat(String(promptItem.time)) || 1;
    const targetMin = Math.round(timeMinutes * 60);  // approx 60-80 wpm written
    const lengthOk = wordCount >= targetMin;

    // Count discourse connectors (exact word boundaries)
    const usedConnectors = DISCOURSE_CONNECTORS.filter(c => new RegExp(`\\b${c}\\b`).test(lower));
    const connectorCount = usedConnectors.length;

    // Count academic words
    const academicWordMatches = ACADEMIC_WORDS.filter(w => new RegExp(`\\b${w}\\b`).test(lower));
    const academicCount = academicWordMatches.length;

    // Complex sentence indicators
    const complexMatches = COMPLEX_STRUCTURES.filter(s => new RegExp(`\\b${s}\\b`).test(lower));

    // Count key vocab from prompt
    const vocabMatches = (promptItem.vocab || []).filter(v => new RegExp(`\\b${v.toLowerCase()}\\b`).test(lower)).length;

    // Weak phrases
    const weakCount = WEAK_PHRASES.filter(p => new RegExp(`\\b${p}\\b`).test(lower)).length;

    // Missing connector categories
    const missingCategories = Object.keys(CONNECTOR_CATEGORIES).filter(cat =>
        !CONNECTOR_CATEGORIES[cat].some(c => lower.includes(c))
    );
    const missingConnectors = missingCategories.map(cat => CONNECTOR_CATEGORIES[cat][0]);

    // Enhanced Band estimation (0-10 scale for finer tuning before band map)
    let score = 0;
    if (wordCount >= targetMin * 0.8) score += 1;
    if (wordCount >= targetMin) score += 1;

    // Vocabulary score
    if (academicCount >= 3) score += 2;
    else if (academicCount >= 1) score += 1;

    // Cohesion score
    if (connectorCount >= 4) score += 2;
    else if (connectorCount >= 2) score += 1;

    // Syntax score
    if (complexMatches.length >= 3) score += 2;
    else if (complexMatches.length >= 1) score += 1;

    // Prompt specific
    if (vocabMatches >= Math.max(1, (promptItem.vocab?.length || 0) / 2)) score += 1;

    // Penalties
    score -= Math.min(2, weakCount);
    if ((wordCount / sentenceCount) < 8) score -= 1; // Very short sentences (choppy)

    score = Math.max(0, score);

    let band;
    if (score >= 9) band = 'Excellent (C1–C2)';
    else if (score >= 7) band = 'Good (B2)';
    else if (score >= 5) band = 'Fair (B1–B2)';
    else if (score >= 3) band = 'Developing (B1)';
    else band = 'Basic (A2–B1)';

    // Strengths Generation
    const strengths = [];
    if (lengthOk) strengths.push(`Excellent length (${wordCount} words fully answers the task)`);
    if (connectorCount >= 3) strengths.push(`Smooth transitions (${usedConnectors.slice(0, 3).join(', ')})`);
    if (academicCount >= 2) strengths.push(`Strong academic register (${academicWordMatches.slice(0, 2).join(', ')})`);
    if (complexMatches.length >= 2) strengths.push(`Good grammatical range (complex sentences used)`);
    if (vocabMatches >= 2) strengths.push(`Effectively used prompt-specific vocabulary`);
    if (strengths.length === 0) strengths.push('Response recorded successfully. Review improvements to boost your score.');

    // Improvements Generation
    const improvements = [];
    if (!lengthOk) improvements.push(`Extend your answer (${wordCount}/${targetMin} words goal). Add examples.`);
    if (connectorCount < 3) improvements.push('Signpost your ideas better with linking words.');
    if (academicCount < 2) improvements.push('Upgrade basic verbs/adjectives to more academic alternatives.');
    if (weakCount > 0) improvements.push('Avoid informal filler words ("like", "basically", "I guess").');
    if (complexMatches.length < 2) improvements.push('Try using relative clauses (which/who) to combine short sentences.');
    if ((wordCount / sentenceCount) < 8) improvements.push('Your sentences are quite short. Try linking them to show fluency.');

    return {
        wordCount,
        sentenceCount,
        connectorCount,
        academicCount,
        vocabMatches,
        weakCount,
        lengthOk,
        band,
        strengths,
        improvements,
        missingConnectors,
        usedConnectors,
    };
}
