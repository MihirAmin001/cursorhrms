import { supabase } from '../lib/supabase';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  // Add other employee fields as needed
}

export async function getEmployeesByBirthDateRange(startDate: string, endDate: string): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('cursorhrms_employees')
      .select('*')
      .gte('birth_date', startDate)
      .lte('birth_date', endDate);

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmployeesByBirthDateRange:', error);
    throw error;
  }
} 