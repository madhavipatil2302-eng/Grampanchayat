import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Droplets,
  FileText,
  GalleryHorizontalEnd,
  Home,
  Info,
  Landmark,
  LogOut,
  Menu,
  Megaphone,
  ImageUp,
  Phone,
  Settings2,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
  QrCode,
} from 'lucide-react'
import Footer from './Footer'
import { getPermissionMatrix } from '../Services/permissionService'
import NotificationList from '../components/NotificationList'

const languageNames = {
  en: 'English',
  mr: 'Marathi',
  hi: 'Hindi',
}

const navItems = [
  { icon: Home, label: 'Home', moduleKey: 'home', path: '/' },
  { icon: Info, label: 'Panchayat Info', moduleKey: 'panchayatInfo', path: '/panchayat-info' },
  { icon: BarChart3, label: 'Village Statistics', moduleKey: 'villageStatistics', path: '/village-statistics' },
  { icon: Users, label: 'Citizen Services', moduleKey: 'citizenServices', path: '/citizen-services' },
  { icon: Bot, label: 'User AI', moduleKey: 'userAI', path: '/user-ai' },
  { icon: FileText, label: 'Birth Death Registration', moduleKey: 'birthDeathRegistration', path: '/birth-death-registration' },
  { icon: Landmark, label: 'View Property Tax', moduleKey: 'propertyTaxPublic', path: '/property-tax/check' },
  { icon: QrCode, label: 'QR Code', moduleKey: 'qrCodePublic', path: '/qr-code' },
  { icon: Landmark, label: 'Property Tax', moduleKey: 'propertyTax', path: '/property-tax' },
  { icon: Droplets, label: 'Water Supply', moduleKey: 'waterSupply', path: '/water-supply' },
  { icon: Megaphone, label: 'Complaints', moduleKey: 'complaints', path: '/complaints' },
  { icon: ShieldCheck, label: 'Schemes', moduleKey: 'schemes', path: '/schemes' },
  { icon: BriefcaseBusiness, label: 'Ongoing Projects', moduleKey: 'ongoingProjects', path: '/ongoing-projects' },
  { icon: BriefcaseBusiness, label: 'All Ongoing Projects', moduleKey: 'ongoingProjects', path: '/get-allongoingprojects' },
  { icon: ImageUp, label: 'Media Upload', moduleKey: 'mediaUpload', path: '/media-upload' },
  { icon: GalleryHorizontalEnd, label: 'Gallery', moduleKey: 'gallery', path: '/gallery' },
  { icon: Bell, label: 'Notice Board', moduleKey: 'noticeBoard', path: '/notice-board' },
  { icon: AlertTriangle, label: 'View Emergency Alerts', moduleKey: 'roleManagement', path: '/view-emergency-alerts' },
  { icon: AlertTriangle, label: 'Add Official Emergency Contact', moduleKey: 'roleManagement', path: '/add-official-emergency-contact' },
  { icon: Phone, label: 'Contact', moduleKey: 'contact', path: '/contact' },
  { icon: AlertTriangle, label: 'Emergency Contact', moduleKey: 'emergencyContact', path: '/emergency-contact' },
  { icon: Settings2, label: 'Role Management', moduleKey: 'roleManagement', path: '/role-management' },
  { icon: ShieldCheck, label: 'Permission Matrix', moduleKey: 'roleManagement', path: '/permission-matrix' },
]

const publicNavItems = navItems.filter(
  (item) =>
    item.path === '/' ||
    item.path === '/gallery' ||
    item.path === '/schemes' ||
    item.path === '/notice-board' ||
    item.path === '/user-ai' ||
    item.path === '/property-tax/check' ||
    item.path === '/qr-code' ||
    item.path === '/get-allongoingprojects' ||
    item.path === '/emergency-contact'
)

function getTokenRole() {
  const token = localStorage.getItem('accesstoken')

  if (!token) {
    return 'citizen'
  }

  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    return decodedPayload?.role || 'citizen'
  } catch {
    return 'citizen'
  }
}

