import { adminProcedure, router } from "..";

export const expertManagerRouter = router({
    getAll: adminProcedure.query(async () => {

    }),
});