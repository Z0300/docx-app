import type {ReactNode} from 'react'

export function PageHeader({title, description, actions}: {
    title: string;
    description?: string;
    actions?: ReactNode
}) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-headline-lg font-semibold tracking-tight">{title}</h1>
                {description && <p className="text-base-content/65 mt-1 max-w-prose text-sm">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}
