import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TrashPage from "./pages/TrashPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { WebSocketProvider } from "./components/WebSocketProvider";
import { Toaster } from "sonner";
import DocumentQA from "./pages/DocumentQA";
import SharedDashboardPage from "./pages/SharedDashboardPage";
import { Editor } from "./components/Editor";

function App() {
    return (
        <WebSocketProvider>
            <>
                <Toaster richColors position="bottom-center" />
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={
                            <PublicRoute><LoginPage /></PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute><RegisterPage /></PublicRoute>
                        } />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <PrivateRoute>
                                <MainLayout><DashboardPage /></MainLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/trash" element={
                            <PrivateRoute>
                                <MainLayout><TrashPage /></MainLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/shared" element={
                            <PrivateRoute>
                                <MainLayout><SharedDashboardPage /></MainLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/document-assistant" element={
                            <PrivateRoute>
                                <MainLayout><DocumentQA /></MainLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/editor" element={<Editor />} />
                    </Routes>
                </Router>
            </>
        </WebSocketProvider>
    );
}

export default App;
