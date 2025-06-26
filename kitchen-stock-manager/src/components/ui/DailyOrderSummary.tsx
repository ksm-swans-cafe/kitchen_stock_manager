import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/share/ui/card";
import { Button } from "@/share/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/share/ui/badge";
import { Clock, ShoppingBag, Package, DollarSign } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  ingredients: { name: string; cost: number; unit: string }[];
}

interface Order {
  id: number;
  time: string;
  customerName: string;
  totalAmount: number;
  items: MenuItem[];
}

const DailyOrderSummary: React.FC = () => {
  // Mock data สำหรับออเดอร์รายวัน
  const dailyOrders: Order[] = [
    {
      id: 1,
      time: '08:30',
      customerName: 'คุณสมชาย',
      totalAmount: 280,
      items: [
        {
          id: 1,
          name: 'กาแฟอเมริกาโน่',
          price: 50,
          ingredients: [
            { name: 'เมล็ดกาแฟ อราบิก้า', cost: 15, unit: 'กรัม' },
            { name: 'น้ำ', cost: 2, unit: 'มล.' }
          ]
        },
        {
          id: 2,
          name: 'ครัวซองต์',
          price: 80,
          ingredients: [
            { name: 'แป้งสาลี', cost: 20, unit: 'กรัม' },
            { name: 'เนย', cost: 25, unit: 'กรัม' },
            { name: 'น้ำตาล', cost: 5, unit: 'กรัม' }
          ]
        },
        {
          id: 3,
          name: 'กาแฟลาเต้',
          price: 70,
          ingredients: [
            { name: 'เมล็ดกาแฟ อราบิก้า', cost: 15, unit: 'กรัม' },
            { name: 'นมสด', cost: 20, unit: 'มล.' }
          ]
        },
        {
          id: 4,
          name: 'น้ำปั่นสตรอเบอรี่',
          price: 80,
          ingredients: [
            { name: 'สตรอเบอรี่', cost: 30, unit: 'กรัม' },
            { name: 'น้ำแข็ง', cost: 2, unit: 'กรัม' },
            { name: 'น้ำตาล', cost: 5, unit: 'กรัม' }
          ]
        }
      ]
    },
    {
      id: 2,
      time: '09:15',
      customerName: 'คุณมาลี',
      totalAmount: 150,
      items: [
        {
          id: 1,
          name: 'กาแฟอเมริกาโน่',
          price: 50,
          ingredients: [
            { name: 'เมล็ดกาแฟ อราบิก้า', cost: 15, unit: 'กรัม' },
            { name: 'น้ำ', cost: 2, unit: 'มล.' }
          ]
        },
        {
          id: 2,
          name: 'กาแฟลาเต้',
          price: 70,
          ingredients: [
            { name: 'เมล็ดกาแฟ อราบิก้า', cost: 15, unit: 'กรัม' },
            { name: 'นมสด', cost: 20, unit: 'มล.' }
          ]
        },
        {
          id: 3,
          name: 'เค้กช็อกโกแลต',
          price: 30,
          ingredients: [
            { name: 'แป้งสาลี', cost: 10, unit: 'กรัม' },
            { name: 'โกโก้', cost: 8, unit: 'กรัม' },
            { name: 'น้ำตาล', cost: 5, unit: 'กรัม' }
          ]
        }
      ]
    },
    {
      id: 3,
      time: '10:45',
      customerName: 'คุณสุดา',
      totalAmount: 200,
      items: [
        {
          id: 1,
          name: 'กาแฟคาปูชิโน่',
          price: 80,
          ingredients: [
            { name: 'เมล็ดกาแฟ อราบิก้า', cost: 15, unit: 'กรัม' },
            { name: 'นมสด', cost: 25, unit: 'มล.' }
          ]
        },
        {
          id: 2,
          name: 'ครัวซองต์',
          price: 80,
          ingredients: [
            { name: 'แป้งสาลี', cost: 20, unit: 'กรัม' },
            { name: 'เนย', cost: 25, unit: 'กรัม' },
            { name: 'น้ำตาล', cost: 5, unit: 'กรัม' }
          ]
        },
        {
          id: 3,
          name: 'น้ำส้มคั้น',
          price: 40,
          ingredients: [
            { name: 'ส้ม', cost: 25, unit: 'ลูก' },
            { name: 'น้ำแข็ง', cost: 2, unit: 'กรัม' }
          ]
        }
      ]
    }
  ];

  const calculateOrderIngredientCost = (order: Order) => {
    return order.items.reduce((total, item) => 
      total + item.ingredients.reduce((itemTotal, ingredient) => itemTotal + ingredient.cost, 0), 0
    );
  };

  const calculateOrderProfit = (order: Order) => {
    return order.totalAmount - calculateOrderIngredientCost(order);
  };

  const totalDailySales = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalDailyCost = dailyOrders.reduce((sum, order) => sum + calculateOrderIngredientCost(order), 0);
  const totalDailyProfit = totalDailySales - totalDailyCost;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              สรุปรายวัน - วันที่ {new Date().toLocaleDateString('th-TH')}
            </CardTitle>
            <CardDescription>รายละเอียดออเดอร์และสรุปยอดขาย</CardDescription>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-green-600 font-bold">฿{totalDailySales.toLocaleString()}</div>
              <div className="text-muted-foreground">ยอดขาย</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-bold">฿{totalDailyCost.toLocaleString()}</div>
              <div className="text-muted-foreground">ต้นทุน</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-bold">฿{totalDailyProfit.toLocaleString()}</div>
              <div className="text-muted-foreground">กำไร</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-4">
          {dailyOrders.map((order) => (
            <AccordionItem key={order.id} value={`order-${order.id}`} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex justify-between items-center w-full mr-4">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {order.time}
                    </Badge>
                    <span className="font-medium">ออเดอร์ #{order.id}</span>
                    <span className="text-muted-foreground">{order.customerName}</span>
                    <Badge className="flex items-center">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      {order.items.length} เมนู
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">฿{order.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      กำไร: ฿{calculateOrderProfit(order).toLocaleString()}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {/* รายการเมนูในออเดอร์ */}
                  <div className="grid gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className="font-bold text-green-600">฿{item.price}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Package className="w-3 h-3 mr-1" />
                            <span>วัตถุดิบที่ใช้:</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {item.ingredients.map((ingredient, idx) => (
                              <div key={idx} className="flex justify-between text-xs bg-background rounded p-2">
                                <span>{ingredient.name}</span>
                                <span className="text-red-600">฿{ingredient.cost}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-sm pt-1 border-t">
                            <span>ต้นทุนรวม:</span>
                            <span className="text-red-600 font-medium">
                              ฿{item.ingredients.reduce((sum, ing) => sum + ing.cost, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>กำไรต่อเมนู:</span>
                            <span className="text-green-600">
                              ฿{item.price - item.ingredients.reduce((sum, ing) => sum + ing.cost, 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* สรุปออเดอร์ */}
                  <div className="border-t pt-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        สรุปออเดอร์ #{order.id}
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-green-600 font-bold text-lg">฿{order.totalAmount.toLocaleString()}</div>
                          <div className="text-muted-foreground">ยอดขายรวม</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-bold text-lg">฿{calculateOrderIngredientCost(order).toLocaleString()}</div>
                          <div className="text-muted-foreground">ต้นทุนวัตถุดิบ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-bold text-lg">฿{calculateOrderProfit(order).toLocaleString()}</div>
                          <div className="text-muted-foreground">กำไรสุทธิ</div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-xs text-muted-foreground">
                          อัตรากำไร: {Math.round((calculateOrderProfit(order) / order.totalAmount) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DailyOrderSummary;
