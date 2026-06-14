export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface List {
  id: string;
  boardId: string;
  name: string;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  listId: string;
  createdById: string;
  title: string;
  description: string | null;
  position: number;
  coverUrl: string | null;
  coverColor: string | null;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  isArchived: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  assignees?: CardAssignee[];
  labels?: CardLabelWithLabel[];
  attachments?: Attachment[];
  checklists?: ChecklistWithItems[];
  comments?: Comment[];
  customFieldValues?: CustomFieldValue[];
  _count?: { comments: number; attachments: number; checklists: number };
}

export interface CardAssignee {
  id: string;
  cardId: string;
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface CardLabelWithLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: { id: string; name: string; color: string };
}

export interface Attachment {
  id: string;
  cardId: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ChecklistWithItems {
  id: string;
  cardId: string;
  name: string;
  position: number;
  createdAt: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
}

export interface CustomFieldValue {
  id: string;
  cardId: string;
  customFieldId: string;
  value: string | null;
  customField: { id: string; name: string; type: string };
}

export interface Activity {
  id: string;
  boardId: string | null;
  cardId: string | null;
  userId: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface CreateListRequest {
  boardId: string;
  name: string;
}

export interface UpdateListRequest {
  name?: string;
  position?: number;
}

export interface CreateCardRequest {
  listId: string;
  title: string;
  description?: string;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  listId?: string;
  position?: number;
  coverUrl?: string | null;
  coverColor?: string | null;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
}
