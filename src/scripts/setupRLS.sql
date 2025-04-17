-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON cursorhrms_users;
DROP POLICY IF EXISTS "Service role can insert users" ON cursorhrms_users;
DROP POLICY IF EXISTS "Users can update their own data" ON cursorhrms_users;
DROP POLICY IF EXISTS "Service role can update any user" ON cursorhrms_users;
DROP POLICY IF EXISTS "Service role can delete users" ON cursorhrms_users;

-- Enable Row Level Security
ALTER TABLE cursorhrms_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view their own data"
ON cursorhrms_users
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow service role to insert new users
CREATE POLICY "Service role can insert users"
ON cursorhrms_users
FOR INSERT
WITH CHECK (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data"
ON cursorhrms_users
FOR UPDATE
USING (auth.uid() = id);

-- Create policy to allow service role to update any user
CREATE POLICY "Service role can update any user"
ON cursorhrms_users
FOR UPDATE
USING (true);

-- Create policy to allow service role to delete users
CREATE POLICY "Service role can delete users"
ON cursorhrms_users
FOR DELETE
USING (true); 