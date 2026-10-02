import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { forgatePassword } from '../Services/loginservices'

function ForgatePassword() {
    const location = useLocation()
    const [email, setEmail] = useState(location.state?.email || '')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')

        const result = await forgatePassword(email.trim())
        if (result.success) {
            setMessage(result.message)
        } else {
            setError(result.message)
        }

        setLoading(false)
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-xl items-center px-4 py-12">
            <section className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-900/5 sm:p-10">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Account Recovery</p>
                <h1 className="mt-3 text-3xl font-black text-neutral-950">Forgot password?</h1>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                    Enter the email address registered with your admin account. If it is registered, password reset instructions will be sent to it.
                </p>

                <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-neutral-700" htmlFor="recovery-email">
                            Email address
                        </label>
                        <input
                            autoComplete="email"
                            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                            id="recovery-email"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="admin@example.com"
                            required
                            type="email"
                            value={email}
                        />
                    </div>

                    {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">{error}</p>}
                    {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800" role="status">{message}</p>}

                    <button
                        className="h-12 w-full rounded-xl bg-emerald-800 text-base font-black text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? 'Please wait...' : 'Send reset instructions'}
                    </button>
                </form>

                <Link className="mt-6 inline-block text-sm font-bold text-emerald-800 underline underline-offset-4" to="/login/admin">
                    Back to admin login
                </Link>
            </section>
        </main>
    )
}

export default ForgatePassword