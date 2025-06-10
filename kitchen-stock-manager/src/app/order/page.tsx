'use client';
import SearchBox from '@/components/SearchBox';

export default function Order() {

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
        <div className="w-full max-w-2xl">
          <SearchBox />
        </div>
    </main>
  );
}