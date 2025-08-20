import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { db, CrewMember as DBCrewMember, TimesheetEntry as DBTimesheetEntry } from '@/lib/supabase';

export interface StormEvent {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'planning';
  priority: 'high' | 'medium' | 'low';
  region: string;
  description: string;
  totalCrew: number;
  activeWorkOrders: number;
}

export interface WorkOrder {
  id: string;
  stormEventId: string;
  title: string;
  location: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedHours: number;
  assignedCrew: string[];
}

export interface CrewMember extends DBCrewMember {
  certifications: string[];
  currentStatus: 'clocked-in' | 'clocked-out' | 'on-break';
}

export interface TimesheetEntry extends Omit<DBTimesheetEntry, 'clock_in' | 'clock_out'> {
  stormEventId?: string;
  clockIn: string;
  clockOut?: string;
  workOrderId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  exception?: {
    reason: string;
    description: string;
    status: 'pending' | 'approved' | 'denied';
  };
}

interface StormEventContextType {
  currentStorm: StormEvent | null;
  stormEvents: StormEvent[];
  workOrders: WorkOrder[];
  crewMembers: CrewMember[];
  timesheetEntries: TimesheetEntry[];
  setCurrentStorm: (storm: StormEvent) => void;
  loadCrewMembers: () => Promise<void>;
  loadTimesheetEntries: (date?: string) => Promise<void>;
  addTimesheetEntry: (entry: Omit<TimesheetEntry, 'id'>) => void;
  updateTimesheetEntry: (id: string, updates: Partial<TimesheetEntry>) => void;
  deleteTimesheetEntry: (id: string) => void;
  getCrewTimesheetForDate: (crewId: string, date: string) => TimesheetEntry[];
  getCurrentStormWorkOrders: () => WorkOrder[];
  getTotalHoursForDate: (date: string) => Promise<number>;
}

const StormEventContext = createContext<StormEventContextType | undefined>(undefined);

const mockStormEvents: StormEvent[] = [
  {
    id: 'storm-1',
    name: 'Hurricane Maria',
    startDate: '2024-01-15',
    status: 'active',
    priority: 'high',
    region: 'Gulf Coast',
    description: 'Category 3 hurricane with widespread power outages',
    totalCrew: 24,
    activeWorkOrders: 8,
  },
  {
    id: 'storm-2',
    name: 'Winter Storm Alpha',
    startDate: '2024-01-10',
    endDate: '2024-01-14',
    status: 'completed',
    priority: 'medium',
    region: 'Northeast',
    description: 'Ice storm causing tree damage and power lines down',
    totalCrew: 16,
    activeWorkOrders: 0,
  },
  {
    id: 'storm-3',
    name: 'Tornado Outbreak Beta',
    startDate: '2024-01-18',
    status: 'planning',
    priority: 'high',
    region: 'Midwest',
    description: 'Severe weather system with multiple tornado warnings',
    totalCrew: 32,
    activeWorkOrders: 12,
  },
];

const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    stormEventId: 'storm-1',
    title: 'Restore Power to Residential Area',
    location: '1234 Oak Street, Gulf City',
    priority: 'urgent',
    status: 'in-progress',
    estimatedHours: 8,
    assignedCrew: ['crew-1', 'crew-2', 'crew-3'],
  },
  {
    id: 'wo-2',
    stormEventId: 'storm-1',
    title: 'Clear Fallen Trees from Power Lines',
    location: 'Highway 45 & Maple Ave',
    priority: 'high',
    status: 'pending',
    estimatedHours: 6,
    assignedCrew: ['crew-4', 'crew-5'],
  },
  {
    id: 'wo-3',
    stormEventId: 'storm-1',
    title: 'Replace Damaged Transformer',
    location: 'Industrial District - Sector 7',
    priority: 'medium',
    status: 'pending',
    estimatedHours: 12,
    assignedCrew: ['crew-1', 'crew-6'],
  },
];

