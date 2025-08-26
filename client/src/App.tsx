import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SecurityProvider } from "@/hooks/use-security";
import { LanguageProvider } from "@/hooks/use-language";
import Home from "@/pages/home";
import Activities from "@/pages/activities";
import Booking from "@/pages/booking-fixed";
import Reviews from "@/pages/reviews";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import CEODashboard from "@/pages/admin/ceo-dashboard";
import PerformanceDashboard from "@/pages/admin/performance-dashboard";
import AdminAccessGuide from "@/components/admin-access-guide";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public pages - SecurityWrapper temporarily disabled to prevent 405 errors */}
      <Route path="/" component={() => (
        <Home />
      )} />
      
      <Route path="/activities" component={() => (
        <Activities />
      )} />
      
      <Route path="/reviews" component={() => (
        <Reviews />
      )} />
      
      {/* Booking page */}
      <Route path="/booking" component={() => (
        <Booking />
      )} />
      
      {/* Admin pages - SecurityWrapper temporarily disabled to prevent 405 errors */}
      <Route path="/admin/login" component={() => (
        <AdminLogin />
      )} />
      
      <Route path="/admin/ceo" component={() => (
        <CEODashboard />
      )} />
      
      <Route path="/admin/dashboard" component={() => (
        <AdminDashboard />
      )} />
      
      <Route path="/admin" component={() => (
        <AdminDashboard />
      )} />
      
      <Route path="/admin/performance" component={() => (
        <PerformanceDashboard />
      )} />
      
      <Route path="/admin/access-guide" component={() => (
        <AdminAccessGuide />
      )} />
      
      {/* 404 page */}
      <Route component={() => (
        <NotFound />
      )} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <LanguageProvider>
          <TooltipProvider>
            <link
              href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
              rel="stylesheet"
            />
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;
