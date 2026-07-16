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
    <footer id="contact-footer" className="bg-[#032f25] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
              <span className="text-2xl">GP</span>
            </div>
            <div>
              <h3 className="font-black">Chapalgaon Gram Panchayat</h3>
              <p className="text-xs text-emerald-200">Tal. Akkalkot, Dist. Solapur</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-emerald-100/80">
            Dedicated official digital portal for village development, citizen services, and transparent administration.
          </p>
          <div className="mt-5 flex gap-3">
            {['GP', '@', 'Tel'].map((item) => (
              <button
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xs font-black transition hover:bg-emerald-600"
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-black">Important Links</h4>
          <ul className="mt-5 space-y-3 text-sm text-emerald-100/80">
            {footerQuickLinks.map((link) => (
              <li key={link}>
                <a className="flex items-center gap-2 transition hover:translate-x-1 hover:text-white" href="#">
                  <span className="text-base">&gt;</span>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-black">Citizen Services</h4>
          <ul className="mt-5 space-y-3 text-sm text-emerald-100/80">
            {footerServiceLinks.map((link) => (
              <li key={link}>
                <a className="flex items-center gap-2 transition hover:translate-x-1 hover:text-white" href="#">
                  <span className="text-base">&gt;</span>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
          <h4 className="text-lg font-black">Contact Us</h4>
          <div className="mt-5 space-y-4 text-sm text-emerald-100/80">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-emerald-300">Loc</span>
              <p>Gram Panchayat Office, Chapalgaon, Akkalkot, Solapur</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-emerald-300">Tel</span>
              <a href="tel:+919422647642">+91 9422647642</a>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-emerald-300">@</span>
              <a className="break-all" href="mailto:gajadhanetathaget@gmail.com">
                gajadhanetathaget@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center text-xs text-emerald-100/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Chapalgaon Gram Panchayat. All rights reserved.</p>
          <p>Designed for Digital Village Administration</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
