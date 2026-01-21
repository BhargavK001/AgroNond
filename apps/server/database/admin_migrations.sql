-- Admin Panel Schema Migrations

-- 1. Commission Rules Table
CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL, -- e.g., 'Wheat', 'Rice', or 'All'
  role_type TEXT NOT NULL, -- e.g., 'trader', 'farmer'
  rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.02 for 2%
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id),
  payer_id UUID REFERENCES profiles(id),
  payee_id UUID REFERENCES profiles(id),
  amount DECIMAL(14, 2) NOT NULL,
  status TEXT CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')) DEFAULT 'Pending',
  payment_method TEXT, -- e.g., 'Bank Transfer', 'Cash', 'UPI'
  transaction_ref TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Commission Rules: Public read (for calculations), Admin write
CREATE POLICY "Public read commission rules" ON commission_rules FOR SELECT USING (true);
-- Note: Admin write policy needs a way to identify admins. Using a text role check or specific ID if available. 
-- For now, we'll assume application-level checks for writing, or add a policy if 'auth.jwt()->>role' or profile lookup is used.
-- Using a simplistic check for now assuming 'admin' role in profiles is required which is hard to join in simple policies without performance hit or custom claims.
-- We will rely on backend API `requireAuth` + Role check for mutations.

-- System Settings: Public read (some might be sensitive, but for now allow read), Admin write
CREATE POLICY "Public read system settings" ON system_settings FOR SELECT USING (true);

-- Payments: Participants view, Admin view
CREATE POLICY "Users view their own payments" ON payments FOR SELECT 
USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- 6. Triggers for updated_at
CREATE TRIGGER update_commission_rules_updated_at BEFORE UPDATE ON commission_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'AgroNond Admin Schema created successfully!' AS message;
