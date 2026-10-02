import {X} from 'lucide-react'
import {useEffect, useRef} from 'react'
import type {ReactNode} from 'react'

interface ModalProps {
    open: boolean
    title: string
    onClose: () => void
    children: ReactNode
}

/** Thin wrapper over the native <dialog>: focus trapping, Esc to close and inert background come free. */
export function Modal({open, title, onClose, children}: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    return (
        <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby="modal-title">
            <div className="modal-box border border-base-300 shadow-[0_4px_4px_-2px_rgba(0,0,0,0.1)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 id="modal-title" className="text-lg font-semibold">
                        {title}
                    </h2>
                    <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Close"
                            onClick={onClose}>
                        <X size={16}/>
                    </button>
                </div>
                {open && children}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button aria-label="Close">close</button>
            </form>
        </dialog>
    )
}
