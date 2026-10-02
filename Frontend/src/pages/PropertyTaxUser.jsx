import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, House, LockKeyhole, Mail, Search, ShieldCheck } from 'lucide-react'
import { CreatePropertyTaxPaymentOrder, LookupPropertyTax, SendPropertyTaxOtp, VerifyPropertyTaxOtp, VerifyPropertyTaxPayment } from '../Services/AddGrampanchaytTax'
import { generateQRCode } from '../Services/QRCodeService'

const initialForm = { houseNumber: '', email: '', otp: '' }

function PropertyTaxUser() {
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState('lookup')
  const [propertyTax, setPropertyTax] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [paymentOptionOpen, setPaymentOptionOpen] = useState(false)
  const [upiQrUrl, setUpiQrUrl] = useState('')
  const [upiQrLoading, setUpiQrLoading] = useState(false)
  const [qrRecordId, setQrRecordId] = useState('')
  const [upiId, setUpiId] = useState('')
  const [upiTransactionId, setUpiTransactionId] = useState('')

  useEffect(() => () => {
    if (upiQrUrl) URL.revokeObjectURL(upiQrUrl)
  }, [upiQrUrl])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const lookupHouse = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await LookupPropertyTax(form.houseNumber.trim())
      setForm((current) => ({ ...current, email: response.data?.email || '' }))
      setStep('email')
    } catch (lookupError) {
      setError(lookupError.message)
    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await SendPropertyTaxOtp({ houseNumber: form.houseNumber.trim(), email: form.email.trim() })
      setForm((current) => ({ ...current, email: response.email || current.email }))
      setMessage('OTP sent to your registered email address.')
      setStep('otp')
    } catch (sendError) {
      setError(sendError.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await VerifyPropertyTaxOtp({ otp: form.otp.trim(), email: form.email.trim() })
      setPropertyTax(response.data)
      setMessage('OTP verified. Your property tax details are ready.')
      setStep('details')
    } catch (verifyError) {
      setError(verifyError.message)
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setForm(initialForm)
    setPropertyTax(null)
    setStep('lookup')
    setError('')
    setMessage('')
    setPaymentLoading(false)
    setPaymentStatus('idle')
    setPaymentOptionOpen(false)
    setUpiQrUrl('')
    setQrRecordId('')
    setUpiId('')
    setUpiTransactionId('')
  }

  const showUpiQr = async () => {
    const amount = Number(String(propertyTax.totalTax || propertyTax.taxAmount || '').replace(/,/g, ''))
    if (!propertyTax?._id || !Number.isFinite(amount) || amount <= 0) {
      setError('A valid property tax amount is not available for payment.')
      return
    }
    setUpiQrLoading(true)
    setError('')
    try {
      const { blob, qrRecordId: nextQrRecordId, upiId: nextUpiId } = await generateQRCode({
        amount,
        propertyTaxId: propertyTax._id,
      })
      setUpiQrUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl)
        return URL.createObjectURL(blob)
      })
      setQrRecordId(nextQrRecordId || '')
      setUpiId(nextUpiId || '')
      setUpiTransactionId('')
    } catch (qrError) {
      setError(qrError.message || 'Unable to generate payment QR')
    } finally {
      setUpiQrLoading(false)
    }
  }

  const confirmUpiPayment = async () => {
    if (!propertyTax?._id || paymentStatus === 'processing' || paymentStatus === 'success' || propertyTax.isPaid) {
      return
    }
    const transactionId = upiTransactionId.trim()
    if (!transactionId) {
      setError('Please enter the UPI payment transaction ID received after payment.')
      return
    }

    setPaymentLoading(true)
    setPaymentStatus('processing')
    setError('')
    setMessage('Payment is being verified using the UPI transaction details.')
    try {
      const verification = await VerifyPropertyTaxPayment({
        propertyTaxId: propertyTax._id,
        qrRecordId,
        upiId: upiId || propertyTax.upiId || '',
        transactionId,
        paymentId: transactionId,
        paymentMethod: 'UPI',
      })

      if (!verification.success || !verification.data?.isPaid) {
        setPaymentStatus('processing')
        setMessage(verification.message || 'Payment is still processing. Please wait for confirmation.')
        return
      }

      const paidTaxRecord = {
        ...propertyTax,
        ...verification.data,
        isPaid: true,
        pendingAmount: verification.data?.pendingAmount ?? '0',
        paymentDate: verification.data?.paymentDate || new Date().toISOString(),
        paymentMethod: verification.data?.paymentMethod || 'UPI',
        paymentId: verification.data?.paymentId || transactionId,
        transactionId: verification.data?.transactionId || transactionId,
        upiId: verification.data?.upiId || upiId || propertyTax.upiId || '',
      }

      setPropertyTax(paidTaxRecord)
      setPaymentStatus('success')
      setMessage('Payment successful. Your property tax is now paid.')
      setPaymentOptionOpen(false)
    } catch (verificationError) {
      setPaymentStatus('failed')
      setError(verificationError.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const payPropertyTax = async () => {
    const amount = Number(String(propertyTax.totalTax || propertyTax.taxAmount || '').replace(/,/g, ''))
    if (!propertyTax?._id || !Number.isFinite(amount) || amount <= 0) {
      setError('A valid property tax amount is not available for payment.')
      return
    }
    if (paymentStatus === 'processing' || paymentStatus === 'success' || propertyTax.isPaid) {
      return
    }

    setPaymentLoading(true)
    setPaymentStatus('processing')
    setError('')
    setMessage('Payment is being processed. Please wait for confirmation.')
    setPaymentOptionOpen(false)
    try {
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) return resolve(true)
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })

      if (!scriptLoaded) throw new Error('Unable to load payment checkout')

      const orderResponse = await CreatePropertyTaxPaymentOrder({
        propertyTaxId: propertyTax._id,
        currency: 'INR',
      })

      if (!orderResponse.keyId) {
        throw new Error('Razorpay key is not configured in the backend environment')
      }

      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: orderResponse.keyId,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'Grampanchayat Property Tax',
          description: `Property tax for house ${propertyTax.houseNo}`,
          order_id: orderResponse.data.id,
          prefill: { name: propertyTax.ownerName, email: propertyTax.email, contact: propertyTax.phone },
          handler: async (paymentResponse) => {
            try {
              const verification = await VerifyPropertyTaxPayment({
                propertyTaxId: propertyTax._id,
                qrRecordId,
                ...paymentResponse,
              })

              if (!verification.success || !verification.data?.isPaid) {
                setPaymentStatus('processing')
                setMessage(verification.message || 'Payment is still processing. Please wait for confirmation.')
                return resolve()
              }

              const paidTaxRecord = {
                ...propertyTax,
                ...verification.data,
                isPaid: true,
                pendingAmount: verification.data?.pendingAmount ?? '0',
                paymentDate: verification.data?.paymentDate || new Date().toISOString(),
                paymentMethod: verification.data?.paymentMethod || 'Online',
                paymentId: verification.data?.paymentId || paymentResponse.razorpay_payment_id,
                transactionId: verification.data?.transactionId || paymentResponse.razorpay_payment_id,
              }

              setPropertyTax(paidTaxRecord)
              setPaymentStatus('success')
              setMessage('Payment successful. Your property tax is now paid.')
              resolve()
            } catch (verificationError) {
              setPaymentStatus('failed')
              reject(verificationError)
            }
          },
          modal: {
            ondismiss: () => {
              setPaymentStatus('failed')
              setMessage('Payment was cancelled. Please try again if you want to pay.')
              reject(new Error('Payment was cancelled'))
            },
          },
        })
        checkout.open()
      })
    } catch (paymentError) {
      setPaymentStatus('failed')
      setError(paymentError.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <main className="-m-4 min-h-full bg-[#f4f8f5] px-4 py-8 text-slate-950 sm:-m-8 sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section className="rounded-lg bg-[#123b32] p-7 text-white shadow-sm sm:p-10">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#d9f17c] text-[#123b32]"><House size={24} /></div>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.18em] text-[#d9f17c]">Citizen services</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Property tax, made clear.</h1>
          <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-emerald-50/75">Check your house record securely with a one-time password sent to your email.</p>
          <div className="mt-10 space-y-4 text-sm font-bold text-emerald-50/90">
            <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-[#d9f17c]" /> Secure OTP verification</div>
            <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#d9f17c]" /> View payment status and dues</div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Property tax lookup</p><h2 className="mt-2 text-2xl font-black">Find your record</h2></div>
            <LockKeyhole className="mt-1 text-emerald-800" size={22} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-black uppercase tracking-wide text-slate-400">
            {['House number', 'Verify email', 'View details'].map((label, index) => <div key={label} className={index <= ['lookup', 'email', 'otp', 'details'].indexOf(step) ? 'border-t-2 border-emerald-800 pt-3 text-emerald-900' : 'border-t-2 border-slate-200 pt-3'}>{label}</div>)}
          </div>

          {step === 'lookup' && <form className="mt-8" onSubmit={lookupHouse}><label className="block text-sm font-black text-slate-800" htmlFor="house-number">House number</label><div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-emerald-800"><Search size={19} className="text-slate-400" /><input autoFocus required id="house-number" name="houseNumber" value={form.houseNumber} onChange={updateField} placeholder="Enter your house number" className="h-12 min-w-0 flex-1 outline-none" /></div><button disabled={loading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-5 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Checking...' : 'Continue'} <ArrowRight size={18} /></button></form>}

          {step === 'email' && <form className="mt-8" onSubmit={sendOtp}><label className="block text-sm font-black text-slate-800" htmlFor="property-email">Email address</label><div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-300 px-4 focus-within:border-emerald-800"><Mail size={19} className="text-slate-400" /><input required id="property-email" name="email" type="email" value={form.email} onChange={updateField} placeholder="Enter your email address" className="h-12 min-w-0 flex-1 outline-none" /></div><p className="mt-3 text-xs font-semibold text-slate-500">House number: {form.houseNumber}</p><button disabled={loading} className="mt-5 h-12 w-full rounded-lg bg-emerald-900 px-5 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Sending OTP...' : 'Send OTP'}</button></form>}

          {step === 'otp' && <form className="mt-8" onSubmit={verifyOtp}><label className="block text-sm font-black text-slate-800" htmlFor="property-otp">Enter one-time password</label><input required id="property-otp" name="otp" inputMode="numeric" maxLength="6" pattern="[0-9]{6}" value={form.otp} onChange={updateField} placeholder="6-digit OTP" className="mt-2 h-14 w-full rounded-lg border border-slate-300 px-4 text-2xl font-black tracking-[0.35em] outline-none focus:border-emerald-800" /><p className="mt-3 text-xs font-semibold text-slate-500">OTP sent to {form.email}</p><button disabled={loading} className="mt-5 h-12 w-full rounded-lg bg-emerald-900 px-5 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Verifying...' : 'Verify OTP'}</button></form>}

          {step === 'details' && propertyTax && <div className="mt-8"><div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm font-black text-emerald-900"><CheckCircle2 size={20} /> Verified property record</div><div className="mt-4 grid gap-3 sm:grid-cols-2">{[['House number', propertyTax.houseNo], ['Owner name', propertyTax.ownerName], ['Financial year', propertyTax.financialYear], ['Total tax', propertyTax.totalTax || propertyTax.taxAmount], ['Pending amount', propertyTax.pendingAmount], ['Payment status', propertyTax.isPaid ? 'Paid' : 'Pending'], ['UPI ID', propertyTax.upiId || upiId], ['Payment ID', propertyTax.paymentId], ['Transaction ID', propertyTax.transactionId], ['Payment date', propertyTax.paymentDate ? new Date(propertyTax.paymentDate).toLocaleDateString('en-IN') : 'Not paid'], ['Address', propertyTax.address]].map(([label, value]) => <div key={label} className="rounded-lg bg-[#f4f8f5] p-4"><p className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 break-words text-sm font-black text-slate-900">{value || 'Not available'}</p></div>)}</div>{!propertyTax.isPaid && <button type="button" onClick={() => setPaymentOptionOpen(true)} disabled={paymentStatus === 'processing' || paymentStatus === 'success'} className="mt-5 h-12 w-full rounded-lg bg-[#d9f17c] px-5 text-sm font-black text-[#123b32] hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60">{paymentStatus === 'processing' ? 'Payment in progress...' : `Pay ₹${propertyTax.totalTax || propertyTax.taxAmount}`}</button>}<button type="button" onClick={resetFlow} className="mt-5 w-full rounded-lg border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Check another house</button></div>}

          {paymentOptionOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Payment method</p><h3 className="mt-2 text-xl font-black">Choose how to pay</h3></div><button type="button" onClick={() => setPaymentOptionOpen(false)} disabled={paymentStatus === 'processing'} className="text-sm font-black text-slate-500 disabled:cursor-not-allowed disabled:opacity-40">Close</button></div>{upiQrUrl ? <div className="mt-6 text-center"><img alt="UPI payment QR code" className="mx-auto h-64 w-64 rounded-lg border border-slate-200 p-3" src={upiQrUrl} /><p className="mt-4 text-sm font-black text-slate-800">UPI ID: {upiId || 'Not available'}</p><div className="mt-4 text-left"><label className="block text-sm font-black text-slate-800" htmlFor="upi-transaction-id">UPI transaction ID</label><input id="upi-transaction-id" value={upiTransactionId} onChange={(event) => setUpiTransactionId(event.target.value)} placeholder="Enter payment transaction ID" className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none focus:border-emerald-800" /></div><p className="mt-2 text-sm font-bold text-slate-700">Scan this QR in your UPI app and paste the transaction ID here after payment.</p><button type="button" onClick={confirmUpiPayment} disabled={paymentLoading || paymentStatus === 'processing' || paymentStatus === 'success' || propertyTax.isPaid} className="mt-5 w-full rounded-lg bg-emerald-900 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60">{paymentLoading ? 'Verifying payment...' : paymentStatus === 'success' || propertyTax.isPaid ? 'Payment successful' : 'Confirm payment'}</button></div> : <div className="mt-6 grid gap-3"><button type="button" onClick={showUpiQr} disabled={upiQrLoading || paymentStatus === 'processing' || paymentStatus === 'success'} className="rounded-lg border border-emerald-800 px-4 py-3 text-left text-sm font-black text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">{upiQrLoading ? 'Generating UPI QR...' : 'Pay with UPI QR'}</button><button type="button" onClick={() => { setPaymentOptionOpen(false); payPropertyTax() }} disabled={paymentLoading || paymentStatus === 'processing' || paymentStatus === 'success'} className="rounded-lg bg-emerald-900 px-4 py-3 text-left text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60">{paymentLoading ? 'Opening Razorpay...' : paymentStatus === 'processing' ? 'Payment in progress...' : 'Pay with Razorpay'}</button></div>}</div></div>}

          {paymentStatus === 'processing' && (
            <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Payment is being processed. Please wait for confirmation before the payment is marked as successful.
            </p>
          )}
          {paymentStatus === 'success' && (
            <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              Payment was completed successfully.
            </p>
          )}
          {message && <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</p>}
          {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        </section>
      </div>
    </main>
  )
}

export default PropertyTaxUser