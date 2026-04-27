import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Toast, useToast } from '../components/Toast'
import {
    Shield, LogOut, Search, Edit2, Trash2, Download,
    ChevronLeft, ChevronRight, X, Save, Loader2, RefreshCw,
} from 'lucide-react'

const PAGE_SIZE = 20

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { toasts, addToast, removeToast } = useToast()
    const [user, setUser] = useState(null)
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [editId, setEditId] = useState(null)
    const [editData, setEditData] = useState({})
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [confirmDel, setConfirmDel] = useState(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) navigate('/admin'); else setUser(user)
        })
        const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
            if (!s?.user) navigate('/admin')
        })
        return () => sub?.subscription?.unsubscribe()
    }, [navigate])

    const fetch = useCallback(async () => {
        setLoading(true)
        try {
            let q = supabase
                .from('students')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
            if (search) q = q.or(`name.ilike.%${search}%,telegram.ilike.%${search}%,district.ilike.%${search}%,center.ilike.%${search}%`)
            const { data, error, count } = await q
            if (error) throw error
            setStudents(data || [])
            setTotal(count || 0)
        } catch (e) {
            addToast('Failed to load: ' + e.message, 'error')
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        if (!user) return
        const t = setTimeout(fetch, search ? 300 : 0)
        return () => clearTimeout(t)
    }, [fetch, user, search])

    const logout = async () => { await supabase.auth.signOut(); navigate('/admin') }

    const startEdit = (s) => { setEditId(s.id); setEditData({ ...s }); setConfirmDel(null) }
    const cancelEdit = () => { setEditId(null); setEditData({}) }

    const saveEdit = async () => {
        setSaving(true)
        try {
            const { error } = await supabase.from('students').update({
                name: editData.name, center: editData.center,
                district: editData.district, telegram: editData.telegram, roll: editData.roll || null,
            }).eq('id', editId)
            if (error) throw error
            addToast('Saved!', 'success')
            cancelEdit(); fetch()
        } catch (e) { addToast('Save failed: ' + e.message, 'error') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (confirmDel !== id) { setConfirmDel(id); return }
        setDeleting(id)
        try {
            const { error } = await supabase.from('students').delete().eq('id', id)
            if (error) throw error
            addToast('Deleted.', 'success')
            setConfirmDel(null); fetch()
        } catch (e) { addToast('Delete failed: ' + e.message, 'error') }
        finally { setDeleting(null) }
    }

    const exportCSV = async () => {
        try {
            const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false })
            if (error) throw error
            const hdr = ['ID', 'Name', 'District', 'Center', 'Telegram', 'Roll', 'Created At']
            const rows = data.map(s => [s.id, s.name, s.district, s.center, s.telegram, s.roll || '', s.created_at])
            const csv = [hdr, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
            a.download = `neet-students-${new Date().toISOString().slice(0, 10)}.csv`
            a.click()
        } catch (e) { addToast('Export failed: ' + e.message, 'error') }
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)
    if (!user) return null

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider"
    const tdClass = "px-4 py-3.5 text-sm"

    return (
        <div className="min-h-[calc(100vh-60px)] bg-stone-50 py-8 px-5 sm:px-8">
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className="max-w-7xl mx-auto">

                {/* Top bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={18} className="text-stone-400" />
                            <h1 className="text-xl font-black text-stone-900">Admin Dashboard</h1>
                        </div>
                        <p className="text-xs text-stone-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportCSV}
                            id="export-csv-btn"
                            className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300
                text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                        <button
                            onClick={logout}
                            id="admin-logout-btn"
                            className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-red-200
                text-stone-500 hover:text-red-500 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { l: 'Total', v: total },
                        { l: 'Page', v: `${page + 1} / ${totalPages || 1}` },
                        { l: 'Showing', v: students.length },
                    ].map(({ l, v }) => (
                        <div key={l} className="bg-white border border-stone-100 rounded-xl px-4 py-2 flex items-center gap-2">
                            <span className="text-stone-400 text-xs">{l}</span>
                            <span className="text-stone-900 font-semibold text-sm">{v}</span>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="flex gap-2 mb-5">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            id="admin-search"
                            type="text"
                            placeholder="Search name, telegram, district, center..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0) }}
                            className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400
                focus:ring-2 focus:ring-stone-900/5 hover:border-stone-300 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => { setSearch(''); setPage(0); }}
                        className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-300
              text-stone-500 px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-stone-100 bg-stone-50">
                                <tr>
                                    <th className={thClass}>Name</th>
                                    <th className={thClass}>District</th>
                                    <th className={`${thClass} hidden md:table-cell`}>Center</th>
                                    <th className={thClass}>Telegram</th>
                                    <th className={`${thClass} hidden sm:table-cell`}>Roll</th>
                                    <th className={thClass + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-4 py-4">
                                                    <div className="h-3.5 bg-stone-100 rounded-md" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-stone-400 text-sm">No students found</td>
                                    </tr>
                                ) : students.map(s => (
                                    editId === s.id
                                        ? <EditRow key={s.id} data={editData} setData={setEditData} onSave={saveEdit} onCancel={cancelEdit} saving={saving} />
                                        : (
                                            <tr key={s.id} className="hover:bg-stone-50 transition-colors group">
                                                <td className={`${tdClass} text-stone-900 font-medium`}>{s.name}</td>
                                                <td className={`${tdClass} text-stone-500`}>{s.district}</td>
                                                <td className={`${tdClass} text-stone-400 text-xs max-w-[180px] truncate hidden md:table-cell`}>{s.center}</td>
                                                <td className={`${tdClass} text-[#229ED9] text-xs`}>{s.telegram}</td>
                                                <td className={`${tdClass} text-stone-400 text-xs hidden sm:table-cell`}>{s.roll || '—'}</td>
                                                <td className={`${tdClass}`}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => startEdit(s)}
                                                            className="p-2 text-stone-300 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            disabled={deleting === s.id}
                                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${confirmDel === s.id
                                                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                                                    : 'text-stone-300 hover:text-red-500 hover:bg-red-50'
                                                                }`}
                                                        >
                                                            {deleting === s.id
                                                                ? <Loader2 size={12} className="animate-spin" />
                                                                : <Trash2 size={13} />
                                                            }
                                                            {confirmDel === s.id && <span>Confirm?</span>}
                                                        </button>
                                                        {confirmDel === s.id && (
                                                            <button onClick={() => setConfirmDel(null)} className="p-1.5 text-stone-300 hover:text-stone-500 rounded-lg">
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-100 bg-stone-50">
                            <p className="text-xs text-stone-400">
                                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200
                    disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs text-stone-500 px-2">{page + 1} / {totalPages}</span>
                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200
                    disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function EditRow({ data, setData, onSave, onCancel, saving }) {
    const inp = "w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-stone-900 text-xs focus:outline-none focus:border-stone-500 uppercase transition-all"
    const ch = (f, v) => setData(p => ({ ...p, [f]: v.toUpperCase() }))

    return (
        <tr className="bg-violet-50 border-y border-violet-100">
            <td className="px-4 py-3"><input value={data.name || ''} onChange={e => ch('name', e.target.value)} className={inp} /></td>
            <td className="px-4 py-3"><input value={data.district || ''} onChange={e => ch('district', e.target.value)} className={inp} /></td>
            <td className="px-4 py-3 hidden md:table-cell"><input value={data.center || ''} onChange={e => ch('center', e.target.value)} className={inp} /></td>
            <td className="px-4 py-3"><input value={data.telegram || ''} onChange={e => ch('telegram', e.target.value)} className={inp} /></td>
            <td className="px-4 py-3 hidden sm:table-cell"><input value={data.roll || ''} onChange={e => ch('roll', e.target.value)} className={inp} /></td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-1 bg-stone-900 hover:bg-stone-700 text-white
              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-1 text-stone-500 hover:text-stone-700 px-2.5 py-1.5
              rounded-lg text-xs border border-stone-200 hover:bg-stone-100 transition-all"
                    >
                        <X size={11} />
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    )
}
