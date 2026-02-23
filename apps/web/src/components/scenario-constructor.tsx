"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { trpc } from "../utils/trpc";
import { toast } from "sonner";

export default function ScenarioConstructor() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [criteria, setCriteria] = useState<Array<{ content: string; typeId?: number }>>([
    { content: "", typeId: undefined },
  ]);

  const criteriaTypesQuery = trpc.courses.criteriaTypes.useQuery();

  const categoriesQuery = trpc.courses.categories.useQuery();
  const createCourse = trpc.courses.createWithDetails.useMutation();

  async function handleSave() {
    try {
      if (title.trim().length < 3) {
        toast.error("Название должно быть не менее 3 символов");
        return;
      }
      if (context.trim().length < 10) {
        toast.error("Контекст должен быть не менее 10 символов");
        return;
      }
      if (!categoryId) {
        toast.error("Выберите категорию");
        return;
      }

      const payload = {
        title: title.trim(),
        context: context.trim(),
        categoryId,
        questions: questions.map((q) => q.trim()).filter(Boolean),
        criteria: criteria
          .map((c) => ({ typeId: c.typeId, content: c.content.trim() }))
          .filter((c) => c.content),
      };

      await createCourse.mutateAsync(payload);
      toast.success("Курс успешно создан");
      // Optionally reset form
      setTitle("");
      setContext("");
      setCategoryId(undefined);
      setQuestions([""]);
      setCriteria([{ content: "", typeId: undefined }]);
    } catch (err: any) {
      toast.error(err?.message || "Ошибка при создании курса");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              className="border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded-none text-lg w-80"
              placeholder="Название курса"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleSave} disabled={createCourse.isLoading}>
              {createCourse.isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button variant="ghost" size="sm">Перейти в песочницу</Button>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm text-neutral-600 dark:text-neutral-300">Назад</button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Опыт: 0</span>
              <div className="w-8 h-8 rounded-full bg-black dark:bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Контекст</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 border border-gray-300 dark:border-neutral-700 px-3 py-2 text-sm"
                  placeholder="Опишите цель курса, целевую аудиторию и ожидаемые результаты"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Примеры вопросов (опционально)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-300 dark:border-neutral-700 px-3 py-2 text-sm"
                        placeholder={`Вопрос ${i + 1}`}
                        value={q}
                        onChange={(e) => {
                          const next = [...questions];
                          next[i] = e.target.value;
                          setQuestions(next);
                        }}
                      />
                      <button
                        className="text-sm px-2"
                        onClick={() => setQuestions((s) => s.filter((_, idx) => idx !== i))}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <div>
                    <button
                      className="text-sm text-blue-600"
                      onClick={() => setQuestions((s) => [...s, ""])}
                    >
                      + Добавить вопрос
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Настройки курса</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm block mb-1">Категория</label>
                    <select
                      className="w-full border border-gray-300 dark:border-neutral-700 px-3 py-2 text-sm"
                      value={categoryId ?? ""}
                      onChange={(e) => setCategoryId(e.target.value || undefined)}
                    >
                      <option value="">-- Выберите категорию --</option>
                      {categoriesQuery.data?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm block mb-1">Видимость</label>
                    <div className="text-sm text-neutral-700 dark:text-neutral-300">Пока что только публичные сценарии поддерживаются.</div>
                  </div>

                  <div>
                    <label className="text-sm block mb-1">Критерии оценки</label>
                    <div className="space-y-2">
                          {criteria.map((c, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input
                                className="flex-1 border border-gray-300 dark:border-neutral-700 px-3 py-2 text-sm"
                                placeholder={`Критерий ${i + 1}`}
                                value={c.content}
                                onChange={(e) => {
                                  const next = [...criteria];
                                  next[i] = { ...next[i], content: e.target.value };
                                  setCriteria(next as any);
                                }}
                              />
                              <select
                                className="w-48 border border-gray-300 dark:border-neutral-700 px-2 py-2 text-sm"
                                value={c.typeId ?? ""}
                                onChange={(e) => {
                                  const next = [...criteria];
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  next[i] = { ...next[i], typeId: val };
                                  setCriteria(next as any);
                                }}
                              >
                                <option value="">Тип (по умолчанию)</option>
                                {criteriaTypesQuery.data?.map((t) => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                              <button className="text-sm px-2" onClick={() => setCriteria((s) => s.filter((_, idx) => idx !== i))}>
                                Удалить
                              </button>
                            </div>
                          ))}
                      <div>
                        <button className="text-sm text-blue-600" onClick={() => setCriteria((s) => [...s, ""])}>
                          + Добавить критерий
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
