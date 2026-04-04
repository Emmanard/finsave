import { StyleSheet, Text, View } from 'react-native';
import type { Goal, GoalProgress } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatMonthYear } from '../../utils/formatDate';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress;
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
    default:
      return colors.primary;
  }
}

export function GoalCard({ goal, progress }: GoalCardProps) {
  const badgeTone = toneForStatus(progress.status);
  const label =
    progress.status === 'achieved'
      ? 'achieved'
      : progress.status === 'on-track'
        ? 'on-track'
        : progress.status === 'at-risk'
          ? 'at-risk'
          : progress.status === 'over-budget'
            ? 'over-budget'
            : 'no-data';

  return (
    <View style={styles.card}>
      <Text style={[typography.small, styles.month]} numberOfLines={1}>
        {formatMonthYear(goal.month)}
      </Text>
      <Text style={[typography.h2, styles.title]} numberOfLines={2}>
        {goal.title}
      </Text>
      <Text style={[typography.h1, styles.amount]} numberOfLines={1}>
        {formatCurrency(Math.max(0, progress.current))}
      </Text>
      <Text style={[typography.body, styles.target]} numberOfLines={1}>
        of {formatCurrency(goal.target)}
      </Text>
      <View style={styles.bar}>
        <ProgressBar progress={progress.percentage} color={barColor(progress.status)} />
      </View>
      <Badge label={label} tone={badgeTone} />
      <Text style={[typography.body, styles.msg]} numberOfLines={3}>
        {progress.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  month: {
    color: colors.textMuted,
  },
  title: {
    color: colors.text,
  },
  amount: {
    color: colors.text,
    marginTop: spacing.sm,
  },
  target: {
    color: colors.textMuted,
  },
  bar: {
    marginTop: spacing.sm,
  },
  msg: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
