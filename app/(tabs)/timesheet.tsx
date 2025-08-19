import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStormEvent, TimesheetEntry, CrewMember } from '@/contexts/StormEventContext';
import { StormEventHeader } from '@/components/StormEventHeader';
import { TimesheetCard } from '@/components/TimesheetCard';

export default function TimesheetScreen() {
  const {
    currentStorm,
    crewMembers,
    timesheetEntries,
    getCurrentStormWorkOrders,
    addTimesheetEntry,
    updateTimesheetEntry,
  } = useStormEvent();

  const [refreshing, setRefreshing] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showIndividualControls, setShowIndividualControls] = useState(false);

  const workOrders = getCurrentStormWorkOrders();
  const todaysEntries = timesheetEntries.filter(entry => 
    entry.date === selectedDate && 
    entry.stormEventId === currentStorm?.id
  );

  const activeEntries = todaysEntries.filter(entry => !entry.clockOut);
  const completedEntries = todaysEntries.filter(entry => entry.clockOut);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCrewClockIn = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    const mockLocation = gpsEnabled ? {
      latitude: 29.7604 + (Math.random() - 0.5) * 0.01,
      longitude: -95.3698 + (Math.random() - 0.5) * 0.01,
      address: '1234 Main St, Houston, TX 77001'
    } : undefined;

    // Clock in all available crew members
    const availableCrew = crewMembers.filter(crewMember => 
      !activeEntries.find(entry => entry.crewMemberId === crewMember.id)
    );

    availableCrew.forEach(crewMember => {
      const newEntry: Omit<TimesheetEntry, 'id'> = {
        stormEventId: currentStorm?.id || '',
        crewMemberId: crewMember.id,
        date: selectedDate,
        clockIn: timeString,
        activity: 'working',
        location: mockLocation,
        status: 'draft'
      };
      addTimesheetEntry(newEntry);
    });
    
    Alert.alert(
      'Crew Clocked In',
      `Successfully clocked in ${availableCrew.length} crew members at ${formatTime(timeString)}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleCrewClockOut = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    // Clock out all active crew members
    activeEntries.forEach(entry => {
      updateTimesheetEntry(entry.id, { 
        clockOut: timeString,
        status: 'submitted'
      });
    });
    
    Alert.alert(
      'Crew Clocked Out',
      `Successfully clocked out ${activeEntries.length} crew members at ${formatTime(timeString)}`,
      [{ text: 'OK', style: 'default' }]
    );
  };
  const handleQuickClockIn = async (crewMemberId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Prevent any navigation during clock-in process
    try {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      
      const mockLocation = gpsEnabled ? {
        latitude: 29.7604 + (Math.random() - 0.5) * 0.01,
        longitude: -95.3698 + (Math.random() - 0.5) * 0.01,
        address: '1234 Main St, Houston, TX 77001'
      } : undefined;

      const newEntry: Omit<TimesheetEntry, 'id'> = {
        stormEventId: currentStorm?.id || '',
        crewMemberId,
        date: selectedDate,
        clockIn: timeString,
        activity: 'working',
        location: mockLocation,
        status: 'draft'
      };

      addTimesheetEntry(newEntry);
      
      Alert.alert(
        'Clocked In',
        `Successfully clocked in at ${formatTime(timeString)}${gpsEnabled ? ' with GPS location' : ''}`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error during clock-in:', error);
      Alert.alert(
        'Clock-In Error',
        'There was an issue clocking in. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleQuickClockOut = async (entryId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    updateTimesheetEntry(entryId, { 
      clockOut: timeString,
      status: 'submitted'
    });
    
    Alert.alert(
      'Clocked Out',
      `Successfully clocked out at ${formatTime(timeString)}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getCrewActiveEntry = (crewId: string) => {
    return activeEntries.find(entry => entry.crewMemberId === crewId);
  };

  const handleEditEntry = (entry: TimesheetEntry) => {
    Alert.alert(
      'Edit Entry',
      'Timesheet editing functionality would open here',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getTotalHoursToday = () => {
    let totalMinutes = 0;
    completedEntries.forEach(entry => {
      if (entry.clockOut) {
        const start = new Date(`${entry.date} ${entry.clockIn}`);
        const end = new Date(`${entry.date} ${entry.clockOut}`);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      }
    });
    return (totalMinutes / 60).toFixed(1);
  };

  const getCrewStatus = () => {
    const totalCrew = crewMembers.length;
    const activeCrew = activeEntries.length;
    
    if (activeCrew === 0) return 'All crew available';
    if (activeCrew === totalCrew) return 'All crew active';
    return `${activeCrew}/${totalCrew} crew active`;
  };

  const availableCrew = crewMembers.filter(crewMember => 
    !activeEntries.find(entry => entry.crewMemberId === crewMember.id)
  );
  if (!currentStorm) {
    return (
      <View style={styles.container}>
        <StormEventHeader title="Timesheet" />
        <View style={styles.noStormContainer}>
          <MaterialIcons name="warning" size={64} color="#F59E0B" />
          <Text style={styles.noStormText}>No storm event selected</Text>
          <Text style={styles.noStormSubtext}>Please select a storm event to manage timesheets</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StormEventHeader title="Timesheet" />
      
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Crew Control Panel */}
        <View style={styles.controlPanel}>
          <View style={styles.crewStatusHeader}>
            <View style={styles.crewStatusInfo}>
              <Text style={styles.crewStatusTitle}>Crew Status</Text>
              <Text style={styles.crewStatusText}>{getCrewStatus()}</Text>
            </View>
            <View style={styles.todayStats}>
              <Text style={styles.statsLabel}>Total Hours Today</Text>
              <Text style={styles.statsValue}>{getTotalHoursToday()}h</Text>
            </View>
          </View>
          
          <View style={styles.crewControls}>
            {availableCrew.length > 0 && (
              <TouchableOpacity
                style={[styles.crewButton, styles.clockInButton]}
                onPress={handleCrewClockIn}
              >
                <MaterialIcons name="login" size={24} color="#FFFFFF" />
                <Text style={styles.crewButtonText}>Clock In Crew</Text>
                <Text style={styles.crewButtonSubtext}>({availableCrew.length} available)</Text>
              </TouchableOpacity>
            )}
            
            {activeEntries.length > 0 && (
              <TouchableOpacity
                style={[styles.crewButton, styles.clockOutButton]}
                onPress={handleCrewClockOut}
              >
                <MaterialIcons name="logout" size={24} color="#FFFFFF" />
                <Text style={styles.crewButtonText}>Clock Out Crew</Text>
                <Text style={styles.crewButtonSubtext}>({activeEntries.length} active)</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.gpsRow}>
            <TouchableOpacity 
              style={styles.gpsToggle}
              onPress={() => setGpsEnabled(!gpsEnabled)}
            >
              <MaterialIcons 
                name={gpsEnabled ? "gps-fixed" : "gps-off"} 
                size={16} 
                color={gpsEnabled ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.gpsText}>
                GPS {gpsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.individualToggle}
              onPress={() => setShowIndividualControls(!showIndividualControls)}
            >
              <MaterialIcons 
                name={showIndividualControls ? "expand-less" : "expand-more"} 
                size={16} 
                color="#6B7280" 
              />
              <Text style={styles.individualToggleText}>Individual Controls</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Entries Section */}
        {activeEntries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="access-time" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Active Crew ({activeEntries.length})</Text>
            </View>
            
            {activeEntries.map(entry => {
              const crewMember = crewMembers.find(c => c.id === entry.crewMemberId);
              const workOrder = workOrders.find(w => w.id === entry.workOrderId);
              
              if (!crewMember) return null;
              
              return (
                <TimesheetCard
                  key={entry.id}
                  entry={entry}
                  crewMember={crewMember}
                  workOrder={workOrder}
                  onEdit={handleEditEntry}
                  onDelete={(id) => {/* Handle delete */}}
                  onClockOut={() => handleQuickClockOut(entry.id)}
                  showClockOut={showIndividualControls}
                />
              );
            })}
          </View>
        )}

        {/* Individual Controls Section - Hidden by default */}
        {showIndividualControls && availableCrew.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color="#6B7280" />
              <Text style={styles.sectionTitle}>Individual Controls</Text>
            </View>
            
            {availableCrew.map(crewMember => (
              <View key={crewMember.id} style={styles.individualCrewCard}>
                <View style={styles.crewInfo}>
                  <Text style={styles.crewName}>{crewMember.name}</Text>
                  <Text style={styles.crewRole}>{crewMember.role}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.individualClockInButton}
                  onPress={() => handleQuickClockIn(crewMember.id)}
                >
                  <MaterialIcons name="login" size={16} color="#FFFFFF" />
                  <Text style={styles.individualClockInText}>Clock In</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Completed Entries */}
        {completedEntries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Completed Today ({completedEntries.length})</Text>
            </View>
            
            {completedEntries.map(entry => {
              const crewMember = crewMembers.find(c => c.id === entry.crewMemberId);
              const workOrder = workOrders.find(w => w.id === entry.workOrderId);
              
              if (!crewMember) return null;
              
              return (
                <TimesheetCard
                  key={entry.id}
                  entry={entry}
                  crewMember={crewMember}
                  workOrder={workOrder}
                  onEdit={handleEditEntry}
                  onDelete={(id) => {/* Handle delete */}}
                  showClockOut={false}
                />
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {todaysEntries.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="schedule" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Ready to start the shift</Text>
            <Text style={styles.emptyStateText}>
              Use the "Clock In Crew" button to start tracking time for your team
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noStormContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noStormText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  noStormSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  controlPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  crewStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  crewStatusInfo: {
    flex: 1,
  },
  crewStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  crewStatusText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  todayStats: {
    alignItems: 'flex-end',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
  },
  crewControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  crewButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 80,
  },
  clockInButton: {
    backgroundColor: '#10B981',
  },
  clockOutButton: {
    backgroundColor: '#EF4444',
  },
  crewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  crewButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  gpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  gpsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  individualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  individualToggleText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  individualCrewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  crewRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  individualClockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  individualClockInText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});