import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// Import screens (will create these next)
import WelcomeScreen from '../screens/WelcomeScreen';
import AddMotorScreen from '../screens/AddMotorScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TipsScreen from '../screens/TipsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UpdateOdometerScreen from '../screens/UpdateOdometerScreen';
import PerformMaintenanceScreen from '../screens/PerformMaintenanceScreen';

// Type definitions for navigation
export type RootStackParamList = {
  Welcome: undefined;
  AddMotor: undefined;
  Main: MainTabNavigationProp | undefined;
  UpdateOdometer: {motorId: number};
  PerformMaintenance: {perawatanId: number; jenisPerawatan: string};
};

export type MainTabParamList = {
  Dashboard: undefined;
  Maintenance: undefined;
  History: undefined;
  Tips: undefined;
  Settings: undefined;
};

export type MainTabNavigationProp = {
  screen: keyof MainTabParamList;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2196F3',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#B3E5FC',
      }}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Maintenance" 
        component={MaintenanceScreen}
        options={{
          tabBarLabel: 'Perawatan',
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Riwayat',
        }}
      />
      <Tab.Screen 
        name="Tips" 
        component={TipsScreen}
        options={{
          tabBarLabel: 'Tips',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Pengaturan',
        }}
      />
    </Tab.Navigator>
  );
}

// Root stack navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddMotor" 
          component={AddMotorScreen}
          options={{ title: 'Tambah Motor' }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="UpdateOdometer" 
          component={UpdateOdometerScreen}
          options={{ title: 'Update Odometer' }}
        />
        <Stack.Screen 
          name="PerformMaintenance" 
          component={PerformMaintenanceScreen}
          options={{ title: 'Lakukan Perawatan' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}