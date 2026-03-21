import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
	it('возвращает "—" для null', () => {
		expect(formatDate(null)).toBe("—");
	});

	it('возвращает "—" для undefined (хотя тип не позволяет, но на всякий случай)', () => {
		// @ts-expect-error тестируем поведение при некорректном значении
		expect(formatDate(undefined)).toBe("—");
	});

	it("корректно форматирует дату без времени (полдень)", () => {
		const date = new Date("2025-03-15T12:00:00");
		expect(formatDate(date)).toMatch('15 марта 2025 г. в 12:00');
	});

	it("форматирует дату в начале дня", () => {
		const date = new Date(2024, 0, 1, 0, 0, 0); // 1 января 2024 00:00
		expect(formatDate(date)).toBe("1 января 2024 г. в 00:00");
	});

	it("форматирует дату в конце дня", () => {
		const date = new Date(2025, 11, 31, 23, 59, 59);
		expect(formatDate(date)).toBe("31 декабря 2025 г. в 23:59");
	});

	it("правильно обрабатывает однозначные дни и месяцы", () => {
		const date = new Date("2025-02-09T09:05:00");
		expect(formatDate(date)).toBe("9 февраля 2025 г. в 09:05");
	});

	it("правильно форматирует май (проверка русского названия месяца)", () => {
		const date = new Date(2026, 4, 20, 14, 30);
		expect(formatDate(date)).toBe("20 мая 2026 г. в 14:30");
	});

	it("проверяем високосный год — 29 февраля", () => {
		const date = new Date(2024, 1, 29, 8, 15);
		expect(formatDate(date)).toBe("29 февраля 2024 г. в 08:15");
	});

	it("корректно работает с датой из будущего (2027)", () => {
		const date = new Date("2027-10-12T18:45:22");
		expect(formatDate(date)).toBe("12 октября 2027 г. в 18:45");
	});

	it("проверяем очень старую дату", () => {
		const date = new Date("1995-06-17T03:22:00");
		expect(formatDate(date)).toBe("17 июня 1995 г. в 03:22");
	});

	it('использует русский формат (проверка на "г." и порядок день-месяц-год)', () => {
		const date = new Date(2025, 7, 5, 13, 5);
		const result = formatDate(date);

		expect(result).toContain("августа");
		expect(result).toContain("2025 г.");
		expect(result).toMatch(/5 августа 2025 г\. в 13:0[5]/);
	});
});
