'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/share/ui/button';
import { Card, CardContent } from '@/share/ui/card';
import {
  Plus,
  ShoppingCart,
  History,
} from 'lucide-react';

export default function Page() {
  const router = useRouter();
  
  const handleAddIngredients = () => {
    router.push('/ingredients');
  };

  const handleOrder = () => {
    router.push('/home/order');
  };

  const handleOrderHistory = () => {
    router.push('/orderhistory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Add Ingredients */}
          <Card className="group hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-border/30 hover:border-primary/20">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleAddIngredients}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-green-500/10 group-hover:bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-base">Add Ingredients</span>
              </Button>
            </CardContent>
          </Card>

          {/* Order */}
          <Card className="group hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-border/30 hover:border-primary/20">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleOrder}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-base">Order</span>
              </Button>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="group hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border-border/30 hover:border-primary/20">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleOrderHistory}
                className="w-full h-20 flex items-center justify-start space-x-4 px-6 text-foreground font-semibold hover:bg-transparent"
              >
                <div className="w-12 h-12 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-base">Order History</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
