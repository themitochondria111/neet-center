import Form from '../components/Form'
import { Toast, useToast } from '../components/Toast'

export default function SubmitForm() {
    const { toasts, addToast, removeToast } = useToast()

    return (
        <div className="min-h-[calc(100vh-60px)] py-14 px-5 sm:px-8">
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className="max-w-md mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Step 1 of 1</p>
                    <h1 className="text-3xl font-black text-stone-900 mb-2">Register your center</h1>
                    <p className="text-stone-500 text-sm leading-relaxed">
                        Add your details so other NEET students at your center can find and reach you on Telegram.
                    </p>
                </div>

                {/* Pill badges */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {['Free', 'Instant listing', 'No account needed'].map(tag => (
                        <span key={tag} className="text-xs font-medium text-stone-500 bg-white border border-stone-200
              px-3 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Form card */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-sm">
                    <Form
                        onSuccess={msg => addToast(msg, 'success')}
                        onError={msg => addToast(msg, 'error')}
                    />
                </div>

                <p className="text-center text-stone-300 text-xs mt-5">
                    All fields auto-convert to uppercase • Visible to other students
                </p>
            </div>
        </div>
    )
}
