import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-[calc(100vh-60px)]">

            {/* ── Hero ── */}
            <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-20 pb-16 text-center">

                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200
          text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 select-none">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    NEET 2025 — Live
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 leading-[1.1] tracking-tight mb-6">
                    Find students at your<br />
                    <span className="text-stone-400">exact exam center</span>
                </h1>

                <p className="text-stone-500 text-lg max-w-xl mx-auto leading-relaxed mb-10">
                    Register your NEET exam center details and connect with fellow aspirants
                    in West Bengal via Telegram — instantly, for free.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/register"
                        id="hero-register-btn"
                        className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700
              text-white font-semibold px-7 py-3.5 rounded-xl transition-all text-sm
              shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        Register My Center
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/search"
                        id="hero-search-btn"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50
              text-stone-700 font-semibold px-7 py-3.5 rounded-xl border border-stone-200
              hover:border-stone-300 transition-all text-sm active:scale-[0.98]"
                    >
                        Find Students
                    </Link>
                </div>
            </section>

            {/* ── Divider line ── */}
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <div className="border-t border-stone-100" />
            </div>

            {/* ── How it works ── */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-8">How it works</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            num: '01',
                            title: 'Register',
                            desc: 'Fill in your name, exam center, district and Telegram username. Takes under a minute.',
                            link: '/register',
                            cta: 'Go to form',
                        },
                        {
                            num: '02',
                            title: 'Search',
                            desc: 'Browse students by district and center. Use live search to narrow down results instantly.',
                            link: '/search',
                            cta: 'Search now',
                        },
                        {
                            num: '03',
                            title: 'Connect',
                            desc: 'Click Contact to open Telegram and reach out directly. No middleman, no signup needed.',
                            link: '/search',
                            cta: 'Find partners',
                        },
                    ].map(({ num, title, desc, link, cta }) => (
                        <Link key={num} to={link} className="group block bg-white hover:bg-stone-50 border border-stone-100
              hover:border-stone-200 rounded-2xl p-6 transition-all duration-150">
                            <span className="text-4xl font-black text-stone-100 group-hover:text-stone-200 transition-colors block mb-4 select-none">
                                {num}
                            </span>
                            <h3 className="text-stone-900 font-bold text-base mb-2">{title}</h3>
                            <p className="text-stone-500 text-sm leading-relaxed mb-4">{desc}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400
                group-hover:text-stone-700 transition-colors">
                                {cta}
                                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Stats strip ── */}
            <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
                <div className="bg-stone-900 rounded-2xl px-8 py-6 grid grid-cols-3 gap-4 text-center">
                    {[
                        { v: '23', l: 'WB Districts' },
                        { v: '100+', l: 'Registered' },
                        { v: 'Free', l: 'Always' },
                    ].map(({ v, l }) => (
                        <div key={l}>
                            <p className="text-white text-2xl sm:text-3xl font-black">{v}</p>
                            <p className="text-stone-400 text-xs mt-0.5">{l}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
