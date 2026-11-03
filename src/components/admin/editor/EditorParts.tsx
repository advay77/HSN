'use client'

// Small pieces of the AdminCourses.dc.html editor language, shared by the case study and library editors.
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

export const chevron = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>

/** Move up / move down / delete buttons for a repeatable block. */
export function RowControls({ label, index, count, onMove, onDelete }: { label: string; index: number; count: number; onMove: (to: number) => void; onDelete: () => void }) {
  return (
    <span className="row nowrap g4">
      <button type="button" className="cb-mini" aria-label={`Move ${label} up`} onClick={() => onMove(index - 1)} disabled={index === 0}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 15 6-6 6 6"></path></svg></button>
      <button type="button" className="cb-mini" aria-label={`Move ${label} down`} onClick={() => onMove(index + 1)} disabled={index === count - 1}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
      <button type="button" className="cb-mini" aria-label={`Delete ${label}`} onClick={onDelete}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg></button>
    </span>
  )
}

export const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  return next
}

export const addIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>

export type CurrentFile = { name: string; url: string; isImage: boolean } | null

/**
 * File picker in the design's style: the current file as a `.res` row with Replace / Remove, or the dashed
 * `.drop` zone ("Choose a file or drag it here"). The chosen File is kept by the parent until Save.
 */
export function FilePicker({
  label,
  hint,
  accept,
  current,
  chosen,
  onChoose,
  onRemove,
  chooseText = 'Choose a file',
}: {
  label: string
  hint?: string
  accept?: string
  current: CurrentFile
  chosen: File | null
  onChoose: (f: File | null) => void
  onRemove: () => void
  chooseText?: string
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const preview = useMemo(() => (chosen && chosen.type.startsWith('image/') ? URL.createObjectURL(chosen) : null), [chosen])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const name = chosen?.name ?? current?.name
  const img = preview ?? (current?.isImage && !chosen ? current.url : null)
  return (
    <div className="fld">
      <span className="lbl" id={`${id}-l`}>{label}</span>
      <input ref={input} id={id} type="file" className="sr" accept={accept} aria-labelledby={`${id}-l`} onChange={(e) => onChoose(e.target.files?.[0] ?? null)} />
      {name ? (
        <div className="res">
          {img ? <img src={img} alt="" style={{ width: '72px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B3261E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6"></path></svg>}
          <span className="grow small strong" style={{ overflowWrap: 'anywhere' }}>
            {current && !chosen ? <a href={current.url} target="_blank" rel="noopener">{name}</a> : name}
            {chosen && <span className="small muted" style={{ fontWeight: 400 }}>{' '}· saved when you click Save</span>}
          </span>
          <button type="button" className="btn btn-t btn-sm" onClick={() => input.current?.click()}>Replace</button>
          <button type="button" className="btn btn-t btn-sm" onClick={() => { if (input.current) input.current.value = ''; onRemove() }}>Remove</button>
        </div>
      ) : (
        <div
          className="drop"
          style={{ padding: '16px', ...(over ? { borderColor: '#0B6B3A', background: '#E3F1E4' } : {}) }}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onChoose(f) }}
        >
          <span><button type="button" className="btn btn-t" style={{ padding: '0 4px', minHeight: '44px' }} onClick={() => input.current?.click()}>{chooseText}</button>{' '}or drag it here</span>
        </div>
      )}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export const ErrorText = ({ children }: { children?: React.ReactNode }) =>
  children ? (
    <span className="emsg" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5M12 16.5v.01"></path></svg>
      <span>{children}</span>
    </span>
  ) : null
