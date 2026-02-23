import * as tables from "./scheme";

export * from "./scheme";

const schema = {
  user: tables.user,
  account: tables.account,
  session: tables.session,
  verification: tables.verification,
};

export const authSchema = schema;
export default schema;
