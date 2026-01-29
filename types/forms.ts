/**
 * Form-related types
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RequestAccessFormData {
  email: string;
  company: string;
  message?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}
