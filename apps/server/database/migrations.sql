-- AgroNond Trader Dashboard Schema

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES profiles(id),
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL CHECK (quantity > 0),
  rate DECIMAL(12, 2) NOT NULL CHECK (rate > 0),
  total_amount DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  commission_rate DECIMAL(5, 4) DEFAULT 0.09,
  status TEXT CHECK (status IN ('Pending', 'Paid', 'Overdue')) DEFAULT 'Pending',
  purchase_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_trader ON purchases(trader_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date DESC);

-- Farmer Contacts table
CREATE TABLE IF NOT EXISTS farmer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  primary_crop TEXT,
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_transactions INTEGER DEFAULT 0,
  total_value DECIMAL(14, 2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trader_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_farmer_contacts_trader ON farmer_contacts(trader_id);
CREATE INDEX IF NOT EXISTS idx_farmer_contacts_location ON farmer_contacts(location);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL CHECK (quantity >= 0),
  max_quantity DECIMAL(12, 2) NOT NULL CHECK (max_quantity > 0),
  unit TEXT DEFAULT 'kg',
  location TEXT,
  price_per_unit DECIMAL(12, 2) NOT NULL CHECK (price_per_unit > 0),
  days_in_storage INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('good', 'low', 'critical')) DEFAULT 'good',
  purchase_id UUID REFERENCES purchases(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trader_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_trader ON inventory(trader_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_crop ON inventory(crop);

-- RLS Policies
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Purchases policies
CREATE POLICY "Traders can view own purchases" ON purchases FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Traders can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Traders can update own purchases" ON purchases FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Traders can delete own purchases" ON purchases FOR DELETE USING (auth.uid() = trader_id);

-- Farmer contacts policies
CREATE POLICY "Traders can view own contacts" ON farmer_contacts FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Traders can insert own contacts" ON farmer_contacts FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Traders can update own contacts" ON farmer_contacts FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Traders can delete own contacts" ON farmer_contacts FOR DELETE USING (auth.uid() = trader_id);

-- Inventory policies
CREATE POLICY "Traders can view own inventory" ON inventory FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Traders can insert own inventory" ON inventory FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Traders can update own inventory" ON inventory FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Traders can delete own inventory" ON inventory FOR DELETE USING (auth.uid() = trader_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_contacts_updated_at BEFORE UPDATE ON farmer_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inventory status trigger
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.max_quantity * 0.1 THEN
    NEW.status = 'critical';
  ELSIF NEW.quantity <= NEW.max_quantity * 0.25 THEN
    NEW.status = 'low';
  ELSE
    NEW.status = 'good';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_inventory_status BEFORE INSERT OR UPDATE OF quantity ON inventory FOR EACH ROW EXECUTE FUNCTION update_inventory_status();

SELECT 'AgroNond Trader Dashboard schema created successfully!' AS message;
