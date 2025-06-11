'use client';
import SearchBox from '@/components/SearchBox';
import { useEffect, useState } from 'react';

type Employee = {
  id: number;
  name: string;
  role: string;
};

export default function Order() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/test');
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-2xl">
          <SearchBox />
        </div>
       <h1>รายชื่อพนักงาน</h1>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>ชื่อ</th>
              <th>ตำแหน่ง</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}