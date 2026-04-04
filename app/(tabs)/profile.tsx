import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useProfileStore } from '../../src/stores/profileStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const displayName = useProfileStore((s) => s.displayName);

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
        <ScreenHeader title="Profile" />
        <Text style={styles.label}>Display name</Text>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.hint}>You&apos;ll be able to edit your name inline from here soon.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  hint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
