class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, 400, errors);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Non authentifié') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Ressource', message = null) {
    super(message || `${resource} non trouvée`, 404);
    this.name = 'NotFoundError';
  }
}

export const errorHandler = {
  handle: (error, context = {}) => {
    const isDev = process.env.NODE_ENV === 'development';
    const normalizedError = error instanceof Error
      ? error
      : new Error(typeof error === 'string' ? error : error?.message || 'Une erreur inattendue est survenue.');

    let errorResponse = {
      success: false,
      error: {
        message: 'Une erreur est survenue',
        statusCode: 500,
      },
    };

    if (normalizedError instanceof AppError) {
      errorResponse.error = {
        message: normalizedError.message,
        statusCode: normalizedError.statusCode,
        ...(isDev && { details: normalizedError.details }),
        ...(isDev && { stack: normalizedError.stack }),
      };
    } else {
      errorResponse.error = {
        message: isDev ? normalizedError.message : 'Erreur serveur',
        statusCode: 500,
        ...(isDev && { stack: normalizedError.stack }),
      };
    }

    if (isDev) {
      console.error('[AgriMarket] Erreur traitée', normalizedError, { context, timestamp: new Date().toISOString() });
    } else {
      console.error('[ERROR]', errorResponse.error.message);
    }

    return errorResponse;
  },

  logError: (error, context = {}) => {
    const log = {
      level: 'error',
      message: error.message || 'Erreur inconnue',
      timestamp: new Date().toISOString(),
      context,
      ...(error.stack && { stack: error.stack }),
    };
    console.error(JSON.stringify(log));
  },

  logWarning: (message, context = {}) => {
    console.warn(JSON.stringify({
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      context,
    }));
  },

  logInfo: (message, context = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
    }));
  },
};

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
