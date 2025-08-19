import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TimesheetEntry, CrewMember, WorkOrder } from '@/contexts/StormEventContext';

interface TimesheetCardProps {
  entry: TimesheetEntry;
  crewMember: CrewMember;
  workOrder?: WorkOrder;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (entryId: string) => void;
  onClockOut?: () => void;
  showClockOut?: boolean;
}

export function TimesheetCard({ entry, crewMember, workOrder, onEdit, onDelete, onClockOut, showClockOut = false }: TimesheetCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isActive = !entry.clockOut;

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'working': return '#10B981';
      case 'traveling': return '#3B82F6';
      case 'standby': return '#F59E0B';
      case 'break': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'submitted': return '#3B82F6';
      case 'draft': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const calculateHours = () => {
    if (!entry.clockOut) return 'In Progress';
    const start = new Date(`${entry.date} ${entry.clockIn}`);
    const end = new Date(`${entry.date} ${entry.clockOut}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this timesheet entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) }
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowDetails(true)}
      >
        {isActive && (
          <View style={[styles.statusBar, { backgroundColor: getActivityColor(entry.activity) }]}>
            <Text style={styles.statusBarText}>{entry.activity}</Text>
          </View>
        )}
        <View style={[styles.cardHeader, !isActive && styles.cardHeaderNoBar]}>
          <View style={styles.crewInfo}>
            <Text style={styles.crewName}>{crewMember.name}</Text>
            <Text style={styles.crewRole}>{crewMember.role}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(entry.status) }]} />
            <Text style={styles.statusText}>{entry.status}</Text>
          </View>
        </View>

        <View style={styles.timeInfo}>
          <View style={styles.timeSlot}>
            <MaterialIcons name="login" size={16} color="#10B981" />
            <Text style={styles.timeText}>{formatTime(entry.clockIn)}</Text>
          </View>
          
          <View style={styles.timeDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.hoursText}>{calculateHours()}</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <View style={styles.timeSlot}>
            <MaterialIcons name="logout" size={16} color={entry.clockOut ? "#EF4444" : "#9CA3AF"} />
            <Text style={[styles.timeText, !entry.clockOut && styles.pendingText]}>
              {entry.clockOut ? formatTime(entry.clockOut) : 'Active'}
            </Text>
          </View>
        </View>

        <View style={styles.activityInfo}>
          {workOrder && (
            <Text style={styles.workOrderText} numberOfLines={2}>
              {workOrder.title}
            </Text>
          )}
        </View>

        {entry.exception && (
          <View style={styles.exceptionBanner}>
            <MaterialIcons name="warning" size={16} color="#F59E0B" />
            <Text style={styles.exceptionText}>Exception: {entry.exception.status}</Text>
          </View>
        )}

        {showClockOut && onClockOut && (
          <TouchableOpacity
            style={styles.clockOutButton}
            onPress={onClockOut}
          >
            <MaterialIcons name="logout" size={16} color="#FFFFFF" />
            <Text style={styles.clockOutText}>Clock Out</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetails}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Timesheet Details</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Crew Member</Text>
              <Text style={styles.detailText}>{crewMember.name} - {crewMember.role}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Time Period</Text>
              <Text style={styles.detailText}>
                {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : 'Active'}
              </Text>
              <Text style={styles.detailSubtext}>Total: {calculateHours()}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Activity & Location</Text>
              <Text style={styles.detailText}>Activity: {entry.activity}</Text>
              {entry.location && (
                <Text style={styles.detailText}>Location: {entry.location.address}</Text>
              )}
            </View>

            {workOrder && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Work Order</Text>
                <Text style={styles.detailText}>{workOrder.title}</Text>
                <Text style={styles.detailSubtext}>{workOrder.location}</Text>
              </View>
            )}

            {entry.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.detailText}>{entry.notes}</Text>
              </View>
            )}

            {entry.exception && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Exception</Text>
                <Text style={styles.detailText}>{entry.exception.reason}</Text>
                <Text style={styles.detailSubtext}>{entry.exception.description}</Text>
                <Text style={[styles.detailSubtext, { color: getStatusColor(entry.exception.status) }]}>
                  Status: {entry.exception.status}
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setShowDetails(false);
                  onEdit(entry);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  statusBarText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8, // Default margin when status bar is present
    marginBottom: 12,
  },
  cardHeaderNoBar: {
    marginTop: 16, // Increased margin when no status bar
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  crewRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  pendingText: {
    color: '#9CA3AF',
  },
  timeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    flex: 1,
  },
  hoursText: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 8,
    fontWeight: '500',
  },
  activityInfo: {
    alignItems: 'flex-start',
  },
  workOrderText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  exceptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  exceptionText: {
    fontSize: 12,
    color: '#D97706',
    marginLeft: 6,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 320,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#2563EB',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  clockOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  clockOutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});