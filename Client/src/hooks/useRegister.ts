import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { UseFormSetError } from 'react-hook-form';
import axios from 'axios';
import { applyVendorOnboarding } from '../services/auth';
import type { ApiAxiosError, ValidationErrorItem } from '../types/api';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
  category: string;
  website: string;
  description: string;
  password: string;
  confirmPassword: string;
}

export const useRegister = (setError?: UseFormSetError<RegisterFormData>) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [submitted, setSubmitted] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormData) => {
      try {
        const data = await applyVendorOnboarding({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phoneNumber: values.phone,
          storeName: values.storeName,
          storeDescription: values.description,
          commercialRegisterNumber: values.website,
        });
        return data;
      } catch (error: unknown) {
        const isAx = axios.isAxiosError(error);
        const axiosError = isAx ? (error as ApiAxiosError) : null;
        const responseData = axiosError?.response?.data;
        
        // 1. Try to find the API error object (handling response format with data/error/meta)
        const apiError = responseData?.error || responseData;
        
        // 2. Try to find field-specific errors
        let fieldErrors: unknown = null;
        if (apiError && typeof apiError === 'object') {
          const obj = apiError as Record<string, any>;
          fieldErrors = obj.details || obj.errors || obj.validation || apiError;
        }

        // If it resolved to the top level response wrapper itself, drill down into .error
        if (fieldErrors && typeof fieldErrors === 'object' && ('data' in fieldErrors || 'error' in fieldErrors)) {
          const innerError = (fieldErrors as Record<string, any>).error;
          if (innerError && typeof innerError === 'object') {
            fieldErrors = innerError.details || innerError.errors || innerError.validation || innerError;
          }
        }

        let mainMsg = '';

        if (fieldErrors && typeof fieldErrors === 'object') {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((err: ValidationErrorItem) => {
              const key = err.field || err.property || err.param;
              const msg = err.message || err.msg || err.error;
              if (key && msg) {
                let fieldName: keyof RegisterFormData | undefined;
                if (key === 'firstName') fieldName = 'firstName';
                else if (key === 'lastName') fieldName = 'lastName';
                else if (key === 'email') fieldName = 'email';
                else if (key === 'phoneNumber' || key === 'phone') fieldName = 'phone';
                else if (key === 'storeName') fieldName = 'storeName';
                else if (key === 'storeDescription' || key === 'description') fieldName = 'description';
                else if (key === 'commercialRegisterNumber' || key === 'website') fieldName = 'website';
                else if (key === 'password') fieldName = 'password';

                if (fieldName && setError) {
                  setError(fieldName, {
                    type: 'server',
                    message: msg,
                  });
                } else {
                  mainMsg += `${key}: ${msg}\n`;
                }
              }
            });
          } else {
            // Object map
            Object.keys(fieldErrors).forEach((key) => {
              if (key === 'message' || key === 'success' || key === 'status' || key === 'statusCode' || key === 'data' || key === 'meta' || key === 'error') return;

              let fieldName: keyof RegisterFormData | undefined;
              if (key === 'firstName') fieldName = 'firstName';
              else if (key === 'lastName') fieldName = 'lastName';
              else if (key === 'email') fieldName = 'email';
              else if (key === 'phoneNumber' || key === 'phone') fieldName = 'phone';
              else if (key === 'storeName') fieldName = 'storeName';
              else if (key === 'storeDescription' || key === 'description') fieldName = 'description';
              else if (key === 'commercialRegisterNumber' || key === 'website') fieldName = 'website';
              else if (key === 'password') fieldName = 'password';

              const val = fieldErrors[key];
              const messages = Array.isArray(val) ? val : [val];
              // Filter out nested object strings like "[object Object]"
              const cleanMessages = messages.map(m => typeof m === 'object' ? JSON.stringify(m) : m);
              const messageStr = cleanMessages.join(', ');

              if (fieldName && setError) {
                setError(fieldName, {
                  type: 'server',
                  message: messageStr,
                });
              } else {
                mainMsg += `${key}: ${messageStr}\n`;
              }
            });
          }
        }

        const generalMsg = 
          apiError?.message || 
          responseData?.message || 
          mainMsg.trim() || 
          error.message ||
          (isRtl
            ? 'فشلت عملية التسجيل. يرجى المحاولة مرة أخرى.'
            : 'Registration failed. Please try again.');

        throw new Error(generalMsg);
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success(
        isRtl
          ? 'تم تقديم طلبك بنجاح!'
          : 'Your application has been submitted successfully!'
      );
    },
  });

  return {
    register: registerMutation.mutate,
    isPending: registerMutation.isPending,
    submitted,
    error: registerMutation.error,
    setSubmitted,
    reset: registerMutation.reset,
    registrationData: registerMutation.data,
  };
};
