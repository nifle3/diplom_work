/**
 * Creates a session hook to enrich the session with the user's role.
 * Injects DB dependency for unit testing.
 */
export const createSessionHook = (deps: {
	db: {
		query: {
			usersTable: {
				findFirst: (opts: any) => Promise<any>;
			};
		};
	};
}) => {
	return async ({ user, session }: { user: any; session: any }) => {
		const userWithRole = await deps.db.query.usersTable.findFirst({
			where: (usersTable: any, { eq }: any) => eq(usersTable.id, user.id),
			with: {
				role: true,
			},
		});
		return {
			user: user,
			session: {
				...session,
				role: userWithRole?.role.name,
			},
		};
	};
};
