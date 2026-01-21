-- 1. Create the records table
CREATE TABLE IF NOT EXISTS public.records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.profiles(id) NOT NULL,
  market TEXT NOT NULL,
  vegetable TEXT NOT NULL,
  quantity NUMERIC NOT NULL, -- Estimated quantity
  official_qty NUMERIC,      -- Updated by committee
  rate NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  trader TEXT DEFAULT '-',
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Weighed', 'Sold'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Security
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Permissions)

-- Farmers can see ONLY their own records
CREATE POLICY "Farmers view own records" ON public.records
  FOR SELECT USING (auth.uid() = farmer_id);

-- Farmers can insert records
CREATE POLICY "Farmers insert records" ON public.records
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- Committee/Weight Staff can view ALL records (to search and weigh)
CREATE POLICY "Staff view all records" ON public.records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('committee', 'weight', 'admin'))
  );

-- Committee/Weight Staff can UPDATE records (to set weight)
CREATE POLICY "Staff update records" ON public.records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('committee', 'weight', 'admin'))
  );