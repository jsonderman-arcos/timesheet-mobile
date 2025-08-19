import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GridNavigationMenu } from '@/components/GridNavigationMenu';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide the default tab bar
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="timesheet" />
        <Tabs.Screen name="convoy" />
        <Tabs.Screen name="damage" />
        <Tabs.Screen name="repairs" />
        <Tabs.Screen name="expenses" />
      </Tabs>
      <GridNavigationMenu />
    </>
  );
}