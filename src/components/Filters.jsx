import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { WB_DISTRICTS } from '../lib/districts'
import { ChevronDown, X, Loader2 } from 'lucide-react'

const selectCls = `
  w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800
  appearance-none cursor-pointer transition-all duration-150 pr-10
  focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/5
  hover:border-stone-300
`

function SelectWrap({ children }) {
    return (
        <div className="relative">
            {children}
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
    )
}

export default function Filters({
    district, customDistrict, center, search,
    onDistrictChange, onCustomDistrictChange, onCenterChange, onSearchChange, onClear
}) {
    const [centers, setCenters] = useState([])
    const [loadingCenters, setLoadingCenters] = useState(false)

    const effectiveDistrict = district === 'OTHER' ? customDistrict : district

    // Fetch distinct centers for selected district
    useEffect(() => {
        if (!effectiveDistrict) { setCenters([]); return }
        setLoadingCenters(true)
        supabase
            .from('students')
            .select('center')
            .eq('district', effectiveDistrict)
            .then(({ data }) => {
                if (data) {
                    const unique = [...new Set(data.map(r => r.center).filter(Boolean))].sort()
                    setCenters(unique)
                }
                setLoadingCenters(false)
            })
    }, [effectiveDistrict])

    const hasFilters = district || center || search

    return (
        <div className="space-y-3">

            {/* Live search */}
            <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    id="search-input"
                    type="text"
                    placeholder="Search name or Telegram..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-9 py-3 text-sm
            text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400
            focus:ring-2 focus:ring-stone-900/5 hover:border-stone-300 transition-all"
                />
                {search && (
                    <button onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* District dropdown — WB only + Other */}
            <SelectWrap>
                <select
                    id="filter-district"
                    value={district}
                    onChange={e => onDistrictChange(e.target.value)}
                    className={selectCls}
                >
                    <option value="">All Districts</option>
                    {WB_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="OTHER">Other</option>
                </select>
            </SelectWrap>

            {/* Custom district input when "Other" selected */}
            {district === 'OTHER' && (
                <input
                    id="filter-custom-district"
                    type="text"
                    value={customDistrict}
                    onChange={e => onCustomDistrictChange(e.target.value.toUpperCase())}
                    placeholder="TYPE DISTRICT NAME"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800
            placeholder-stone-300 uppercase focus:outline-none focus:border-stone-400
            focus:ring-2 focus:ring-stone-900/5 hover:border-stone-300 transition-all"
                    autoFocus
                />
            )}

            {/* Center dropdown — dynamic from Supabase */}
            <div className="relative">
                <select
                    id="filter-center"
                    value={center}
                    onChange={e => onCenterChange(e.target.value)}
                    disabled={!effectiveDistrict || loadingCenters}
                    className={`${selectCls} ${(!effectiveDistrict || loadingCenters) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    <option value="">
                        {loadingCenters ? 'Loading centers…' : effectiveDistrict ? 'All Centers' : 'Select district first'}
                    </option>
                    {centers.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {loadingCenters
                    ? <Loader2 size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 animate-spin" />
                    : <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                }
            </div>

            {/* Clear */}
            {hasFilters && (
                <button
                    id="clear-filters"
                    onClick={onClear}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-stone-400
            hover:text-stone-600 py-2 rounded-xl hover:bg-stone-100 transition-all border border-stone-200"
                >
                    <X size={12} />
                    Clear all filters
                </button>
            )}
        </div>
    )
}
