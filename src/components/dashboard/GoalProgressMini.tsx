import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { GoalProgress } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface GoalProgressMiniProps {
  title: string;
  target: number;
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
    case 'no-data':
      return colors.textDisabled;
    default:
      return colors.primary;
  }
}

export function GoalProgressMini({ title, target, progress }: GoalProgressMiniProps) {
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
      <Text style={[typography.h3, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[typography.body, styles.sub]} numberOfLines={1}>
        {formatCurrency(Math.max(0, progress.current))} of {formatCurrency(target)}
      </Text>
      <View style={styles.bar}>
        <ProgressBar progress={progress.percentage} color={barColor(progress.status)} />
      </View>
      <View style={styles.row}>
        <Badge label={label} tone={badgeTone} />
      </View>
      <Text style={[typography.small, styles.msg]} numberOfLines={2}>
        {progress.message}
      </Text>
    </View>
  );
}

export function GoalPromptCard() {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/(tabs)/goals')}
      style={({ pressed }) => [styles.prompt, pressed && { opacity: 0.9 }]}
    >
      <Text style={[typography.body, styles.promptText]} numberOfLines={2}>
        Set a savings goal →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
  },
  sub: {
    color: colors.textMuted,
  },
  bar: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msg: {
    color: colors.textMuted,
  },
  prompt: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  promptText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
