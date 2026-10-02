import { Mail, MapPin, Phone } from 'lucide-react'

const footerQuickLinks = [
  'About Panchayat',
  'Village Development Plan',
  'Citizen Facilities',
  'Gram Sabha Information',
]

const footerServiceLinks = [
  'Property Tax Payment',
  'Water Bill Information',
  'Complaint Registration',
  'Certificate Applications',
]

function Footer() {
  return (
    <footer className="portal-footer mt-8 overflow-hidden rounded-t-xl border border-slate-200 bg-[#eaf3fc] text-slate-800" id="contact-footer">
      <div aria-hidden="true" className="grid h-1 grid-cols-3">
        <span className="bg-[#e87825]" />
        <span className="bg-white" />
        <span className="bg-[#13804b]" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr] lg:px-7">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white p-1.5">
              <img alt="State Emblem of India" className="max-h-full max-w-full object-contain" src="/emblem-of-india.svg" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 sm:text-base">Chapalgaon Gram Panchayat</h3>
              <p className="mt-1 text-xs text-slate-600">Tal. Akkalkot, Dist. Solapur</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Dedicated digital portal for village development, citizen services, and transparent administration.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-black text-slate-900">Important Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            {footerQuickLinks.map((link) => (
              <li key={link}>
                <a className="flex items-center gap-2 transition hover:text-blue-800" href="#">
                  <span aria-hidden="true" className="text-orange-700">›</span>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black text-slate-900">Citizen Services</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            {footerServiceLinks.map((link) => (
              <li key={link}>
                <a className="flex items-center gap-2 transition hover:text-blue-800" href={link === 'Property Tax Payment' ? '/property-tax/check' : '#'}>
                  <span aria-hidden="true" className="text-orange-700">›</span>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white/70 p-4 sm:col-span-2 lg:col-span-1">
          <h4 className="text-sm font-black text-slate-900">Contact Us</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 shrink-0 text-blue-700" size={16} />
              <p>Gram Panchayat Office, Chapalgaon, Akkalkot, Solapur</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="shrink-0 text-blue-700" size={16} />
              <a href="tel:+919422647642">+91 9422647642</a>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 shrink-0 text-blue-700" size={16} />
              <a className="break-all" href="mailto:gajadhanetathaget@gmail.com">gajadhanetathaget@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-4 text-center text-[11px] text-slate-500 sm:flex-row sm:px-7">
          <p>© {new Date().getFullYear()} Chapalgaon Gram Panchayat. All rights reserved.</p>
          <p>Designed for Digital Village Administration</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
