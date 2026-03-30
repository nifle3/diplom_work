export enum Status {
	active = "active",
	complete = "complete",
	canceled = "canceled",
}

export const statusToId: Record<Status, number> = {
	[Status.active]: 1,
	[Status.complete]: 2,
	[Status.canceled]: 3,
};
