import { useState, useEffect } from "react";
import useLoadingDots from "@/lib/hook/Dots";

interface LoadingProps {
  context?: string;
  icon?: string;
}

export const Loading = ({ context = "", icon = "", color = "" }: LoadingProps) => {
  const dots = useLoadingDots();

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4'>
        <div className='bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-sm w-full'>
          <div className={`animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-${color}-500 border-t-transparent rounded-full mx-auto mb-4`}></div>
          <h3 className='text-base md:text-lg font-medium text-gray-700 mb-2 flex items-center gap-2 justify-center'>
            {icon && <img src={icon} alt='' className='w-10 h-10' />}
            กำลังโหลด{context}
          </h3>
          <p className='text-base text-gray-500'>กรุณารอสักครู่{dots}</p>
        </div>
      </div>
    </>
  );
};
