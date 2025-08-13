import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { homeUrl, layoutUrl } from "./urls";
import { SignIn } from "../modules/auth/views/SignIn";
import { HomePage } from "../modules/home/views/HomePage"
import Layout from "../modules/app/Layout"
import { useAuthStore } from "../stores/useAuthStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      setUser(user);
      console.log(user);
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
          element: (
            <HomePage></HomePage>
          )
        },
      ],
    },
  ]);
