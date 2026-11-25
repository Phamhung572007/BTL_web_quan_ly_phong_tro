import { AlertCircle, CheckCircle2, Info, LoaderCircle } from 'lucide-react'
import { statusLabel, statusTone } from '../utils/format.js'

export function PageHeader({ title, description, actions }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function Notice({ children, tone = 'error', onClose }) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'info' ? Info : AlertCircle
  return (
    <div className={`alert${tone === 'success' ? ' alert--success' : tone === 'info' ? ' alert--info' : ''}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={15} aria-hidden="true" />
      <span>{children}</span>
      {onClose && <button className="text-link" onClick={onClose}>Đóng</button>}
    </div>
  )
}

export function Status({ value, label }) {
  return <span className={`status-badge status-badge--${statusTone(value)}`}>{label || statusLabel(value)}</span>
}

export function LoadingRows({ columns = 5, rows = 4 }) {
  return (
    <div className="table-wrap" aria-label="Đang tải dữ liệu">
      <table className="data-table"><tbody>
        {Array.from({ length: rows }, (_, row) => (
          <tr key={row}>{Array.from({ length: columns }, (_, column) => <td key={column}><div className={`skeleton skeleton-line${column === 1 ? '' : ' skeleton-line--short'}`} /></td>)}</tr>
        ))}
      </tbody></table>
    </div>
  )
}

export function EmptyState({ title, detail, action }) {
  return (
    <div className="page-state">
      <div className="page-state__mark"><Info size={18} /></div>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action && <div className="page-state__action">{action}</div>}
    </div>
  )
}

export function SavingLabel({ active, children = 'Đang lưu…' }) {
  if (!active) return null
  return <span className="saving-label"><LoaderCircle size={13} className="spin" /> {children}</span>
}
