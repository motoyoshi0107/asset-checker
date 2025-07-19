-- =============================================
-- Personal Finance Dashboard - Initial Schema
-- =============================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create tables
CREATE TABLE IF NOT EXISTS assets_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    asset_class TEXT NOT NULL, -- e.g., "stocks", "bonds", "cash", "crypto"
    sub_account TEXT, -- e.g., "401k", "roth_ira", "brokerage"
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL, -- e.g., "food", "transport", "entertainment"
    memo TEXT,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    annual_rate DECIMAL(5,4) NOT NULL DEFAULT 0.07, -- 7% annual return
    monthly_invest DECIMAL(10,2) NOT NULL DEFAULT 1000.00, -- $1000/month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One setting per user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_snapshots_user_date ON assets_snapshots(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_user ON monthly_settings(user_id);

-- Enable Row Level Security
ALTER TABLE assets_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own asset snapshots" ON assets_snapshots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own asset snapshots" ON assets_snapshots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own asset snapshots" ON assets_snapshots
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own asset snapshots" ON assets_snapshots
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly settings" ON monthly_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly settings" ON monthly_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly settings" ON monthly_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly settings" ON monthly_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_assets_snapshots_updated_at 
    BEFORE UPDATE ON assets_snapshots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_settings_updated_at 
    BEFORE UPDATE ON monthly_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();