import {Link, useNavigate} from '@tanstack/react-router'
import {useSelector} from '@tanstack/react-form'
import {CheckCircle2, Circle, CloudUpload, FileText, RotateCcw, X} from 'lucide-react'
import {useRef, useState} from 'react'
import {useAppForm} from '@/components/form/form'
import {getErrorMessage} from '@/lib/api/errors'
import {formatBytes} from '@/lib/utils/format'
import {createDocumentSchema} from './schema'
import {useCreateDocument, useUploadFile} from './queries'
import type {UserSummary} from "@/features/users/types.ts";
import {ApproverChainPicker} from "@/components/form/ApproverChainPicker.tsx";
import {UserCombobox} from "@/components/form/UserCombobox.tsx";
import {firstFieldError} from "@/lib/utils/formErrors.tsx";

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.xlsx']
const MAX_SIZE_BYTES = 50 * 1024 * 1024

function SectionLabel({children}: { children: string }) {
    return <span className="text-label-sm text-base-content/50 tracking-wider uppercase">{children}</span>
}


export function CreateDocumentPage() {
    const navigate = useNavigate()
    const create = useCreateDocument()
    const upload = useUploadFile()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [localFile, setLocalFile] = useState<File | null>(null)

    const form = useAppForm({
        defaultValues: {
            documentTitle: '',
            fileName: '',
            filePath: '',
            changeComments: '',
            reviewer: null as UserSummary | null,
            approvers: [] as UserSummary[]
        },
        validators: {onChange: createDocumentSchema},
        onSubmit: async ({value}) => {
            createDocumentSchema.parse(value)
            const payload = {
                documentTitle: value.documentTitle,
                fileName: value.fileName,
                filePath: value.filePath,
                changeComments: value.changeComments || undefined,
                reviewerUserId: value.reviewer!.userId,
                approverUserIds: value.approvers.map((a) => a.userId),
            }

            await create
                .mutateAsync(payload)
                .then((doc) => navigate({to: '/documents/$documentId', params: {documentId: String(doc.documentId)}}))
                .catch(() => undefined)
        },
    })

    const values = useSelector(form.store, (s) => s.values)
    console.log({ fileName: values.fileName, filePath: values.filePath, uploadIsSuccess: upload.isSuccess })
    const hasReviewer = values.reviewer !== null
    const hasFile = upload.isSuccess && values.fileName.trim() !== '' && values.filePath.trim() !== ''
    const hasTitle = values.documentTitle.trim().length >= 3

    function clientSideError(file: File): string | null {
        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
        if (!ACCEPTED_EXTENSIONS.includes(ext)) return `Only ${ACCEPTED_EXTENSIONS.join(', ')} files are accepted`
        if (file.size > MAX_SIZE_BYTES) return `File exceeds the ${formatBytes(MAX_SIZE_BYTES)} limit`
        return null
    }

    async function handleFile(file: File) {
        const clientError = clientSideError(file)
        if (clientError) {
            upload.reset()
            // Reuse the mutation's error slot for a client-side-only rejection, so the UI has one error path.
            upload.mutate(file) // will also be rejected server-side as a backstop; see note below
            return
        }
        setLocalFile(file)
        try {
            const result = await upload.mutateAsync(file)
            form.setFieldValue('fileName', result.fileName)
            form.setFieldValue('filePath', result.filePath)
        } catch {
            setLocalFile(null)
        }
    }

    function clearFile() {
        setLocalFile(null)
        upload.reset()
        form.setFieldValue('fileName', '')
        form.setFieldValue('filePath', '')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <>
            <div className="mb-1 flex items-center gap-2 text-sm">
                <Link to="/documents" className="link link-hover text-base-content/60">
                    Documents
                </Link>
                <span className="text-base-content/40">/</span>
                <span className="font-medium">New Submission</span>
            </div>

            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-headline-lg font-semibold tracking-tight">Submit Document for Review</h1>
                    <p className="text-base-content/65 mt-1 max-w-prose text-body-md">
                        Submits directly into review — assign a reviewer and at least one approver below.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/documents" className="btn btn-surface">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        form="create-document-form"
                        className="btn btn-primary"
                        disabled={create.isPending || upload.isPending || !hasFile}
                    >
                        {create.isPending && <span className="loading loading-spinner loading-sm"/>}
                        Submit for Approval
                    </button>
                </div>
            </div>

            <form
                id="create-document-form"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void form.handleSubmit()
                }}
                className="grid gap-6 lg:grid-cols-3"
            >
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* 1 — Source document, now a real upload */}
                    <section className="bg-base-100 border-base-300 rounded-box border p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-title-lg font-semibold">1. Source Document</h2>
                            <SectionLabel>Required</SectionLabel>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_EXTENSIONS.join(',')}
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) void handleFile(file)
                            }}
                        />

                        {!localFile ? (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    setIsDragging(true)
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    setIsDragging(false)
                                    const file = e.dataTransfer.files?.[0]
                                    if (file) void handleFile(file)
                                }}
                                className={`flex cursor-pointer flex-col items-center gap-2 rounded-box border border-dashed px-6 py-10 text-center transition-colors ${
                                    isDragging ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200/40'
                                }`}
                            >
                                <CloudUpload size={28} className="text-base-content/40" aria-hidden="true"/>
                                <p className="text-body-sm">
                                    <span className="text-primary font-medium">Browse</span> or drag and drop a file
                                    here
                                </p>
                                <p className="text-base-content/50 text-body-sm">
                                    {ACCEPTED_EXTENSIONS.join(', ')} up to {formatBytes(MAX_SIZE_BYTES)}
                                </p>
                            </div>
                        ) : (
                            <div
                                className="border-base-300 bg-base-200/40 flex items-center gap-3 rounded-box border p-4">
                                <FileText size={28} className="text-base-content/50 shrink-0" aria-hidden="true"/>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-body-sm font-medium">{localFile.name}</p>
                                    <p className="text-base-content/50 text-body-sm">{formatBytes(localFile.size)}</p>
                                    {upload.isPending && (
                                        <progress className="progress progress-primary mt-1 h-1.5 w-full"
                                                  value={upload.progress} max={100}/>
                                    )}
                                </div>
                                {upload.isPending ? (
                                    <span className="text-base-content/50 text-body-sm">{upload.progress}%</span>
                                ) : upload.isError ? (
                                    <button type="button" className="btn btn-ghost btn-sm"
                                            onClick={() => handleFile(localFile)}>
                                        <RotateCcw size={14}/> Retry
                                    </button>
                                ) : (
                                    <CheckCircle2 size={18} className="text-success shrink-0" aria-hidden="true"/>
                                )}
                                <button type="button" className="btn btn-ghost btn-sm btn-square"
                                        aria-label="Remove file" onClick={clearFile}>
                                    <X size={16}/>
                                </button>
                            </div>
                        )}

                        {upload.isError && (
                            <p role="alert" className="alert alert-error alert-soft mt-3 text-sm">
                                {getErrorMessage(upload.error)}
                            </p>
                        )}
                    </section>

                    {/* 2 — Details */}
                    <section className="bg-base-100 border-base-300 rounded-box border p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-title-lg font-semibold">2. Details</h2>
                            <SectionLabel>Required</SectionLabel>
                        </div>
                        <div className="flex flex-col gap-4">
                            <form.AppField name="documentTitle">{(f) => <f.TextField label="Document title"
                                                                                     required/>}</form.AppField>
                            <form.AppField name="changeComments">
                                {(f) => <f.TextAreaField label="Comments" hint="Optional — shown to the reviewer"
                                                         rows={3}/>}
                            </form.AppField>
                        </div>
                    </section>

                    {/* 3 — Approval chain */}
                    <section className="bg-base-100 border-base-300 rounded-box border p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-title-lg font-semibold">3. Approval Chain</h2>
                            <SectionLabel>Required</SectionLabel>
                        </div>
                        <div className="flex flex-col gap-4">
                            <form.Field name="reviewer">
                                {(field) => (
                                    <UserCombobox
                                        role="AUDITOR"
                                        value={field.state.value}
                                        onChange={(u) => field.handleChange(u)}
                                        label="Reviewer"
                                        excludeUserIds={form.state.values.approvers.map((a) => a.userId)}
                                        error={field.state.meta.isTouched ? firstFieldError(field.state.meta.errors) : null}
                                    />
                                )}
                            </form.Field>

                            <form.Field name="approvers">
                                {(field) => (
                                    <ApproverChainPicker
                                        role="APPROVER"
                                        value={field.state.value}
                                        onChange={(users) => field.handleChange(users)}
                                        excludeUserIds={form.state.values.reviewer ? [form.state.values.reviewer.userId] : []}
                                        error={field.state.meta.isTouched ? firstFieldError(field.state.meta.errors) : null}
                                    />
                                )}
                            </form.Field>
                        </div>
                    </section>
                    {create.isError && (
                        <p role="alert" className="alert alert-error alert-soft text-sm">
                            {getErrorMessage(create.error)}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-base-100 border-base-300 rounded-box border p-5">
                        <h2 className="text-title-md mb-1 font-semibold">Approval Path</h2>
                        <p className="text-base-content/60 text-body-sm mb-4">Updates as you fill in the chain.</p>
                        <ol className="flex flex-col gap-4">
                            <ApprovalPathStep label="Review"
                                              detail={hasReviewer ? values.reviewer!.displayName : 'Not set'}
                                              active={hasReviewer}/>
                            {values.approvers.length === 0 ? (
                                <ApprovalPathStep label="Approval" detail="Not set" active={false}/>
                            ) : (
                                values.approvers.map((approver, i) => (
                                    <ApprovalPathStep
                                        key={approver.userId}
                                        label={i === values.approvers.length - 1 ? 'Final Approval' : `Approval ${i + 1}`}
                                        detail={approver.displayName}
                                        active
                                    />
                                ))
                            )}
                        </ol>
                    </div>

                    <div className="bg-base-100 border-base-300 rounded-box border p-5">
                        <h2 className="text-title-md mb-4 font-semibold">Submission Checklist</h2>
                        <ul className="flex flex-col gap-2.5">
                            <ChecklistRow done={hasTitle} label="Document title provided"/>
                            <ChecklistRow done={hasFile} label="File uploaded"/>
                            <ChecklistRow done={hasReviewer} label="Reviewer assigned"/>
                            <ChecklistRow done={values.approvers.length > 0} label="At least one approver assigned"/>
                        </ul>
                    </div>
                </div>
            </form>
        </>
    )
}

function ApprovalPathStep({label, detail, active}: { label: string; detail: string; active: boolean }) {
    return (
        <li className="flex gap-3">
            <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-label-sm font-bold ${
                    active ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/50'
                }`}
            >
                <FileText size={11} aria-hidden="true"/>
            </div>
            <div>
                <p className="text-body-sm font-medium">{label}</p>
                <p className={`text-body-sm ${active ? 'text-base-content/70' : 'text-base-content/40'}`}>{detail}</p>
            </div>
        </li>
    )
}

function ChecklistRow({done, label}: { done: boolean; label: string }) {
    return (
        <li className="flex items-center gap-2 text-body-sm">
            {done ? <CheckCircle2 size={16} className="text-success" aria-hidden="true"/> :
                <Circle size={16} className="text-base-content/30" aria-hidden="true"/>}
            <span className={done ? '' : 'text-base-content/50'}>{label}</span>
        </li>
    )
}