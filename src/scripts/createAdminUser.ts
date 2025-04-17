import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and service role key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // First, sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@hrm.com',
      password: 'Admin@123', // You should change this password after first login
      email_confirm: true // Automatically confirm the email
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    if (!authData.user) {
      console.error('No user data returned from signup');
      return;
    }

    // Then, create the user record in cursorhrms_users
    const { error: dbError } = await supabase
      .from('cursorhrms_users')
      .insert([
        {
          id: authData.user.id,
          email: 'admin@hrm.com',
          role: 'admin'
        }
      ]);

    if (dbError) {
      console.error('Error creating user record:', dbError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: admin@hrm.com');
    console.log('Password: Admin@123');
    console.log('Please change the password after first login.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminUser(); 