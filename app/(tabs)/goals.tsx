import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GoalCard } from '../../src/components/goals/GoalCard';
import { GoalCelebration } from '../../src/components/goals/GoalCelebration';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { InputField } from '../../src/components/ui/InputField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useGoalStore } from '../../src/stores/goalStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useGoals } from '../../src/hooks/useGoals';

export default function GoalsScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const goals = useGoalStore((s) => s.goals);
  const fetchAll = useGoalStore((s) => s.fetchAll);
  const upsert = useGoalStore((s) => s.upsert);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const error = useGoalStore((s) => s.error);
  const isLoading = useGoalStore((s) => s.isLoading);
  const { currentMonthGoal, goalProgress, streakCount } = useGoals();

  const celebratedRef = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('Monthly Savings');
  const [formAmount, setFormAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void fetchAll();
    }, [fetchAll]),
  );

  const goal = currentMonthGoal(goals);
  const progress = goal ? goalProgress(goal) : null;
  const streak = streakCount(goals);

  useEffect(() => {
    if (progress?.status === 'achieved' && !celebratedRef.current) {
      celebratedRef.current = true;
      setShowCelebration(true);
    }
  }, [progress?.status]);

  const resetFormState = () => {
    setFormTitle('Monthly Savings');
    setFormAmount('');
    setFormError(null);
  };

  const openFormForCreate = () => {
    resetFormState();
    setShowForm(true);
  };

  const openFormForEdit = () => {
    if (goal) {
      setFormTitle(goal.title);
      setFormAmount(String(goal.target));
    }
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const onSaveGoal = async () => {
    const parsed = Number.parseFloat(formAmount);
    if (!parsed || parsed <= 0) {
      setFormError('Enter a valid amount');
      return;
    }
    setFormError(null);
    await upsert({
      title: formTitle.trim(),
      target: parsed,
      month: format(new Date(), 'yyyy-MM'),
    });
    if (!useGoalStore.getState().error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowForm(false);
    }
  };

  const onConfirmDelete = () => {
    if (!goal) {
      return;
    }
    Alert.alert(
      'Delete goal',
      'Remove this month’s savings goal? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await deleteGoal(goal.month);
              setShowForm(false);
              resetFormState();
            })();
          },
        },
      ],
    );
  };

  const modalTitle = goal ? 'Edit Goal' : 'Set Goal';

  const emptyStateMinHeight = Math.max(
    340,
    windowHeight - insets.top - insets.bottom - TAB_BAR_HEIGHT - 160,
  );

  return (
    <View style={styles.root}>
      {isLoading ? (
        <View style={styles.loadingOverlay} pointerEvents="box-none">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xl,
          },
        ]}
      >
        <ScreenHeader
          title="My Goals"
          right={
            goal ? (
              <Pressable
                accessibilityRole="button"
                onPress={openFormForEdit}
                hitSlop={12}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="pencil-outline" size={24} color={colors.textMuted} />
              </Pressable>
            ) : null
          }
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {goal && progress ? (
          <GoalCard
            goal={goal}
            progress={progress}
            streak={streak}
            onEditPress={openFormForEdit}
          />
        ) : (
          <View style={[styles.emptyStateWrap, { minHeight: emptyStateMinHeight }]}>
            <EmptyState
              icon={<Ionicons name="flag-outline" size={48} color={colors.textMuted} />}
              title="No goal set for this month"
              subtitle="Set a savings target to stay on track"
              actionLabel="Set Goal"
              onAction={openFormForCreate}
            />
          </View>
        )}
      </ScrollView>
      <GoalCelebration
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
      />

      <Modal
        animationType="slide"
        transparent
        visible={showForm}
        onRequestClose={closeForm}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeForm}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={[typography.h3, styles.sheetTitle]}>{modalTitle}</Text>
              <Pressable accessibilityRole="button" onPress={closeForm} hitSlop={12}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>
            <InputField
              label="Goal Title"
              value={formTitle}
              onChangeText={setFormTitle}
              containerStyle={styles.fieldFullWidth}
            />
            <InputField
              label="Target Amount"
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="decimal-pad"
              placeholder="₹0"
              containerStyle={[styles.fieldFullWidth, styles.fieldGap]}
            />
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <Button label="Save Goal" onPress={() => void onSaveGoal()} style={styles.saveBtn} />
            <Button label="Cancel" variant="ghost" onPress={closeForm} style={styles.cancelBtn} />
            {goal ? (
              <Pressable
                accessibilityRole="button"
                onPress={onConfirmDelete}
                style={({ pressed }) => [styles.deleteGoalBtn, pressed && styles.deleteGoalBtnPressed]}
              >
                <Text style={styles.deleteGoalText}>Delete Goal</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  emptyStateWrap: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceHigh,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: colors.text,
    flex: 1,
  },
  fieldFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  fieldGap: {
    marginTop: spacing.md,
  },
  formError: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  deleteGoalBtn: {
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteGoalBtnPressed: {
    opacity: 0.85,
  },
  deleteGoalText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
  cancelBtn: {
    marginTop: spacing.sm,
  },
});
