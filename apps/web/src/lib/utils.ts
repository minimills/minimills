import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt);
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDueDate(date: string | Date): { label: string; color: string } {
  const d = new Date(date);
  if (isToday(d)) return { label: 'Today', color: 'text-amber-600' };
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-amber-500' };
  if (isPast(d)) return { label: format(d, 'MMM d'), color: 'text-red-500' };
  return { label: format(d, 'MMM d'), color: 'text-muted-foreground' };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function priorityConfig(priority: string) {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    URGENT: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    HIGH: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    MEDIUM: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    LOW: { label: 'Low', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    NONE: { label: 'None', color: 'text-muted-foreground', bg: 'bg-muted' },
  };
  return configs[priority] ?? configs.NONE;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
