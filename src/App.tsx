import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import DiseaseDetection from "./pages/DiseaseDetection";
import PriceForecast from "./pages/PriceForecast";
import CropRecommend from "./pages/CropRecommend";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./i18n/LanguageContext";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/agriconnectai">
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/detect" element={<DiseaseDetection />} />
              <Route path="/forecast" element={<PriceForecast />} />
              <Route path="/recommend" element={<CropRecommend />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
