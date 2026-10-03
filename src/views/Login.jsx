import { useNavigate } from "react-router-dom";

function Login({ setIsAuthenticated }) {
    const navigate = useNavigate()
    const handleLogin = () => {
        setIsAuthenticated(true)
        navigate('/dashboard')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
            <div className="p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ULA MONITORS</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xs">
                    Haz clic en el botón para simular el inicio de sesión y acceder al sistema.
                </p>
                <button
                    onClick={handleLogin}
                    className="w-full px-6 py-3 bg-[#1479c9] text-white font-bold rounded-lg hover:bg-[#0d6bab] transition-all transform hover:-translate-y-1"
                >
                    Entrar de prueba
                </button>
            </div>
        </div>
    )
}

export default Login