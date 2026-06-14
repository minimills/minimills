export type NotificationType =
  | 'CARD_ASSIGNED'
  | 'CARD_COMMENTED'
  | 'CARD_MENTIONED'
  | 'CARD_DUE_SOON'
  | 'CARD_OVERDUE'
  | 'BOARD_INVITED'
  | 'WORKSPACE_INVITED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}
