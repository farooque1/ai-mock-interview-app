/**
 * Type-Safe Form Components with Validation
 * 
 * Reusable form components with built-in validation:
 * - FormField: Text input with validation
 * - FormTextarea: Textarea with character counter
 * - FormNumberInput: Number input with validation
 * - FormContainer: Form wrapper with submission handling
 * - ValidationError: Error message display
 */

'use client';

import React, { ReactNode } from 'react';
import { useCharacterCounter } from './useFormValidation';
import { VALIDATION_LIMITS } from '@/app/utils/validation.schemas';

// ============================================================================
// ERROR DISPLAY COMPONENT
// ============================================================================

interface ValidationErrorProps {
  message?: string;
  show: boolean;
  helperText?: string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ message, show, helperText }) => {
  if (!show || !message) return null;

  return (
    <div className="mt-1 flex flex-col gap-1">
      <p className="text-sm font-medium text-red-600">{message}</p>
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  touched,
  helperText,
  maxLength,
  showCharCount = false,
  required = false,
  onChange,
  onBlur,
  icon,
  value = '',
  ...inputProps
}) => {
  const charCounter = useCharacterCounter(inputProps.name || '', maxLength);
  const hasError = touched && !!error;
  const isExceeded = charCounter.isExceeded;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={inputProps.name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showCharCount && (
          <span className={`text-xs ${isExceeded ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            {charCounter.count} / {charCounter.max}
          </span>
        )}
      </div>

      <div className="relative mt-1">
        {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
        <input
          {...inputProps}
          value={value}
          onChange={(e) => {
            if (showCharCount) {
              charCounter.handleChange(e.target.value);
            }
            onChange?.(e);
          }}
          onBlur={onBlur}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-lg outline-none transition-colors
            ${icon ? 'pl-10' : ''}
            ${hasError ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />
      </div>

      {showCharCount && charCounter.isNearLimit && (
        <p className="mt-1 text-xs text-amber-600">Character limit approaching</p>
      )}

      <ValidationError message={error} show={hasError} helperText={helperText} />
    </div>
  );
};

// ============================================================================
// TEXTAREA COMPONENT WITH CHARACTER COUNTER
// ============================================================================

interface FormTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  maxLength?: number;
  required?: boolean;
  showCharCount?: boolean;
  minRows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  touched,
  helperText,
  maxLength,
  required = false,
  showCharCount = true,
  minRows = 4,
  onChange,
  onBlur,
  value = '',
  ...textareaProps
}) => {
  const charCounter = useCharacterCounter(textareaProps.name || '', maxLength);
  const hasError = touched && !!error;
  const isExceeded = charCounter.isExceeded;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={textareaProps.name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showCharCount && (
          <span className={`text-xs ${isExceeded ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            {charCounter.count} / {charCounter.max}
          </span>
        )}
      </div>

      <textarea
        {...textareaProps}
        value={value}
        onChange={(e) => {
          if (showCharCount) {
            charCounter.handleChange(e.target.value);
          }
          onChange?.(e);
        }}
        onBlur={onBlur}
        maxLength={maxLength}
        rows={minRows}
        className={`
          w-full px-3 py-2 border rounded-lg outline-none transition-colors resize-none
          ${hasError ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
      />

      <div className="flex items-center justify-between mt-1">
        <div>
          {showCharCount && charCounter.isNearLimit && (
            <p className="text-xs text-amber-600">Character limit approaching</p>
          )}
        </div>
        {showCharCount && (
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-colors ${
                isExceeded ? 'bg-red-500' : charCounter.isNearLimit ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(charCounter.percentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      <ValidationError message={error} show={hasError} helperText={helperText} />
    </div>
  );
};

// ============================================================================
// NUMBER INPUT COMPONENT
// ============================================================================

interface FormNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
}

export const FormNumberInput: React.FC<FormNumberInputProps> = ({
  label,
  error,
  touched,
  helperText,
  required = false,
  min,
  max,
  onChange,
  onBlur,
  icon,
  value = '',
  ...inputProps
}) => {
  const hasError = touched && !!error;

  return (
    <div className="w-full">
      <label htmlFor={inputProps.name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {(min !== undefined || max !== undefined) && (
          <span className="text-xs text-gray-500 ml-2">
            {min !== undefined && max !== undefined ? `(${min}-${max})` : min ? `(≥${min})` : `(≤${max})`}
          </span>
        )}
      </label>

      <div className="relative mt-1">
        {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
        <input
          {...inputProps}
          type="number"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          min={min}
          max={max}
          className={`
            w-full px-3 py-2 border rounded-lg outline-none transition-colors
            ${icon ? 'pl-10' : ''}
            ${hasError ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />
      </div>

      <ValidationError message={error} show={hasError} helperText={helperText} />
    </div>
  );
};

// ============================================================================
// FORM CONTAINER COMPONENT
// ============================================================================

interface FormContainerProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  submitButtonVariant?: 'primary' | 'secondary' | 'danger';
  resetButtonText?: string;
  onReset?: () => void;
  showResetButton?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit',
  submitButtonVariant = 'primary',
  resetButtonText = 'Reset',
  onReset,
  showResetButton = false,
  gap = 'md',
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const buttonVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <form onSubmit={onSubmit} className={`flex flex-col ${gapClasses[gap]} w-full`}>
      {children}

      <div className="flex gap-2 justify-end pt-2">
        {showResetButton && (
          <button
            type="reset"
            onClick={onReset}
            disabled={isSubmitting}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              bg-gray-100 hover:bg-gray-200 text-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {resetButtonText}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${buttonVariants[submitButtonVariant]}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? 'Processing...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// SELECT COMPONENT
// ============================================================================

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  touched,
  helperText,
  required = false,
  options,
  onChange,
  onBlur,
  value = '',
  ...selectProps
}) => {
  const hasError = touched && !!error;

  return (
    <div className="w-full">
      <label htmlFor={selectProps.name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        {...selectProps}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full px-3 py-2 border rounded-lg outline-none transition-colors mt-1
          ${hasError ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ValidationError message={error} show={hasError} helperText={helperText} />
    </div>
  );
};

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  error,
  touched,
  helperText,
  onChange,
  onBlur,
  ...inputProps
}) => {
  const hasError = touched && !!error;

  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          {...inputProps}
          type="checkbox"
          onChange={onChange}
          onBlur={onBlur}
          className={`
            w-4 h-4 rounded outline-none transition-colors cursor-pointer
            ${hasError ? 'accent-red-500' : 'accent-blue-600'}
          `}
        />
        <label htmlFor={inputProps.name} className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      </div>

      <ValidationError message={error} show={hasError} helperText={helperText} />
    </div>
  );
};

// ============================================================================
// INLINE VALIDATION MESSAGE
// ============================================================================

interface InlineValidationMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: ReactNode;
}

export const InlineValidationMessage: React.FC<InlineValidationMessageProps> = ({ type, message, icon }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${typeStyles[type]}`}>
      {icon && <span>{icon}</span>}
      <p className="text-sm">{message}</p>
    </div>
  );
};
