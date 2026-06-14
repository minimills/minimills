export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  query: string;
  type?: 'cards' | 'boards' | 'workspaces' | 'all';
  boardId?: string;
  workspaceId?: string;
  assigneeId?: string;
  labelId?: string;
  priority?: string;
  dueBefore?: string;
  dueAfter?: string;
}
