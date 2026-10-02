import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  ClipboardList,
  CheckCircle2,
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
  getComplaintWardRates,
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

function isImageMedia(item) {
  return item?.mediaMimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(item?.mediaFile || '')
}

function ComplaintWardChart({ rows, loading, lastUpdated, panchayatInfo }) {
  const normalizedRows = rows
    .map((row) => ({
      ward: String(row.ward || 'Ward not assigned'),
      total: Number(row.total) || 0,
      resolved: Number(row.resolved) || 0,
      open: Number(row.open) || 0,
    }))
    .filter((row) => row.total > 0)
  const totalComplaints = normalizedRows.reduce((sum, row) => sum + row.total, 0)
  const totalResolved = normalizedRows.reduce((sum, row) => sum + row.resolved, 0)
  const totalOpen = normalizedRows.reduce((sum, row) => sum + row.open, 0)
  const highestCount = Math.max(0, ...normalizedRows.map((row) => row.total))
  const lowestCount = normalizedRows.length ? Math.min(...normalizedRows.map((row) => row.total)) : 0
  const averageCount = totalComplaints / (normalizedRows.length || 1)
  const resolutionRate = totalComplaints ? Math.round((totalResolved / totalComplaints) * 100) : 0
  const workloadTotals = normalizedRows.reduce((totals, row) => {
    const tone = highestCount > lowestCount && row.total === highestCount
      ? 'highest'
      : row.total >= averageCount
        ? 'average'
        : 'lower'
    totals[tone] += row.total
    return totals
  }, { highest: 0, average: 0, lower: 0 })
  const highestShare = totalComplaints ? (workloadTotals.highest / totalComplaints) * 100 : 0
  const averageShare = totalComplaints ? (workloadTotals.average / totalComplaints) * 100 : 0
  const lowerShare = totalComplaints ? (workloadTotals.lower / totalComplaints) * 100 : 0
  const workloadGradient = totalComplaints
    ? `conic-gradient(#e11d48 0% ${highestShare}%, #f59e0b ${highestShare}% ${highestShare + averageShare}%, #10b981 ${highestShare + averageShare}% ${highestShare + averageShare + lowerShare}%)`
    : '#e2e8f0'

  function getLoadTone(count) {
    if (highestCount > lowestCount && count === highestCount) {
      return { label: 'Highest workload', stripe: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500' }
    }

    if (count >= averageCount) {
      return { label: 'Above average', stripe: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400' }
    }

    return { label: 'Lower workload', stripe: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' }
  }

  return (
    <section className="mx-auto mt-7 max-w-7xl px-4 sm:px-5" aria-labelledby="complaint-ward-title">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-800"><ClipboardList size={23} /></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Area-wise service status</p>
            <h2 className="mt-0.5 text-xl font-black text-slate-950 sm:text-2xl" id="complaint-ward-title">Complaints by Ward</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Ward-wise complaint summary and resolution progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
          <Clock3 className="text-blue-700" size={16} />
          <span>{loading ? 'Updating…' : `Last updated${lastUpdated ? ` · ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}`}</span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(270px,1.45fr)]">
        <article className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><ClipboardList size={20} /></span>
          <div><p className="text-xs font-semibold text-slate-500">Total complaints</p><p className="mt-1 text-2xl font-black tabular-nums text-slate-950">{totalComplaints}</p><p className="text-[11px] text-slate-500">Across {normalizedRows.length} wards</p></div>
        </article>
        <article className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 size={20} /></span>
          <div><p className="text-xs font-semibold text-slate-500">Resolved</p><p className="mt-1 text-2xl font-black tabular-nums text-emerald-700">{totalResolved}</p><p className="text-[11px] text-emerald-700">{resolutionRate}% of total</p></div>
        </article>
        <article className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700"><Clock3 size={20} /></span>
          <div><p className="text-xs font-semibold text-slate-500">Open</p><p className="mt-1 text-2xl font-black tabular-nums text-amber-700">{totalOpen}</p><p className="text-[11px] text-amber-700">{totalComplaints ? Math.round((totalOpen / totalComplaints) * 100) : 0}% of total</p></div>
        </article>
        <article className="flex min-w-0 items-center gap-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div aria-label="Complaint workload by ward" className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full" role="img" style={{ background: workloadGradient }}>
            <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-white text-center">
              <span><strong className="block text-lg leading-5 text-slate-900">{totalComplaints}</strong><span className="text-[9px] font-bold text-slate-500">Total</span></span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-[11px] font-semibold text-slate-600">
            <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Highest workload</span><strong className="tabular-nums text-slate-800">{workloadTotals.highest}</strong></p>
            <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Above average / open</span><strong className="tabular-nums text-slate-800">{workloadTotals.average}</strong></p>
            <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Lower workload</span><strong className="tabular-nums text-slate-800">{workloadTotals.lower}</strong></p>
          </div>
        </article>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.85fr)]">
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900"><BarChart3 className="text-blue-700" size={18} />Ward workload and resolution progress</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Resolved</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Open</span>
            </div>
          </div>

          {normalizedRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-9 text-center">
              <p className="text-sm font-bold text-slate-700">No complaint counts available yet.</p>
              <p className="mt-1 text-xs text-slate-500">Ward statistics will appear after complaints are recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {normalizedRows.map((row) => {
                const tone = getLoadTone(row.total)
                const rowWidth = `${(row.total / highestCount) * 100}%`
                const resolvedWidth = `${row.total ? (row.resolved / row.total) * 100 : 0}%`
                const openWidth = `${row.total ? (row.open / row.total) * 100 : 0}%`

                return (
                  <div className="grid gap-3 rounded-lg border border-slate-100 px-3 py-3 sm:grid-cols-[minmax(115px,0.65fr)_minmax(0,1.35fr)_120px] sm:items-center sm:gap-4" key={row.ward}>
                    <div className="flex min-w-0 items-center justify-between gap-2 sm:block">
                      <p className="truncate text-sm font-black text-slate-900">{row.ward}</p>
                      <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-black ${tone.badge}`}>{tone.label}</span>
                    </div>
                    <div className="min-w-0">
                      <div aria-label={`${row.ward}: ${row.total} complaints, ${row.resolved} resolved, ${row.open} open`} className="h-3 overflow-hidden rounded-full bg-slate-100" role="img">
                        <div className="flex h-full overflow-hidden rounded-full transition-all duration-500" style={{ width: rowWidth }}>
                          <span className="h-full bg-emerald-500" style={{ width: resolvedWidth }} />
                          <span className="h-full bg-amber-400" style={{ width: openWidth }} />
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] font-medium text-slate-500">{row.total} {row.total === 1 ? 'complaint' : 'complaints'}</p>
                    </div>
                    <p className="text-[10px] font-bold tabular-nums sm:text-right"><span className="text-emerald-700">{row.resolved} resolved</span><span className="px-1 text-slate-300">/</span><span className="text-amber-700">{row.open} open</span></p>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500">
            <span className="mr-1">Workload:</span>
            <span className="rounded bg-rose-50 px-2 py-1 text-rose-700">Highest</span>
            <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">Above average</span>
            <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">Lower</span>
          </div>
        </article>

        <div className="grid min-w-0 gap-4">
          <ChapalgaonMap panchayatInfo={panchayatInfo} />
          <article className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-blue-800"><MapPin size={16} />Location overview</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              {[
                ['State', panchayatInfo?.state || 'Maharashtra'],
                ['District', panchayatInfo?.district || 'Solapur'],
                ['Taluka', panchayatInfo?.taluka || 'Akkalkot'],
                ['Village', panchayatInfo?.villageName || 'Chapalgaon'],
              ].map(([label, value]) => (
                <div className="min-w-0 border-l-2 border-blue-200 pl-2" key={label}>
                  <p className="text-[10px] font-semibold text-slate-500">{label}</p>
                  <p className="mt-0.5 truncate font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

function ChapalgaonMap({ panchayatInfo }) {
  const mapQuery = buildMapQuery(panchayatInfo)
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(panchayatInfo?.googleMapLink || mapQuery)}&output=embed`
  const mapOpenUrl = panchayatInfo?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const villageTitle = panchayatInfo?.villageName || 'Chapalgaon'
  const talukaTitle = panchayatInfo?.taluka || 'Akkalkot'

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.13em] text-blue-700"><MapPin size={14} />Location map</p>
          <h3 className="mt-1 text-sm font-black text-slate-950">{villageTitle}, {talukaTitle} Taluka</h3>
        </div>
        <a aria-label={`Open ${villageTitle} in Google Maps`} className="text-xs font-bold text-blue-700 hover:text-blue-900" href={mapOpenUrl} rel="noreferrer" target="_blank">Open map</a>
      </div>
      <a aria-label={`Open ${villageTitle} ${talukaTitle} location in Google Maps`} className="group relative block h-[210px] overflow-hidden bg-slate-100" href={mapOpenUrl} rel="noreferrer" target="_blank">
        <iframe className="pointer-events-none absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl} title={`${villageTitle} location map`} />
      </a>
    </article>
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
  const [complaintWardRates, setComplaintWardRates] = useState([])
  const [complaintRatesLoading, setComplaintRatesLoading] = useState(true)
  const [complaintRatesUpdatedAt, setComplaintRatesUpdatedAt] = useState(null)
  const selectedRoleMember = roleMembers.find((member) => (member._id || member.email || member.fullName) === expandedRoleId)
  const heroImage = panchayatInfo?.panchayatImage ? resolveAssetUrl(panchayatInfo.panchayatImage) : ''
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

    async function loadComplaintWardRates() {
      const result = await getComplaintWardRates()

      if (!ignoreResult) {
        setComplaintWardRates(result.success ? result.data : [])
        setComplaintRatesUpdatedAt(new Date())
        setComplaintRatesLoading(false)
      }
    }

    loadComplaintWardRates()
    const intervalId = window.setInterval(loadComplaintWardRates, 30000)

    return () => {
      ignoreResult = true
      window.clearInterval(intervalId)
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
        setGalleryItems(Array.isArray(result.data) ? result.data : [])
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
    <div className="-m-4 overflow-hidden bg-[#f2f7fd] text-slate-950 sm:-m-8">
      <section className="relative min-h-[360px] overflow-hidden bg-[#eaf3fc] px-5 py-10 text-slate-900 sm:px-8 lg:px-12 lg:py-12">
        {heroImage && (
          <img
            alt={heroVillageName || 'Gram Panchayat'}
            className="absolute inset-0 h-full w-full object-cover object-center"
            src={heroImage}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(241,247,253,0.97)_0%,rgba(232,242,253,0.9)_55%,rgba(222,237,252,0.76)_100%)]" />

        <div className="relative max-w-5xl">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-blue-900 shadow-sm backdrop-blur-md">
            <Sparkles size={15} className="text-amber-600" />
            {t('heroBadge')}
          </div>
          <p className="mb-2 font-bold text-blue-800">{t('heroSubtitle')}</p>
          <h1 className="text-3xl font-black leading-[1.15] text-slate-950 sm:text-4xl lg:text-5xl">
            {t('heroTitlePrimary')}
            <span className="mt-1 block text-blue-800">
              {heroVillageName || t('heroTitleHighlight')}
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            {t('heroDescription')}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="group flex items-center gap-3 rounded-lg bg-blue-800 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-900">
              {t('heroPrimaryButton')}
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-blue-200 bg-white/80 px-5 py-3 text-sm font-black text-blue-900 transition hover:bg-white">
              <ClipboardList size={18} />
              {t('heroSecondaryButton')}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-5 text-sm font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-700" />
              {t('heroFeatureOne')}
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList size={20} className="text-blue-700" />
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

      <ComplaintWardChart rows={complaintWardRates} loading={complaintRatesLoading} lastUpdated={complaintRatesUpdatedAt} panchayatInfo={panchayatInfo} />

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
                const memberPhoto = resolveAssetUrl(member.profilePhoto)

                return (
                  <article
                    className="flex min-h-60 flex-col items-center justify-start rounded-md bg-white px-4 py-5 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                    key={memberId}
                  >
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-emerald-50 bg-slate-50 p-1 shadow-sm">
                      {memberPhoto ? (
                        <img alt={member.fullName || member.name || 'Team member'} className="h-full w-full rounded-full object-cover" src={memberPhoto} />
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
                    alt={selectedRoleMember.fullName || selectedRoleMember.name || 'Team member'}
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
                const mediaUrl = resolveAssetUrl(item.mediaFile)
                const isImage = isImageMedia(item)

                return (
                  <article
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                    key={item._id}
                  >
                    <div className="grid h-full place-items-center overflow-hidden bg-slate-50">
                      {isImage && mediaUrl ? (
                        <img alt={item.title || item.mediaFileName || 'Gallery media'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={mediaUrl} />
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
