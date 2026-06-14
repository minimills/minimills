export type SocketEvent =
  // Board events
  | 'board:updated'
  | 'board:member_added'
  | 'board:member_removed'
  // List events
  | 'list:created'
  | 'list:updated'
  | 'list:deleted'
  | 'list:reordered'
  // Card events
  | 'card:created'
  | 'card:updated'
  | 'card:deleted'
  | 'card:moved'
  | 'card:reordered'
  // Comment events
  | 'comment:created'
  | 'comment:updated'
  | 'comment:deleted'
  // Reaction events
  | 'reaction:added'
  | 'reaction:removed'
  // Checklist events
  | 'checklist:created'
  | 'checklist:updated'
  | 'checklist:deleted'
  | 'checklist_item:updated'
  // Notification events
  | 'notification:new'
  // Presence events
  | 'presence:join'
  | 'presence:leave'
  | 'presence:update';

export interface SocketPayload {
  boardId?: string;
  data: unknown;
  userId?: string;
  timestamp: string;
}

export interface PresenceUser {
  userId: string;
  name: string;
  avatarUrl: string | null;
  activeCardId?: string;
  joinedAt: string;
}
