import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { TransactionInput } from '../../types';
import { CATEGORIES } from '../../utils/categories';

function categoriesForType(txType: 'income' | 'expense') {
  return CATEGORIES.filter((c) => c.type === 'both' || c.type === txType);
}

function parseAmount(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(/,/g, '').trim());
  if (Number.isNaN(n) || n <= 0) {
    return null;
  }
  return n;
}

export interface TransactionEditorProps {
  title: string;
  submitLabel: string;
  initialType: 'income' | 'expense';
  initialAmount: string;
  initialNotes: string;
  initialDate: Date;
  initialCategory: string;
  onSubmit: (payload: TransactionInput) => Promise<void>;
  leading: ReactNode;
  trailing: ReactNode;
  /** Zustand transaction store error — shown in red below the header */
  storeError?: string | null;
  /** When set, renders a destructive bottom action (e.g. edit screen) */
  onDeletePress?: () => void;
}

export function TransactionEditor({
  title,
  submitLabel,
  initialType,
  initialAmount,
  initialNotes,
  initialDate,
  initialCategory,
  onSubmit,
  leading,
  trailing,
  storeError,
  onDeletePress,
}: TransactionEditorProps) {
  const insets = useSafeAreaInsets();
  const [txType, setTxType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState(initialAmount);
  const [notes, setNotes] = useState(initialNotes);
  const [date, setDate] = useState(initialDate);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useMemo(() => categoriesForType(txType), [txType]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? categories[0],
    [categories, categoryId],
  );

  const onChangeType = (next: 'income' | 'expense') => {
    setTxType(next);
    const nextCats = categoriesForType(next);
    const stillValid = nextCats.some((c) => c.id === categoryId);
    if (!stillValid && nextCats[0]) {
      setCategoryId(nextCats[0].id);
    }
  };

  const handleSave = async () => {
    setFormError(null);
    const parsed = parseAmount(amount);
    if (parsed === null) {
      setFormError('Enter a valid amount greater than zero.');
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) {
      setFormError('Choose a category.');
      return;
    }
    const payload: TransactionInput = {
      amount: parsed,
      type: txType,
      category: cat.id,
      date: format(date, 'yyyy-MM-dd'),
      notes: notes.trim(),
    };
    setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  const openDatePress = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    }
  };

  const onDateChange = (_event: unknown, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selected) {
      setDate(selected);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <View style={styles.headerSide}>{leading}</View>
          <Text style={[typography.h2, styles.title]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSide}>{trailing}</View>
        </View>

        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {storeError ? <Text style={styles.error}>{storeError}</Text> : null}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.segmentRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onChangeType('income')}
              style={[styles.segment, txType === 'income' && styles.segmentActive]}
            >
              <Text
                style={[
                  typography.body,
                  styles.segmentText,
                  txType === 'income' && styles.segmentTextActive,
                ]}
              >
                Income
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onChangeType('expense')}
              style={[styles.segment, txType === 'expense' && styles.segmentActive]}
            >
              <Text
                style={[
                  typography.body,
                  styles.segmentText,
                  txType === 'expense' && styles.segmentTextActive,
                ]}
              >
                Expense
              </Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Date</Text>
          <Pressable
            accessibilityRole="button"
            onPress={openDatePress}
            style={styles.dateRow}
          >
            <Text style={[typography.body, styles.dateText]} numberOfLines={1}>
              {format(date, 'EEEE, d MMM yyyy')}
            </Text>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          ) : null}

          <Text style={styles.fieldLabel}>Category</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCategoryModalOpen(true)}
            style={styles.categoryPick}
          >
            <Text style={[typography.body, styles.categoryPickText]} numberOfLines={2}>
              {selectedCategory?.label ?? 'Select'}
            </Text>
            <Ionicons name="chevron-down" size={22} color={colors.textMuted} />
          </Pressable>

          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.input, styles.notesInput]}
          />

          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => {
              void handleSave();
            }}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              saving && styles.saveBtnDisabled,
            ]}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : submitLabel}</Text>
          </Pressable>

          {onDeletePress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete transaction"
              disabled={saving}
              onPress={onDeletePress}
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            >
              <Text style={styles.deleteBtnText}>Delete transaction</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <Modal
        visible={categoryModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCategoryModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCategoryModalOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, styles.modalTitle]}>Category</Text>
              <Pressable accessibilityRole="button" onPress={() => setCategoryModalOpen(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              numColumns={3}
              columnWrapperStyle={styles.catRow}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item.id === categoryId;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setCategoryId(item.id);
                      setCategoryModalOpen(false);
                    }}
                    style={[styles.catCell, selected && styles.catCellSelected]}
                  >
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={selected ? colors.white : item.color}
                    />
                    <Text
                      style={[typography.small, styles.catLabel, selected && styles.catLabelSelected]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.white,
  },
  input: {
    ...typography.body,
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
    color: colors.text,
  },
  categoryPick: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryPickText: {
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtnPressed: {
    opacity: 0.9,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  deleteBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteBtnPressed: {
    opacity: 0.85,
  },
  deleteBtnText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  modalTitle: {
    color: colors.text,
  },
  catRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  catCell: {
    flex: 1,
    minWidth: '28%',
    maxWidth: '33.33%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  catCellSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  catLabel: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  catLabelSelected: {
    color: colors.white,
  },
});
