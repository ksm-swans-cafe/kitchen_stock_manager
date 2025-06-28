'use client';

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { th } from 'date-fns/locale';

type AlertCalendarProps = {
  alertDates?: string[];
  onSelectDate?: (date: Date) => void;
};

const AlertCalendar: React.FC<AlertCalendarProps> = ({
  alertDates = [],
  onSelectDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const isAlertDate = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return alertDates.includes(dateString);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onSelectDate?.(date);
    setShowCalendar(false);
  };

  return (
    <div className="relative z-50">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
        onClick={() => setShowCalendar(true)}
      >
        Filter
      </button>

      {showCalendar && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <Calendar
              locale="th-TH" 
              onChange={(date) => handleDateChange(date as Date)}
              value={selectedDate}
              tileClassName={({ date }) =>
                isAlertDate(date) ? 'alert-date' : undefined
              }
            />
            <button
              className="mt-2 text-sm text-gray-500 underline"
              onClick={() => setShowCalendar(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .alert-date {
          background: #ffe6e6 !important;
          color: #c00 !important;
          border-radius: 50%;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default AlertCalendar;
