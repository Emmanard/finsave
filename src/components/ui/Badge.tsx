import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
  primary: { bg: 'rgba(108, 99, 255, 0.2)', fg: colors.primaryLight },
  success: { bg: 'rgba(34, 197, 94, 0.2)', fg: colors.success },
  warning: { bg: 'rgba(245, 158, 11, 0.2)', fg: colors.warning },
  danger: { bg: 'rgba(239, 68, 68, 0.2)', fg: colors.danger },
  neutral: { bg: colors.surfaceHigh, fg: colors.textMuted },
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const c = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[typography.small, styles.text, { color: c.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  text: {
    fontWeight: '600',
  },
});
