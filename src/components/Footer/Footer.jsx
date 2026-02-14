import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'

function Footer() {
  return (
    <section className="relative overflow-hidden border-t border-slate-900/10 bg-white/70 py-10 backdrop-blur sm:py-12">
      <div className="mesh-accent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="surface-glass rounded-3xl p-5 sm:p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr,1fr]">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-3">
              <Logo width="100px" />
              <span className="text-lg font-semibold text-slate-900">MegaBlog</span>
              </div>
              <p className="max-w-sm text-sm text-slate-600">
                Ideas, stories, and tutorials crafted with a calm pace and strong perspective.
              </p>
              <p className="text-xs text-slate-500">Created by Utkarsh Pandey</p>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Company
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Features
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Support
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Account
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Help
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Customer Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Legals
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-slate-900" to="/">
                    Licensing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Footer
