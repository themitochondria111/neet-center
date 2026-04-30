import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { WB_DISTRICTS } from '../lib/districts'
import { ChevronDown, AlertCircle, Loader2, X } from 'lucide-react'

const inputBase = `
  w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900
  placeholder-stone-300 transition-all duration-150 uppercase
  focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/5
  hover:border-stone-300
`
const inputErr = `
  w-full bg-white border border-red-300 rounded-xl px-4 py-3 text-sm text-stone-900
  placeholder-stone-300 transition-all duration-150 uppercase
  focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/5
`

function Field({ label, required, error, hint, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
                {!required && <span className="text-stone-300 text-xs font-normal ml-1">(optional)</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-stone-400">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={11} />{error}
                </p>
            )}
        </div>
    )
}

// ── Center autocomplete combobox ──────────────────────────────────
function CenterInput({ district, value, onChange, hasError }) {
    const [suggestions, setSuggestions] = useState([])
    const [open, setOpen] = useState(false)
    const [loadingSuggest, setLoadingSuggest] = useState(false)
    const wrapRef = useRef(null)

    // Fetch distinct centers for this district from Supabase
    useEffect(() => {
        if (!district) { setSuggestions([]); return }
        setLoadingSuggest(true)
        supabase
            .from('students')
            .select('center')
            .eq('district', district)
            .then(({ data }) => {
                if (data) {
                    const unique = [...new Set(data.map(r => r.center).filter(Boolean))].sort()
                    setSuggestions(unique)
                }
                setLoadingSuggest(false)
            })
    }, [district])

    // Close dropdown on outside click
    useEffect(() => {
        const onOutside = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [])

    const filtered = value
        ? suggestions.filter(s => s.includes(value.toUpperCase()))
        : suggestions

    const handleSelect = (c) => { onChange(c); setOpen(false) }

    const cls = `${hasError ? inputErr : inputBase} pr-10`

    return (
        <div ref={wrapRef} className="relative">
            <input
                type="text"
                id="student-center"
                value={value}
                disabled={!district}
                onChange={e => { onChange(e.target.value.toUpperCase()); setOpen(true) }}
                onFocus={() => setOpen(true)}
                placeholder={district ? 'TYPE OR SELECT YOUR CENTER' : 'SELECT DISTRICT FIRST'}
                className={`${cls} ${!district ? 'opacity-40 cursor-not-allowed' : ''}`}
                autoComplete="off"
            />

            {/* right icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {value && district && (
                    <button type="button" onClick={() => { onChange(''); setOpen(false) }}
                        className="text-stone-300 hover:text-stone-500 transition-colors">
                        <X size={13} />
                    </button>
                )}
                {loadingSuggest
                    ? <Loader2 size={14} className="text-stone-300 animate-spin" />
                    : <ChevronDown size={14} className="text-stone-400" />
                }
            </div>

            {/* Dropdown */}
            {open && district && filtered.length > 0 && (
                <ul className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-stone-200
          rounded-xl shadow-lg max-h-52 overflow-y-auto py-1">
                    {filtered.map(c => (
                        <li key={c}>
                            <button
                                type="button"
                                onMouseDown={() => handleSelect(c)}
                                className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50
                  transition-colors truncate"
                            >
                                {c}
                            </button>
                        </li>
                    ))}
                    {/* allow typing a new one not in list */}
                    {value && !filtered.includes(value.toUpperCase()) && (
                        <li>
                            <button
                                type="button"
                                onMouseDown={() => handleSelect(value)}
                                className="w-full text-left px-4 py-2.5 text-sm text-stone-400 hover:bg-stone-50
                  transition-colors italic"
                            >
                                Add "{value}" as new center
                            </button>
                        </li>
                    )}
                </ul>
            )}

            {/* No suggestions yet — user can still type */}
            {open && district && suggestions.length === 0 && !loadingSuggest && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-stone-200
          rounded-xl shadow-lg px-4 py-3 text-xs text-stone-400">
                    No centers added yet for this district — type yours below and be the first!
                </div>
            )}
        </div>
    )
}

