import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SelectFieldProps {
  label: string;
  valueLabel: string;
  placeholder: string;
  onPress: () => void;
}

export function SelectField({ label, valueLabel, placeholder, onPress }: SelectFieldProps) {
  const display = valueLabel.length > 0 ? valueLabel : placeholder;
  const color = valueLabel.length > 0 ? colors.text : colors.textMuted;

  return (
    <View>
      <Text style={[typography.label, styles.label]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.field,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={[typography.body, { color }]} numberOfLines={1}>
          {display}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
