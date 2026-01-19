import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to read from .env in root of server app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

import { getSupabaseAdmin } from '../src/config/supabase.js';

const ADMIN_PHONE = '+919999999999';

async function createAdminUser() {
  console.log('🚀 Starting Admin User Creation Process...');
  console.log(`Target Phone: ${ADMIN_PHONE}`);

  const supabase = getSupabaseAdmin();

  try {
    // 1. Check if user exists in Auth
    // We can't search by phone directly easily in admin api without getUserById, 
    // but listUsers can work or just try to create and catch error.
    // Actually listUsers is safer.
    
    console.log('Checking if user exists...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) throw listError;

    let user = users.find(u => u.phone === ADMIN_PHONE);
    let userId;

    if (user) {
      console.log('✅ User already exists in Auth system.');
      userId = user.id;
    } else {
      console.log('User not found. Creating new user...');
      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: ADMIN_PHONE,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: 'Admin User'
        }
      });

      if (createError) throw createError;
      
      console.log('✅ User created successfully.');
      user = newUser.user;
      userId = user.id;
    }

    console.log(`User ID: ${userId}`);

    // 2. Ensure Profile exists and set Role
    // The trigger might have created the profile, but let's wait a moment or just upsert.
    // We'll use upsert to be safe and set the role.
    
    console.log('Updating profile with Admin role...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        phone: ADMIN_PHONE,
        role: 'admin',
        full_name: 'System Admin',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) throw profileError;

    console.log('✅ Profile updated successfully:');
    console.log(profile);
    console.log('\n🎉 Admin user setup complete!');
    console.log('You can now login with:');
    console.log(`Phone: ${ADMIN_PHONE}`);
    console.log('OTP: 123456 (Make sure this is added in Supabase Dashboard)');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
