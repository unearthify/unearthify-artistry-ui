/* eslint-disable @typescript-eslint/no-explicit-any */
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Artists from "./pages/Artist/Artists";
import ArtForms from "./pages/ArtForm/ArtForms";
import Events from "./pages/Events/Events";
import Contribute from "./pages/Contribute";
import NotFound from "./pages/NotFound";
import ScrollTop from "./components/ScrollTop";
import ArtFormDetail from "./pages/ArtForm/ArtFormDetail";
import CategoryArtForms from "./pages/ArtForm/CategoryArtForms";
import EventDetail from "./pages/Events/EventDetail";
import ArtistDetails from "./pages/Artist/ArtistDetails";
import AboutUnearthify from "./pages/AboutUnearthify";
import ArtistLogin from "./pages/ArtistDashboard/ArtistLogin";
import ArtistSignup from "./pages/ArtistDashboard/ArtistSignup";
import ArtistDashboard from "./pages/ArtistDashboard/ArtistDashboard";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();
const ToasterWrapper = () => <Toaster position={"top-right" as any} />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToasterWrapper />
      <Sonner />
      <BrowserRouter>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:id" element={<ArtistDetails />} />
          <Route path="/contribute" element={<Contribute />} />

          {/* Art Forms Root */}
          <Route path="/art-forms" element={<ArtForms />} />
          <Route
            path="/artform/:categorySlug"
            element={<CategoryArtForms />}
          />
          <Route
            path="/artform/:categorySlug/:artTypeSlug"
            element={<ArtFormDetail />}
          />

          {/* Event Form */}
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          {/* About Unearthify */}
          <Route path="/about" element={<AboutUnearthify />} />
          {/* Artist Login */}
          <Route path="/artist-login" element={<ArtistLogin />} />
          <Route path="/artist-signup" element={<ArtistSignup />} />
          <Route path="/artist/dashboard" element={<ArtistDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
