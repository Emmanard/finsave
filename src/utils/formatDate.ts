import { format, parseISO } from 'date-fns';

export function formatDisplayDate(isoDate: string): string {
  return format(parseISO(isoDate), 'EEE, d MMM yyyy');
}

export function formatMonthYear(isoMonth: string): string {
  return format(parseISO(`${isoMonth}-01`), 'MMMM yyyy');
}
