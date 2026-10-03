import { Route, Routes } from "react-router-dom"
import { useState } from "react"
import PrivateLayout from "./PrivateLayout"
import Login from "../views/Login"
import Home from "../views/Home"
import Sensors from "../views/Sensors"
import Dashboard from '../views/Dashboard'
import Measurements from "../views/Measurements"
import Interventions from "../views/Interventions"
import Sites from "../views/Sites"

function RouterJS() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    return (
        <Routes>
            <Route path="/" element={ <Login setIsAuthenticated={setIsAuthenticated}/> } />
            <Route element={ <PrivateLayout isAuthenticated={isAuthenticated}/> }>
                <Route path="/home" element={ <Home /> } />
                <Route path="/dashboard" element={ <Dashboard /> } />
                <Route path="/sensors" element={ <Sensors /> } />
                <Route path="/measurements" element={ <Measurements /> } />
                <Route path="/interventions" element={ <Interventions /> } />
                <Route path="/sites" element={ <Sites /> } />
            </Route>
            <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
    )
}

export default RouterJS