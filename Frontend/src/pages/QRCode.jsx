import { useEffect, useState } from 'react'
import { Download, Link2, QrCode as QrCodeIcon, RefreshCw, Sparkles } from 'lucide-react'
import { generateQRCode } from '../Services/QRCodeService'

function QRCode() {
  const [mode, setMode] = useState('upi')
  const [url, setUrl] = useState('')
  const [amount, setAmount] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => () => {
    if (qrUrl) URL.revokeObjectURL(qrUrl)
  }, [qrUrl])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const input = url.trim()
    if (!input) {
      setError(mode === 'upi' ? 'Please enter a UPI ID.' : 'Please enter a URL.')
      return
    }

    let payload
    if (mode === 'upi') {
      if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9.-]{2,64}$/.test(input.replace(/^https?:\/\//i, ''))) {
        setError('Enter a valid UPI ID, for example 9876543210@upi.')
        return
      }
      payload = { upiid: input, amount }
    } else {
      let normalizedUrl = input
      if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`
      try {
        new URL(normalizedUrl)
      } catch {
        setError('Please enter a valid URL.')
        return
      }
      payload = { url: normalizedUrl }
    }

    setLoading(true)
    try {
      const { blob } = await generateQRCode(payload)
      const nextQrUrl = URL.createObjectURL(blob)
      setQrUrl((currentQrUrl) => {
        if (currentQrUrl) URL.revokeObjectURL(currentQrUrl)
        return nextQrUrl
      })
    } catch (generateError) {
      setError(generateError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="-m-4 min-h-full bg-[#f4f8f5] px-4 py-8 text-slate-950 sm:-m-8 sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <section className="rounded-lg bg-[#123b32] p-7 text-white shadow-sm sm:p-10">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#d9f17c] text-[#123b32]"><QrCodeIcon size={25} /></div>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.18em] text-[#d9f17c]">Digital sharing</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Create a QR code.</h1>
          <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-emerald-50/75">Paste any website link and generate a clean, downloadable QR code for citizens.</p>
          <div className="mt-10 flex items-center gap-3 text-sm font-bold text-emerald-50/90"><Sparkles size={18} className="text-[#d9f17c]" /> Ready to scan in seconds</div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-6"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-800"><Link2 size={19} /></div><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">QR generator</p><h2 className="mt-1 text-2xl font-black">Enter a URL</h2></div></div>
          <form className="mt-7" onSubmit={handleSubmit}>
            <div className="mb-5 flex gap-2"><button type="button" onClick={() => { setMode('upi'); setUrl(''); setError('') }} className={`rounded-lg px-4 py-2 text-sm font-black ${mode === 'upi' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'}`}>UPI ID</button><button type="button" onClick={() => { setMode('url'); setUrl(''); setError('') }} className={`rounded-lg px-4 py-2 text-sm font-black ${mode === 'url' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'}`}>Website URL</button></div>
            <label className="block text-sm font-black text-slate-800" htmlFor="qr-url">{mode === 'upi' ? 'UPI ID' : 'Website URL'}</label>
            <input id="qr-url" name="url" type="text" value={url} onChange={(event) => { setUrl(event.target.value); setError('') }} placeholder={mode === 'upi' ? '9876543210@upi' : 'https://example.com'} className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-800" />
            {mode === 'upi' && <><label className="mt-4 block text-sm font-black text-slate-800" htmlFor="qr-amount">Amount (optional, INR)</label><input id="qr-amount" name="amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => { setAmount(event.target.value); setError('') }} placeholder="100.00" className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-800" /></>}
            <button className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-5 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60" disabled={loading} type="submit">{loading ? <><RefreshCw className="animate-spin" size={18} /> Generating...</> : <><QrCodeIcon size={18} /> Generate QR</>}</button>
          </form>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

          {qrUrl && <div className="mt-7 border-t border-slate-100 pt-7"><div className="mx-auto grid max-w-[280px] place-items-center rounded-lg border border-slate-200 bg-white p-4"><img alt={`QR code for ${url}`} className="h-auto w-full" src={qrUrl} /></div><p className="mt-4 break-all text-center text-xs font-semibold text-slate-500">{url}</p><a className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-black text-slate-700 hover:bg-slate-50" download="grampanchayat-website-qr.png" href={qrUrl}><Download size={18} /> Download QR</a></div>}
        </section>
      </div>
    </main>
  )
}

export default QRCode