import * as tables from "./scheme";

export * from "./scheme";

const schema = {
  user: tables.usersTable,
  session: tables.sessionsTable,
  verification: tables.verificationsTable,
};

export const authSchema = schema;
export default schema;
