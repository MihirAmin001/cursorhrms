import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and service role key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmUserEmail(email: string) {
  try {
    // First, get the user by email using the auth.users table
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }

    if (!users) {
      console.error('User not found');
      return;
    }

    // Confirm the user's email using the admin API
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      users.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming email:', confirmError);
      return;
    }

    console.log(`Email confirmed successfully for user: ${email}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script for admin@hrm.com
confirmUserEmail('admin@hrm.com'); 