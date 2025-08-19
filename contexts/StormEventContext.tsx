import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  certifications: string[];
  hourlyRate: number;
  currentStatus: 'clocked-in' | 'clocked-out' | 'on-break';
}

export interface TimesheetEntry {
  id: string;
  stormEventId: string;
  crewMemberId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  workOrderId?: string;
  activity: 'traveling' | 'working' | 'standby' | 'break';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
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
  addTimesheetEntry: (entry: Omit<TimesheetEntry, 'id'>) => void;
  updateTimesheetEntry: (id: string, updates: Partial<TimesheetEntry>) => void;
  deleteTimesheetEntry: (id: string) => void;
  getCrewTimesheetForDate: (crewId: string, date: string) => TimesheetEntry[];
  getCurrentStormWorkOrders: () => WorkOrder[];
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

const mockCrewMembers: CrewMember[] = [
  {
    id: 'crew-1',
    name: 'John Martinez',
    role: 'Crew Lead',
    phone: '(555) 123-4567',
    email: 'j.martinez@utility.com',
    certifications: ['Electrical Safety', 'Crane Operation', 'First Aid'],
    hourlyRate: 45,
    currentStatus: 'clocked-in',
  },
  {
    id: 'crew-2',
    name: 'Sarah Johnson',
    role: 'Line Technician',
    phone: '(555) 234-5678',
    email: 's.johnson@utility.com',
    certifications: ['Line Work', 'High Voltage'],
    hourlyRate: 38,
    currentStatus: 'clocked-in',
  },
  {
    id: 'crew-3',
    name: 'Mike Davis',
    role: 'Equipment Operator',
    phone: '(555) 345-6789',
    email: 'm.davis@utility.com',
    certifications: ['Heavy Equipment', 'CDL Class A'],
    hourlyRate: 35,
    currentStatus: 'clocked-out',
  },
  {
    id: 'crew-4',
    name: 'Lisa Chen',
    role: 'Safety Coordinator',
    phone: '(555) 456-7890',
    email: 'l.chen@utility.com',
    certifications: ['Safety Management', 'OSHA 30'],
    hourlyRate: 42,
    currentStatus: 'clocked-in',
  },
  {
    id: 'crew-5',
    name: 'David Wilson',
    role: 'Apprentice Lineman',
    phone: '(555) 567-8901',
    email: 'd.wilson@utility.com',
    certifications: ['Basic Electrical', 'First Aid'],
    hourlyRate: 28,
    currentStatus: 'clocked-out',
  },
  {
    id: 'crew-6',
    name: 'Angela Rodriguez',
    role: 'Field Engineer',
    phone: '(555) 678-9012',
    email: 'a.rodriguez@utility.com',
    certifications: ['Engineering', 'Project Management'],
    hourlyRate: 50,
    currentStatus: 'on-break',
  },
];

export function StormEventProvider({ children }: { children: ReactNode }) {
  const [currentStorm, setCurrentStorm] = useState<StormEvent | null>(null);
  const [stormEvents] = useState<StormEvent[]>(mockStormEvents);
  const [workOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [crewMembers] = useState<CrewMember[]>(mockCrewMembers);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    if (currentStorm) {
      AsyncStorage.setItem('currentStorm', JSON.stringify(currentStorm));
    }
  }, [currentStorm]);

  const loadStoredData = async () => {
    try {
      const storedStorm = await AsyncStorage.getItem('currentStorm');
      const storedEntries = await AsyncStorage.getItem('timesheetEntries');
      
      if (storedStorm) {
        setCurrentStorm(JSON.parse(storedStorm));
      } else {
        // Set first active storm as default
        const activeStorm = stormEvents.find(s => s.status === 'active');
        if (activeStorm) {
          setCurrentStorm(activeStorm);
        }
      }
      
      if (storedEntries) {
        setTimesheetEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      // Set default storm if loading fails
      const activeStorm = stormEvents.find(s => s.status === 'active');
      if (activeStorm) {
        setCurrentStorm(activeStorm);
      }
    }
  };

  const addTimesheetEntry = (entry: Omit<TimesheetEntry, 'id'>) => {
    const newEntry: TimesheetEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setTimesheetEntries(prev => {
      const updated = [...prev, newEntry];
      AsyncStorage.setItem('timesheetEntries', JSON.stringify(updated));
      return updated;
    });
  };

  const updateTimesheetEntry = (id: string, updates: Partial<TimesheetEntry>) => {
    setTimesheetEntries(prev => {
      const updated = prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      );
      AsyncStorage.setItem('timesheetEntries', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTimesheetEntry = (id: string) => {
    setTimesheetEntries(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      AsyncStorage.setItem('timesheetEntries', JSON.stringify(updated));
      return updated;
    });
  };

  const getCrewTimesheetForDate = (crewId: string, date: string): TimesheetEntry[] => {
    return timesheetEntries.filter(entry => 
      entry.crewMemberId === crewId && 
      entry.date === date &&
      entry.stormEventId === currentStorm?.id
    );
  };

  const getCurrentStormWorkOrders = (): WorkOrder[] => {
    return workOrders.filter(wo => wo.stormEventId === currentStorm?.id);
  };

  return (
    <StormEventContext.Provider value={{
      currentStorm,
      stormEvents,
      workOrders,
      crewMembers,
      timesheetEntries,
      setCurrentStorm,
      addTimesheetEntry,
      updateTimesheetEntry,
      deleteTimesheetEntry,
      getCrewTimesheetForDate,
      getCurrentStormWorkOrders,
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