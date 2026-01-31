# Fix Infinite Recursion Error

## Problem
The error "infinite recursion detected in policy for relation 'students'" occurs because the RLS policies have a circular dependency.

## Solution

### Step 1: Run the Migration in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `/supabase/migrations/005_fix_infinite_recursion_policies.sql`
5. Click **Run**

### Step 2: Verify the Fix

After running the migration, try the onboarding process again. The errors should be resolved.

## What Was Changed

1. **Removed the problematic "Rankboard read for opted-in users" policy** that caused infinite recursion
2. **Created a new "Users can view profiles" policy** that:
   - Allows users to always view their own profile
   - Allows users to view other opted-in profiles (without causing recursion)
3. **Simplified the onboarding queries** to avoid complex `.or()` filters that might trigger multiple policies

## Alternative: Quick Fix via Supabase Dashboard

If you prefer, you can manually fix this in the Supabase Dashboard:

1. Go to **Authentication** > **Policies**
2. Find the **students** table
3. Delete the policy named **"Rankboard read for opted-in users"**
4. Create a new policy:
   - **Name**: Users can view profiles
   - **Policy command**: SELECT
   - **Using expression**:
   ```sql
   auth.uid() = id
   OR
   (
     consent_rankboard = true 
     AND auth.uid() IN (
       SELECT id FROM students WHERE consent_rankboard = true
     )
   )
   ```
