/**
 * Client-Side Validation Hooks
 * 
 * React hooks for real-time form validation with:
 * - Real-time field validation
 * - Form-wide validation
 * - Error state management
 * - Touch tracking
 * - Type-safe validation
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import {
  createInterviewRequestSchema,
  generateFeedbackRequestSchema,
  saveAnswerRequestSchema,
  validateField,
  validateForm,
  VALIDATION_LIMITS,
  type CreateInterviewRequest,
  type GenerateFeedbackRequest,
  type SaveAnswerRequest,
} from './validation.schemas';

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface FormFieldError {
  message: string;
  touched: boolean;
}

export interface FormValidationState {
  errors: Record<string, FormFieldError>;
  isValid: boolean;
  isDirty: boolean;
}

// ============================================================================
// CREATE INTERVIEW FORM HOOK
// ============================================================================

/**
 * Hook for validating create interview form
 * Real-time validation with touch tracking
 */
export function useCreateInterviewValidation() {
  const [formData, setFormData] = useState({
    jobPosition: '',
    jobDesc: '',
    jobExperience: '',
  });

  const [validationState, setValidationState] = useState<FormValidationState>({
    errors: {},
    isValid: false,
    isDirty: false,
  });

  const touchedFields = useRef<Set<string>>(new Set());

  // Validate single field
  const validateFieldValue = useCallback(
    (fieldName: string, value: string | number) => {
      let error: string | null = null;

      try {
        if (fieldName === 'jobPosition') {
          createInterviewRequestSchema.shape.jobPosition.parse(value);
        } else if (fieldName === 'jobDesc') {
          createInterviewRequestSchema.shape.jobDesc.parse(value);
        } else if (fieldName === 'jobExperience') {
          const numValue = typeof value === 'string' ? Number(value) : value;
          if (isNaN(numValue)) {
            error = 'Experience must be a valid number';
          } else {
            createInterviewRequestSchema.shape.jobExperience.parse(numValue);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          error = err.message;
        }
      }

      setValidationState((prev) => {
        const newErrors = { ...prev.errors };
        if (error) {
          newErrors[fieldName] = { message: error, touched: touchedFields.current.has(fieldName) };
        } else {
          delete newErrors[fieldName];
        }

        const isValid = Object.keys(newErrors).length === 0 && Object.keys(formData).every((k) => {
          if (k === 'jobExperience') return !isNaN(Number(formData[k as keyof typeof formData]));
          return formData[k as keyof typeof formData] !== '';
        });

        return {
          errors: newErrors,
          isValid,
          isDirty: prev.isDirty || true,
        };
      });
    },
    [formData]
  );

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateFieldValue(name, value);
    },
    [validateFieldValue]
  );

  // Handle field blur (mark as touched)
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    touchedFields.current.add(name);
    validateFieldValue(name, formData[name as keyof typeof formData]);
  }, [formData, validateFieldValue]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      jobPosition: '',
      jobDesc: '',
      jobExperience: '',
    });
    setValidationState({
      errors: {},
      isValid: false,
      isDirty: false,
    });
    touchedFields.current.clear();
  }, []);

  // Get form data (parsed to correct types)
  const getFormData = useCallback((): CreateInterviewRequest | null => {
    try {
      return createInterviewRequestSchema.parse({
        jobPosition: formData.jobPosition,
        jobDesc: formData.jobDesc,
        jobExperience: Number(formData.jobExperience),
      });
    } catch {
      return null;
    }
  }, [formData]);

  return {
    formData,
    setFormData,
    validationState,
    handleChange,
    handleBlur,
    resetForm,
    getFormData,
    isValid: validationState.isValid,
    errors: validationState.errors,
    touchedFields: touchedFields.current,
  };
}

// ============================================================================
// FEEDBACK FORM HOOK
// ============================================================================

/**
 * Hook for validating feedback request form
 */
