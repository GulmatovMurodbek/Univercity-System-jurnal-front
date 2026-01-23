import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Groups from "./pages/admin/Groups";
import Teachers from "./pages/admin/Teachers";
import Subjects from "./pages/admin/Subjects";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyAttendance from "./pages/student/MyAttendance";
import MyGrades from "./pages/student/MyGrades";

// Shared Pages
import WeeklyAttendance from "./pages/attendance/WeeklyAttendance";
import GradeJournal from "./pages/grades/GradeJournal";
import WeeklySchedule from "./pages/schedule/WeeklySchedule";

// Profiles
import StudentProfile from "./pages/profiles/StudentProfile";
import TeacherProfile from "./pages/profiles/TeacherProfile";
import { useEffect, useState } from "react";
import JournalEntryPage from "./pages/attendance/JournalEntryPage";
import JournalByGroupPage from "./pages/attendance/DailyAttendance";
import WeeklyGradePage from "./pages/admin/weeklyGrade";
import AdminNotesPage from "./pages/admin/feedback";
import Logs from "./pages/admin/Logs";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading, isAuthenticated } = useAuth();

  // ⏳ ТО ВАҚТЕ auth/me КОР МЕКУНАД — ҲЕҶ ҶО НАМЕРАВАД
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 Агар login нашудааст
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Агар role иҷозат надорад
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}


function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/groups"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Groups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/noutes"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminNotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Logs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Subjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/weekly"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <WeeklyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades/weekly"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <WeeklyGradePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <GradeJournal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/journal/:date/:shift/:slot/:groupId/:subjectId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JournalEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/journal/group/:groupId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JournalByGroupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/journal/group/:groupId/:date"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JournalByGroupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <WeeklySchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/journal/:date/:shift/:slot/:groupId/:subjectId"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <JournalEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/journal/group/:groupId"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <JournalByGroupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/journal/group/:groupId/:date"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <JournalByGroupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/subjects"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Subjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/groups"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <Groups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/journal/:date/:shift/:slot/:groupId/:subjectId"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <JournalEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/journal/group/:groupId"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <JournalByGroupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher/journal/group/:groupId/:date"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <JournalByGroupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/grades"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <GradeJournal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/schedule"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <WeeklySchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherProfile />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/grades"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/schedule"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <WeeklySchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer /> {/* 💡 Илова мекунем */}
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
