"use client";
import Link from "next/link";

export default function UnauthenticatedWindow() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6 text-center">
      <h1 className="text-4xl font-extrabold mb-4">Interview Master AI</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Подготовьтесь к собеседованию с помощью интерактивного ИИ: симулируйте реальные
        интервью, получайте подробную обратную связь от экспертных сценариев и
        улучшайте навыки шаг за шагом.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <Link
          href="/sign-in"
          className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Войти
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Зарегистрироваться
        </Link>
      </div>

      <section className="text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-3">Что внутри</h2>
        <ul className="list-disc pl-5 space-y-2 text-base">
          <li>Динамическая генерация вопросов, похожих на реальные интервью.</li>
          <li>Настраиваемые сценарии и критерии от экспертов HR.</li>
          <li>Мгновенный анализ ответов и развернутые отчёты.</li>
          <li>Геймификация: стрики, достижения и прогресс XP.</li>
        </ul>
      </section>
    </main>
  );
}
