import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { UseFormSetError } from 'react-hook-form';
import axios from 'axios';
import { applyVendorOnboarding } from '../services/auth';
import type { ApiAxiosError } from '../types/api';

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

        const FIELD_LABELS: Record<keyof RegisterFormData, { en: string; ar: string }> = {
          firstName: { en: 'First Name', ar: 'الاسم الأول' },
          lastName: { en: 'Last Name', ar: 'اسم العائلة' },
          email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
          phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
          storeName: { en: 'Store Name', ar: 'اسم المتجر' },
          category: { en: 'Category', ar: 'الفئة' },
          website: { en: 'Commercial Registration Number', ar: 'رقم السجل التجاري' },
          description: { en: 'Store Description', ar: 'وصف المتجر' },
          password: { en: 'Password', ar: 'كلمة المرور' },
          confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
        };

        const getFieldLabel = (field: keyof RegisterFormData): string => {
          return FIELD_LABELS[field]?.[isRtl ? 'ar' : 'en'] || field;
        };

        const mapKeyToField = (
          key: string
        ): keyof RegisterFormData | undefined => {
          const lower = key.toLowerCase();
          if (lower === 'firstname' || lower === 'first_name') return 'firstName';
          if (lower === 'lastname' || lower === 'last_name') return 'lastName';
          if (lower === 'email') return 'email';
          if (lower === 'phonenumber' || lower === 'phone' || lower === 'phone_number') return 'phone';
          if (lower === 'storename' || lower === 'store_name') return 'storeName';
          if (lower === 'storedescription' || lower === 'description' || lower === 'store_description')
            return 'description';
          if (lower === 'commercialregisternumber' || lower === 'website' || lower === 'crnumber' || lower === 'cr_number')
            return 'website';
          if (lower === 'category') return 'category';
          if (lower === 'password') return 'password';
          if (lower === 'confirmpassword' || lower === 'confirm_password') return 'confirmPassword';
          return undefined;
        };

        const fieldErrorSummaries: string[] = [];

        if (responseData) {
          const rawMessage = responseData.message;

          // Find validation array or object across all standard API formats
          let validationList: any[] | null = null;
          let validationMap: Record<string, any> | null = null;

          if (Array.isArray(responseData?.validation) && responseData.validation.length > 0) {
            validationList = responseData.validation;
          } else if (Array.isArray(responseData?.error?.validation) && responseData.error.validation.length > 0) {
            validationList = responseData.error.validation;
          } else if (Array.isArray(responseData?.details) && responseData.details.length > 0) {
            validationList = responseData.details;
          } else if (Array.isArray(responseData?.error?.details) && responseData.error.details.length > 0) {
            validationList = responseData.error.details;
          } else if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
            validationList = responseData.errors;
          } else if (Array.isArray(responseData?.error?.errors) && responseData.error.errors.length > 0) {
            validationList = responseData.error.errors;
          } else if (
            typeof responseData?.error?.details === 'object' &&
            responseData?.error?.details !== null &&
            Object.keys(responseData.error.details).length > 0
          ) {
            validationMap = responseData.error.details;
          } else if (
            typeof responseData?.details === 'object' &&
            responseData?.details !== null &&
            Object.keys(responseData.details).length > 0
          ) {
            validationMap = responseData.details;
          } else if (
            typeof responseData?.errors === 'object' &&
            responseData?.errors !== null &&
            Object.keys(responseData.errors).length > 0
          ) {
            validationMap = responseData.errors;
          }

          // 1. Process array of validation error items ({ field, issue } or { property, message })
          if (validationList && validationList.length > 0) {
            validationList.forEach((err: any) => {
              const key =
                typeof err === 'object' && err !== null
                  ? err.field || err.property || err.param || err.path || err.key || err.name
                  : null;
              const msg =
                typeof err === 'object' && err !== null
                  ? err.issue || err.message || err.msg || err.error || err.detail || err.reason
                  : typeof err === 'string'
                    ? err
                    : null;

              if (key && msg) {
                const fieldName = mapKeyToField(key);
                if (fieldName && setError) {
                  setError(fieldName, { type: 'server', message: msg });
                  const label = getFieldLabel(fieldName);
                  fieldErrorSummaries.push(`${label}: ${msg}`);
                } else {
                  fieldErrorSummaries.push(`${key}: ${msg}`);
                }
              } else if (msg) {
                fieldErrorSummaries.push(msg);
              }
            });
          } else if (validationMap) {
            Object.keys(validationMap).forEach((key) => {
              const fieldName = mapKeyToField(key);
              const val = validationMap![key];
              const cleanMsg = Array.isArray(val)
                ? val
                    .map((m) => (typeof m === 'object' ? m.issue || m.message || JSON.stringify(m) : m))
                    .join(', ')
                : typeof val === 'object'
                  ? val.issue || val.message || JSON.stringify(val)
                  : String(val);

              if (fieldName && setError) {
                setError(fieldName, { type: 'server', message: cleanMsg });
                const label = getFieldLabel(fieldName);
                fieldErrorSummaries.push(`${label}: ${cleanMsg}`);
              } else {
                fieldErrorSummaries.push(`${key}: ${cleanMsg}`);
              }
            });
          }

          // 2. Process array of error strings (NestJS default class-validator format)
          if (fieldErrorSummaries.length === 0) {
            const messagesList: string[] = [];
            if (Array.isArray(rawMessage)) {
              messagesList.push(...rawMessage);
            } else if (
              typeof rawMessage === 'string' &&
              rawMessage !== 'Bad Request' &&
              rawMessage !== 'Validation failed.'
            ) {
              messagesList.push(rawMessage);
            }

            messagesList.forEach((msg) => {
              let matchedField: keyof RegisterFormData | undefined;
              if (msg.includes('commercialRegisterNumber') || msg.includes('website'))
                matchedField = 'website';
              else if (msg.includes('phoneNumber') || msg.includes('phone'))
                matchedField = 'phone';
              else if (msg.includes('firstName')) matchedField = 'firstName';
              else if (msg.includes('lastName')) matchedField = 'lastName';
              else if (msg.includes('email')) matchedField = 'email';
              else if (msg.includes('storeName')) matchedField = 'storeName';
              else if (
                msg.includes('storeDescription') ||
                msg.includes('description')
              )
                matchedField = 'description';
              else if (msg.includes('password')) matchedField = 'password';

              if (matchedField && setError) {
                setError(matchedField, { type: 'server', message: msg });
                const label = getFieldLabel(matchedField);
                fieldErrorSummaries.push(`${label}: ${msg}`);
              } else {
                fieldErrorSummaries.push(msg);
              }
            });
          }
        }

        const fallbackDefaultMsg = isRtl
          ? 'فشلت عملية التسجيل. يرجى المحاولة مرة أخرى.'
          : 'Registration failed. Please try again.';

        let generalMsg = '';
        if (fieldErrorSummaries.length > 0) {
          const uniqueList = Array.from(new Set(fieldErrorSummaries));
          const header = isRtl
            ? 'يرجى تصحيح أخطاء التحقق التالية:'
            : 'Please fix the following validation errors:';
          generalMsg = `${header}\n• ${uniqueList.join('\n• ')}`;
        } else if (typeof responseData?.message === 'string') {
          generalMsg = responseData.message;
        } else if (
          Array.isArray(responseData?.message) &&
          responseData.message.length > 0
        ) {
          generalMsg = responseData.message.join('\n');
        } else if (typeof responseData?.error === 'string') {
          generalMsg = responseData.error;
        } else {
          generalMsg = (error as any)?.message || fallbackDefaultMsg;
        }

        toast.error(generalMsg);
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
