"use client";

export function ResetForm() {
    return (
        <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
                <Label className="mb-2" htmlFor="newPassword">
                    Новый пароль
                </Label>
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={resetValues.newPassword}
                    onChange={handleResetChange("newPassword")}
                />
            </div>

            <div>
                <Label className="mb-2" htmlFor="confirmPassword">
                    Повторите пароль
                </Label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={resetValues.confirmPassword}
                    onChange={handleResetChange("confirmPassword")}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Сохраняем..." : "Сохранить новый пароль"}
            </Button>
        </form>
    )
}