import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/DashboardPage";


const AppRouter = () => {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default AppRouter;
