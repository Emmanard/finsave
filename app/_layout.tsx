import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { openDatabaseAndMigrate } from '../src/db/database';
import { useGoalStore } from '../src/stores/goalStore';
import { useProfileStore } from '../src/stores/profileStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { seedIfNeeded } from '../src/utils/seed';

export default function RootLayout() {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [bootError, setBootError] = useState<string | null>(null);
  const loadProfile = useProfileStore((s) => s.load);
  const fetchTransactions = useTransactionStore((s) => s.fetchAll);
  const fetchGoals = useGoalStore((s) => s.fetchAll);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await openDatabaseAndMigrate();
        await seedIfNeeded();
        await loadProfile();
        await fetchTransactions();
        await fetchGoals();
        if (!cancelled) {
          setPhase('ready');
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to start Finsave';
        if (!cancelled) {
          setBootError(message);
          setPhase('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfile, fetchTransactions, fetchGoals]);

  if (phase === 'loading') {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <View style={[styles.gate, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (phase === 'error') {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <View style={[styles.gate, { backgroundColor: colors.background }]}>
            <Text style={[typography.body, styles.errorText]}>{bootError}</Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="transaction/add"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="transaction/[id]"
            options={{ presentation: 'card', headerShown: false }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
});
