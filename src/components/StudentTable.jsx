import { ExternalLink } from 'lucide-react'

export default function StudentTable({ students, loading }) {
    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3.5 bg-stone-100 rounded-md w-2/5" />
                                <div className="h-3 bg-stone-50 rounded-md w-3/5" />
                            </div>
                            <div className="h-8 w-20 bg-stone-100 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!students?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <p className="text-stone-500 font-medium text-sm">No students found</p>
                <p className="text-stone-400 text-xs mt-1">Try different filters or register yourself!</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {students.map((student, idx) => (
                <StudentCard key={student.id} student={student} idx={idx} />
            ))}
        </div>
    )
}

const avatarColors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
]

function StudentCard({ student, idx }) {
    const color = avatarColors[idx % avatarColors.length]
    const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2)

    const openTelegram = () => {
        window.open(`https://t.me/${student.telegram.replace('@', '')}`, '_blank')
    }

    return (
        <div className="group bg-white hover:bg-stone-50 border border-stone-100 hover:border-stone-200
      rounded-2xl px-4 py-4 transition-all duration-150 animate-fade-up">

            <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center
            text-xs font-bold shrink-0 select-none mt-0.5`}>
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Name + Telegram button on same row */}
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-stone-900 font-semibold text-sm">{student.name}</p>

                        {/* Telegram — only shown if provided */}
                        {student.telegram ? (
                            <button
                                onClick={openTelegram}
                                className="flex items-center gap-1.5 bg-[#229ED9]/10 hover:bg-[#229ED9]/20
                  text-[#229ED9] text-xs font-semibold px-3 py-1.5 rounded-xl transition-all
                  shrink-0 border border-[#229ED9]/20 hover:border-[#229ED9]/30"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.026 9.54c-.146.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.889.68z" />
                                </svg>
                                <span>{student.telegram}</span>
                            </button>
                        ) : (
                            <span className="text-stone-300 text-xs px-3 py-1.5 rounded-xl border border-stone-100 shrink-0">
                                No Telegram
                            </span>
                        )}
                    </div>

                    {/* Labeled rows */}
                    <div className="mt-1.5 space-y-0.5">
                        <p className="text-xs">
                            <span className="text-stone-400 font-medium w-14 inline-block">District</span>
                            <span className="text-stone-300 mr-1.5">:</span>
                            <span className="text-stone-600">{student.district}</span>
                        </p>
                        <p className="text-xs">
                            <span className="text-stone-400 font-medium w-14 inline-block">Venue</span>
                            <span className="text-stone-300 mr-1.5">:</span>
                            <span className="text-stone-600">{student.center}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
