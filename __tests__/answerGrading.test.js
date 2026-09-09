import {
  acceptedAnswersForQuestion,
  displayCorrectAnswer,
  gradeExam,
  gradeQuestion,
  normalizeAnswer,
} from '../src/utils/answerGrading';

describe('answerGrading', () => {
  test('normalizes case, whitespace and terminal punctuation', () => {
    expect(normalizeAnswer('  Climate   Change. ')).toBe('climate change');
  });

  test('grades indexed MCQ answers without treating index 0 as empty', () => {
    const q = { options: ['A', 'B', 'C'], answer: 0 };
    expect(gradeQuestion(q, 0).correct).toBe(true);
    expect(gradeQuestion(q, 1).correct).toBe(false);
    expect(displayCorrectAnswer(q)).toBe('A');
  });

  test('grades short-answer strings case-insensitively', () => {
    const q = { type: 'short_answer', answer: 'Substantial evidence' };
    expect(gradeQuestion(q, ' substantial evidence. ').correct).toBe(true);
  });

  test('accepts any answer in a short-answer answer array', () => {
    const q = { type: 'short_answer', answer: ['urbanization', 'urbanisation'] };
    expect(gradeQuestion(q, 'Urbanisation').correct).toBe(true);
    expect(gradeQuestion(q, 'industrialization').correct).toBe(false);
    expect(acceptedAnswersForQuestion(q)).toEqual(['urbanization', 'urbanisation']);
  });

  test('supports normalized acceptedAnswers schema', () => {
    const q = { acceptedAnswers: ['therefore', 'as a result'] };
    expect(gradeQuestion(q, 'As a result').correct).toBe(true);
  });

  test('grades mixed exams consistently', () => {
    const questions = [
      { key: 'r0', q: { options: ['A', 'B'], answer: 1 } },
      { key: 'r1', q: { type: 'short_answer', answer: ['inference', 'an inference'] } },
      { key: 'g0', q: { options: ['is', 'are'], answer: 0 } },
    ];
    const result = gradeExam(questions, {
      r0: 1,
      r1: 'Inference.',
      g0: 1,
    });
    expect(result).toMatchObject({ correct: 2, total: 3, percent: 67 });
  });

  test('replacement/similar questions are graded against their active answer', () => {
    const questions = [{ key: 'r0', q: { options: ['A', 'B'], answer: 0 } }];
    const replacements = { r0: { options: ['A', 'B'], answer: 1 } };
    expect(gradeExam(questions, { r0: 1 }, replacements).correct).toBe(1);
  });
});
