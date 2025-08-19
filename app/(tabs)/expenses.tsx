import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StormEventHeader } from '@/components/StormEventHeader';

export default function ExpensesScreen() {
  return (
    <View style={styles.container}>
      <StormEventHeader title="Expenses" />
      
      <ScrollView style={styles.content}>
        <View style={styles.placeholderCard}>
          <MaterialIcons name="receipt" size={64} color="#6B7280" />
          <Text style={styles.placeholderTitle}>Expense Management</Text>
          <Text style={styles.placeholderText}>
            Receipt capture, mileage tracking, and expense approval workflow will be implemented here.
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="camera-alt" size={20} color="#10B981" />
              <Text style={styles.featureText}>Receipt capture</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="directions-car" size={20} color="#2563EB" />
              <Text style={styles.featureText}>Mileage tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="approval" size={20} color="#F59E0B" />
              <Text style={styles.featureText}>Approval workflow</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="link" size={20} color="#EF4444" />
              <Text style={styles.featureText}>Timesheet integration</Text>
            </View>
          </View>
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
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  featureList: {
    gap: 12,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
});