/**
 * Script to add an Accounting user for Accounting Dashboard testing
 * Phone: 2222222222, OTP: 123456
 */

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ACCOUNTING_USER = {
  phone: '912222222222',
  otp: '123456',
  role: 'accounting',
  full_name: 'Accounting Admin',
};

async function addAccountingUser() {
  console.log('📊 Adding Accounting User...');
  console.log('   Phone:', ACCOUNTING_USER.phone);
  console.log('   OTP:', ACCOUNTING_USER.otp);
  console.log('   Role:', ACCOUNTING_USER.role);

  try {
    // Step 1: Check if user already exists in auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const existingUser = existingUsers?.users?.find(u => u.phone === ACCOUNTING_USER.phone);

    let userId;

    if (existingUser) {
      console.log('ℹ️  User already exists in auth, updating profile...');
      userId = existingUser.id;
    } else {
      // Step 2: Create auth user with phone
      console.log('📱 Creating auth user...');
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        phone: ACCOUNTING_USER.phone,
        phone_confirm: true,
        user_metadata: {
          full_name: ACCOUNTING_USER.full_name,
        },
      });

      if (authError) {
        console.error('❌ Error creating auth user:', authError);
        return;
      }

      userId = authUser.user.id;
      console.log('✅ Auth user created:', userId);
    }

    // Step 3: Upsert profile with accounting role
    console.log('👤 Updating profile to accounting role...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        phone: ACCOUNTING_USER.phone,
        full_name: ACCOUNTING_USER.full_name,
        role: ACCOUNTING_USER.role,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
      return;
    }

    console.log('✅ Profile updated:', profile);

    console.log('\n========================================');
    console.log('✅ ACCOUNTING USER READY!');
    console.log('========================================');
    console.log('📱 Phone: ' + ACCOUNTING_USER.phone);
    console.log('🔐 OTP: ' + ACCOUNTING_USER.otp);
    console.log('👤 Role: ' + ACCOUNTING_USER.role);
    console.log('🆔 User ID: ' + userId);
    console.log('========================================\n');
    console.log('You can now login with this phone number.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addAccountingUser();
