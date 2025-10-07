import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";
import ChildrenPage from "./pages/ChildrenPage";
import ChildPage from "./pages/ChildPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TasksPage from "./pages/TasksPage";
import UserPage from "./pages/UserPage";
import TasksAdminPage from "./pages/TasksAdminPage";
import TaskExecutionPage from "./pages/TaskExecutionPage"; // 👈 добавляем

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },

            {
                path: "users",
                element: (
                    <ProtectedRoute
                        element={<UsersPage />}
                        allowedRoles={["ROLE_MODERATOR"]}
                    />
                ),
            },
            {
                path: "children",
                element: (
                    <ProtectedRoute
                        element={<ChildrenPage />}
                        allowedRoles={["ROLE_PARENT"]}
                    />
                ),
            },
            {
                path: "child",
                element: (
                    <ProtectedRoute
                        element={<ChildPage />}
                        allowedRoles={["ROLE_CHILD"]}
                    />
                ),
            },
            {
                path: "tasks",
                element: (
                    <ProtectedRoute
                        element={<TasksPage />}
                        allowedRoles={["ROLE_PARENT", "ROLE_CHILD"]}
                    />
                ),
            },
            {
                path: "tasks/:taskId/execute/:taskResultId",
                element: (
                    <ProtectedRoute
                        element={<TaskExecutionPage />}
                        allowedRoles={["ROLE_CHILD"]}
                    />
                ),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute
                        element={<UserPage />}
                        allowedRoles={[
                            "ROLE_MODERATOR",
                            "ROLE_PARENT",
                            "ROLE_CHILD",
                        ]}
                    />
                ),
            },
            {
                path: "tasks-admin",
                element: (
                    <ProtectedRoute
                        element={<TasksAdminPage />}
                        allowedRoles={["ROLE_MODERATOR"]}
                    />
                ),
            },
        ],
    },
]);
