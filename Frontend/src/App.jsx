import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminLogin from './pages/AdminLogin'
import ForgatePassword from './pages/ForgatePassword'
import BirthDeathRegistration from './pages/BirthDeathRegistration'
import CitizenServices from './pages/CitizenServices'
import Complaints from './pages/Complaints'
import Contact from './pages/Contact'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import Logout from './pages/Logout'
import MediaUpload from './pages/MediaUpload'
import NoticeBoard from './pages/NoticeBoard'
import OngoingProjects from './pages/OngoingProjects'
import PanchayatInfo from './pages/PanchayatInfo'
import PermissionMatrix from './pages/PermissionMatrix'
import Profile from './pages/Profile'
import PropertyTax from './pages/PropertyTax'
import PropertyTaxUser from './pages/PropertyTaxUser'
import QRCode from './pages/QRCode'
import RoleManagement from './pages/RoleManagement'
import Schemes from './pages/Schemes'
import SideBar from './pages/SideBar'
import SimplePage from './pages/SimplePage'
import VillageStatistics from './pages/VillageStatistics'
import WaterSupply from './pages/WaterSupply'
import { allPanchayatRoles, role } from './constants/roles'
import GetOngogingProject from './pages/OngoingProjectUser'
import UserAI from './pages/UserAI'

import ComplintAi from './pages/ComplintAi'
import TrackCompilt from './pages/TrackCompilt'
import EmergencyContact from './pages/Emergency'
import AddOfficialEmergencyContact from './pages/AddOfficialEmergencyContact'
import ViewEmergencyAlerts from './pages/ViewEmergencyAlerts'
import { checkIpAccess } from './Services/loginservices'

const {
  applicationAdmin,
  sarpanch,
  deputySarpanch,
  upSarpanch,
  gramSevak,
  wardMember,
  clerk,
  operator,
  taxOfficer,
  waterSupplyWorker,
} = role

const adminRoles = [applicationAdmin, sarpanch, deputySarpanch, upSarpanch]
const deputySarpanchRoles = [applicationAdmin, deputySarpanch, upSarpanch]
const citizenServiceRoles = [applicationAdmin, sarpanch, deputySarpanch, upSarpanch, gramSevak, clerk, operator]
const taxRoles = [applicationAdmin, sarpanch, deputySarpanch, upSarpanch, taxOfficer, clerk]
const waterRoles = [applicationAdmin, sarpanch, deputySarpanch, upSarpanch, waterSupplyWorker, gramSevak]
const publicWorkRoles = [applicationAdmin, sarpanch, deputySarpanch, upSarpanch, wardMember, gramSevak]

function getTokenRole() {
  const token = localStorage.getItem('accesstoken')

  if (!token) {
    return ''
  }

  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    return decodedPayload?.role || ''
  } catch {
    localStorage.removeItem('accesstoken')
    return ''
  }
}

function RequireRole({ allowedRoles, children }) {
  const role = getTokenRole()

  if (!role) {
    return <Navigate replace to="/login/admin" />
  }

  if (!allowedRoles?.includes(role)) {
    return <Navigate replace to="/" />
  }

  return children
}

function PublicOnly({ children }) {
  if (getTokenRole()) {
    return <Navigate replace to="/role-management" />
  }

  return children
}

