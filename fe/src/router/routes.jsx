import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";

const routes = createBrowserRouter([
    {
        path: "/", 
        element: <Login />,
    },
    {
        path: "/login",
        element: <Login />,
    }
])

export default routes