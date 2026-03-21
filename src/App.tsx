import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import DeleteAccount from "./pages/DeleteAccount.tsx";
import AdminLayout from "./components/layout/AdminLayout";

// Shell Pages
import Users from "./pages/Users";
import Listings from "./pages/Listings";
import Products from "./pages/Products";
import Services from "./pages/Services";
import ServiceBookings from "./pages/ServiceBookings";
import Banners from "./pages/Banners";
import Categories from "./pages/Categories";
import ProductCategories from "./pages/ProductCategories";
import ServiceCategories from "./pages/ServiceCategories";
import Breeds from "./pages/Breeds";
import Subscriptions from "./pages/Subscriptions";
import Reviews from "./pages/Reviews";
import Payments from "./pages/Payments";
import Locations from "./pages/Locations";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
            <Route path="/listings" element={<ProtectedRoute><AdminLayout><Listings /></AdminLayout></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><AdminLayout><Products /></AdminLayout></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><AdminLayout><Services /></AdminLayout></ProtectedRoute>} />
            <Route path="/service-bookings" element={<ProtectedRoute><AdminLayout><ServiceBookings /></AdminLayout></ProtectedRoute>} />
            <Route path="/banners" element={<ProtectedRoute><AdminLayout><Banners /></AdminLayout></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
            <Route path="/product-categories" element={<ProtectedRoute><AdminLayout><ProductCategories /></AdminLayout></ProtectedRoute>} />
            <Route path="/service-categories" element={<ProtectedRoute><AdminLayout><ServiceCategories /></AdminLayout></ProtectedRoute>} />
            <Route path="/breeds" element={<ProtectedRoute><AdminLayout><Breeds /></AdminLayout></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><AdminLayout><Subscriptions /></AdminLayout></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><AdminLayout><Reviews /></AdminLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><AdminLayout><Payments /></AdminLayout></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><AdminLayout><Locations /></AdminLayout></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><AdminLayout><Support /></AdminLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AdminLayout><Notifications /></AdminLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/delete-account" element={<DeleteAccount />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
