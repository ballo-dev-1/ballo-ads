'use client'

import AdminHero from '@/app/admin/components/AdminHero'

type EnvLink = {
  env: 'Production' | 'Staging' | 'Development'
  frontend: string
  webApp: string
  backendApi: string
}

const ENV_LINKS: EnvLink[] = [
  {
    env: 'Production',
    frontend: 'https://balloads.com',
    webApp: 'https://app.balloads.com',
    backendApi: 'https://api.balloads.com',
  },
  {
    env: 'Staging',
    frontend: 'https://staging.balloads.com',
    webApp: 'https://staging-ballo-ads.web.app',
    backendApi: 'https://staging-api.balloads.com',
  },
  {
    env: 'Development',
    frontend: 'https://dev.balloads.com',
    webApp: 'https://dev-ballo-ads.web.app/',
    backendApi: 'https://dev-api.balloads.com',
  },
]

function LinkCell({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block break-all text-[var(--admin-ui-accent)] hover:underline"
    >
      {href}
    </a>
  )
}

export default function AdminDocsPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
      <AdminHero
        eyebrow="Documentation"
        title="Environment Links"
        description="Quick reference for frontend site, frontend web app, and backend API endpoints by environment."
        variant="sky"
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-white text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <th className="whitespace-nowrap px-4 py-3">Environment</th>
                <th className="whitespace-nowrap px-4 py-3">Frontend</th>
                <th className="whitespace-nowrap px-4 py-3">Frontend web app</th>
                <th className="whitespace-nowrap px-4 py-3">Backend APIs</th>
              </tr>
            </thead>
            <tbody>
              {ENV_LINKS.map((row) => (
                <tr key={row.env} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.env}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <LinkCell href={row.frontend} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <LinkCell href={row.webApp} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <LinkCell href={row.backendApi} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
