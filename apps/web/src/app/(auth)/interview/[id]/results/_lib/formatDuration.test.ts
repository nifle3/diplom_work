import { describe, expect, it } from "vitest";
import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
	it('возвращает "—" когда finishedAt = null', () => {
		const started = new Date("2025-04-10T10:00:00");
		expect(formatDuration(started, null)).toBe("—");
	});

	it("минимум 1 минута даже при нулевой разнице", () => {
		const t = new Date("2025-04-10T14:30:00");
		expect(formatDuration(t, t)).toBe("1 мин");
	});

	it("округляет до целых минут (вверх при ≥30 сек)", () => {
		const start = new Date("2025-04-10T14:30:00");
		const end = new Date("2025-04-10T14:30:29");
		expect(formatDuration(start, end)).toBe("1 мин");

		const end2 = new Date("2025-04-10T14:30:30");
		expect(formatDuration(start, end2)).toBe("1 мин");
	});

	it("менее часа → только минуты", () => {
		const start = new Date("2025-04-10T09:15:00");
		const end = new Date("2025-04-10T09:42:00");
		expect(formatDuration(start, end)).toBe("27 мин");
	});

	it('ровно 1 час → "1 ч"', () => {
		const start = new Date("2025-04-10T13:00:00");
		const end = new Date("2025-04-10T14:00:00");
		expect(formatDuration(start, end)).toBe("1 ч");
	});

	it("1 час и несколько минут", () => {
		const start = new Date("2025-04-10T10:00:00");
		const end = new Date("2025-04-10T11:37:00");
		expect(formatDuration(start, end)).toBe("1 ч 37 мин");
	});

	it("ровно 2 часа", () => {
		const start = new Date(2025, 3, 5, 8, 20);
		const end = new Date(2025, 3, 5, 10, 20);
		expect(formatDuration(start, end)).toBe("2 ч");
	});

	it("несколько часов + минуты", () => {
		const start = new Date("2025-06-20T14:45:00");
		const end = new Date("2025-06-20T19:08:00");
		expect(formatDuration(start, end)).toBe("4 ч 23 мин");
	});

	it("очень короткий интервал → всё равно 1 мин", () => {
		const start = new Date("2025-01-01T00:00:01");
		const end = new Date("2025-01-01T00:00:59");
		expect(formatDuration(start, end)).toBe("1 мин");
	});

	it("очень длинный интервал (> 24 ч)", () => {
		const start = new Date("2025-03-01T09:00:00");
		const end = new Date("2025-03-04T14:30:00");
		expect(formatDuration(start, end)).toBe("77 ч 30 мин");
	});

	it("finishedAt раньше startedAt → всё равно минимум 1 мин", () => {
		const start = new Date("2025-05-15T15:00:00");
		const end = new Date("2025-05-15T14:45:00");
		expect(formatDuration(start, end)).toBe("1 мин");
	});
});
