import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NavigationIndicator from "@/components/NavigationIndicator";
import { usePageTitle } from "@/hooks/usePageTitle";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordResetVerify from "./pages/PasswordResetVerify";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Classes from "./pages/Classes";
import Schedule, { ScheduleCodeEntryPage, SchedulePublicSubscriptionPage } from "./pages/Schedule/Schedule";
import Files from "./pages/Files";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/Profile/ProfileEdit";
import ProfileChangePassword from "./pages/Profile/ProfileChangePassword";
import Trash from "./pages/Trash";
import Notifications from "./pages/Notifications";
import Sharing from "./pages/Sharing";
import Settings from "./pages/Settings";
import Storage from "./pages/Storage";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import HowToUse from "./pages/HowToUse";
import Privacy from "./pages/Privacy";
import Contact from "./pages/ClassDetails/Contact";
import ClassDetails from "./pages/ClassDetails";
import Marketplace from "./pages/Marketplace";
import Library from "./pages/Library/index";
import Channel from "./pages/Channel/index";
import PublicRegister from "./pages/Channel/PublicRegister";

const queryClient = new QueryClient();

// Component to handle page title updates
const AppContent = () => {
  usePageTitle();

  return (
    <>
      <NavigationIndicator />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/password-reset/verify" element={<PasswordResetVerify />} />
        <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
        <Route path="/classes/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/schedule/calendar/:calendarId" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/schedule/subscribe/:token" element={<SchedulePublicSubscriptionPage />} />
        <Route path="/schedule/code" element={<ScheduleCodeEntryPage />} />
        <Route path="/schedule/code/:code" element={<SchedulePublicSubscriptionPage />} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/profile/change-password" element={<ProtectedRoute><ProfileChangePassword /></ProtectedRoute>} />
        <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
        <Route path="/sharing" element={<ProtectedRoute><Sharing /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/storage" element={<ProtectedRoute><Storage /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/channel" element={<ProtectedRoute><Channel /></ProtectedRoute>} />
        <Route path="/channel/register/:token" element={<PublicRegister />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