export function useGenerateFeedbackValidation() {
  const [formData, setFormData] = useState({
    userAnswer: '',
  });

  const [validationState, setValidationState] = useState<FormValidationState>({
    errors: {},
    isValid: false,
    isDirty: false,
  });

  const touchedFields = useRef<Set<string>>(new Set());

  const validateFieldValue = useCallback((fieldName: string, value: string) => {
    let error: string | null = null;

    try {
      if (fieldName === 'userAnswer') {
        generateFeedbackRequestSchema.shape.userAnswer.parse(value);
      }
    } catch (err) {
      if (err instanceof Error) {
        error = err.message;
      }
    }

    setValidationState((prev) => {
      const newErrors = { ...prev.errors };
      if (error) {
        newErrors[fieldName] = { message: error, touched: touchedFields.current.has(fieldName) };
      } else {
        delete newErrors[fieldName];
      }

      const isValid = Object.keys(newErrors).length === 0 && formData.userAnswer.trim() !== '';

      return {
        errors: newErrors,
        isValid,
        isDirty: prev.isDirty || true,
      };
    });
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateFieldValue(name, value);
    },
    [validateFieldValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      const { name } = e.target;
      touchedFields.current.add(name);
      validateFieldValue(name, formData[name as keyof typeof formData]);
    },
    [formData, validateFieldValue]
  );

  const resetForm = useCallback(() => {
    setFormData({ userAnswer: '' });
    setValidationState({
      errors: {},
      isValid: false,
      isDirty: false,
    });
    touchedFields.current.clear();
  }, []);

  const getFormData = useCallback((): GenerateFeedbackRequest | null => {
    try {
      return generateFeedbackRequestSchema.parse({
        userAnswer: formData.userAnswer,
      });
    } catch {
      return null;
    }
  }, [formData]);

  return {
    formData,
    setFormData,
    validationState,
    handleChange,
    handleBlur,
    resetForm,
    getFormData,
    isValid: validationState.isValid,
    errors: validationState.errors,
    touchedFields: touchedFields.current,
  };
}

// ============================================================================
// CHARACTER COUNTER HOOK
// ============================================================================

/**
 * Hook for managing character count with limits
 */
export function useCharacterCounter(fieldName: string, maxLength?: number) {
  const [count, setCount] = useState(0);
  const [isNearLimit, setIsNearLimit] = useState(false);

  const max = maxLength || (VALIDATION_LIMITS as Record<string, number>)[`${fieldName.toUpperCase()}_MAX`] || 1000;

  const handleChange = useCallback(
    (text: string) => {
      const newCount = text.length;
      setCount(newCount);
      setIsNearLimit(newCount > max * 0.8); // Warn at 80% capacity
    },
    [max]
  );

  const getRemainingCount = useCallback(() => {
    return max - count;
  }, [max, count]);

  const isExceeded = count > max;

  return {
    count,
    max,
    remaining: getRemainingCount(),
    isNearLimit,
    isExceeded,
    handleChange,
    percentage: (count / max) * 100,
  };
}

// ============================================================================
// FIELD-SPECIFIC VALIDATION HOOKS
// ============================================================================

/**
 * Hook for validating job position field
 */
export function useJobPositionValidation() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    try {
      createInterviewRequestSchema.shape.jobPosition.parse(newValue);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  return { value, error, handleChange, isValid: !error && value.length > 0 };
}

/**
 * Hook for validating job description field
 */
export function useJobDescValidation() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    try {
      createInterviewRequestSchema.shape.jobDesc.parse(newValue);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  return { value, error, handleChange, isValid: !error && value.length > 0 };
}

/**
 * Hook for validating experience field
 */
export function useExperienceValidation() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    const numValue = Number(newValue);
    try {
      createInterviewRequestSchema.shape.jobExperience.parse(numValue);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  return {
    value,
    error,
    handleChange,
    isValid: !error && !isNaN(Number(value)) && value.length > 0,
  };
}

/**
 * Hook for validating user answer field
 */
export function useAnswerValidation() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    try {
      generateFeedbackRequestSchema.shape.userAnswer.parse(newValue);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, []);

  return { value, error, handleChange, isValid: !error && value.length > 0 };
}

// ============================================================================
// DEBOUNCED VALIDATION HOOK
// ============================================================================

/**
 * Hook for debounced field validation (reduces excessive validation)
 */
export function useDebouncedValidation(delay = 300) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();

  const validateWithDelay = useCallback(
    (fieldName: string, value: unknown, schema: any) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          schema.parse(value);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        } catch (err) {
          if (err instanceof Error) {
            setErrors((prev) => ({
              ...prev,
              [fieldName]: err.message,
            }));
          }
        }
      }, delay);
    },
    [delay]
  );

  return { errors, validateWithDelay };
}

// ============================================================================
// BULK VALIDATION HOOK
// ============================================================================

/**
 * Hook for validating entire form at once
 */
export function useFormValidation<T extends Record<string, unknown>>(schema: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    (formData: T): boolean => {
      setIsValidating(true);
      try {
        schema.parse(formData);
        setErrors({});
        setIsValidating(false);
        return true;
      } catch (err) {
        if (err instanceof Error && 'issues' in err) {
          const newErrors: Record<string, string> = {};
          (err as any).issues.forEach((issue: any) => {
            const path = issue.path.join('.');
            newErrors[path] = issue.message;
          });
          setErrors(newErrors);
        }
        setIsValidating(false);
        return false;
      }
    },
    [schema]
  );

  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, resetErrors, isValidating };
}
