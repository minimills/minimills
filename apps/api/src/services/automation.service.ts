import { prisma } from '../config/database';
import { AutomationRule, Card } from '@prisma/client';

type TriggerType = string;
type TriggerContext = {
  cardId?: string;
  listId?: string;
  boardId: string;
  card?: Card;
  userId?: string;
  previousListId?: string;
  labelId?: string;
};

class AutomationService {
  async executeRules(boardId: string, trigger: TriggerType, context: TriggerContext) {
    const rules = await prisma.automationRule.findMany({
      where: { boardId, isEnabled: true },
    });

    const matchingRules = rules.filter((rule) => {
      const t = rule.trigger as { type: string; config: Record<string, unknown> };
      return t.type === trigger;
    });

    for (const rule of matchingRules) {
      try {
        const conditionsMet = await this.evaluateConditions(rule, context);
        if (conditionsMet) {
          await this.executeActions(rule, context);
          await prisma.automationRule.update({
            where: { id: rule.id },
            data: { executionCount: { increment: 1 }, lastRunAt: new Date() },
          });
        }
      } catch (err) {
        console.error(`Automation rule ${rule.id} failed:`, err);
      }
    }
  }

  private async evaluateConditions(
    rule: AutomationRule,
    context: TriggerContext
  ): Promise<boolean> {
    const conditions = rule.conditions as Array<{ type: string; operator: string; value: unknown }>;
    if (!conditions || conditions.length === 0) return true;

    for (const condition of conditions) {
      const met = await this.evaluateCondition(condition, context);
      if (!met) return false;
    }
    return true;
  }

  private async evaluateCondition(
    condition: { type: string; operator: string; value: unknown },
    context: TriggerContext
  ): Promise<boolean> {
    const card = context.card ?? (context.cardId
      ? await prisma.card.findUnique({ where: { id: context.cardId } })
      : null);

    switch (condition.type) {
      case 'LIST_IS':
        return condition.operator === 'IS'
          ? card?.listId === condition.value
          : card?.listId !== condition.value;
      case 'PRIORITY_IS':
        return condition.operator === 'IS'
          ? card?.priority === condition.value
          : card?.priority !== condition.value;
      case 'CARD_TITLE_CONTAINS':
        return card?.title.toLowerCase().includes((condition.value as string).toLowerCase()) ?? false;
      default:
        return true;
    }
  }

  private async executeActions(
    rule: AutomationRule,
    context: TriggerContext
  ): Promise<void> {
    const actions = rule.actions as Array<{ type: string; config: Record<string, unknown> }>;

    for (const action of actions) {
      try {
        await this.executeAction(action, context);
      } catch (err) {
        console.error(`Action ${action.type} failed:`, err);
      }
    }
  }

  private async executeAction(
    action: { type: string; config: Record<string, unknown> },
    context: TriggerContext
  ): Promise<void> {
    const cardId = context.cardId;
    if (!cardId) return;

    switch (action.type) {
      case 'MOVE_CARD':
        await prisma.card.update({
          where: { id: cardId },
          data: { listId: action.config.listId as string },
        });
        break;
      case 'ADD_LABEL': {
        const labelId = action.config.labelId as string;
        await prisma.cardLabel.upsert({
          where: { cardId_labelId: { cardId, labelId } },
          create: { cardId, labelId },
          update: {},
        });
        break;
      }
      case 'REMOVE_LABEL': {
        const labelId = action.config.labelId as string;
        await prisma.cardLabel.deleteMany({ where: { cardId, labelId } });
        break;
      }
      case 'SET_PRIORITY':
        await prisma.card.update({
          where: { id: cardId },
          data: { priority: action.config.priority as string },
        });
        break;
      case 'SET_DUE_DATE': {
        const days = action.config.daysFromNow as number;
        await prisma.card.update({
          where: { id: cardId },
          data: { dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000) },
        });
        break;
      }
      case 'ADD_COMMENT':
        if (context.userId) {
          await prisma.comment.create({
            data: {
              cardId,
              userId: context.userId,
              content: action.config.text as string,
            },
          });
        }
        break;
      case 'ARCHIVE_CARD':
        await prisma.card.update({
          where: { id: cardId },
          data: { isArchived: true },
        });
        break;
      default:
        console.log(`Unknown action type: ${action.type}`);
    }
  }
}

export const automationService = new AutomationService();
