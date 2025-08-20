import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('supabase.co');
};

// Database types
export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TimesheetEntry {
  id: string;
  crew_member_id: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  activity: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Helper function to generate crew member ID
export function generateCrewId(): string {
  const randomNumbers = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `C00${randomNumbers}`;
}

// Database operations
export const db = {
  // Crew Members
  async getCrewMembers(): Promise<CrewMember[]> {
    const { data, error } = await supabase
      .from('crew_members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async createCrewMember(crewMember: Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>): Promise<CrewMember> {
    const newCrewMember = {
      id: generateCrewId(),
      ...crewMember,
    };

    const { data, error } = await supabase
      .from('crew_members')
      .insert(newCrewMember)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Timesheet Entries
  async getTimesheetEntries(date?: string): Promise<TimesheetEntry[]> {
    let query = supabase
      .from('timesheet_entries')
      .select('*')
      .order('date', { ascending: false })
      .order('clock_in', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async createTimesheetEntry(entry: Omit<TimesheetEntry, 'id' | 'hours_worked' | 'created_at' | 'updated_at'>): Promise<TimesheetEntry> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTimesheetEntry(id: string, updates: Partial<TimesheetEntry>): Promise<TimesheetEntry> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTimesheetEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('timesheet_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get entries for specific crew member and date
  async getCrewTimesheetForDate(crewMemberId: string, date: string): Promise<TimesheetEntry[]> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .eq('date', date)
      .order('clock_in');
    
    if (error) throw error;
    return data || [];
  },

  // Get total hours for a date
  async getTotalHoursForDate(date: string): Promise<number> {
    const { data, error } = await supabase
      .from('timesheet_entries')
      .select('hours_worked')
      .eq('date', date)
      .not('hours_worked', 'is', null);
    
    if (error) throw error;
    
    return data?.reduce((total, entry) => total + (entry.hours_worked || 0), 0) || 0;
  },
};