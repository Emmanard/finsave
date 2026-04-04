import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, StyleSheet } from 'react-native';

const ANDROID_TAB_FALLBACK = 'rgba(9, 9, 9, 0.97)';

function TabBar(props: BottomTabBarProps) {
  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={[
        styles.blur,
        Platform.OS === 'android' ? styles.blurAndroid : null,
      ]}
    >
      <BottomTabBar {...props} />
    </BlurView>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C6EFA',
        tabBarInactiveTintColor: '#3D3D52',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 82,
          paddingBottom: 14,
          backgroundColor: Platform.OS === 'android' ? ANDROID_TAB_FALLBACK : 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          zIndex: 100,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'flag' : 'flag-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    zIndex: 100,
  },
  blurAndroid: {
    backgroundColor: ANDROID_TAB_FALLBACK,
  },
});
