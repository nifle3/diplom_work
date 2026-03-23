import { describe, expect, it } from "vitest";
import { getBackHref } from "./getBackHref";

describe("getBackHref", () => {
	it('возвращает "/scripts" когда id = null', () => {
		expect(getBackHref(null)).toBe("/scripts");
	});

	it('возвращает "/scripts" когда id = undefined (хотя тип не позволяет)', () => {
		// @ts-expect-error проверяем поведение при некорректном значении
		expect(getBackHref(undefined)).toBe("/scripts");
	});

	it('возвращает "/script/abc123" для валидного строкового id', () => {
		expect(getBackHref("abc123")).toBe("/script/abc123");
	});

	it("корректно работает с числовым id в виде строки", () => {
		expect(getBackHref("8472")).toBe("/script/8472");
	});

	it("правильно обрабатывает uuid-подобный id", () => {
		const uuid = "550e8400-e29b-41d4-a716-446655440000";
		expect(getBackHref(uuid)).toBe(`/script/${uuid}`);
	});

	it("сохраняет все символы id без изменений (включая дефисы, подчёркивания)", () => {
		expect(getBackHref("user-script_v2-final")).toBe(
			"/script/user-script_v2-final",
		);
	});

	it("работает с очень коротким id", () => {
		expect(getBackHref("a")).toBe("/script/a");
	});

	it("работает с очень длинным id", () => {
		const longId = "x".repeat(100);
		expect(getBackHref(longId)).toBe(`/script/${longId}`);
	});

	it("тип возвращаемого значения совместим с Route из next (проверка as Route)", () => {
		const result = getBackHref("123");
		expect(typeof result).toBe("string");
		expect(result).toMatch(/^\/script\/\w+$|^\/scripts$/);
	});
});
