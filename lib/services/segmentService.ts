import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SegmentRule = {
  attr: string;
  op: string;
  val: any;
};

export class SegmentService {
  /**
   * Translates segment rules into a Prisma where clause for CrmClient
   */
  static buildWhereClause(rules: SegmentRule[]): Prisma.CrmClientWhereInput {
    if (!rules || rules.length === 0) return {};

    const conditions: Prisma.CrmClientWhereInput[] = rules.map((rule) => {
      const { attr, op, val } = rule;

      switch (attr) {
        case "industry":
        case "region":
        case "planTier":
        case "accountStatus":
          return this.buildStringCondition(attr, op, val);

        case "healthScore":
        case "creditsRemaining":
          return this.buildNumberCondition(attr, op, Number(val));

        case "interests":
          return this.buildArrayCondition(attr, op, val);

        case "lastActiveAt":
          return this.buildDateCondition(attr, op, val);

        // Behavioral placeholders (to be expanded)
        case "has_clicked":
          return {
            messageLogs: {
              some: { status: "clicked" }
            }
          };

        default:
          return {};
      }
    });

    return { AND: conditions };
  }

  private static buildStringCondition(attr: string, op: string, val: string): Prisma.CrmClientWhereInput {
    switch (op) {
      case "eq": return { [attr]: val };
      case "neq": return { NOT: { [attr]: val } };
      case "contains": return { [attr]: { contains: val, mode: 'insensitive' } };
      default: return { [attr]: val };
    }
  }

  private static buildNumberCondition(attr: string, op: string, val: number): Prisma.CrmClientWhereInput {
    switch (op) {
      case "eq": return { [attr]: val };
      case "gt": return { [attr]: { gt: val } };
      case "lt": return { [attr]: { lt: val } };
      case "gte": return { [attr]: { gte: val } };
      case "lte": return { [attr]: { lte: val } };
      default: return { [attr]: val };
    }
  }

  private static buildArrayCondition(attr: string, op: string, val: string): Prisma.CrmClientWhereInput {
    // val could be a single string or a comma-separated list
    const values = typeof val === 'string' ? val.split(',').map(v => v.trim()) : [val];
    
    switch (op) {
      case "has": return { [attr]: { hasSome: values } };
      case "has_all": return { [attr]: { hasEvery: values } };
      default: return { [attr]: { hasSome: values } };
    }
  }

  private static buildDateCondition(attr: string, op: string, val: string): Prisma.CrmClientWhereInput {
    const date = new Date(val);
    switch (op) {
      case "before": return { [attr]: { lt: date } };
      case "after": return { [attr]: { gt: date } };
      default: return { [attr]: { gt: date } };
    }
  }

  /**
   * Estimates the reach of a segment based on rules
   */
  static async estimateReach(rules: SegmentRule[]) {
    const where = this.buildWhereClause(rules);
    const count = await prisma.crmClient.count({ where });
    const sample = await prisma.crmClient.findMany({
      where,
      take: 10,
      select: { id: true, companyName: true }
    });

    return {
      count,
      sampleIds: sample.map(s => s.id)
    };
  }

  /**
   * Gets all clients belonging to a segment
   */
  static async getClientsForSegment(segmentId: string) {
    const segment = await prisma.crmSegment.findUnique({
      where: { id: segmentId }
    });

    if (!segment || segment.type === 'static') {
      // Static segments might need a mapping table or manualContacts JSON
      // For now, assuming rules define the segment
      return [];
    }

    const rules = (segment.rules as any) as SegmentRule[];
    const where = this.buildWhereClause(rules);
    
    return prisma.crmClient.findMany({ where });
  }
}
