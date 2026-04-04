import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Goal, GoalProgress } from '../../types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
  streak: number;
  onEditPress: () => void;
}

function toneForStatus(status: GoalProgress['status']): 'success' | 'primary' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'achieved':
      return 'success';
    case 'on-track':
      return 'primary';
    case 'at-risk':
      return 'warning';
    case 'over-budget':
      return 'danger';
    default:
      return 'neutral';
  }
}

function barColor(status: GoalProgress['status']): string {
  switch (status) {
    case 'achieved':
      return colors.success;
    case 'on-track':
      return colors.primary;
    case 'at-risk':
      return colors.warning;
    case 'over-budget':
      return colors.danger;
    case 'no-data':
      return colors.textDisabled;
    default:
      return colors.primary;
  }
}

function badgeLabel(status: GoalProgress['status']): string {
  switch (status) {
    case 'achieved':
      return 'Achieved';
    case 'on-track':
      return 'On track';
    case 'at-risk':
      return 'At risk';
    case 'over-budget':
      return 'Over budget';
    case 'no-data':
      return 'No data';
    default:
      return status;
  }
}

export function GoalCard({ goal, progress, streak, onEditPress }: GoalCardProps) {
  const badgeTone = toneForStatus(progress.status);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[typography.small, styles.month]} numberOfLines={1}>
          {format(parseISO(`${goal.month}-01`), 'MMMM yyyy')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onEditPress}
          hitSlop={10}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="pencil-outline" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={[typography.h3, styles.goalTitle]} numberOfLines={2}>
        {goal.title}
      </Text>
      <Text style={[typography.h1, styles.savings]} numberOfLines={1}>
        {formatCurrency(Math.max(0, progress.current))}
      </Text>
      <Text style={[typography.body, styles.ofTarget]} numberOfLines={1}>
        of {formatCurrency(goal.target)}
      </Text>
      <View style={styles.bar}>
        <ProgressBar progress={progress.percentage} color={barColor(progress.status)} />
      </View>
      <Badge label={badgeLabel(progress.status)} tone={badgeTone} />
      <Text style={[typography.small, styles.msg]} numberOfLines={4}>
        {progress.message}
      </Text>
      {streak > 1 ? (
        <Text style={[typography.small, styles.streak]}>
          🔥 {streak}-month saving streak
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  month: {
    color: colors.textMuted,
    flex: 1,
  },
  goalTitle: {
    color: colors.text,
  },
  savings: {
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  ofTarget: {
    color: colors.textMuted,
  },
  bar: {
    marginTop: spacing.sm,
  },
  msg: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  streak: {
    color: colors.warning,
    marginTop: spacing.sm,
  },
});
