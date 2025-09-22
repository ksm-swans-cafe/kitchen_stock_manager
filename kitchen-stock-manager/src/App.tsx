import { Toaster } from "@/share/ui/toaster";
import { Toaster as Sonner } from "@/share/ui/sonner";
import { TooltipProvider } from "@/share/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter></BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
