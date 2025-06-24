export type MockQueryBuilder = typeof QueryBuilder;

export type MockTransaction = (tableName: string) => MockQueryBuilder;

export type MockModel = {
  (table: string): MockQueryBuilder;
  raw?: (sql: string) => string;
  transaction?: (callback: (trx: MockTransaction) => unknown) => unknown;
};

export const QueryBuilder = {
  select: jest.fn().mockReturnThis(),
  join: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  rightJoin: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  whereRaw: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  andWhereRaw: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  orWhereRaw: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  clearSelect: jest.fn().mockReturnThis(),
  clearOrder: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  first: jest.fn().mockReturnThis(),
  then: jest.fn().mockReturnThis(),
};
