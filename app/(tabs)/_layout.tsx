import { Tabs } from 'expo-router';
import { Chrome as Home, Dumbbell, User } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { useContext, useEffect } from 'react';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { auth } from '@/FirebaseConfig';

export default function TabLayout() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!user && !firebaseUser) {
        router.replace('/authpage');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size} color={color} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
          tabBarLabelStyle: styles.tabBarLabel,
        }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              router.push('/authpage');
            }
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    height: Platform.select({ ios: 88, android: 60, web: 60 }),
    paddingBottom: Platform.select({ ios: 28, android: 8, web: 8 }),
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});