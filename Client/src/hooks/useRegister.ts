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
        const responseData = axiosError?.response?.data as any;

        let mainMsg = '';

        if (responseData) {
          const rawMessage = responseData.message;
          const rawErrorObj =
            typeof responseData.error === 'object'
              ? responseData.error
              : responseData;

          const mapKeyToField = (key: string): keyof RegisterFormData | undefined => {
            if (key === 'firstName') return 'firstName';
            if (key === 'lastName') return 'lastName';
            if (key === 'email') return 'email';
            if (key === 'phoneNumber' || key === 'phone') return 'phone';
            if (key === 'storeName') return 'storeName';
            if (key === 'storeDescription' || key === 'description') return 'description';
            if (key === 'commercialRegisterNumber' || key === 'website') return 'website';
            if (key === 'password') return 'password';
            return undefined;
          };

          // 1. Process array of error strings (NestJS default class-validator format)
          const messagesList: string[] = [];
          if (Array.isArray(rawMessage)) {
            messagesList.push(...rawMessage);
          } else if (typeof rawMessage === 'string' && rawMessage !== 'Bad Request') {
            messagesList.push(rawMessage);
          }

          messagesList.forEach((msg) => {
            let matchedField: keyof RegisterFormData | undefined;
            if (msg.includes('commercialRegisterNumber')) matchedField = 'website';
            else if (msg.includes('phoneNumber') || msg.includes('phone')) matchedField = 'phone';
            else if (msg.includes('firstName')) matchedField = 'firstName';
            else if (msg.includes('lastName')) matchedField = 'lastName';
            else if (msg.includes('email')) matchedField = 'email';
            else if (msg.includes('storeName')) matchedField = 'storeName';
            else if (msg.includes('storeDescription') || msg.includes('description')) matchedField = 'description';
            else if (msg.includes('password')) matchedField = 'password';

            if (matchedField && setError) {
              setError(matchedField, { type: 'server', message: msg });
            } else {
              mainMsg += `${msg}\n`;
            }
          });

          // 2. Process structured validation objects/arrays
          let fieldErrors: Record<string, any> =
            rawErrorObj?.details || rawErrorObj?.errors || rawErrorObj?.validation || {};

          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((err: ValidationErrorItem) => {
              const key = err.field || err.property || err.param;
              const msg = err.message || err.msg || err.error;
              if (key && msg) {
                const fieldName = mapKeyToField(key);
                if (fieldName && setError) {
                  setError(fieldName, { type: 'server', message: msg });
                } else {
                  mainMsg += `${key}: ${msg}\n`;
                }
              }
            });
          } else if (typeof fieldErrors === 'object' && fieldErrors !== null) {
            Object.keys(fieldErrors).forEach((key) => {
              if (
                ['message', 'success', 'status', 'statusCode', 'data', 'meta', 'error'].includes(key)
              )
                return;

              const fieldName = mapKeyToField(key);
              const val = fieldErrors[key];
              const cleanMsg = Array.isArray(val)
                ? val.map((m) => (typeof m === 'object' ? JSON.stringify(m) : m)).join(', ')
                : typeof val === 'object'
                ? JSON.stringify(val)
                : String(val);

              if (fieldName && setError) {
                setError(fieldName, { type: 'server', message: cleanMsg });
              } else {
                mainMsg += `${key}: ${cleanMsg}\n`;
              }
            });
          }
        }

        const fallbackDefaultMsg = isRtl
          ? 'فشلت عملية التسجيل. يرجى المحاولة مرة أخرى.'
          : 'Registration failed. Please try again.';

        let generalMsg = mainMsg.trim();
        if (!generalMsg) {
          if (typeof responseData?.message === 'string') {
            generalMsg = responseData.message;
          } else if (Array.isArray(responseData?.message) && responseData.message.length > 0) {
            generalMsg = responseData.message.join('\n');
          } else if (typeof responseData?.error === 'string') {
            generalMsg = responseData.error;
          } else {
            generalMsg = (error as any)?.message || fallbackDefaultMsg;
          }
        }

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
