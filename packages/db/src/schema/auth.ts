import * as tables from "./scheme";

export * from "./scheme";

export const authSchema = {
  user: tables.usersTable,
  session: tables.sessionsTable,
  verification: tables.verificationsTable,
  account: tables.accountsTable,
};