export function StormEventProvider({ children }: { children: ReactNode }) {
  const [currentStorm, setCurrentStorm] = useState<StormEvent | null>(null);
  const [stormEvents] = useState<StormEvent[]>(mockStormEvents);
  const [workOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    initializeData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeData = async () => {
    try {
      // Set default storm
      const activeStorm = stormEvents.find(s => s.status === 'active');
      if (activeStorm && isMountedRef.current) {
        setCurrentStorm(activeStorm);
      }
      
      // Load data from database
      await loadCrewMembers();
      await loadTimesheetEntries();
    } catch (error) {
      console.error('Error initializing data:', error);
      const activeStorm = stormEvents.find(s => s.status === 'active');
      if (activeStorm && isMountedRef.current) {
        setCurrentStorm(activeStorm);
      }
    }
  };

  const loadCrewMembers = async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const dbCrewMembers = await db.getCrewMembers();
      
      // Transform database crew members to include additional fields
      const transformedCrewMembers: CrewMember[] = dbCrewMembers.map(member => ({
        ...member,
        certifications: [], // Default empty array, could be expanded later
        currentStatus: 'clocked-out' as const, // Default status
      }));
      
      if (isMountedRef.current) {
        setCrewMembers(transformedCrewMembers);
      }
    } catch (error) {
      console.error('Error loading crew members:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const loadTimesheetEntries = async (date?: string) => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const dbEntries = await db.getTimesheetEntries(date);
      
      // Transform database entries to match our interface
      const transformedEntries: TimesheetEntry[] = dbEntries.map(entry => ({
        ...entry,
        clockIn: entry.clock_in,
        clockOut: entry.clock_out || undefined,
      }));
      
      if (isMountedRef.current) {
        setTimesheetEntries(transformedEntries);
      }
    } catch (error) {
      console.error('Error loading timesheet entries:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addTimesheetEntry = (entry: Omit<TimesheetEntry, 'id'>) => {
    const createEntry = async () => {
      try {
        const dbEntry = await db.createTimesheetEntry({
          crew_member_id: entry.crewMemberId,
          date: entry.date,
          clock_in: entry.clockIn,
          clock_out: entry.clockOut || null,
          activity: entry.activity,
          notes: entry.notes,
          status: entry.status,
        });
        
        const transformedEntry: TimesheetEntry = {
          ...dbEntry,
          crewMemberId: dbEntry.crew_member_id,
          clockIn: dbEntry.clock_in,
          clockOut: dbEntry.clock_out || undefined,
          stormEventId: entry.stormEventId,
          workOrderId: entry.workOrderId,
          location: entry.location,
          exception: entry.exception,
        };
        
        if (isMountedRef.current) {
          setTimesheetEntries(prev => [...prev, transformedEntry]);
        }
      } catch (error) {
        console.error('Error creating timesheet entry:', error);
      }
    };
    
    createEntry();
  };

  const updateTimesheetEntry = (id: string, updates: Partial<TimesheetEntry>) => {
    const updateEntry = async () => {
      try {
        const dbUpdates: any = {};
        if (updates.clockOut !== undefined) dbUpdates.clock_out = updates.clockOut;
        if (updates.activity !== undefined) dbUpdates.activity = updates.activity;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        
        const updatedEntry = await db.updateTimesheetEntry(id, dbUpdates);
        
        if (isMountedRef.current) {
          setTimesheetEntries(prev => 
            prev.map(entry => 
              entry.id === id ? {
                ...entry,
                ...updates,
                clockIn: updatedEntry.clock_in,
                clockOut: updatedEntry.clock_out || undefined,
              } : entry
            )
          );
        }
      } catch (error) {
        console.error('Error updating timesheet entry:', error);
      }
    };
    
    updateEntry();
  };

  const deleteTimesheetEntry = (id: string) => {
    const deleteEntry = async () => {
      try {
        await db.deleteTimesheetEntry(id);
        if (isMountedRef.current) {
          setTimesheetEntries(prev => prev.filter(entry => entry.id !== id));
        }
      } catch (error) {
        console.error('Error deleting timesheet entry:', error);
      }
    };
    
    deleteEntry();
  };

  const getCrewTimesheetForDate = (crewId: string, date: string): TimesheetEntry[] => {
    return timesheetEntries.filter(entry => 
      entry.crew_member_id === crewId && 
      entry.date === date &&
      entry.stormEventId === currentStorm?.id
    );
  };

  const getCurrentStormWorkOrders = (): WorkOrder[] => {
    return workOrders.filter(wo => wo.stormEventId === currentStorm?.id);
  };

  const getTotalHoursForDate = async (date: string): Promise<number> => {
    try {
      return await db.getTotalHoursForDate(date);
    } catch (error) {
      console.error('Error getting total hours:', error);
      return 0;
    }
  };

  return (
    <StormEventContext.Provider value={{
      currentStorm,
      stormEvents,
      workOrders,
      crewMembers,
      timesheetEntries,
      setCurrentStorm,
      loadCrewMembers,
      loadTimesheetEntries,
      addTimesheetEntry,
      updateTimesheetEntry,
      deleteTimesheetEntry,
      getCrewTimesheetForDate,
      getCurrentStormWorkOrders,
      getTotalHoursForDate,
    }}>
      {children}
    </StormEventContext.Provider>
  );
}

export function useStormEvent() {
  const context = useContext(StormEventContext);
  if (context === undefined) {
    throw new Error('useStormEvent must be used within a StormEventProvider');
  }
  return context;
}