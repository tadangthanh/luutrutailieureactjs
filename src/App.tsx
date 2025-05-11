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
import { Editor } from "./components/Editor";
import SavedDocumentsPage from "./pages/SavedDocumentsPage";

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
                                <MainLayout><DashboardPage isSharedView={false} /></MainLayout>
                            </PrivateRoute>
                        } />
                        <Route path="/folders/:id" element={
                            <PrivateRoute>
                                <MainLayout><DashboardPage isSharedView={false} /></MainLayout>
                            </PrivateRoute>
                        } />
                        {/* trash */}
                        <Route path="/trash" element={
                            <PrivateRoute>
                                <MainLayout><TrashPage /></MainLayout>
                            </PrivateRoute>
                        } />
                        {/* document assistant */}
                        <Route path="/document-assistant" element={
                            <PrivateRoute>
                                <MainLayout><DocumentQA /></MainLayout>
                            </PrivateRoute>
                        } />
                        {/* saved */}
                        <Route path="/saved" element={
                            <PrivateRoute>
                                <MainLayout><SavedDocumentsPage /></MainLayout>
                            </PrivateRoute>
                        } />
                        {/* shared with me */}
                        <Route path="/shared-with-me" element={
                            <PrivateRoute>
                                <MainLayout><DashboardPage isSharedView={true} /></MainLayout>
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