// ── Main Form ────────────────────────────────────────────────────
export default function Form({ onSuccess, onError }) {
    const [form, setForm] = useState({
        name: '', district: '', customDistrict: '', center: '', telegram: '', roll: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const isOther = form.district === 'OTHER'
    const effectiveDistrict = isOther ? form.customDistrict.toUpperCase().trim() : form.district

    const set = (field, value) => {
        const v = typeof value === 'string' ? value.toUpperCase() : value
        setForm(prev => ({
            ...prev,
            [field]: v,
            ...(field === 'district' ? { center: '', customDistrict: '' } : {})
        }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.district) e.district = 'District is required'
        if (isOther && !form.customDistrict.trim()) e.customDistrict = 'Please enter your district name'
        if (!form.center.trim()) e.center = 'Exam center is required'
        if (form.telegram.trim() && !/^[A-Z0-9_]{3,32}$/.test(form.telegram.replace('@', '')))
            e.telegram = 'Must be 3–32 characters (letters, numbers, underscore)'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            const rawTg = form.telegram.trim()
            const telegram = rawTg ? (rawTg.startsWith('@') ? rawTg : `@${rawTg}`) : null
            const { error } = await supabase.from('students').insert([{
                name: form.name.trim(),
                center: form.center.trim(),
                district: effectiveDistrict,
                telegram,
                roll: form.roll.trim() || null,
            }])
            if (error) {
                onError(error.code === '23505' ? 'This Telegram username is already registered.' : error.message)
            } else {
                setForm({ name: '', district: '', customDistrict: '', center: '', telegram: '', roll: '' })
                onSuccess("You're registered! Others can now find you.")
            }
        } catch {
            onError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name */}
            <Field label="Full Name" required error={errors.name}>
                <input
                    id="student-name"
                    type="text"
                    maxLength={100}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="ENTER YOUR FULL NAME"
                    className={errors.name ? inputErr : inputBase}
                />
            </Field>

            {/* District */}
            <Field label="District" required error={errors.district || errors.customDistrict}>
                <div className="space-y-2">
                    <div className="relative">
                        <select
                            id="student-district"
                            value={form.district}
                            onChange={e => set('district', e.target.value)}
                            className={`${errors.district ? inputErr : inputBase} appearance-none cursor-pointer pr-10 normal-case`}
                        >
                            <option value="">Select district</option>
                            {WB_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            <option value="OTHER">Other (enter manually)</option>
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    </div>

                    {/* Custom district input */}
                    {isOther && (
                        <input
                            id="student-custom-district"
                            type="text"
                            maxLength={80}
                            value={form.customDistrict}
                            onChange={e => {
                                setForm(prev => ({ ...prev, customDistrict: e.target.value.toUpperCase() }))
                                if (errors.customDistrict) setErrors(prev => ({ ...prev, customDistrict: '' }))
                            }}
                            placeholder="ENTER YOUR DISTRICT NAME"
                            className={errors.customDistrict ? inputErr : inputBase}
                            autoFocus
                        />
                    )}
                </div>
            </Field>

            {/* Center — live autocomplete from Supabase */}
            <Field label="Exam Center" required error={errors.center}
                hint={effectiveDistrict ? 'Type to search existing centers or add your own' : undefined}>
                <CenterInput
                    district={effectiveDistrict}
                    value={form.center}
                    onChange={v => { setForm(prev => ({ ...prev, center: v })); if (errors.center) setErrors(p => ({ ...p, center: '' })) }}
                    hasError={!!errors.center}
                />
            </Field>

            {/* Telegram */}
            <Field label="Telegram Username" error={errors.telegram} hint="Leave blank if you prefer not to share">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm select-none">@</span>
                    <input
                        id="student-telegram"
                        type="text"
                        maxLength={32}
                        value={form.telegram.replace('@', '')}
                        onChange={e => {
                            const v = e.target.value.toUpperCase().replace('@', '')
                            setForm(prev => ({ ...prev, telegram: v }))
                            if (errors.telegram) setErrors(prev => ({ ...prev, telegram: '' }))
                        }}
                        placeholder="USERNAME"
                        className={`${errors.telegram ? inputErr : inputBase} pl-8`}
                    />
                </div>
            </Field>

            {/* Roll */}
            <Field label="Roll Number">
                <input
                    id="student-roll"
                    type="text"
                    maxLength={20}
                    value={form.roll}
                    onChange={e => set('roll', e.target.value)}
                    placeholder="NEET ROLL NUMBER"
                    className={inputBase}
                />
            </Field>

            <button
                type="submit"
                id="submit-registration"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700
          text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
            >
                {loading
                    ? <><Loader2 size={16} className="animate-spin" />Submitting…</>
                    : 'Register Now'
                }
            </button>
        </form>
    )
}
