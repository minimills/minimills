export type WorkspaceVisibility = 'PRIVATE' | 'PUBLIC';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'OBSERVER';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  visibility: WorkspaceVisibility;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; boards: number };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  expiresAt: string;
  createdAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  visibility?: WorkspaceVisibility;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  visibility?: WorkspaceVisibility;
}

export interface InviteMemberRequest {
  email: string;
  role: WorkspaceRole;
}
