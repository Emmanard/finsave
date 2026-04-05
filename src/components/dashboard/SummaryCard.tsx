import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SummaryCardProps {
  label: string;
  amount: string;
  amountColor?: string;
  onPress?: () => void;
}

export function SummaryCard({
  label,
  amount,
  amountColor = colors.white,
  onPress,
}: SummaryCardProps) {
  const content = (
    <View style={styles.card}>
      <Text style={[typography.small, styles.label]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[typography.h2, styles.amount, { color: amountColor }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {amount}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.flex, pressed && { opacity: 0.9 }]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.flex}>{content}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  amount: {
    fontWeight: '800',
  },
});
