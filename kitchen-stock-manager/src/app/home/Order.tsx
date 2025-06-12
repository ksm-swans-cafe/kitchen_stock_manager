import React from 'react';
import { Button } from "@/share/ui/button";
import { ArrowLeft, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Order: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Menu Bar */}
      <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <span className="text-xl md:text-2xl">SWANS</span>{' '}
            <span className="text-sm md:text-lg font-medium">CAFE & BISTRO</span>
          </h1>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
              {/* Role and username will be shown here after login */}
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2 shadow-sm hover:shadow-md transition-all text-xs md:text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="w-full bg-secondary/20 border-b border-border/50">
        <div className="p-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToDashboard}
            className="flex items-center hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-medium">Order</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Order</h2>
          <p className="text-muted-foreground">This page will contain the order functionality.</p>
        </div>
      </div>
    </div>
  );
};

export default Order;
