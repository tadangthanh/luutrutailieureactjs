
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TrashPage from "./pages/TrashPage";
import SharedPage from "./pages/SharedPage";

function App() {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/trash" element={<TrashPage />} />
                    <Route path="/shared" element={<SharedPage />} />
                </Routes>
            </MainLayout>
        </Router>
    );
}

export default App;