function App() {
  const [access, setAccess] = useState('checking')

  useEffect(() => {
    let isMounted = true

    checkIpAccess().then((result) => {
      if (isMounted) {
        setAccess(result.success ? (result.allowed ? 'allowed' : 'blocked') : 'unavailable')
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  if (access === 'checking') {
    return <main className="grid min-h-screen place-items-center bg-neutral-50 text-sm font-semibold text-neutral-600">Checking access...</main>
  }

  if (access === 'blocked') {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 text-center">
        <section>
          <p className="text-7xl font-black tracking-tight text-neutral-900">404</p>
          <h1 className="mt-4 text-xl font-bold text-neutral-800">Please contact application admin.</h1>
        </section>
      </main>
    )
  }

  if (access === 'unavailable') {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 text-center">
        <section>
          <h1 className="text-xl font-bold text-neutral-800">Unable to verify application access.</h1>
          <button className="mt-4 font-semibold text-emerald-800 underline" onClick={() => window.location.reload()} type="button">
            Try again
          </button>
        </section>
      </main>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SideBar />} path="/">
          <Route index element={<Home />} />
          <Route element={<Home />} path="home" />
          <Route
            element={
              <RequireRole allowedRoles={deputySarpanchRoles}>
                <PanchayatInfo />
              </RequireRole>
            }
            path="panchayat-info"
          />
          <Route
            element={
              <RequireRole allowedRoles={deputySarpanchRoles}>
                <VillageStatistics />
              </RequireRole>
            }
            path="village-statistics"
          />
          <Route
            element={
              <RequireRole allowedRoles={citizenServiceRoles}>
                <CitizenServices />
              </RequireRole>
            }
            path="citizen-services"
          />

          <Route
            element={<UserAI />}
            path="user-ai"
          />
          <Route
            element={
              <RequireRole allowedRoles={citizenServiceRoles}>
                <BirthDeathRegistration />
              </RequireRole>
            }
            path="birth-death-registration"
          />
          <Route
            element={
              <RequireRole allowedRoles={taxRoles}>
                <PropertyTax />
              </RequireRole>
            }
            path="property-tax"
          />
          <Route element={<PropertyTaxUser />} path="property-tax/check" />
          <Route element={<QRCode />} path="qr-code" />
          <Route
            element={
              <RequireRole allowedRoles={waterRoles}>
                <WaterSupply />
              </RequireRole>
            }
            path="water-supply"
          />
          <Route
            element={
              <RequireRole allowedRoles={allPanchayatRoles}>
                <Complaints />
              </RequireRole>
            }
            path="complaints"
          />
          <Route element={<Schemes />} path="schemes" />
          <Route
            element={
              <RequireRole allowedRoles={publicWorkRoles}>
                <OngoingProjects />
              </RequireRole>
            }
            path="ongoing-projects"
          />
          <Route
            element={
              <RequireRole allowedRoles={publicWorkRoles}>
                <MediaUpload />
              </RequireRole>
            }
            path="media-upload"
          />
          <Route element={<Gallery />} path="gallery" />
          <Route element={<NoticeBoard />} path="notice-board" />
          <Route element={<Contact />} path="contact" />
          <Route
            element={
              <RequireRole allowedRoles={deputySarpanchRoles}>
                <Profile />
              </RequireRole>
            }
            path="profile"
          />
          <Route
            element={
              <RequireRole allowedRoles={adminRoles}>
                <RoleManagement />
              </RequireRole>
            }
            path="role-management"
          />

          <Route element={<GetOngogingProject />} path="get-allongoingprojects" />
          <Route
            element={
              <RequireRole allowedRoles={adminRoles}>
                <PermissionMatrix />
              </RequireRole>
            }
            path="permission-matrix"
          />
          <Route
            element={
              <RequireRole allowedRoles={allPanchayatRoles}>
                <Logout />
              </RequireRole>
            }
            path="logout"
          />
          <Route
            element={
              <PublicOnly>
                <AdminLogin />
              </PublicOnly>
            }
            path="login/admin"
          />
          <Route
            element={
              <PublicOnly>
                <ForgatePassword />
              </PublicOnly>
            }
            path="forgot-password"
          />
          <Route
            element={
              <PublicOnly>
                <TrackCompilt />
              </PublicOnly>
            }
            path="track-compilnt"
          />

          <Route
            element={
              <RequireRole allowedRoles={adminRoles}>
                <ViewEmergencyAlerts />
              </RequireRole>
            }
            path="view-emergency-alerts"
          />

          <Route
            element={
              <RequireRole allowedRoles={adminRoles}>
                <AddOfficialEmergencyContact />
              </RequireRole>
            }
            path="add-official-emergency-contact"
          />

          <Route
            element={<EmergencyContact />}
            path="emergency-contact"
          />

          <Route element={<ComplintAi />} path='complint-ai' />
          <Route element={<SimplePage pageKey="workerLogin" />} path="login/worker" />
          <Route element={<SimplePage pageKey="userLogin" />} path="login/user" />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
