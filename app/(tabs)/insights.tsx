import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const fetchAll = useTransactionStore((s) => s.fetchAll);

  useFocusEffect(
    useCallback(() => {
      void fetchAll();
    }, [fetchAll]),
  );

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
        <ScreenHeader title="Insights" />
        <Text style={styles.body}>
          Charts and automated insight cards will appear on this screen after the insights layout is wired up.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
});
