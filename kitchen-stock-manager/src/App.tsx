import { Toaster } from "@/share/ui/toaster";
import { Toaster as Sonner } from "@/share/ui/sonner";
import { TooltipProvider } from "@/share/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";   
import page from "./app/home/page"; 
import AddIngredients from "./app/home/AddIngredients";
import Order from "./app/home/Order";
import OrderHistory from "./app/home/OrderHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
