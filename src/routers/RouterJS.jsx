import { Route, Routes } from "react-router-dom";
import Login from "../views/Login"
import Home from "../views/Home"
import Sensors from "../views/Sensors"
import Measurements from "../views/Measurements"
import Interventions from "../views/Interventions"

function RouterJS() {
    return (
        <Routes>
            <Route path="/" element={ <Login /> } />
            <Route path="/home" element={ <Home /> } />
            <Route path="/dashboard" element={ <Login /> } />
            <Route path="/sensors" element={ <Sensors /> } />
            <Route path="/measurements" element={ <Measurements /> } />
            <Route path="/interventions" element={ <Interventions /> } />
            <Route path="*" element={<div>Página no encontrada</div>} />
        </Routes>
    )
}

export default RouterJS