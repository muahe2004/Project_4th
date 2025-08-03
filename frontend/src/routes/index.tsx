import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { homeUrl, layoutUrl } from "./urls";
import { SignIn } from "../modules/auth/views/SignIn";
import Layout from "../modules/app/Layout"
import { useAuthStore } from "../stores/useAuthStore";

const mockUser = {
  id: "123",
  name: "Ly Văn Minh",
  email: "minh@gmail.com",
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (mockUser) {
      setUser(mockUser);
    } else {
      useAuthStore.getState().logout();
      navigate("/sign-in");
    }
  }, []);

  return user ? <>{children}</> : <Navigate to="/sign-in" replace />;
};

export const createRouterConfig = () =>
  createBrowserRouter([
    {
      path: "/sign-in",
      element: <SignIn />,
    },
    {
      path: layoutUrl,
      element: (
        <ProtectedRoute>
          <Layout/>
        </ProtectedRoute>
      ),
      children: [
        {
          path: homeUrl,
          element: <div>Trang chính sau khi login</div>,
        },
      ],
    },
  ]);