function resolvePermissionRole(role) {
  const roleMap = {
    ApplicationAdmin: 'admin',
    Clerk: 'dataEntry',
    DeputySarpanch: 'deputySarpanch',
    GramSevak: 'gramsevak',
    Operator: 'dataEntry',
    TaxOfficer: 'dataEntry',
    UpSarpanch: 'deputySarpanch',
    WardMember: 'gramsevak',
    WaterSupplyWorker: 'dataEntry',
    sarpanch: 'sarpanch',
  }

  return roleMap[role] || 'citizen'
}

function LogoBlock({ compact = false }) {
  return (
    <div className={`portal-brand ${compact ? 'portal-brand-compact' : ''}`} data-no-translate="true">
      <div className="portal-brand-mark">
        <img alt="State Emblem of India" src="/emblem-of-india.svg" />
      </div>
      <div className="portal-brand-copy">
        <p className="portal-brand-title">ग्रामपंचायत पोर्टल</p>
        {!compact && <p className="portal-brand-subtitle">Chapalgaon Gram Panchayat</p>}
      </div>
    </div>
  )
}

function SideBar() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [visibleNavItems, setVisibleNavItems] = useState(publicNavItems)

  const isLoginPage = location.pathname.startsWith('/login')
  const isHomePage = location.pathname === '/' || location.pathname === '/home'
  const isLoggedIn = Boolean(localStorage.getItem('accesstoken'))
  const title = isLoginPage ? 'प्रशासकीय लॉगिन' : 'ग्रामपंचायत पोर्टल'

  useEffect(() => {
    let ignoreResult = false

    async function loadVisibleNavItems() {
      const permissionRole = resolvePermissionRole(getTokenRole())

      if (!isLoggedIn) {
        setVisibleNavItems(publicNavItems)
        return
      }

      if (permissionRole === 'admin') {
        setVisibleNavItems(navItems)
        return
      }

      const result = await getPermissionMatrix()

      if (!result.success || !Array.isArray(result.data?.modules)) {
        if (!ignoreResult && permissionRole !== 'admin') {
          setVisibleNavItems(publicNavItems)
        }
        return
      }

      const permissionsByModule = new Map(
        result.data.modules.map((module) => [module.moduleKey, module.permissions?.[permissionRole] || ''])
      )

      const nextItems = navItems.filter((item) => {
        const permission = permissionsByModule.get(item.moduleKey)

        return permission && permission !== 'Denied'
      })

      if (!ignoreResult) {
        setVisibleNavItems(nextItems.length > 0 ? nextItems : publicNavItems)
      }
    }

    loadVisibleNavItems()

    return () => {
      ignoreResult = true
    }
  }, [isLoggedIn])

  function handleLogout() {
    localStorage.removeItem('accesstoken')
    setLogoutDialogOpen(false)
    navigate('/login/admin', { replace: true })
  }

  const sidebar = (
    <aside className="portal-sidebar flex h-dvh w-[252px] shrink-0 flex-col overflow-hidden border-r bg-white">
      <div className="portal-sidebar-brand px-5 py-5">
        <LogoBlock />
      </div>

      <nav className="portal-nav min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              className={({ isActive }) =>
                `portal-nav-link flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition ${isActive
                  ? 'portal-nav-link-active'
                  : 'text-slate-700 hover:bg-slate-50'
                }`
              }
              end={item.path === '/'}
              key={item.path}
              onClick={() => setMobileOpen(false)}
              to={item.path}
            >
              <Icon className="portal-nav-icon h-[18px] w-[18px] shrink-0" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="portal-nav-chevron text-lg font-normal">›</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )

  return (
    <div className="portal-shell h-dvh w-full overflow-hidden text-slate-900">
      <div className="h-dvh w-full overflow-hidden bg-white">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full" onClick={(event) => event.stopPropagation()}>
              {sidebar}
            </div>
          </div>
        )}

        <main className="portal-main h-dvh min-w-0 overflow-hidden lg:pl-[252px]">
          <header className="portal-header fixed left-0 right-0 top-0 z-30 flex h-[76px] items-center justify-between border-b bg-white px-4 sm:px-7 lg:left-[252px]">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                className="portal-menu-button grid h-10 w-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMobileOpen(true)}
                type="button"
              >
                <Menu size={28} />
              </button>
              <img alt="State Emblem of India" className="portal-header-emblem h-9 w-7 shrink-0 object-contain sm:h-10 sm:w-8" src="/emblem-of-india.svg" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black text-emerald-950 sm:text-2xl">{title}</h1>
                <p className="mt-1 hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
                  <span aria-hidden="true" className="portal-tricolor-mark" />
                  माझी गाव, माझी जबाबदारी, आपला विकास
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <select
                className="portal-language-select h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                data-no-translate="true"
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                value={i18n.language}
              >
                <option value="mr">{languageNames.mr}</option>
                <option value="hi">{languageNames.hi}</option>
                <option value="en">{languageNames.en}</option>
              </select>

              <div className="relative">
                <button 
                  className="relative hidden text-slate-700 transition hover:text-blue-700 sm:block" 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  type="button"
                >
                  <Bell size={24} />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-xs font-black text-white shadow-sm">
                    3
                  </span>
                </button>

                {isNotificationOpen && (
                    <div className="absolute right-0 z-50 mt-4 w-80 origin-top-right rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:w-96">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-3">
                        <h3 className="text-base font-black text-slate-900">Notifications</h3>
                      <button 
                        className="text-xs font-bold text-blue-700 transition hover:text-blue-900"
                        onClick={() => setIsNotificationOpen(false)}
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                    <NotificationList />
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <>
                  <Link
                    className="portal-account-button grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-800 ring-1 ring-blue-100 transition hover:bg-blue-700 hover:text-white"
                    title="Profile"
                    to="/profile"
                  >
                    <User size={22} />
                  </Link>
                  <button
                    className="grid h-10 w-10 place-items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-600 hover:text-white"
                    onClick={() => setLogoutDialogOpen(true)}
                    title="Logout"
                    type="button"
                  >
                    <LogOut size={22} />
                  </button>
                </>
              )}

              {!isLoggedIn && (
                <Link
                  className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-900"
                  to="/login/admin"
                >
                  Login
                </Link>
              )}
            </div>
          </header>

          {logoutDialogOpen && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
              <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-black text-slate-950">Logout</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Are you sure you want to logout?
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-800 transition hover:bg-slate-50"
                    onClick={() => setLogoutDialogOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-10 rounded-lg bg-rose-600 px-5 text-sm font-black text-white transition hover:bg-rose-700"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="portal-page-scroll fixed inset-x-0 bottom-0 top-[76px] flex flex-col overflow-y-auto p-3 pb-28 sm:p-5 lg:left-[252px] lg:p-6 lg:pb-7">
            <section
              className={
                isLoginPage
                  ? 'min-h-[calc(100vh-10rem)] text-left'
                  : isHomePage
                    ? 'rounded-none border-0 bg-transparent p-0 text-left shadow-none'
                    : 'portal-content-panel rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm sm:p-7'
              }
            >
              <Outlet />
            </section>

            <div className="mt-auto">
              <Footer />
            </div>
          </div>

          <section className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
            <div className="portal-mobile-nav flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-lg">
              <LogoBlock compact />
              {visibleNavItems.slice(0, 8).map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    className={({ isActive }) =>
                      `grid min-w-20 place-items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold ${isActive ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                    end={item.path === '/'}
                    key={item.path}
                    to={item.path}
                  >
                    <Icon size={22} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
              <div className="ml-auto hidden h-11 w-48 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-400 md:flex">
                Search...
                <span className="ml-auto text-xl">⌕</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SideBar
