import { Navigate, Outlet } from 'react-router-dom'
import Navbar from "./modules/Navbar"

function PrivateLayout({ isValidate }) {
    if (isValidate) return <Navigate to="/" replace />

    return (
        <div className="flex flex-col min-h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Navbar />
            <div className="flex-auto">
                <Outlet />
            </div>
        </div>
    )
}

export default PrivateLayout