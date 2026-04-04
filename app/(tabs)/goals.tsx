import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoalCard } from '../../src/components/goals/GoalCard';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useGoalStore } from '../../src/stores/goalStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useGoals } from '../../src/hooks/useGoals';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const goals = useGoalStore((s) => s.goals);
  const fetchAll = useGoalStore((s) => s.fetchAll);
  const error = useGoalStore((s) => s.error);
  const { currentMonthGoal, goalProgress } = useGoals();

  useFocusEffect(
    useCallback(() => {
      void fetchAll();
    }, [fetchAll]),
  );

  const goal = currentMonthGoal(goals);
  const progress = goal ? goalProgress(goal) : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
        }}
      >
        <ScreenHeader title="My Goals" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {goal && progress ? (
          <GoalCard goal={goal} progress={progress} />
        ) : (
          <Text style={styles.muted}>No goal for this month yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
});
