import type { Route } from "next";

export function getBackHref(id: string | null): Route {
	return (id ? `/script/${id}` : "/scripts") as Route;
}
