"use client";
import React, { useState, useMemo } from "react";
import { Plus, Search, Filter, Grid3X3, List } from "lucide-react";

export default function Order() {
  const [selectedCategory, setSelectedCategory] = useState<string>("สินค้าน้อย");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data ตรงตามภาพ - เพิ่มข้อมูลให้มากขึ้น
  const products = useMemo(() => [
    // กาแฟ/เอสเปรสโซ
    { id: "1", name: "Brazil cerado Coffee", price: "0.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "2", name: "Whiskey Blend Special Coffee", price: "120.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "3", name: "Ethiopia Special coffee", price: "130.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "4", name: "ROOTS special", price: "140.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "5", name: "Citrus's Coffee", price: "145.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "6", name: "Mixed Berry Colombia", price: "160.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "7", name: "ชาเขียวยา มาเก้ (Premium Yerba...)", price: "95.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    
    // เพิ่มข้อมูล Mock เพิ่มเติม
    { id: "8", name: "Colombian Supreme", price: "180.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "9", name: "Guatemala Antigua", price: "170.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "10", name: "Jamaica Blue Mountain", price: "350.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "11", name: "Hawaiian Kona", price: "280.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "12", name: "Yemen Mocha", price: "220.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    
    // กาแฟนม/เย็น
    { id: "13", name: "Iced Caramel Macchiato", price: "85.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "14", name: "Cold Brew Original", price: "75.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "15", name: "Vanilla Frappuccino", price: "90.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "16", name: "Mocha Frappuccino", price: "95.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "17", name: "Iced Latte", price: "70.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "18", name: "Thai Iced Coffee", price: "65.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    
    // กาแฟดำ/เย็น
    { id: "19", name: "Iced Americano", price: "55.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "20", name: "Cold Drip Coffee", price: "80.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "21", name: "Iced Espresso", price: "50.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "22", name: "Nitro Cold Brew", price: "85.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "23", name: "Japanese Ice Coffee", price: "75.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    
    // มักกะ
    { id: "24", name: "Hot Chocolate", price: "65.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "25", name: "White Chocolate Mocha", price: "85.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "26", name: "Dark Chocolate Mocha", price: "80.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "27", name: "Peppermint Mocha", price: "90.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "28", name: "Salted Caramel Mocha", price: "95.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    
    // ชา
    { id: "29", name: "Thai Tea", price: "45.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "30", name: "Green Tea Latte", price: "60.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "31", name: "Earl Grey Tea", price: "40.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "32", name: "Jasmine Tea", price: "35.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "33", name: "Chamomile Tea", price: "38.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "34", name: "Oolong Tea", price: "42.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "35", name: "Bubble Tea", price: "55.00", image: "/api/placeholder/120/120", category: "ชา" },
    
    // อื่นๆ
    { id: "36", name: "Fresh Orange Juice", price: "50.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "37", name: "Apple Juice", price: "45.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "38", name: "Sparkling Water", price: "25.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "39", name: "Mineral Water", price: "20.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "40", name: "Energy Drink", price: "60.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "41", name: "Smoothie Berry", price: "75.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "42", name: "Lemonade", price: "40.00", image: "/api/placeholder/120/120", category: "อื่น" },
    
    // สินค้าน้อย (สินค้าที่เหลือน้อย)
    { id: "43", name: "Limited Edition Blend", price: "250.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "44", name: "Seasonal Special", price: "200.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "45", name: "Single Origin Reserve", price: "300.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    
    // เพิ่มข้อมูล Mock เพิ่มเติม - กาแฟร้อน
    { id: "46", name: "Americano Classic", price: "55.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "47", name: "Espresso Double Shot", price: "65.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "48", name: "Cappuccino Premium", price: "75.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "49", name: "Macchiato Traditional", price: "80.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "50", name: "Flat White Special", price: "85.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "51", name: "Cortado Spanish", price: "78.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "52", name: "Gibraltar Coffee", price: "82.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    { id: "53", name: "Ristretto Intense", price: "70.00", image: "/api/placeholder/120/120", category: "กาแฟร้อน" },
    
    // กาแฟนม/เย็น เพิ่มเติม
    { id: "54", name: "Iced Cappuccino", price: "72.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "55", name: "Coffee Smoothie", price: "88.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "56", name: "Affogato Ice Cream", price: "95.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "57", name: "Coconut Coffee", price: "78.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "58", name: "Matcha Coffee Fusion", price: "92.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    { id: "59", name: "Hazelnut Iced Coffee", price: "83.00", image: "/api/placeholder/120/120", category: "กาแฟนม/เย็น" },
    
    // กาแฟดำ/เย็น เพิ่มเติม
    { id: "60", name: "Black Eye Coffee", price: "85.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "61", name: "Red Eye Special", price: "78.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "62", name: "Long Black Coffee", price: "68.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "63", name: "Iced Filter Coffee", price: "65.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    { id: "64", name: "Vietnamese Drip", price: "72.00", image: "/api/placeholder/120/120", category: "กาแฟดำ/เย็น" },
    
    // มักกะ เพิ่มเติม
    { id: "65", name: "Iced Mocha", price: "88.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "66", name: "Mint Chocolate Mocha", price: "92.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "67", name: "Orange Mocha", price: "89.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "68", name: "Spiced Mocha", price: "91.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    { id: "69", name: "Coconut Mocha", price: "87.00", image: "/api/placeholder/120/120", category: "มักกะ" },
    
    // ชา เพิ่มเติม
    { id: "70", name: "Matcha Latte Premium", price: "68.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "71", name: "Royal Milk Tea", price: "58.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "72", name: "Honey Lemon Tea", price: "48.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "73", name: "Masala Chai", price: "52.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "74", name: "Dragon Well Green Tea", price: "45.00", image: "/api/placeholder/120/120", category: "ชา" },
    { id: "75", name: "White Tea Premium", price: "55.00", image: "/api/placeholder/120/120", category: "ชา" },
    
    // อื่นๆ เพิ่มเติม
    { id: "76", name: "Mango Smoothie", price: "78.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "77", name: "Banana Smoothie", price: "72.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "78", name: "Strawberry Juice", price: "65.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "79", name: "Pineapple Juice", price: "58.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "80", name: "Coconut Water", price: "35.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "81", name: "Sports Drink", price: "45.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "82", name: "Chocolate Milkshake", price: "85.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "83", name: "Vanilla Milkshake", price: "82.00", image: "/api/placeholder/120/120", category: "อื่น" },
    { id: "84", name: "Strawberry Milkshake", price: "85.00", image: "/api/placeholder/120/120", category: "อื่น" },
    
    // สินค้าน้อย เพิ่มเติม
    { id: "85", name: "Geisha Coffee Limited", price: "450.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "86", name: "Panama Boquete Special", price: "380.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "87", name: "Rare Bourbon Blend", price: "320.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "88", name: "Monsoon Malabar", price: "280.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "89", name: "Aged Sumatra", price: "290.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" },
    { id: "90", name: "Black Ivory Coffee", price: "650.00", image: "/api/placeholder/120/120", category: "สินค้าน้อย" }
  ], []);

  // Filter products based on selected category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => product.category === selectedCategory);
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.price.includes(searchQuery)
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-48 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            {/* Time */}
            <div className="text-center mb-6 pt-3">
              <div className="text-base font-medium text-gray-600">20:38</div>
              <div className="text-base font-medium text-gray-600">น.ก.น.</div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "สินค้าน้อย" ? "bg-gray-600" : "bg-gray-500 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedCategory("สินค้าน้อย")}
              >
                สินค้าน้อย
              </div>
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "กาแฟร้อน" ? "bg-orange-600" : "bg-orange-500 hover:bg-orange-600"
                }`}
                onClick={() => setSelectedCategory("กาแฟร้อน")}
              >
                กาแฟร้อน
              </div>
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "กาแฟนม/เย็น" ? "bg-orange-700" : "bg-orange-600 hover:bg-orange-700"
                }`}
                onClick={() => setSelectedCategory("กาแฟนม/เย็น")}
              >
                กาแฟนม/เย็น
              </div>
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "กาแฟดำ/เย็น" ? "bg-orange-800" : "bg-orange-700 hover:bg-orange-800"
                }`}
                onClick={() => setSelectedCategory("กาแฟดำ/เย็น")}
              >
                กาแฟดำ/เย็น
              </div>
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "มักกะ" ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={() => setSelectedCategory("มักกะ")}
              >
                มักกะ
              </div>
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "ชา" ? "bg-purple-600" : "bg-purple-500 hover:bg-purple-600"
                }`}
                onClick={() => setSelectedCategory("ชา")}
              >
                ชา
              </div>
              <div 
                className={`p-4 text-base text-center text-white cursor-pointer rounded-lg ${
                  selectedCategory === "อื่น" ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"
                }`}
                onClick={() => setSelectedCategory("อื่น")}
              >
                อื่น
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 bg-gradient-to-br from-white/80 via-gray-50/50 to-white/80 backdrop-blur-sm">

          {/* Search and Filter Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า, ราคา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" 
                      ? "bg-white shadow-sm text-orange-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" 
                      ? "bg-white shadow-sm text-orange-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 text-gray-700">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">ตัวกรอง</span>
              </button>
            </div>
            
            {searchQuery && (
              <div className="text-sm text-gray-600">
                ค้นหา &ldquo;{searchQuery}&rdquo; ใน {selectedCategory} - พบ {filteredProducts.length} รายการ
              </div>
            )}
          </div>

          {/* Products Gallery */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                {selectedCategory}
              </span>
              <span className="ml-3 text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {filteredProducts.length} รายการ
              </span>
            </h2>
            
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-6 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        {/* Placeholder image with gradient */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 rounded-xl shadow-inner flex items-center justify-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 rounded-lg opacity-60"></div>
                        </div>
                        
                        {/* Overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Price badge */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                          <span className="text-xs font-bold text-orange-600">฿{product.price}</span>
                        </div>
                        
                        {/* Add to cart button */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200">
                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-gray-800 text-xs md:text-sm leading-tight mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                      
                      {/* Rating stars (mock) */}
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                        <span className="ml-1 text-xs text-gray-500">(4.5)</span>
                      </div>
                      
                      {/* Stock indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1 md:mr-2"></div>
                          <span className="text-xs text-gray-500">พร้อมจำหน่าย</span>
                        </div>
                        <div className="text-xs text-gray-400">#{product.id}</div>
                      </div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center p-4 md:p-6">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 mr-4 md:mr-6">
                        <div className="w-full h-full bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 rounded-xl shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-300 via-pink-300 to-purple-300 rounded-lg opacity-60"></div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                          <span className="text-xs font-bold text-orange-600">฿{product.price}</span>
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-1 group-hover:text-orange-600 transition-colors duration-200">
                              {product.name}
                            </h3>
                            
                            {/* Rating and stock */}
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                  </svg>
                                ))}
                                <span className="ml-2 text-xs text-gray-500">(4.5)</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-xs text-gray-500">พร้อมจำหน่าย</span>
                              </div>
                              <div className="text-xs text-gray-400">#{product.id}</div>
                            </div>
                          </div>
                          
                          {/* Add to cart button */}
                          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            
            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">ไม่มีสินค้าในหมวดหมู่นี้</h3>
                <p className="text-gray-400">เลือกหมวดหมู่อื่นเพื่อดูสินค้า</p>
              </div>
            )}
          </div>

          {/* Add new item */}
          <div className="flex justify-end mb-4">
            <button className="border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
              <Plus className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Bottom section */}
          <div className="flex items-center justify-between">
            <div></div>
            
            {/* Scan button */}
            <div className="flex-1 max-w-md">
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                📱 Scan
              </button>
            </div>

            {/* Right button */}
            <div>
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                ขายหน้าร้าน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
