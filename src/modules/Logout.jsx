import { useNavigate } from "react-router-dom"
import { TOKEN_KEY } from "../api/client"

export function Logout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/");
    }

    return (
        <div>
            <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={handleLogout}>Cerrar sesión</button>
        </div>
    )
}