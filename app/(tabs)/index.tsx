import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStormEvent } from '@/contexts/StormEventContext';
import { StormEventHeader } from '@/components/StormEventHeader';

export default function DashboardScreen() {
  const { currentStorm, crewMembers, timesheetEntries, getCurrentStormWorkOrders } = useStormEvent();

  const workOrders = getCurrentStormWorkOrders();
  const todayEntries = timesheetEntries.filter(entry => 
    entry.date === new Date().toISOString().split('T')[0] && 
    (entry.stormEventId === currentStorm?.id || !entry.stormEventId)
  );
  const activeEntries = todayEntries.filter(entry => !entry.clock_out);

  const getTotalHoursToday = () => {
    let totalHours = 0;
    todayEntries.filter(entry => entry.hours_worked).forEach(entry => {
      totalHours += entry.hours_worked || 0;
    });
    return totalHours.toFixed(1);
  };

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };
  if (!currentStorm) {
    return (
      <View style={styles.container}>
        <StormEventHeader title="" />
        <View style={styles.noStormContainer}>
          <MaterialIcons name="cloud-off" size={64} color="#F59E0B" />
          <Text style={styles.noStormText}>No Active Storm Event</Text>
          <Text style={styles.noStormSubtext}>Select a storm event to view the dashboard</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StormEventHeader title="" />
      
      <ScrollView style={styles.content}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => handleCardPress('/(tabs)/timesheet')}
          >
            <MaterialIcons name="group" size={24} color="#2563EB" />
            <Text style={styles.statValue}>{crewMembers.length}</Text>
            <Text style={styles.statLabel}>Crew</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => handleCardPress('/(tabs)/repairs')}
          >
            <MaterialIcons name="assignment" size={24} color="#10B981" />
            <Text style={styles.statValue}>{workOrders.length}</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => handleCardPress('/(tabs)/timesheet')}
          >
            <MaterialIcons name="people" size={24} color="#10B981" />
            <Text style={styles.statValue}>{activeEntries.length}</Text>
            <Text style={styles.statLabel}>Active Crew</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => handleCardPress('/(tabs)/timesheet')}
          >
            <MaterialIcons name="schedule" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{getTotalHoursToday()}</Text>
            <Text style={styles.statLabel}>Hours Today</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="access-time" size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Recent Activity</Text>
          </View>
          
          <View style={styles.activityList}>
            {activeEntries.slice(0, 5).map(entry => {
              const crew = crewMembers.find(c => c.id === entry.crew_member_id);
              if (!crew) return null;
              
              return (
                <View key={entry.id} style={styles.activityItem}>
                  <MaterialIcons name="login" size={16} color="#10B981" />
                  <Text style={styles.activityText}>
                    {crew.name} clocked in at {entry.clock_in}
                  </Text>
                  <Text style={styles.activityTime}>
                    {entry.activity}
                  </Text>
                </View>
              );
            })}
            
            {activeEntries.length === 0 && (
              <Text style={styles.emptyActivity}>No recent activity</Text>
            )}
          </View>
        </View>

        {/* Work Orders Summary */}
        <View style={styles.workOrdersCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="assignment" size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Work Orders</Text>
          </View>
          
          {workOrders.slice(0, 3).map(workOrder => (
            <View key={workOrder.id} style={styles.workOrderItem}>
              <View style={styles.workOrderHeader}>
                <Text style={styles.workOrderTitle}>{workOrder.title}</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: 
                    workOrder.priority === 'urgent' ? '#EF4444' :
                    workOrder.priority === 'high' ? '#F59E0B' : '#10B981'
                  }
                ]}>
                  <Text style={styles.priorityText}>{workOrder.priority}</Text>
                </View>
              </View>
              <Text style={styles.workOrderLocation}>{workOrder.location}</Text>
              <Text style={styles.workOrderCrew}>
                {workOrder.assignedCrew.length} crew members assigned
              </Text>
            </View>
          ))}
        </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  emptyActivity: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  workOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  workOrderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  workOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workOrderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  workOrderLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  workOrderCrew: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});