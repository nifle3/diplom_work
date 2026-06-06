from pathlib import Path

# Каталог проекта
PROJECT_ROOT = Path(".").resolve()

# Файл результата
OUTPUT_FILE = "project_listing.txt"

# Исключаемые директории
EXCLUDED_DIRS = {
    ".agents",
    ".direnv",
    ".claude",
    "node_modules",
    ".git",
    ".turbo",
    ".next",
    "dist",
    "build",
    "coverage",
    ".cache",
    ".idea",
    ".vscode",
    "out",
    "docs",
    "tools",
    "coverage",
    "migrations"
}

# Исключаемые файлы
EXCLUDED_FILES = {
    OUTPUT_FILE,
    ".DS_Store",
    ".codex",
    ".env",
    "listing.py",
    "README.md",
    "CLAUDE.md",
    "pnpm-lock.yaml",
    "flake.lock",
    ".gitignore",
    "next-env.t.ts",
    "tsconfig.tsbuildinfo",
    ".editorconfig",
    ".envrc",
    "compose.yml",
    "flake.nix",
    
}


def should_skip(path: Path) -> bool:
    """Проверяет, нужно ли пропустить файл или директорию."""
    for part in path.parts:
        if part in EXCLUDED_DIRS:
            return True

    if path.name in EXCLUDED_FILES:
        return True

    return False


def read_file(file_path: Path) -> str:
    """Читает файл с безопасной обработкой ошибок и удаляет пустые строки."""
    try:
        content = file_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            return f"[Ошибка чтения файла: {e}]"
    except Exception as e:
        return f"[Ошибка чтения файла: {e}]"

    return "\n".join(
        line for line in content.splitlines()
        if line.strip()
    )


def generate_listing():
    files = []

    for path in PROJECT_ROOT.rglob("*"):
        if should_skip(path):
            continue

        if path.is_file():
            files.append(path)

    files.sort()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        for file_path in files:
            relative_path = file_path.relative_to(PROJECT_ROOT)

            out.write(f"{relative_path}\n")

            content = read_file(file_path)

            out.write(content)
            out.write("\n\n")

    print(f"Готово. Листинг сохранён в {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_listing()