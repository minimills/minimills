export type BoardVisibility = 'PRIVATE' | 'WORKSPACE' | 'PUBLIC';
export type BoardRole = 'ADMIN' | 'MEMBER' | 'OBSERVER';

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  visibility: BoardVisibility;
  backgroundUrl: string | null;
  backgroundColor: string | null;
  isArchived: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { lists: number; members: number; cards: number };
  isStarred?: boolean;
  workspace?: { id: string; name: string; slug: string };
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface CustomField {
  id: string;
  boardId: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX' | 'URL' | 'MEMBER';
  options: string[] | null;
}

export interface CreateBoardRequest {
  workspaceId: string;
  name: string;
  description?: string;
  visibility?: BoardVisibility;
  backgroundColor?: string;
  backgroundUrl?: string;
  templateId?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  visibility?: BoardVisibility;
  backgroundColor?: string;
  backgroundUrl?: string;
}
