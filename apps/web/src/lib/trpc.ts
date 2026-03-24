import type { AppRouter } from "@diplom_work/api/routers/index";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import superjson from "superjson";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: query.invalidate,
				},
			});
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
			toast.error(errorMessage);
		}
	})
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		unstable_httpBatchStreamLink({
			url: "/api/trpc",
			transformer: superjson,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
