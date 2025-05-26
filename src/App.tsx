
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Challenges from "./components/challenge/Challenges";
import ChallengePage from "./components/challenge/ChallengePage";
import Scoreboard from "./pages/Scoreboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./components/admin/Admin";
import Resources from "./components/resource/Resources";
import ResourceDetail from "./components/resource/ResourceDetail";
import CreatorStudio from "./pages/CreatorStudio";
import BlogEditor from "./pages/BlogEditor";
import EditResource from "./components/resource/EditResource";
// 30 minutes inactivity timeout
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const AppWithProviders = () => (
  <BrowserRouter>
    <AuthProvider inactivityTimeout={INACTIVITY_TIMEOUT}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengePage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/creator-studio" element={<CreatorStudio />} />
        <Route path="/blog-editor" element={<BlogEditor />} />
        <Route path="/Edit-Resource/:resourceId" element={<EditResource />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppWithProviders />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
