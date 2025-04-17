-- Update the email confirmation status for admin@hrm.com
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@hrm.com';

-- Verify the update
SELECT email, email_confirmed_at
FROM auth.users
WHERE email = 'admin@hrm.com'; 