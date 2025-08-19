import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStormEvent, StormEvent } from '@/contexts/StormEventContext';

interface StormEventHeaderProps {
  title: string;
}

export function StormEventHeader({ title }: StormEventHeaderProps) {
  const { currentStorm, stormEvents, setCurrentStorm } = useStormEvent();
  const [modalVisible, setModalVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#6B7280';
      case 'planning': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleStormSelect = (storm: StormEvent) => {
    setCurrentStorm(storm);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.header}>
        {title ? (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        ) : null}
        
        <TouchableOpacity 
          style={[
            styles.stormSelector,
            !title && styles.centeredStormSelector
          ]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.stormInfo}>
            <Text style={styles.stormName}>{currentStorm?.name || 'No Storm Selected'}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(currentStorm?.status || '') }]} />
              <Text style={styles.statusText}>{currentStorm?.status}</Text>
            </View>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Storm Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {stormEvents.map((storm) => (
              <TouchableOpacity
                key={storm.id}
                style={[
                  styles.stormOption,
                  currentStorm?.id === storm.id && styles.selectedStorm
                ]}
                onPress={() => handleStormSelect(storm)}
              >
                <View style={styles.stormOptionContent}>
                  <Text style={styles.stormOptionName}>{storm.name}</Text>
                  <Text style={styles.stormOptionRegion}>{storm.region}</Text>
                  <View style={styles.stormOptionMeta}>
                    <View style={styles.stormBadges}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(storm.status) }]}>
                        <Text style={styles.badgeText}>{storm.status}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(storm.priority) }]}>
                        <Text style={styles.badgeText}>{storm.priority}</Text>
                      </View>
                    </View>
                    <Text style={styles.stormDate}>{storm.startDate}</Text>
                  </View>
                </View>
                {currentStorm?.id === storm.id && (
                  <MaterialIcons name="check" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
    paddingBottom: 20,
  },
  centeredStormSelector: {
    position: 'absolute',
    left: '10%', // (100% - 80%) / 2 = 10% from each side
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  stormSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: '80%',
    alignSelf: 'center',
  },
  stormInfo: {
    flex: 1,
    marginRight: 8,
  },
  stormName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
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
  stormOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedStorm: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  stormOptionContent: {
    flex: 1,
  },
  stormOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  stormOptionRegion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  stormOptionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stormBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  stormDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});