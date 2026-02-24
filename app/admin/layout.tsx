import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import { NotificationsProvider } from './contexts/NotificationsContext'
import AdminHeader from './components/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pl-10 pt-6">
        <NotificationsProvider>
          <AdminHeader />
          {children}
        </NotificationsProvider>
      </div>
    </div>
  )
}

