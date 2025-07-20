
export interface AppError {
  type: 'network' | 'validation' | 'api' | 'file' | 'generation' | 'unknown';
  message: string;
  details?: string;
  retryable?: boolean;
  code?: string;
}

export class ErrorHandler {
  static createError(type: AppError['type'], message: string, details?: string, code?: string): AppError {
    return {
      type,
      message,
      details,
      retryable: type === 'network' || type === 'api',
      code
    };
  }

  static getErrorMessage(error: AppError): string {
    switch (error.type) {
      case 'network':
        return 'Network connection issue. Please check your internet connection and try again.';
      case 'validation':
        return error.message;
      case 'api':
        return `API Error: ${error.message}`;
      case 'file':
        return `File Error: ${error.message}`;
      case 'generation':
        return `Generation Error: ${error.message}`;
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'FILE_TOO_LARGE':
        return 'File size is too large. Please use files under 5MB.';
      case 'INVALID_FILE_TYPE':
        return 'Invalid file type. Please use PNG, JPG, or WebP images.';
      case 'NETWORK_TIMEOUT':
        return 'Request timed out. Please try again.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'OPENAI_API_KEY_MISSING':
        return 'OpenAI API key is not configured. Please contact support.';
      case 'QUOTA_EXCEEDED':
        return 'API quota exceeded. Please try again later.';
      default:
        return this.getErrorMessage(error);
    }
  }
}

export const validateFile = (file: File): AppError | null => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

  if (file.size > maxSize) {
    return ErrorHandler.createError('file', 'File too large', `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`, 'FILE_TOO_LARGE');
  }

  if (!allowedTypes.includes(file.type)) {
    return ErrorHandler.createError('file', 'Invalid file type', `File type: ${file.type}`, 'INVALID_FILE_TYPE');
  }

  return null;
};

export const validatePrompt = (prompt: string): AppError | null => {
  if (!prompt.trim()) {
    return ErrorHandler.createError('validation', 'Prompt cannot be empty');
  }

  if (prompt.length > 4000) {
    return ErrorHandler.createError('validation', 'Prompt is too long', `Length: ${prompt.length}/4000 characters`);
  }

  return null;
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) break;
      
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};
