import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface NavigationItem {
  name: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

const navigationItems: NavigationItem[] = [
  { name: 'index', title: 'Dashboard', icon: 'dashboard', route: '/(tabs)/' },
  { name: 'timesheet', title: 'Timesheet', icon: 'schedule', route: '/(tabs)/timesheet' },
  { name: 'convoy', title: 'Convoy', icon: 'local-shipping', route: '/(tabs)/convoy' },
  { name: 'damage', title: 'Damage', icon: 'report-problem', route: '/(tabs)/damage' },
  { name: 'repairs', title: 'Repairs', icon: 'build', route: '/(tabs)/repairs' },
  { name: 'expenses', title: 'Expenses', icon: 'receipt', route: '/(tabs)/expenses' },
];

export function GridNavigationMenu() {
  const [modalVisible, setModalVisible] = useState(false);
  const pathname = usePathname();

  const getCurrentItem = () => {
    const currentPath = pathname.replace('/(tabs)', '').replace('/', '') || 'index';
    return navigationItems.find(item => item.name === currentPath) || navigationItems[0];
  };

  const openMenu = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setModalVisible(true);
  };

  const closeMenu = () => {
    setModalVisible(false);
  };

  const handleItemPress = async (item: NavigationItem) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Only navigate if we're not already on the target route
    const currentPath = pathname.replace('/(tabs)', '').replace('/', '') || 'index';
    if (item.name === currentPath) {
      closeMenu();
      return;
    }
    
    closeMenu();
    
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      router.push(item.route as any);
    }, 100);
  };

  const currentItem = getCurrentItem();

  return (
    <>
      {/* Floating Menu Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={openMenu}>
        <MaterialIcons name="apps" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Grid Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeMenu}
        >
          <View 
            style={styles.gridContainer}
          >
            <View style={styles.gridHeader}>
              <Text style={styles.gridTitle}>Navigation</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.grid}>
              {navigationItems.map((item, index) => {
                const isActive = item.name === currentItem.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.gridItem, isActive && styles.activeGridItem]}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                      <MaterialIcons 
                        name={item.icon} 
                        size={28} 
                        color={isActive ? "#8B1538" : "#FFFFFF"} 
                      />
                    </View>
                    <Text style={[styles.gridItemText, isActive && styles.activeGridItemText]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B1538', // Dark red
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  gridContainer: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeGridItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: '#F97316',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeIconContainer: {
    backgroundColor: '#FFFFFF',
  },
  gridItemText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeGridItemText: {
    color: '#F97316',
    fontWeight: '600',
  },
});