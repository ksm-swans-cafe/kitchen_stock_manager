// pages/footer.tsx
'use client';
import React from "react";

const FooterPage: React.FC = () => {
  return (
    <div>
      <footer className="bg-gray-800 text-white text-center py-6">
        <div className="container mx-auto px-4">
          <p className="text-sm">&copy; 2025 Swan.</p>
          <div className="mt-2 flex justify-center space-x-4 text-xs">
            <a href="#" className="hover:underline">
              About
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterPage;
