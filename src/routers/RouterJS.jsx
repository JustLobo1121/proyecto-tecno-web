import { Route, Routes } from "react-router-dom"
import { useState } from "react"
import PrivateLayout from "./PrivateLayout"
import Login from "../views/Login"
import Sensors from "../views/Sensors"
import Dashboard from '../views/Dashboard'
import Measurements from "../views/Measurements"
import Interventions from "../views/Interventions"
import Sites from "../views/Sites"
import SitesDetailed from "../views/SitesDetailed"
import ErrorView from '../views/error'

function RouterJS() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    return (
        <Routes>
            <Route path="/" element={ <Login setIsAuthenticated={setIsAuthenticated}/> } />
            <Route element={ <PrivateLayout isAuthenticated={isAuthenticated}/> }>
                <Route path="/home" element={ <Dashboard /> } />
                <Route path="/sensors" element={ <Sensors /> } />
                <Route path="/measurements" element={ <Measurements /> } />
                <Route path="/interventions" element={ <Interventions /> } />
                <Route path="/sites" element={ <Sites /> } />
                <Route path="/sites/:id" element={ <SitesDetailed /> } />
            </Route>
            <Route path="*" element={ <ErrorView /> }/>
        </Routes>
    )
}

export default RouterJS