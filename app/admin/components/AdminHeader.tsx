'use client'

import NotificationBell from './NotificationBell'

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-end gap-4 px-6 py-2 shrink-0">
      <NotificationBell />
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </header>
  )
}
