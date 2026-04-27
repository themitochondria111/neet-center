import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Filters from '../components/Filters'
import StudentTable from '../components/StudentTable'
import { Loader2 } from 'lucide-react'

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)

    // customDistrict is only in local state (not URL) — used when district=OTHER
    const [customDistrict, setCustomDistrict] = useState('')

    const district = searchParams.get('district') || ''
    const center = searchParams.get('center') || ''
    const search = searchParams.get('search') || ''

    // The effective district to query with
    const effectiveDistrict = district === 'OTHER' ? customDistrict : district

    const fetchStudents = useCallback(async () => {
        setLoading(true)
        try {
            let q = supabase
                .from('students_public')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(100)

            if (effectiveDistrict) q = q.eq('district', effectiveDistrict)
            if (center) q = q.eq('center', center)
            if (search) q = q.or(`name.ilike.%${search}%,telegram.ilike.%${search}%`)

            const { data, error, count } = await q
            if (error) throw error
            setStudents(data || [])
            setTotalCount(count || 0)
        } catch {
            setStudents([])
        } finally {
            setLoading(false)
        }
    }, [effectiveDistrict, center, search])

    // Debounce fetch
    useEffect(() => {
        // Don't fetch if OTHER is selected but no custom district typed yet
        if (district === 'OTHER' && !customDistrict.trim()) {
            setStudents([])
            setTotalCount(0)
            setLoading(false)
            return
        }
        const t = setTimeout(fetchStudents, search || (district === 'OTHER') ? 400 : 0)
        return () => clearTimeout(t)
    }, [fetchStudents, search, district, customDistrict])

    const updateParam = (key, value) => {
        setSearchParams(prev => {
            const n = new URLSearchParams(prev)
            value ? n.set(key, value) : n.delete(key)
            if (key === 'district') n.delete('center')
            return n
        })
    }

    const handleDistrictChange = (v) => {
        setCustomDistrict('')
        updateParam('district', v)
    }

    const handleClear = () => {
        setCustomDistrict('')
        setSearchParams({})
    }

    return (
        <div className="min-h-[calc(100vh-60px)] py-10 px-5 sm:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Find Partners</p>
                    <div className="flex items-end justify-between flex-wrap gap-3">
                        <h1 className="text-3xl font-black text-stone-900">Students near you</h1>
                        {!loading && (
                            <span className="text-sm text-stone-400 font-medium">
                                {totalCount} student{totalCount !== 1 ? 's' : ''}
                                {effectiveDistrict ? ` in ${effectiveDistrict}` : ''}
                            </span>
                        )}
                        {loading && (
                            <span className="flex items-center gap-1.5 text-sm text-stone-400">
                                <Loader2 size={14} className="animate-spin" />Loading…
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24 bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Filters</p>
                            <Filters
                                district={district}
                                customDistrict={customDistrict}
                                center={center}
                                search={search}
                                onDistrictChange={handleDistrictChange}
                                onCustomDistrictChange={v => setCustomDistrict(v)}
                                onCenterChange={v => updateParam('center', v)}
                                onSearchChange={v => updateParam('search', v)}
                                onClear={handleClear}
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        {/* Prompt if OTHER district not filled */}
                        {district === 'OTHER' && !customDistrict.trim() ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-stone-500 font-medium text-sm">Type your district name above to search</p>
                            </div>
                        ) : (
                            <>
                                <StudentTable students={students} loading={loading} />
                                {!loading && students.length >= 100 && (
                                    <p className="text-center text-stone-400 text-xs mt-6">
                                        Showing first 100 — use filters to narrow results.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
