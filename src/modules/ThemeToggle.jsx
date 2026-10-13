import { useTheme } from "../context/ThemeContex"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const modes = [{mode: "light", string: "Claro"},
                   {mode: "dark", string: "Oscuro"},
                   {mode: "system", string: "Sistema"}];

    return (
        <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-xs transition-colors duration-300">
            {modes.map((m) => (
                <button
                    key={m.mode}
                    onClick={() => setTheme(m.mode)}
                    className={`px-3 py-1.5 rounded-md text-sm font-small capitalize transition-all
                        ${
                            theme === m.mode
                                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        }
                    `}
                >
                    {m.string}
                </button>
            ))}
        </div>
    );
}
