/**
 * Reusable Shared Components
 * 
 * UI components that can be reused across the application:
 * - Loading states (Loader, SkeletonLoader)
 * - Cards (Card, CardHeader, CardContent)
 * - Modals (Modal, ConfirmDialog)
 * - Progress indicators
 * - Feedback components (SuccessMessage, ErrorMessage)
 * - Layout components (Container, Section)
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// ============================================================================
// LOADER COMPONENTS
// ============================================================================

/**
 * Simple spinner loader
 */
export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
};

/**
 * Loader with message
 */
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 p-8">
    <Loader size="lg" />
    <p className="text-gray-600 font-medium">{message}</p>
  </div>
);

/**
 * Skeleton loader for placeholder content
 */
export const SkeletonLoader: React.FC<{
  count?: number;
  height?: string;
  className?: string;
}> = ({ count = 1, height = 'h-4', className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse`}
      />
    ))}
  </div>
);

// ============================================================================
// CARD COMPONENTS
// ============================================================================

/**
 * Card container
 */
export const Card: React.FC<{ children: ReactNode; className?: string; clickable?: boolean; onClick?: () => void }> = ({
  children,
  className = '',
  clickable = false,
  onClick,
}) => (
  <div
    className={`
      bg-white rounded-lg border border-gray-200 shadow-sm
      ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
);

/**
 * Card header
 */
export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Card content
 */
export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

/**
 * Card footer
 */
export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

/**
 * Modal/Dialog component
 */
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}> = ({ isOpen, onClose, title, children, footer, size = 'md', closeButton = true }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Confirm dialog with yes/no buttons
 */
export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-md text-white transition ${
            isDangerous
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmText}
        </button>
      </>
    }
  >
    <p className="text-gray-600">{message}</p>
  </Modal>
);

// ============================================================================
// PROGRESS COMPONENTS
// ============================================================================

/**
 * Progress bar
 */
export const ProgressBar: React.FC<{
  progress: number;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}> = ({ progress, showLabel = false, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
  };

  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm text-gray-600 text-center">{percentage}%</p>
      )}
    </div>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  label?: string;
}> = ({ progress, size = 80, label }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#1f2937"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {progress}%
        </text>
      </svg>
      {label && <p className="text-sm text-gray-600">{label}</p>}
    </div>
  );
};

/**
 * Step indicator/progress
 */
export const StepIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}> = ({ currentStep, totalSteps, stepLabels }) => (
  <div className="flex items-center justify-between">
    {Array.from({ length: totalSteps }).map((_, index) => {
      const step = index + 1;
      const isActive = step <= currentStep;
      const isCurrent = step === currentStep;

      return (
        <div key={step} className="flex items-center flex-1">
          {/* Step Circle */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
              ${isCurrent ? 'bg-blue-600 text-white' : isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              transition-colors
            `}
          >
            {isActive && step < currentStep ? '✓' : step}
          </div>

          {/* Step Label */}
          {stepLabels && stepLabels[index] && (
            <p className="text-xs text-gray-600 mt-1 absolute -bottom-6">{stepLabels[index]}</p>
          )}

          {/* Connector */}
          {step < totalSteps && (
            <div
              className={`
                flex-1 h-1 mx-2
                ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'}
                transition-colors
              `}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ============================================================================
// FEEDBACK/MESSAGE COMPONENTS
// ============================================================================

/**
 * Success message
 */
export const SuccessMessage: React.FC<{
  message: string;
  onClose?: () => void;
}> = ({ message, onClose }) => (
  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
    <p className="text-green-800 text-sm font-medium flex-1">{message}</p>
    {onClose && (
      <button onClick={onClose} className="text-green-600 hover:text-green-700">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

/**
 * Error message
 */
export const ErrorMessage: React.FC<{
  message: string;
  onClose?: () => void;
}> = ({ message, onClose }) => (
  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
    <p className="text-red-800 text-sm font-medium flex-1">{message}</p>
    {onClose && (
      <button onClick={onClose} className="text-red-600 hover:text-red-700">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

/**
 * Warning message
 */
export const WarningMessage: React.FC<{
  message: string;
  onClose?: () => void;
}> = ({ message, onClose }) => (
  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
    <p className="text-yellow-800 text-sm font-medium flex-1">{message}</p>
    {onClose && (
      <button onClick={onClose} className="text-yellow-600 hover:text-yellow-700">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

/**
 * Info message
 */
export const InfoMessage: React.FC<{
  message: string;
  onClose?: () => void;
}> = ({ message, onClose }) => (
  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
    <p className="text-blue-800 text-sm font-medium flex-1">{message}</p>
    {onClose && (
      <button onClick={onClose} className="text-blue-600 hover:text-blue-700">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

/**
 * Container with max-width and padding
 */
export const Container: React.FC<{
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, className = '', size = 'lg' }) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Section with vertical spacing
 */
export const Section: React.FC<{
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}> = ({ children, className = '', title, subtitle }) => (
  <section className={`py-8 sm:py-12 ${className}`}>
    {title && (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

/**
 * Grid layout
 */
export const Grid: React.FC<{
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, columns = 3, gap = 'md', className = '' }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${colClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

/**
 * Empty state placeholder
 */
export const EmptyState: React.FC<{
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {icon && <div className="mb-4 text-gray-400 text-5xl">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="mt-2 text-gray-600 text-center max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

/**
 * Badge/tag component
 */
export const Badge: React.FC<{
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md';
}> = ({ label, variant = 'primary', size = 'md' }) => {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
};

// ============================================================================
// DIVIDER COMPONENTS
// ============================================================================

/**
 * Horizontal divider
 */
export const Divider: React.FC<{ label?: string; className?: string }> = ({
  label,
  className = '',
}) => {
  if (!label) {
    return <hr className={`border-gray-200 ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <hr className="flex-1 border-gray-200" />
      <span className="text-sm text-gray-500">{label}</span>
      <hr className="flex-1 border-gray-200" />
    </div>
  );
};
