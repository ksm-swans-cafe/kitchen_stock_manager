'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const routes = [
    { label: 'example_search', path: '/components/example_search' },
    { label: 'example_search_v2', path: '/components/example_search_v2' },
    { label: 'example_MenuCard', path: '/components/example_MenuCard' },
    { label: 'example_AlertCalendar', path: '/components/example_AlertCalendar' },
    { label: 'home', path: '/' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-50">
      <div className='flex flex-col gap-2'>
        {routes.map((route) => (
          <button
            key={route.path}
            onClick={() => router.push(route.path)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
          >
            {route.label}
          </button>
        ))}
      </div>
    </div>
  )
}
