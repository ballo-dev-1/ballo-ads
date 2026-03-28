import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import { ApiEnvProvider } from './contexts/ApiEnvContext'
import { AdminThemeProvider } from './contexts/AdminThemeContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import AdminHeader from './components/AdminHeader'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter-admin' })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApiEnvProvider>
      <AdminThemeProvider className={inter.variable}>
        <Toaster position="top-center" />
        <Sidebar />
        <div className="admin-main-panel flex min-w-0 flex-1 flex-col overflow-hidden">
          <NotificationsProvider>
            <AdminHeader />
            <main className="admin-content flex-1 overflow-auto px-5 py-5 text-sm leading-relaxed text-[var(--admin-heading)] lg:px-8 lg:py-6">
              {children}
            </main>
          </NotificationsProvider>
        </div>
      </AdminThemeProvider>
    </ApiEnvProvider>
  )
}
