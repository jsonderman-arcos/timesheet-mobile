/*
  # Create timesheet database schema

  1. New Tables
    - `crew_members`
      - `id` (text, primary key) - Format: C00XXXXX
      - `name` (text, not null)
      - `role` (text)
      - `phone` (text)
      - `email` (text)
      - `hourly_rate` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `timesheet_entries`
      - `id` (uuid, primary key)
      - `crew_member_id` (text, foreign key)
      - `date` (date, not null)
      - `clock_in` (time, not null)
      - `clock_out` (time)
      - `hours_worked` (decimal, computed)
      - `activity` (text)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
*/

-- Create crew_members table
CREATE TABLE IF NOT EXISTS crew_members (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text DEFAULT 'Line Worker',
  phone text,
  email text,
  hourly_rate decimal(10,2) DEFAULT 35.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create timesheet_entries table
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id text NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  date date NOT NULL,
  clock_in time NOT NULL,
  clock_out time,
  hours_worked decimal(4,2) GENERATED ALWAYS AS (
    CASE 
      WHEN clock_out IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600
      ELSE NULL
    END
  ) STORED,
  activity text DEFAULT 'working',
  notes text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for crew_members
CREATE POLICY "Users can read all crew members"
  ON crew_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert crew members"
  ON crew_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update crew members"
  ON crew_members
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for timesheet_entries
CREATE POLICY "Users can read all timesheet entries"
  ON timesheet_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert timesheet entries"
  ON timesheet_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update timesheet entries"
  ON timesheet_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete timesheet entries"
  ON timesheet_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_crew_member_id ON timesheet_entries(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_date ON timesheet_entries(date);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_status ON timesheet_entries(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_crew_members_updated_at
  BEFORE UPDATE ON crew_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheet_entries_updated_at
  BEFORE UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample crew members with C00XXXXX format IDs
INSERT INTO crew_members (id, name, role, phone, email, hourly_rate) VALUES
('C0012345', 'John Martinez', 'Crew Lead', '(555) 123-4567', 'j.martinez@utility.com', 45.00),
('C0067890', 'Sarah Johnson', 'Line Technician', '(555) 234-5678', 's.johnson@utility.com', 38.00),
('C0034567', 'Mike Davis', 'Equipment Operator', '(555) 345-6789', 'm.davis@utility.com', 35.00),
('C0089012', 'Lisa Chen', 'Safety Coordinator', '(555) 456-7890', 'l.chen@utility.com', 42.00),
('C0056789', 'David Wilson', 'Apprentice Lineman', '(555) 567-8901', 'd.wilson@utility.com', 28.00)
ON CONFLICT (id) DO NOTHING;