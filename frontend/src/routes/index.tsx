import { createBrowserRouter, Navigate } from "react-router-dom";
import { homeUrl, layoutUrl, signinUrl, profileUrl, gradesUrl, learningScheduleUrl, layOutAdminUrl, dashBoardUrl, departmentUrl, majorUrl, onlineCourse, specializationsUrl, classesUrl, studentUrl, teacherUrl, subjectUrl, teachingScheduleUrl, studentLearningSchedules, teacherTeachingSchedules, roomUrl, examinationScheduleUrl, courseRegistrationUrl } from "./urls";
import { MyProfile } from "../modules/profiles/views/MyProfile";
import { SignIn } from "../modules/auth/views/SignIn";
import { HomePage } from "../modules/home/views/HomePage"
import { NotFound } from "../modules/NotFound/NotFound"
import Layout from "../modules/app/Layout";
import LayoutAdmin from "../modules/app/Layout-Admin"
import { useAuthStore } from "../stores/useAuthStore";
import { GradesPage } from "../modules/grades/views/Grades"
import { LearningSchedule } from "../modules/learningSchedule/views/LearningSchedule";
import DashBoard from "../modules/dashboard/views/DashBoard";
import Departments from "../modules/department/views/Departments";
import Majors from "../modules/majors/views/Majors";
import Courses from "../modules/online-courses/views/Index";
import Specializations from "../modules/specializations/views/Specializations";
import Classes from "../modules/classes/views/Classes";
import { Students } from "../modules/students/views/Students";
import { Teachers } from "../modules/teachers/views/Teachers";
import { Subjects } from "../modules/subjects/views/Subjects";
import { TeachingSchedules } from "../modules/teachingSchedule/views/TeachingSchedules";
import { Rooms } from "../modules/rooms/views/Rooms";
import { ExaminationSchedules } from "../modules/examinationSchedule/views/ExaminationSchedules";
import { ROLES } from "../constants/roles";
import Loading from "../components/Loading/Loading";
import TeacherTeachingScheduleView from "../modules/teachingSchedule/views/TeacherTeachingScheduleView";
import CourseRegistration from "../modules/courseRegistration/views/CourseRegistration";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const authReady = useAuthStore((state) => state.authReady);

  if (!hasHydrated || !authReady) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to={signinUrl} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeUrl} replace />;
  }

  return <>{children}</>;
};

export const createRouterConfig = () => {
  return createBrowserRouter([
    {
      path: signinUrl,
      element: <SignIn />,
    },
    {
      path: layoutUrl,
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: homeUrl,
          element: <HomePage />,
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
          path: studentLearningSchedules,
          element: <LearningSchedule />,
        },
        {
          path: teacherTeachingSchedules,
          element: <TeacherTeachingScheduleView />,
        },
        {
          path: courseRegistrationUrl,
          element: <CourseRegistration />,
        },
      ],
    },
    {
      path: layOutAdminUrl,
      element: (
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <LayoutAdmin />
        </ProtectedRoute>
      ),
      children: [
        {
          path: dashBoardUrl,
          element: <DashBoard />,
        },
        {
          path: layOutAdminUrl + departmentUrl,
          element: <Departments />,
        },
        {
          path: layOutAdminUrl + majorUrl,
          element: <Majors />,
        },
        {
          path: layOutAdminUrl + specializationsUrl,
          element: <Specializations />,
        },
        {
          path: layOutAdminUrl + classesUrl,
          element: <Classes />,
        },
        {
          path: layOutAdminUrl + learningScheduleUrl,
          element: <LearningSchedule></LearningSchedule>
        },
        {
          path: layOutAdminUrl + teachingScheduleUrl,
          element: <TeachingSchedules></TeachingSchedules>
        },
        {
          path: layOutAdminUrl + onlineCourse,
          element: <Courses></Courses>
        },
        {
          path: layOutAdminUrl + studentUrl,
          element: <Students></Students>
        },
        {
          path: layOutAdminUrl + teacherUrl,
          element: <Teachers></Teachers>
        },
        {
          path: layOutAdminUrl + subjectUrl,
          element: <Subjects></Subjects>
        },
        {
          path: layOutAdminUrl + roomUrl,
          element: <Rooms></Rooms>
        },
        {
          path: layOutAdminUrl + examinationScheduleUrl,
          element: <ExaminationSchedules></ExaminationSchedules>
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    }
  ]);
};
