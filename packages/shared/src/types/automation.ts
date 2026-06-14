export type TriggerType =
  | 'CARD_CREATED'
  | 'CARD_MOVED'
  | 'CARD_ASSIGNED'
  | 'CARD_DUE_DATE_SET'
  | 'CARD_DUE_DATE_APPROACHING'
  | 'CARD_OVERDUE'
  | 'CHECKLIST_COMPLETED'
  | 'LABEL_ADDED'
  | 'COMMENT_ADDED'
  | 'SCHEDULED';

export type ConditionType =
  | 'LIST_IS'
  | 'LABEL_IS'
  | 'MEMBER_IS'
  | 'PRIORITY_IS'
  | 'DUE_DATE_IN'
  | 'CARD_TITLE_CONTAINS';

export type ActionType =
  | 'MOVE_CARD'
  | 'ADD_LABEL'
  | 'REMOVE_LABEL'
  | 'ASSIGN_MEMBER'
  | 'UNASSIGN_MEMBER'
  | 'SET_PRIORITY'
  | 'SET_DUE_DATE'
  | 'ADD_COMMENT'
  | 'ARCHIVE_CARD'
  | 'CREATE_CARD'
  | 'SEND_EMAIL';

export interface AutomationTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
}

export interface AutomationCondition {
  type: ConditionType;
  operator: 'IS' | 'IS_NOT' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: unknown;
}

export interface AutomationAction {
  type: ActionType;
  config: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  boardId: string;
  name: string;
  isEnabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  executionCount: number;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationRuleRequest {
  name: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
}
