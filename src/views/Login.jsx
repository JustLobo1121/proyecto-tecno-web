import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, TOKEN_KEY } from "../api/client";

function Login({ setIsAuthenticated }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(true);
    const navigate = useNavigate()
    const handleLoginSuccess = (request) => {
        localStorage.setItem(TOKEN_KEY, request["access_token"])
        setIsAuthenticated(true);
        navigate("/dashboard");
    }
    const handleLoginFailure = () => {
        setSuccess(false);
    }
    const handleLogin = () => {
        if (!username || !password) return;
        apiFetch("/token", {method: "POST", body: new URLSearchParams({ username: username, password: password})})
        .then(handleLoginSuccess)
        .catch(handleLoginFailure)
    }

    useEffect(() => {
        if (localStorage.getItem(TOKEN_KEY)) {
        setIsAuthenticated(true);
        navigate("/dashboard");
    }}, [])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
            <div className="p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ULA MONITORS</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xs">
                    Usuario
                </p>
                <input
                value={username}
                className="border border-gray-200 dark:border-gray-700 rounded-xl"
                onChange={(event) => {setUsername(event.target.value); event.target.value ? event.target.className = "border border-gray-200 dark:border-gray-700 rounded-xl" : event.target.className = "border border-red-600 rounded-xl"}}
                ></input>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xs">
                    Contraseña
                </p>
                <input
                type="password"
                value={password}
                className="border border-gray-200 dark:border-gray-700 rounded-xl"
                onChange={(event) => {setPassword(event.target.value); event.target.value ? event.target.className = "border border-gray-200 dark:border-gray-700 rounded-xl" : event.target.className = "border border-red-600 rounded-xl"}}
                ></input>
                { !success && (<h1 className="text-[#ff0000]-500 dark:text-[#ff0000]-400 text-sm text-center max-w-xs">Usuario o contraseña incorrectos.</h1>)}
                <button
                    onClick={handleLogin}
                    className="w-full px-6 py-3 bg-[#1479c9] text-white font-bold rounded-lg hover:bg-[#0d6bab] transition-all transform hover:-translate-y-1"
                >
                    Iniciar sesión
                </button>
            </div>
        </div>
    )
}

export default Login