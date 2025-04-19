import { JSX } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem("token");

    return token ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
