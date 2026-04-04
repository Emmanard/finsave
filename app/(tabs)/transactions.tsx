import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
} from 'date-fns';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionFilter, type FilterKey } from '../../src/components/transactions/TransactionFilter';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useTransactions } from '../../src/hooks/useTransactions';
import type { Transaction } from '../../src/types';

type Row =
  | { kind: 'header'; title: string }
  | { kind: 'item'; transaction: Transaction };

function buildRows(list: Transaction[]): Row[] {
  const sorted = [...list].sort((a, b) => {
    if (a.date === b.date) {
      return b.id - a.id;
    }
    return a.date < b.date ? 1 : -1;
  });
  const map = new Map<string, Transaction[]>();
  for (const t of sorted) {
    const arr = map.get(t.date) ?? [];
    arr.push(t);
    map.set(t.date, arr);
  }
  const out: Row[] = [];
  for (const [dateStr, data] of map) {
    const d = startOfDay(parseISO(dateStr));
    let title: string;
    if (isToday(d)) {
      title = 'Today';
    } else if (isYesterday(d)) {
      title = 'Yesterday';
    } else {
      title = format(d, 'EEE, d MMM yyyy');
    }
    out.push({ kind: 'header', title });
    for (const t of data) {
      out.push({ kind: 'item', transaction: t });
    }
  }
  return out;
}

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const fetchAll = useTransactionStore((s) => s.fetchAll);
  const removeTransaction = useTransactionStore((s) => s.remove);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const error = useTransactionStore((s) => s.error);
  const { filtered } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const params = useLocalSearchParams<{ type?: string | string[] }>();

  useFocusEffect(
    useCallback(() => {
      void fetchAll();
    }, [fetchAll]),
  );

  const typeParam = normalizeParam(params.type);

  useEffect(() => {
    if (typeParam === 'income' || typeParam === 'expense') {
      setFilter(typeParam);
      router.replace('/(tabs)/transactions');
    }
  }, [typeParam]);

  const rows: Row[] = useMemo(() => {
    const typeArg = filter === 'all' ? undefined : filter;
    const list = filtered(typeArg, undefined, searchQuery);
    return buildRows(list);
  }, [filtered, filter, searchQuery]);

  const listEmpty = rows.length === 0;

  const confirmDelete = (transaction: Transaction) => {
    Alert.alert(
      'Delete transaction',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void removeTransaction(transaction.id);
          },
        },
      ],
    );
  };

  const openTransactionActions = (transaction: Transaction) => {
    const goEdit = () => router.push(`/transaction/${transaction.id}`);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            goEdit();
          } else if (buttonIndex === 2) {
            confirmDelete(transaction);
          }
        },
      );
    } else {
      Alert.alert('Transaction', undefined, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: goEdit },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(transaction),
        },
      ]);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <FlatList
        data={rows}
        keyExtractor={(item, index) =>
          item.kind === 'header' ? `h-${item.title}-${index}` : `t-${item.transaction.id}`
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              void fetchAll();
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader title="Transactions" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notes, amount, category…"
              placeholderTextColor={colors.textMuted}
              style={styles.search}
            />
            <TransactionFilter active={filter} onChange={setFilter} />
            {error ? <Text style={styles.inlineError}>{error}</Text> : null}
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return (
              <Text style={[typography.label, styles.groupTitle]} numberOfLines={1}>
                {item.title}
              </Text>
            );
          }
          return (
            <TransactionItem
              transaction={item.transaction}
              onPress={() => router.push(`/transaction/${item.transaction.id}`)}
              onLongPress={() => openTransactionActions(item.transaction)}
            />
          );
        }}
        ListEmptyComponent={
          listEmpty && !isLoading ? (
            <Text style={styles.empty}>No matching transactions.</Text>
          ) : null
        }
        ListFooterComponent={isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    paddingBottom: spacing.sm,
  },
  search: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  groupTitle: {
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  inlineError: {
    ...typography.small,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
