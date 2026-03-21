import { describe, expect, it } from "vitest";
import { getScoreTone } from "./getScoreTone";

describe("getScoreTone", () => {
	it('возвращает "Нет оценки" при null', () => {
		const result = getScoreTone(null);

		expect(result.label).toBe("Нет оценки");
		expect(result.badgeClassName).toContain("bg-muted");
		expect(result.badgeClassName).toContain("text-muted-foreground");
		expect(result.textClassName).toBe("text-muted-foreground");
		expect(result.ringClassName).toContain("from-border");
	});

	it('80+ баллов → "Сильный результат" (зелёный тон)', () => {
		const result = getScoreTone(80);

		expect(result.label).toBe("Сильный результат");
		expect(result.badgeClassName).toContain("emerald");
		expect(result.badgeClassName).toContain("bg-emerald-50");
		expect(result.textClassName).toContain("emerald-700");
		expect(result.ringClassName).toContain("emerald-400");
	});

	it("очень высокий балл (100) → тоже сильный результат", () => {
		const result = getScoreTone(100);
		expect(result.label).toBe("Сильный результат");
		expect(result.badgeClassName).toContain("emerald");
	});

	it('60–79 баллов → "Хорошая база" (жёлто-оранжевый тон)', () => {
		const cases = [60, 67, 79];

		cases.forEach((score) => {
			const result = getScoreTone(score);
			expect(result.label).toBe("Хорошая база");
			expect(result.badgeClassName).toContain("amber");
			expect(result.textClassName).toContain("amber-700");
			expect(result.ringClassName).toContain("amber-400");
		});
	});

	it('ниже 60 → "Есть зоны роста" (красный тон)', () => {
		const cases = [0, 1, 42, 59];

		cases.forEach((score) => {
			const result = getScoreTone(score);
			expect(result.label).toBe("Есть зоны роста");
			expect(result.badgeClassName).toContain("rose");
			expect(result.textClassName).toContain("rose-700");
			expect(result.ringClassName).toContain("rose-400");
		});
	});

	it("проверяем тёмную тему в классах (dark:...) при высоком балле", () => {
		const result = getScoreTone(92);
		expect(result.badgeClassName).toContain("dark:bg-emerald-950");
		expect(result.badgeClassName).toContain("dark:text-emerald-300");
		expect(result.ringClassName).toContain("dark:from-emerald-500");
	});

	it("проверяем тёмную тему для средней зоны", () => {
		const result = getScoreTone(68);
		expect(result.badgeClassName).toContain("dark:bg-amber-950");
		expect(result.badgeClassName).toContain("dark:text-amber-300");
	});

	it("проверяем тёмную тему для низкого результата", () => {
		const result = getScoreTone(33);
		expect(result.badgeClassName).toContain("dark:bg-rose-950");
		expect(result.badgeClassName).toContain("dark:text-rose-300");
	});

	it("пограничные значения между зонами", () => {
		expect(getScoreTone(59).label).toBe("Есть зоны роста");
		expect(getScoreTone(60).label).toBe("Хорошая база");
		expect(getScoreTone(79).label).toBe("Хорошая база");
		expect(getScoreTone(80).label).toBe("Сильный результат");
	});

	it("отрицательное значение трактуется как низкий результат", () => {
		const result = getScoreTone(-5);
		expect(result.label).toBe("Есть зоны роста");
		expect(result.badgeClassName).toContain("rose");
	});
});
