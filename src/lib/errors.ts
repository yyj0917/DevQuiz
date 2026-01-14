// ============================================================================
// CUSTOM ERROR TYPES
// ============================================================================

export class ActionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ActionError';
  }
}

export class OnboardingError extends ActionError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'OnboardingError';
  }
}

export class QuizGenerationError extends ActionError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'QuizGenerationError';
  }
}

export class QuizSubmissionError extends ActionError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'QuizSubmissionError';
  }
}
