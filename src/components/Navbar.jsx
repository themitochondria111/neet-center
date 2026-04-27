import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, Search, FileText, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    const links = [
        { to: '/', label: 'Home' },
        { to: '/register', label: 'Register' },
        { to: '/search', label: 'Find Partners' },
    ]

    const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-15" style={{ height: '60px' }}>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center group-hover:bg-stone-700 transition-colors">
                            <GraduationCap size={17} className="text-white" />
                        </div>
                        <div className="leading-tight">
                            <span className="text-stone-900 font-bold text-sm block">NEET Center</span>
                            <span className="text-stone-400 text-[9px] font-semibold tracking-widest uppercase block">Partner Finder</span>
                        </div>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive(to)
                                        ? 'bg-stone-900 text-white'
                                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                        <Link
                            to="/admin"
                            className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all border border-stone-200 hover:border-stone-300"
                        >
                            <Shield size={13} />
                            Admin
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden text-stone-500 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-stone-100 bg-white px-5 py-3 flex flex-col gap-1 animate-fade-up">
                    {links.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive(to) ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-100 transition-all"
                    >
                        <Shield size={14} />
                        Admin
                    </Link>
                </div>
            )}
        </nav>
    )
}
