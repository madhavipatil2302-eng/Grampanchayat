import {
  ArrowRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  HomeIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAllRoleManagements,
  getPublicMediaUploads,
  getPublicPanchayatInfo,
  getPublicVillageStatistics,
  resolveAssetUrl,
} from '../Services/homeservices'
import { getPublicNotices } from '../Services/noticeBoardService'

const defaultStats = [
  {
    titleKey: 'statsPopulationTitle',
    value: '5,245',
    changeKey: 'statsPopulationChange',
    icon: Users,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    titleKey: 'statsFamiliesTitle',
    value: '1,125',
    changeKey: 'statsFamiliesChange',
    icon: HomeIcon,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
  },
  {
    titleKey: 'statsTaxTitle',
    value: 'Rs. 2,45,320',
    changeKey: 'statsTaxChange',
    icon: CircleDollarSign,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
]

const notices = [
  {
    categoryKey: 'noticeImportantCategory',
    titleKey: 'noticeCitizenTitle',
    descriptionKey: 'noticeCitizenDescription',
    date: '12 July 2026',
    important: true,
  },
  {
    categoryKey: 'noticeGramSabhaCategory',
    titleKey: 'noticeGramSabhaTitle',
    descriptionKey: 'noticeGramSabhaDescription',
    date: '18 July 2026',
  },
  {
    categoryKey: 'noticeWaterSupplyCategory',
    titleKey: 'noticeWaterSupplyTitle',
    descriptionKey: 'noticeWaterSupplyDescription',
    date: '20 July 2026',
  },
]

function formatNumber(value, fallback) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return fallback
  }

  return new Intl.NumberFormat('en-IN').format(numberValue)
}

function buildMapQuery(panchayatInfo) {
  if (panchayatInfo?.latitude && panchayatInfo?.longitude) {
    return `${panchayatInfo.latitude},${panchayatInfo.longitude}`
  }

  return [
    panchayatInfo?.villageName,
    panchayatInfo?.taluka,
    panchayatInfo?.district,
    panchayatInfo?.state,
  ]
    .filter(Boolean)
    .join(' ') || 'Chapalgaon Akkalkot Maharashtra'
}

