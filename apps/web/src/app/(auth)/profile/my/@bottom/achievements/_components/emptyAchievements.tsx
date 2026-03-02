import { MessageSquare } from "lucide-react"

export function EmptyAchievements() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-semibold text-lg">Нет истории достижений</h3>
            <p className="text-muted-foreground text-sm">
                Начните проходить интервью, чтобы увидеть их здесь
            </p>
        </div>
    )
}