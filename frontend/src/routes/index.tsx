import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { homeUrl, layoutUrl, signinUrl, notFoundUrl, profileUrl, gradesUrl, learningScheduleUrl } from "./urls";
import { MyProfile } from "../modules/profiles/views/MyProfile";
import { SignIn } from "../modules/auth/views/SignIn";
import { HomePage } from "../modules/home/views/HomePage"
import { NotFound } from "../modules/NotFound/NotFound"
import Layout from "../modules/app/Layout"
import { useAuthStore } from "../stores/useAuthStore";
import { GradesPage } from "../modules/grades/views/Grades"
import { LearningSchedule } from "../modules/learningSchedule/views/LearningSchedule";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      setUser(user);
    } else {
      useAuthStore.getState().logout();
      navigate(signinUrl);
    }
  }, []);

  return user ? <>{children}</> : <Navigate to={signinUrl} replace />;
};

export const createRouterConfig = () =>
  createBrowserRouter([
    {
      path: signinUrl,
      element: <SignIn />,
    },
    {
      path: notFoundUrl,
      element: <NotFound />,
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
        {
          path: profileUrl,
          element: <MyProfile />,
        },
        {
          path: gradesUrl,
          element: <GradesPage />,
        },
        {
          path: learningScheduleUrl,
          element: <LearningSchedule />,
        },
      ],
    },

    // not found
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
