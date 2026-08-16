/**
 * speakingExamAssessment.js — AI speaking assessment for the ODTÜ EPE/İYS
 * mock exam's live Speaking block.
 *
 * Wired to the Web Speech API via useSpeechRecognition (browser only). On
 * native the recorder degrades to a silent no-op and the exam falls back to
 * text-only practice input — nothing crashes, nothing is silently zeroed.
 *
 * Pipeline:
 *   transcript  →  estimateFluency      (WPM, fillers, word/sentence counts)
 *               →  scoreTranscriptCoverage (accuracy vs. prompt cue words)
 *               →  analyzeSpeakingResponse (coherence + lexical signals)
 *               →  evaluateSpeakingModel (5-dimension composite 0–100)
 *
 * The composite feeds the official METU Speaking weight (15/100 pts): the
 * mock treats AI-scored responses as 85% of the Speaking share, the rest
 * being the rehearsal value of the face-to-face interview format.
 */
import { scoreTranscriptCoverage, estimateFluency } from '../hooks/useSpeechRecognition';
import { analyzeSpeakingResponse } from './speakingCoach';
import { evaluateSpeakingModel } from './speakingModel';

/** Prompt vocabulary extracted for coverage scoring — high-value cue words. */
function cueWordsFor(promptText = '') {
  const stop = new Set([
    'the', 'a', 'an', 'of', 'to', 'in', 'is', 'and', 'are', 'your', 'you',
    'what', 'why', 'how', 'do', 'does', 'did', 'that', 'this', 'from', 'with',
    'about', 'tell', 'describe', 'us', 'think', 'opinion', 'some', 'people',
    'prefer', 'working', 'most', 'important', 'one', 'would', 'could', 'should',
  ]);
  return String(promptText)
    .replace(/[?!.',":]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w));
}

/**
 * Assess a spoken response against an exam speaking prompt.
 * Returns { overall, band, dimensions, fluency, accuracy, feedback, strengths,
 * improvements, transcriptStats, notRecorded }.
 */
export function assessSpokenResponse({ promptText = '', transcript = '', elapsedSec = 0 } = {}) {
  const text = String(transcript || '').trim();
  if (!text) {
    return {
      overall: 0,
      band: 'Not recorded',
      dimensions: { fluency: 0, coherence: 0, lexicalRange: 0, rubricAlignment: 0, speakingStamina: 0 },
      fluency: { wpm: 0, fillerCount: 0, wordCount: 0, sentenceCount: 0 },
      accuracy: 0,
      feedback: { connectorCount: 0, vocabMatches: 0 },
      strengths: [],
      improvements: ['Tap the microphone and answer the prompt aloud to receive a score.'],
      transcriptStats: { words: 0, elapsedSec },
      notRecorded: true,
    };
  }

  const fluency = estimateFluency(text, elapsedSec);
  const cues = cueWordsFor(promptText);
  const accuracy = scoreTranscriptCoverage(text, [text, ...cues.slice(0, 8)]);
  // Coverage vs the question's cue words rewards on-topic answering; the
  // transcript itself trivially matches 100%, so blend keeps it honest.
  const cueCov = cues.length ? scoreTranscriptCoverage(text, cues) : 60;
  const blendAccuracy = Math.round(accuracy * 0.25 + cueCov * 0.75);

  const feedback = analyzeSpeakingResponse(text, { time: '1.5', vocab: cues.slice(0, 4) });
  const selfCheck = {
    thesis: feedback.connectorCount > 0,
    example: /for example|for instance|such as/i.test(text),
    connector: feedback.connectorCount >= 2,
    conclusion: /in conclusion|to sum up|overall|in short/i.test(text),
  };
  const rubric = {
    total: Math.min(20, Math.round(
      (feedback.connectorCount >= 2 ? 6 : 2) +
      (feedback.academicCount >= 2 ? 5 : 2) +
      (feedback.vocabMatches >= 1 ? 4 : 1) +
      (feedback.wordCount >= 80 ? 3 : 1) +
      (feedback.sentenceCount >= 3 ? 2 : 0)
    )),
    max: 20,
  };

  const model = evaluateSpeakingModel({
    feedback,
    rubric,
    fluency,
    selfCheck,
    elapsedSec,
  });

  const strengths = feedback.strengths.slice(0, 3);
  const improvements = feedback.improvements.slice(0, 3);
  if (fluency.wpm > 0 && fluency.wpm < 80) improvements.push('Speak at a steadier pace — target 90–145 words per minute.');
  if (fluency.wpm > 160) improvements.push('Slow down slightly — very fast speech reduces clarity.');
  if (fluency.fillerCount > 2) improvements.push(`Reduce fillers (${fluency.fillerCount} detected: um/uh/like/you know).`);

  return {
    overall: model.overall,
    band: model.band,
    dimensions: model.dimensions,
    fluency,
    accuracy: blendAccuracy,
    feedback,
    strengths,
    improvements,
    transcriptStats: { words: fluency.wordCount, elapsedSec },
    notRecorded: false,
  };
}

/** Map a 0–100 AI speaking composite to the official METU Speaking pts share. */
export function speakingPtsFor(aiScore, scoring) {
  const pts = Number(scoring?.speaking || 0);
  if (!pts) return 0;
  return Math.round((Math.max(0, Math.min(100, aiScore)) / 100) * pts * 0.85);
}
