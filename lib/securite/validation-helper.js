import { ValidationError } from './error-handler';

export const validateData = async (schema, data) => {
  try {
    const validated = await schema.parseAsync(data);
    return {
      success: true,
      data: validated,
      errors: null,
    };
  } catch (error) {
    if (error?.name === 'ZodError') {
      // Zod 4 exposes validation details as `issues` (older releases used `errors`).
      const issues = Array.isArray(error.issues) ? error.issues : Array.isArray(error.errors) ? error.errors : [];
      const errors = issues.reduce((acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {});

      return {
        success: false,
        data: null,
        errors,
      };
    }

    throw error;
  }
};

export const getFieldError = (errors, field) => {
  if (!errors) return null;
  return errors[field] || null;
};

export const hasFieldError = (errors, field) => {
  return Boolean(getFieldError(errors, field));
};

export const getFormErrors = (errors) => {
  if (!errors) return {};
  return errors;
};

export const clearFieldError = (errors, field) => {
  if (!errors) return {};
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};
