import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BadgeCheck, CalendarDays, CheckCircle2, CreditCard, Download, Droplets, Eye, Hash, House, Mail, MapPin, Plus, ReceiptText, Trash2, Upload, UserRound, X } from 'lucide-react'
import Toast from '../components/Toast'
import { AddGrampanchaytTax, GetAllGrampanchatTax, GetPropertyTaxIdDelete, GetPropertyTaxIdView } from '../Services/AddGrampanchaytTax'

const emptyHouse = { houseNo: '', ownerName: '', waterTax: '', houseRent: '', email: '' }

function PropertyTax() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(emptyHouse)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewTarget, setViewTarget] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const csvInput = useRef(null)

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await GetAllGrampanchatTax()
        setRecords(response.data || [])
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [])

  const visibleRecords = useMemo(() => records.filter((record) => (
    [record.houseNo, record.ownerName, record.email].some((value) => (
      String(value || '').toLowerCase().includes(query.toLowerCase())
    ))
  )), [records, query])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const addHouse = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await AddGrampanchaytTax({
        ...form,
        financialYear: '2026-27',
        taxAmount: form.houseRent,
        totalTax: form.houseRent,
        pendingAmount: form.houseRent,
      })
      setRecords((current) => [response.data, ...current])
      setForm(emptyHouse)
      setShowForm(false)
      setError('')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const uploadCsv = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const [headerLine, ...lines] = String(reader.result).trim().split(/\r?\n/)
      const headers = headerLine.split(',').map((header) => header.trim().toLowerCase())
      const imported = lines.filter(Boolean).map((line) => {
        const values = line.split(',').map((value) => value.trim())
        const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']))
        return { _id: `csv-${Date.now()}-${Math.random()}`, houseNo: row['house no'] || row.houseno || '', ownerName: row.owner || row.ownername || '', waterTax: row['water tax'] || row.watertax || '', houseRent: row['house rent'] || row.houserent || '', email: row.email || '' }
      })
      setRecords((current) => [...imported, ...current])
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  const downloadReceipt = (record) => {
    const receipt = [
      'GRAMPANCHAYAT PROPERTY TAX RECEIPT',
      '----------------------------------',
      `House number: ${record.houseNo || '-'}`,
      `Owner: ${record.ownerName || '-'}`,
      `Financial year: ${record.financialYear || '2026-27'}`,
      `Water tax: ${record.waterTax || '0'}`,
      `House rent: ${record.houseRent || record.taxAmount || '0'}`,
      `Total tax: ${record.totalTax || record.taxAmount || '0'}`,
      `Payment ID: ${record.paymentId || '-'}`,
      `Payment date: ${record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('en-IN') : '-'}`,
    ].join('\n')
    const url = URL.createObjectURL(new Blob([receipt], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `property-tax-${record.houseNo || 'receipt'}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const viewRecord = async (id) => {
    const listRecord = records.find((item) => item._id === id)
    setViewTarget(listRecord || {})
    setViewLoading(true)
    try {
      const response = await GetPropertyTaxIdView(id)
      const record = response?.data || response
      if (!record || record instanceof Error) throw record || new Error('Unable to view property tax record')
      setViewTarget(record)
    } catch (viewError) {
      setViewTarget(null)
      setToast({ message: viewError.message || 'Unable to view property tax record', type: 'error' })
    } finally {
      setViewLoading(false)
    }
  }

  const deleteRecord = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const response = await GetPropertyTaxIdDelete(deleteTarget._id)
      if (response?.success) {
        setRecords((current) => current.filter((record) => record._id !== deleteTarget._id))
        setDeleteTarget(null)
        setToast({ message: 'Property tax record deleted successfully.', type: 'success' })
        window.setTimeout(() => setToast((current) => (
          current.message === 'Property tax record deleted successfully.'
            ? { ...current, message: '' }
            : current
        )), 3000)
      } else {
        throw new Error(response?.message || 'Unable to delete property tax record')
      }
    } catch (deleteError) {
      setToast({ message: deleteError.message || 'Unable to delete property tax record', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 text-[#171717] sm:px-8">
      <Toast message={toast.message} onClose={() => setToast((current) => ({ ...current, message: '' }))} type={toast.type} />
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Gharpatti records</h1>
        <div className="flex flex-wrap gap-3">
          <input ref={csvInput} type="file" accept=".csv,text/csv" onChange={uploadCsv} className="hidden" />
          <button type="button" onClick={() => csvInput.current?.click()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d5d5d5] bg-white px-5 text-base font-medium shadow-sm transition hover:bg-[#f7f7f7]"><Upload size={19} /> Upload CSV</button>
          <button type="button" onClick={() => { setShowForm(true); setError('') }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d5d5d5] bg-white px-5 text-base font-medium shadow-sm transition hover:bg-[#f7f7f7]"><Plus size={20} /> Add house</button>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#dedede] bg-white">
        <div className="flex items-center justify-between border-b border-[#dedede] px-4 py-3"><label className="sr-only" htmlFor="record-search">Search records</label><input id="record-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="w-full max-w-xs bg-transparent text-sm outline-none placeholder:text-[#929292]" /><span className="text-sm text-[#777]">{visibleRecords.length} records</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left">
            <thead className="border-b border-[#dedede] text-[16px] text-[#5c5c5c]">
              <tr>
                <th className="w-[13%] px-4 py-3 font-medium">House no</th>
                <th className="w-[18%] px-4 py-3 font-medium">Owner</th>
                <th className="w-[13%] px-4 py-3 font-medium">Water tax</th>
                <th className="w-[14%] px-4 py-3 font-medium">House rent</th>
                <th className="w-[19%] px-4 py-3 font-medium">Email</th>
                <th className="w-[12%] px-4 py-3 font-medium">Payment</th>
                <th className="w-[11%] px-4 py-3 font-medium">Receipt</th>
                <th className="w-[10%] px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[16px]">
              {loading && <tr><td colSpan="7" className="px-4 py-8 text-center text-[#888]">Loading records...</td></tr>}
              {!loading && visibleRecords.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-[#888]">No records found.</td></tr>}
              {!loading && visibleRecords.map((record) => {
                const paid = record.isPaid === true || record.isPaid === 'true' || record.ispaid === true || record.ispaid === 'true'
                return (
                  <tr key={record._id || record.houseNo} className="border-b border-[#dedede] last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3.5 font-medium">{record.houseNo || '—'}</td>
                    <td className="px-4 py-3.5">{record.ownerName || '—'}</td>
                    <td className="px-4 py-3.5">{record.waterTax || '—'}</td>
                    <td className="px-4 py-3.5">{record.houseRent || record.taxAmount || '—'}</td>
                    <td className="break-words px-4 py-3.5">{record.email || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm ${paid ? 'bg-[#c9edc9] text-[#276f2d]' : 'bg-[#ffe2a9] text-[#805b12]'}`}>
                        {paid && <CheckCircle2 size={14} />}
                        {paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {paid ? <button type="button" onClick={() => downloadReceipt(record)} aria-label={`Download receipt for ${record.houseNo}`} className="inline-flex items-center gap-1 rounded-lg border border-[#d5d5d5] px-2.5 py-1.5 text-sm font-medium hover:bg-[#f7f7f7]"><Download size={15} /> Download</button> : <span className="text-sm text-[#999]">Not available</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => viewRecord(record._id)} aria-label={`View details for ${record.houseNo}`} className="inline-flex items-center gap-1 rounded-lg border border-[#d5d5d5] bg-white px-2 py-1.5 text-sm font-medium text-[#1d4ed8] hover:bg-[#eff6ff]">
                          <Eye size={14} /> View
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(record)} aria-label={`Delete record ${record.houseNo}`} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="mt-3 text-[15px] text-[#8a8a8a]">Paid records include a downloadable receipt. Add an email address to let the owner verify the record online.</p>
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      {viewTarget && (
        createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-4 backdrop-blur-sm sm:py-6" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !viewLoading) setViewTarget(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="property-details-title" className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30 sm:max-h-[calc(100dvh-3rem)]">
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 px-5 py-5 text-white sm:px-8 sm:py-7">
              <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-50">
                    <House size={14} /> Property tax record
                  </span>
                  <h2 id="property-details-title" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">House {viewTarget.houseNo || 'details'}</h2>
                  <p className="mt-1 text-sm text-emerald-50/90">{viewTarget.financialYear || 'Financial year not specified'}</p>
                </div>
                <button type="button" onClick={() => setViewTarget(null)} disabled={viewLoading} aria-label="Close property details" className="relative rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:opacity-50">
                  <X size={20} />
                </button>
              </div>
              <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 sm:mt-6">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${viewTarget.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {viewTarget.isPaid ? <BadgeCheck size={21} /> : <CreditCard size={20} />}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-emerald-50/80">Payment status</p>
                    <p className="font-semibold">{viewTarget.isPaid ? 'Paid' : 'Unpaid'}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${viewTarget.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                  {viewTarget.isPaid ? 'PAYMENT COMPLETE' : 'PAYMENT PENDING'}
                </span>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="space-y-6">
              {viewLoading && <p className="text-sm font-medium text-slate-500">Loading latest record details...</p>}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Owner information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><UserRound size={19} /></span>
                    <div className="min-w-0"><p className="text-xs text-slate-500">Owner name</p><p className="truncate font-semibold text-slate-800">{viewTarget.ownerName || 'Not provided'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><Mail size={18} /></span>
                    <div className="min-w-0"><p className="text-xs text-slate-500">Email address</p><p className="truncate font-semibold text-slate-800">{viewTarget.email || 'Not provided'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><Hash size={18} /></span>
                    <div><p className="text-xs text-slate-500">House number</p><p className="font-semibold text-slate-800">{viewTarget.houseNo || '—'}</p></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm"><MapPin size={18} /></span>
                    <div className="min-w-0"><p className="text-xs text-slate-500">Address / village</p><p className="truncate font-semibold text-slate-800">{[viewTarget.address, viewTarget.village].filter(Boolean).join(', ') || 'Not provided'}</p></div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Tax breakdown</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Droplets size={16} className="text-sky-600" /> Water tax</span>
                    <span className="font-semibold text-slate-800">₹ {viewTarget.waterTax || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><House size={16} className="text-emerald-700" /> House rent</span>
                    <span className="font-semibold text-slate-800">₹ {viewTarget.houseRent || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-50 px-4 py-4">
                    <span className="flex items-center gap-2 font-bold text-emerald-900"><ReceiptText size={17} /> Total tax</span>
                    <span className="text-lg font-extrabold text-emerald-900">₹ {viewTarget.totalTax || viewTarget.taxAmount || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16} className="text-violet-600" /> Payment date</span>
                    <span className="text-sm font-semibold text-slate-800">{viewTarget.paymentDate ? new Date(viewTarget.paymentDate).toLocaleDateString('en-IN') : 'Not paid yet'}</span>
                  </div>
                  {viewTarget.paymentId && <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3.5"><span className="text-sm text-slate-600">Payment ID</span><span className="max-w-[60%] truncate text-sm font-semibold text-slate-800">{viewTarget.paymentId}</span></div>}
                </div>
              </section>
              </div>
            </div>
            <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-4 sm:px-8">
              <button type="button" onClick={() => setViewTarget(null)} className="inline-flex min-w-28 items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Close details</button>
            </footer>
          </section>
        </div>, document.body)
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 px-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deleting) setDeleteTarget(null)
        }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-property-title" aria-describedby="delete-property-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="delete-property-title" className="text-xl font-semibold">Delete property tax record?</h2>
                <p id="delete-property-description" className="mt-2 text-sm leading-6 text-[#666]">
                  Are you sure you want to delete the record for house <span className="font-semibold text-[#171717]">{deleteTarget.houseNo || '—'}</span>? This action will hide the record from the active list.
                </p>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} aria-label="Close confirmation dialog" className="rounded-lg p-2 text-[#666] hover:bg-slate-100 disabled:opacity-50">
                <X size={19} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-xl border border-[#d5d5d5] px-4 py-2.5 text-sm font-semibold hover:bg-[#f7f7f7] disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={deleteRecord} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showForm && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4" role="dialog" aria-modal="true" aria-labelledby="add-house-title"><form onSubmit={addHouse} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 id="add-house-title" className="text-xl font-semibold">Add house</h2><button type="button" onClick={() => setShowForm(false)} aria-label="Close dialog" className="rounded-lg p-2 hover:bg-slate-100"><X size={19} /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[['houseNo', 'House no', 'text'], ['ownerName', 'Owner', 'text'], ['waterTax', 'Water tax', 'number'], ['houseRent', 'House rent', 'number'], ['email', 'Email', 'email']].map(([name, label, type]) => <label key={name} className="text-sm font-medium text-slate-700">{label}<input required={name === 'houseNo' || name === 'ownerName'} name={name} type={type} value={form[name]} onChange={updateField} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-800" /></label>)}</div><button disabled={saving} className="mt-6 w-full rounded-xl bg-[#171717] px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save house'}</button></form></div>}
    </main>
  )
}

export default PropertyTax