/**
 * Add New Interview Dialog Component (Refactored)
 * 
 * Features:
 * - Real-time form validation using Zod schemas
 * - Client-side validation feedback
 * - Character count for text areas
 * - Type-safe form handling
 * - Error boundary integration
 * - Clerk authentication
 * - Database integration with mock interviews
 */

'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { db } from '@/app/utils/db';
import { MockInterview } from '@/app/utils/schema';
import { useCreateInterviewValidation } from '@/app/hooks/useFormValidation';
import {
  FormField,
  FormTextarea,
  FormNumberInput,
  FormContainer,
  InlineValidationMessage,
} from '@/app/components/FormComponents';

// ============================================================================
// TYPES
// ============================================================================

interface APIError {
  success: false;
  error: string;
  errors?: Record<string, string>;
}

interface APISuccess {
  success: true;
  data: {
    questions: Array<{ question: string; answer: string }>;
    metadata: {
      jobPosition: string;
      experience: number;
      totalQuestions: number;
    };
  };
}

type APIResponse = APISuccess | APIError;

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddNewInterview() {
  // ========================================================================
  // STATE & HOOKS
  // ========================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const {
    formData,
    handleChange,
    handleBlur,
    resetForm,
    getFormData,
    errors,
    touchedFields,
  } = useCreateInterviewValidation();

  // ========================================================================
  // FORM SUBMISSION
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    // Validate form before submission
    const validatedData = getFormData();
    if (!validatedData) {
      setApiError('Please fix the validation errors before submitting');
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      setApiError('User email not found. Please sign in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // =====================================================================
      // CALL GENERATE API
      // =====================================================================
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const apiData = (await response.json()) as APIResponse;

      if (!response.ok) {
        const errorMsg = 'error' in apiData ? apiData.error : 'Unknown error occurred';
        setApiError(errorMsg);
        return;
      }

      if (!apiData.success || !apiData.data) {
        setApiError('Invalid API response format');
        return;
      }

      // =====================================================================
      // SAVE TO DATABASE
      // =====================================================================
      const mockId = crypto.randomUUID();

      try {
        const dbResponse = await db
          .insert(MockInterview)
          .values({
            mockId,
            jsonMockResp: JSON.stringify(apiData.data),
            jobPosition: validatedData.jobPosition,
            jobDesc: validatedData.jobDesc,
            jobExperience: String(validatedData.jobExperience),
            createdBy: user.primaryEmailAddress.emailAddress,
            createdAt: new Date().toISOString(),
          })
          .returning({ mockId: MockInterview.mockId });

        if (!dbResponse[0]?.mockId) {
          setApiError('Failed to save interview to database');
          return;
        }

        // ===================================================================
        // SUCCESS - RESET AND REDIRECT
        // ===================================================================
        setApiSuccess(true);
        resetForm();
        setIsOpen(false);

        // Redirect to interview page
        router.push(`/dashboard/interview/${dbResponse[0].mockId}`);
      } catch (dbError) {
        console.error('Database error:', dbError);
        setApiError('Failed to save interview. Please try again.');
      }
    } catch (err) {
      console.error('API error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // RESET DIALOG
  // ========================================================================
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
      setApiError(null);
      setApiSuccess(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div>
      {/* Add New Interview Button */}
      <button
        type="button"
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => handleOpenChange(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add New Interview</h2>
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Interview</DialogTitle>
            <DialogDescription>Fill in the job details to generate interview questions</DialogDescription>
          </DialogHeader>

          {/* API Error Message */}
          {apiError && (
            <InlineValidationMessage
              type="error"
              message={apiError}
              icon={<span className="text-lg">⚠️</span>}
            />
          )}

          {/* API Success Message */}
          {apiSuccess && (
            <InlineValidationMessage
              type="success"
              message="Interview created successfully! Redirecting..."
              icon={<span className="text-lg">✓</span>}
            />
          )}

          {/* Form */}
          <FormContainer
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Generate Questions"
            submitButtonVariant="primary"
            showResetButton={true}
            onReset={() => {
              resetForm();
              setApiError(null);
            }}
            gap="md"
          >
            {/* Job Position Field */}
            <FormField
              name="jobPosition"
              label="Job Position"
              placeholder="e.g., Senior Software Engineer"
              type="text"
              value={formData.jobPosition}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.jobPosition?.message}
              touched={touchedFields.has('jobPosition')}
              helperText="2-100 characters"
              required
              maxLength={100}
              disabled={isSubmitting}
            />

            {/* Tech Stack Field */}
            <FormTextarea
              name="jobDesc"
              label="Tech Stack / Job Description"
              placeholder="e.g., React, Next.js, Node.js, PostgreSQL, AWS"
              value={formData.jobDesc}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.jobDesc?.message}
              touched={touchedFields.has('jobDesc')}
              helperText="Describe the technologies and key responsibilities (10-2000 characters)"
              required
              maxLength={2000}
              showCharCount={true}
              minRows={4}
              disabled={isSubmitting}
            />

            {/* Experience Field */}
            <FormNumberInput
              name="jobExperience"
              label="Years of Experience"
              placeholder="e.g., 5"
              value={formData.jobExperience}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.jobExperience?.message}
              touched={touchedFields.has('jobExperience')}
              helperText="0-80 years"
              required
              min={0}
              max={80}
              disabled={isSubmitting}
            />
          </FormContainer>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
            <p>
              <strong>Note:</strong> Interview questions are AI-generated based on your input. The
              quality depends on the detail and accuracy of the information provided.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
