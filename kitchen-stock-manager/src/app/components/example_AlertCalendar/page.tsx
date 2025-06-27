'use client';

import AlertCalendar from '@/share/order/AlertCalendar';
import { useState } from 'react';

export default function Home() {
  const [selected, setSelected] = useState<Date | null>(null);

  const importantDates = ['2025-07-01', '2025-07-15', '2025-08-05'];

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
      <div>
        <h1 className="text-xl font-bold mb-4">📅 เลือกวัน</h1>
        <AlertCalendar
          alertDates={importantDates}
          onSelectDate={(date: Date) => {
            setSelected(date);
            console.log('เลือกวันที่:', date);
          }}
        />
        {selected && (
          <p className="mt-4 text-green-600">
            คุณเลือก:{" "}
            {selected.toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </main>
  );
}
