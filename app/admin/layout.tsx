import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import { ApiEnvProvider } from './contexts/ApiEnvContext'
import { AdminThemeProvider } from './contexts/AdminThemeContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import AdminHeader from './components/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApiEnvProvider>
      <AdminThemeProvider>
        <Toaster position="top-center" />
        <Sidebar />
        <div className="admin-main-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <NotificationsProvider>
            <AdminHeader />
            <main className="admin-content flex min-h-0 min-w-0 flex-1 flex-col overflow-auto px-5 py-5 text-sm leading-relaxed text-[var(--admin-heading)] lg:px-8 lg:py-6">
              {children}
            </main>
          </NotificationsProvider>
        </div>
      </AdminThemeProvider>
    </ApiEnvProvider>
  )
}