function ChapalgaonMap({ panchayatInfo }) {
  const mapQuery = buildMapQuery(panchayatInfo)
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(panchayatInfo?.googleMapLink || mapQuery)}&output=embed`
  const mapOpenUrl = panchayatInfo?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const villageTitle = panchayatInfo?.villageName || 'Chapalgaon'
  const talukaTitle = panchayatInfo?.taluka || 'Akkalkot'

  return (
    <section className="mx-auto mt-10 max-w-7xl px-5">
      <div className="grid overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-lg shadow-slate-900/5 lg:grid-cols-[1.05fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
            <MapPin size={17} />
            Location Map
          </div>
          <h2 className="text-2xl font-black text-emerald-950 sm:text-3xl">{villageTitle}, {talukaTitle} Taluka</h2>

          <div className="mt-5 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">State</p>
              <p className="mt-1 text-emerald-950">{panchayatInfo?.state || 'Maharashtra'}</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-sky-700">District</p>
              <p className="mt-1 text-sky-950">{panchayatInfo?.district || 'Solapur'}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-amber-700">Taluka</p>
              <p className="mt-1 text-amber-950">{talukaTitle}</p>
            </div>
          </div>
        </div>

        <a
          aria-label={`Open ${villageTitle} ${talukaTitle} location in Google Maps`}
          className="group relative block min-h-[320px] overflow-hidden bg-slate-100"
          href={mapOpenUrl}
          rel="noreferrer"
          target="_blank"
        >
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full border-0 transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            title="Chapalgaon Akkalkot Maharashtra map"
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:inset-x-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-700 text-white">
                <MapPin size={21} />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-950">{villageTitle}, {talukaTitle}</p>
                <p className="text-xs font-bold text-slate-500">Click kara ani Google Maps madhe location open hoil</p>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}

function Home() {
  const { t } = useTranslation()
  const [roleMembers, setRoleMembers] = useState([])
  const [roleLoading, setRoleLoading] = useState(true)
  const [expandedRoleId, setExpandedRoleId] = useState('')
  const [galleryItems, setGalleryItems] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [publicNotices, setPublicNotices] = useState([])
  const [noticeLoading, setNoticeLoading] = useState(true)
  const [panchayatInfo, setPanchayatInfo] = useState(null)
  const [villageStatistics, setVillageStatistics] = useState(null)
  const selectedRoleMember = roleMembers.find((member) => (member._id || member.email || member.fullName) === expandedRoleId)
  const heroImage = panchayatInfo?.panchayatImage ? resolveAssetUrl(panchayatInfo.panchayatImage) : '/image.png'
  const heroVillageName = panchayatInfo?.gramPanchayatName || panchayatInfo?.villageName
  const homeStats = defaultStats.map((stat) => {
    if (stat.titleKey === 'statsPopulationTitle') {
      return {
        ...stat,
        value: formatNumber(villageStatistics?.totalPopulation, stat.value),
      }
    }

    if (stat.titleKey === 'statsFamiliesTitle') {
      return {
        ...stat,
        value: formatNumber(villageStatistics?.totalHouseholds, stat.value),
      }
    }

    return stat
  })

  useEffect(() => {
    let ignoreResult = false

    async function loadRoleMembers() {
      const result = await getAllRoleManagements()

      if (!ignoreResult) {
        setRoleMembers(result.data)
        setRoleLoading(false)
      }
    }

    loadRoleMembers()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadVillageStatistics() {
      const result = await getPublicVillageStatistics()

      if (!ignoreResult && result.success && result.data) {
        setVillageStatistics(result.data)
      }
    }

    loadVillageStatistics()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadGalleryItems() {
      const result = await getPublicMediaUploads()

      if (!ignoreResult) {
        setGalleryItems(Array.isArray(result.data) ? result.data.filter((item) => item.mediaFile) : [])
        setGalleryLoading(false)
      }
    }

    loadGalleryItems()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadNotices() {
      const result = await getPublicNotices()

      if (!ignoreResult) {
        setPublicNotices(result.success && Array.isArray(result.data) ? result.data : [])
        setNoticeLoading(false)
      }
    }

    loadNotices()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadPanchayatInfo() {
      const result = await getPublicPanchayatInfo()

      if (!ignoreResult && result.success && result.data) {
        setPanchayatInfo(result.data)
      }
    }

    loadPanchayatInfo()

    return () => {
      ignoreResult = true
    }
  }, [])

  return (
    <div className="-m-4 overflow-hidden bg-[#f4faf8] text-slate-950 sm:-m-8">
      <section className="relative min-h-[520px] overflow-hidden bg-emerald-950 px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
        <img
          alt={heroVillageName || 'Chapalgaon Gram Panchayat office'}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,44,34,0.96)_0%,rgba(4,78,59,0.9)_42%,rgba(4,78,59,0.45)_72%,rgba(2,44,34,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.25),transparent_32%)]" />
        <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative max-w-5xl">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md">
            <Sparkles size={16} className="text-amber-300" />
            {t('heroBadge')}
          </div>
          <p className="mb-3 font-bold text-emerald-100">{t('heroSubtitle')}</p>
          <h1 className="text-4xl font-black leading-[1.15] text-white sm:text-5xl lg:text-6xl">
            {t('heroTitlePrimary')}
            <span className="mt-2 block bg-gradient-to-r from-amber-200 via-white to-emerald-200 bg-clip-text text-transparent">
              {heroVillageName || t('heroTitleHighlight')}
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-emerald-50/90 sm:text-lg">
            {t('heroDescription')}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button className="group flex items-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-emerald-950 shadow-2xl transition hover:-translate-y-1">
              {t('heroPrimaryButton')}
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20">
              <ClipboardList size={18} />
              {t('heroSecondaryButton')}
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-5 text-sm font-bold text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-300" />
              {t('heroFeatureOne')}
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList size={20} className="text-emerald-300" />
              {t('heroFeatureTwo')}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-5">
        <div className="grid gap-5 md:grid-cols-3">
          {homeStats.map((stat) => {
            const Icon = stat.icon
            return (
              <article
                className="group relative overflow-hidden rounded-[24px] border border-white bg-white p-6 shadow-xl shadow-slate-900/10 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                key={stat.titleKey}
              >
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-emerald-50/80" />
                <div className="relative flex items-center justify-between gap-5">
                  <div>
                    <p className="text-sm font-bold text-slate-500">{t(stat.titleKey)}</p>
                    <h3 className="mt-2 text-3xl font-black text-slate-950">{stat.value}</h3>
                    <p className="mt-2 text-xs font-bold text-emerald-700">{t(stat.changeKey)}</p>
                  </div>
                  <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${stat.iconBg} ${stat.iconColor} transition group-hover:rotate-6 group-hover:scale-110`}>
                    <Icon size={29} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <ChapalgaonMap panchayatInfo={panchayatInfo} />

      <section className="mt-8 bg-[#eef8f3] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">Gram Panchayat Team</p>
            <h2 className="mt-2 text-xl font-black text-emerald-950 sm:text-2xl">
              Grampanchayat Che Sadasya Ani Adhikari
            </h2>
          </div>

          {roleLoading ? (
            <div className="rounded-lg bg-white p-6 text-center text-sm font-bold text-slate-600">Loading role details...</div>
          ) : roleMembers.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center text-sm font-bold text-slate-600">No role details found.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roleMembers.slice(0, 3).map((member) => {
                const memberId = member._id || member.email || member.fullName

                return (
                  <article
                    className="flex min-h-60 flex-col items-center justify-start rounded-md bg-white px-4 py-5 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                    key={memberId}
                  >
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-emerald-50 bg-slate-50 p-1 shadow-sm">
                      {member.profilePhoto ? (
                        <img
                          alt={member.fullName || member.name || member.role}
                          className="h-full w-full rounded-full object-cover"
                          src={resolveAssetUrl(member.profilePhoto)}
                        />
                      ) : (
                        <Users className="h-10 w-10 text-slate-400" />
                      )}
                    </div>

                    <h3 className="mt-4 min-h-9 text-sm font-black leading-5 text-emerald-950">
                      {member.fullName || member.name || 'Name not available'}
                    </h3>
                    <p className="mt-1 min-h-8 text-xs font-semibold leading-5 text-slate-500">
                      {member.role || member.responsibilities || 'Role not available'}
                    </p>

                    <button
                      className="mt-auto h-8 w-full rounded border border-emerald-950 px-4 text-xs font-black text-emerald-950 transition hover:bg-emerald-950 hover:text-white"
                      onClick={() => setExpandedRoleId(memberId)}
                      type="button"
                    >
                      Read more
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {selectedRoleMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6" onClick={() => setExpandedRoleId('')}>
          <article
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b3b75]">Member Details</p>
                <h3 className="mt-1 text-xl font-black text-[#0b3b75]">
                  {selectedRoleMember.fullName || selectedRoleMember.name || 'Name not available'}
                </h3>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-md text-neutral-700 hover:bg-neutral-100"
                onClick={() => setExpandedRoleId('')}
                type="button"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[9rem_1fr]">
              <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full border border-[#0b3b75] bg-slate-50 p-1">
                {selectedRoleMember.profilePhoto ? (
                  <img
                    alt={selectedRoleMember.fullName || selectedRoleMember.name || selectedRoleMember.role}
                    className="h-full w-full rounded-full object-cover"
                    src={resolveAssetUrl(selectedRoleMember.profilePhoto)}
                  />
                ) : (
                  <Users className="h-11 w-11 text-slate-400" />
                )}
              </div>

              <div className="space-y-4 text-sm font-semibold leading-6 text-neutral-700">
                <p className="text-base font-black text-neutral-950">{selectedRoleMember.role || 'Role not available'}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="flex gap-2 rounded-md bg-neutral-50 p-3">
                    <Mail className="mt-1 h-4 w-4 shrink-0 text-[#0b3b75]" />
                    <span className="min-w-0 break-words">{selectedRoleMember.email || 'Email not available'}</span>
                  </p>
                  <p className="flex gap-2 rounded-md bg-neutral-50 p-3">
                    <Phone className="mt-1 h-4 w-4 shrink-0 text-[#0b3b75]" />
                    <span>{selectedRoleMember.mobileNumber || 'Contact not available'}</span>
                  </p>
                </div>
                <p className="flex gap-2 rounded-md bg-neutral-50 p-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#0b3b75]" />
                  <span>
                    {selectedRoleMember.villageName
                      ? `${selectedRoleMember.villageName}${selectedRoleMember.wardNumber ? `, Ward ${selectedRoleMember.wardNumber}` : ''}`
                      : 'Location not set'}
                  </span>
                </p>
                <p>
                  <span className="font-black text-[#0b3b75]">Assigned Work: </span>
                  {selectedRoleMember.responsibilities || 'Not assigned yet.'}
                </p>
                {selectedRoleMember.bio && (
                  <p>
                    <span className="font-black text-[#0b3b75]">Bio: </span>
                    {selectedRoleMember.bio}
                  </p>
                )}
                {Array.isArray(selectedRoleMember.priorityProjects) && selectedRoleMember.priorityProjects.length > 0 && (
                  <div>
                    <p className="font-black text-[#0b3b75]">Priority Projects</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRoleMember.priorityProjects.map((project) => (
                        <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700" key={project}>
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      )}

      <section className="bg-[#f8fcfa] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">Village Gallery</p>
              <h2 className="mt-1 text-xl font-black text-emerald-950 sm:text-2xl">Grampanchayat Gallery</h2>
            </div>
            <a className="text-xs font-black text-emerald-950 hover:text-emerald-700" href="/gallery">
              View All Photos
            </a>
          </div>

          {galleryLoading ? (
            <div className="rounded-lg bg-white p-6 text-center text-sm font-bold text-slate-600">Loading gallery...</div>
          ) : galleryItems.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center text-sm font-bold text-slate-600">No gallery media found.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {galleryItems.slice(0, 3).map((item) => {
                const isImage = item.mediaMimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(item.mediaFile || '')

                return (
                  <article
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                    key={item._id}
                  >
                    <div className="grid h-full place-items-center overflow-hidden bg-slate-50">
                      {isImage ? (
                        <img
                          alt={item.title || item.mediaFileName || 'Gallery media'}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          src={resolveAssetUrl(item.mediaFile)}
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-slate-400" />
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                      <h3 className="overflow-hidden text-ellipsis text-sm font-black leading-5 text-white [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                        {item.title || item.mediaFileName || 'Untitled media'}
                      </h3>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

        </div>
      </section>

      <section className="bg-[#eef8f3] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">{t('noticeSectionTag')}</p>
                <h2 className="text-xl font-black text-emerald-950 sm:text-2xl">{t('noticeSectionTitle')}</h2>
              </div>
            </div>
            <a className="text-xs font-black text-emerald-950 hover:text-emerald-700" href="/notice-board">{t('noticeSectionButton')}</a>
          </div>

          {noticeLoading ? (
            <div className="rounded-[22px] bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">Loading notices...</div>
          ) : publicNotices.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {publicNotices.slice(0, 2).map((notice) => (
                <article className="group rounded-lg border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={notice._id}>
                  <div className="flex gap-4">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${notice.noticeType === 'Urgent' || notice.noticeType === 'Important' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {notice.noticeType === 'Urgent' || notice.noticeType === 'Important' ? <Bell size={18} /> : <CalendarDays size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black text-emerald-700">{notice.category || notice.noticeType || 'Notice'}</p>
                        <p className="text-xs font-semibold text-slate-400">{notice.createdAt ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(notice.createdAt)) : 'Date not set'}</p>
                      </div>
                      <h3 className="mt-1 font-black text-slate-900">{notice.title || 'Untitled notice'}</h3>
                      <p className="mt-2 overflow-hidden text-ellipsis text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">{notice.description || 'No description available.'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {notices.slice(0, 2).map((notice) => (
                <article className="group rounded-lg border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={notice.titleKey}>
                  <div className="flex gap-4">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${notice.important ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {notice.important ? <Bell size={18} /> : <CalendarDays size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black text-emerald-700">{t(notice.categoryKey)}</p>
                        <p className="text-xs font-semibold text-slate-400">{notice.date}</p>
                      </div>
                      <h3 className="mt-1 font-black text-slate-900">{t(notice.titleKey)}</h3>
                      <p className="mt-2 overflow-hidden text-ellipsis text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">{t(notice.descriptionKey)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
