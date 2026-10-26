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

    let errorResponse = {
      success: false,
      error: {
        message: 'Une erreur est survenue',
        statusCode: 500,
      },
    };

    if (error instanceof AppError) {
      errorResponse.error = {
        message: error.message,
        statusCode: error.statusCode,
        ...(isDev && { details: error.details }),
        ...(isDev && { stack: error.stack }),
      };
    } else if (error instanceof Error) {
      errorResponse.error = {
        message: isDev ? error.message : 'Erreur serveur',
        statusCode: 500,
        ...(isDev && { stack: error.stack }),
      };
    }

    if (isDev) {
      console.error('[ERROR]', {
        ...errorResponse.error,
        context,
        timestamp: new Date().toISOString(),
      });
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
