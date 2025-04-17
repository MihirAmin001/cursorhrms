import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  position: string;
  hire_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  name: string;
  description: string;
  manager_id: string;
  created_at: string;
  updated_at: string;
};

export type LeaveRequest = {
  id: string;
  employee_id: string;
  leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid';
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  employee_id: string;
  title: string;
  type: string;
  file_url: string;
  created_at: string;
  updated_at: string;
};

// Table names
export const TABLES = {
  PROFILES: 'cursorhrms_profiles',
  EMPLOYEES: 'cursorhrms_employees',
  DEPARTMENTS: 'cursorhrms_departments',
  LEAVE_REQUESTS: 'cursorhrms_leave_requests',
  DOCUMENTS: 'cursorhrms_documents',
} as const; 