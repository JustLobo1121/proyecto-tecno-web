import { BrowserRouter } from "react-router-dom"
import RouterJS from "./routers/RouterJS"


export default function App() {
  return (
    <BrowserRouter>
      <RouterJS />
    </BrowserRouter>
  );
}