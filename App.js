import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/utils/theme';

// ─── Screens ──────────────────────────────────────────────────────────────────
import SplashScreen        from './src/screens/SplashScreen';
import OnboardingScreen    from './src/screens/OnboardingScreen';
import RoleSelectScreen    from './src/screens/RoleSelectScreen';
import LoginScreen         from './src/screens/LoginScreen';
import RegisterScreen      from './src/screens/RegisterScreen';

// Client Screens
import HomeScreen          from './src/screens/client/HomeScreen';
import SearchScreen        from './src/screens/client/SearchScreen';
import HalwaiProfileScreen from './src/screens/client/HalwaiProfileScreen';
import BookingScreen       from './src/screens/client/BookingScreen';
import PaymentScreen       from './src/screens/client/PaymentScreen';
import TrackingScreen      from './src/screens/client/TrackingScreen';
import ClientBookingsScreen from './src/screens/client/ClientBookingsScreen';
import ClientProfileScreen from './src/screens/client/ClientProfileScreen';

// Halwai Screens
import HalwaiDashboard     from './src/screens/halwai/HalwaiDashboard';
import HalwaiOrders        from './src/screens/halwai/HalwaiOrders';
import HalwaiEarnings      from './src/screens/halwai/HalwaiEarnings';
import HalwaiProfileEdit   from './src/screens/halwai/HalwaiProfileEdit';

// Shared Screens
import ChatScreen          from './src/screens/ChatScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Tab Icon ─────────────────────────────────────────────────────────────────
const TabIcon = ({ icon, color }) => (
  <Text style={{ fontSize: 22, opacity: color === COLORS.gray400 ? 0.5 : 1 }}>
    {icon}
  </Text>
);

// ─── Client Bottom Tabs ───────────────────────────────────────────────────────
const ClientTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor:  COLORS.gray200,
        height:          62,
        paddingBottom:   8,
        paddingTop:      4,
      },
      tabBarActiveTintColor:   COLORS.saffron,
      tabBarInactiveTintColor: COLORS.gray400,
      tabBarLabelStyle: { 
        fontSize:   10, 
        fontWeight: '600' 
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        tabBarLabel: 'Search',
        tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} />
      }}
    />
    <Tab.Screen
      name="Bookings"
      component={ClientBookingsScreen}
      options={{
        tabBarLabel: 'Bookings',
        tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ClientProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />
      }}
    />
  </Tab.Navigator>
);

// ─── Halwai Bottom Tabs ───────────────────────────────────────────────────────
const HalwaiTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor:  COLORS.gray200,
        height:          62,
        paddingBottom:   8,
        paddingTop:      4,
      },
      tabBarActiveTintColor:   COLORS.green,
      tabBarInactiveTintColor: COLORS.gray400,
      tabBarLabelStyle: { 
        fontSize:   10, 
        fontWeight: '600' 
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={HalwaiDashboard}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />
      }}
    />
    <Tab.Screen
      name="Orders"
      component={HalwaiOrders}
      options={{
        tabBarLabel: 'Orders',
        tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} />
      }}
    />
    <Tab.Screen
      name="Earnings"
      component={HalwaiEarnings}
      options={{
        tabBarLabel: 'Earnings',
        tabBarIcon: ({ color }) => <TabIcon icon="💰" color={color} />
      }}
    />
    <Tab.Screen
      name="MyProfile"
      component={HalwaiProfileEdit}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />
      }}
    />
  </Tab.Navigator>
);

// ─── Root Navigator ───────────────────────────────────────────────────────────
const RootNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.saffron 
      }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Screens
        <>
          <Stack.Screen name="Splash"     component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="Login"      component={LoginScreen} />
          <Stack.Screen name="Register"   component={RegisterScreen} />
        </>
      ) : user?.role === 'halwai' ? (
        // Halwai Screens
        <>
          <Stack.Screen name="HalwaiMain" component={HalwaiTabs} />
          <Stack.Screen name="Chat"       component={ChatScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        // Client Screens
        <>
          <Stack.Screen name="ClientMain"    component={ClientTabs} />
          <Stack.Screen name="HalwaiProfile" component={HalwaiProfileScreen} />
          <Stack.Screen name="Booking"       component={BookingScreen} />
          <Stack.Screen name="Payment"       component={PaymentScreen} />
          <Stack.Screen name="Tracking"      component={TrackingScreen} />
          <Stack.Screen name="Chat"          component={ChatScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <Toast />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}