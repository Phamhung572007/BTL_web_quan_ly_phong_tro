import { useEffect, useState } from 'react'
import { Banknote, Bell, CalendarClock, Check, CheckCheck, ExternalLink, FileText, RotateCcw, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate, idOf } from '../../utils/format.js'

function NotificationIcon({ type }) {
  const Icon = type === 'HOA_DON_MOI' || type === 'THANH_TOAN'
    ? Banknote
    : type === 'LICH_XEM'
      ? CalendarClock
      : type === 'DANH_GIA'
        ? Star
        : type === 'HOP_DONG'
          ? FileText
          : Bell
  return <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
}

export default function ThongBao() {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true); setError('')
    const [listResult, unreadResult] = await Promise.allSettled([
      api.get(`/thong-bao?limit=100${onlyUnread ? '&chuaDoc=true' : ''}`),
      api.get('/thong-bao/chua-doc'),
    ])
    if (listResult.status === 'fulfilled') setItems(listResult.value.data || [])
    else setError(errorMessage(listResult.reason,'Không thể tải thông báo.'))
    if (unreadResult.status === 'fulfilled') setUnread(unreadResult.value.data?.total || 0)
    setLoading(false)
  }
  useEffect(() => { load() }, [onlyUnread])

  async function markRead(item) {
    setBusyId(item._id); setError(''); setSuccess('')
    try { await api.patch(`/thong-bao/${item._id}/da-doc`); setSuccess('Đã đánh dấu thông báo đã đọc.'); await load() }
    catch (actionError) { setError(errorMessage(actionError,'Không thể cập nhật thông báo.')) }
    finally { setBusyId('') }
  }
  async function markAll() {
    if (!unread) return
    setBusyId('all'); setError(''); setSuccess('')
    try { const response = await api.patch('/thong-bao/da-doc-tat-ca'); setSuccess(response.message || 'Đã đánh dấu toàn bộ thông báo đã đọc.'); await load() }
    catch (actionError) { setError(errorMessage(actionError,'Không thể cập nhật thông báo.')) }
    finally { setBusyId('') }
  }

  return <section className="page">
    <PageHeader title="Hộp thư thông báo" description="Cập nhật hóa đơn, thanh toán, lịch xem phòng, đánh giá và hoạt động trong dự án." actions={<><button className="button" onClick={load}><RotateCcw size={14}/> Tải lại</button><button className="button button--primary" disabled={!unread || busyId === 'all'} onClick={markAll}><CheckCheck size={14}/> Đánh dấu tất cả đã đọc</button></>}/>
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}
    <div className="notification-summary"><span className="notification-summary__icon"><Bell size={17}/></span><div><b>{unread} thông báo chưa đọc</b><span>Các thay đổi được lưu trên MongoDB Atlas</span></div><span className="toolbar-spacer"/><label className="toggle-filter"><input type="checkbox" checked={onlyUnread} onChange={(event) => setOnlyUnread(event.target.checked)}/> Chỉ chưa đọc</label></div>
    <section className="panel"><div className="panel__heading"><div><h2>{onlyUnread ? 'Thông báo chưa đọc' : 'Tất cả thông báo'}</h2><p>{items.length} mục gần đây</p></div></div><div className="panel__body--flush">{loading ? <LoadingRows columns={4}/> : items.length === 0 ? <EmptyState title={onlyUnread ? 'Đã đọc hết thông báo' : 'Hộp thư đang trống'} detail={onlyUnread ? 'Không có thông báo chưa đọc.' : 'Thông báo hệ thống sẽ xuất hiện tại đây khi có hoạt động mới.'}/> : <div className="notification-list">{items.map((item) => <article className={`notification-row${item.daDocLuc ? '' : ' notification-row--unread'}`} key={idOf(item)}><span className="notification-type"><NotificationIcon type={item.loaiThongBao}/></span><div className="notification-main"><div className="notification-title"><h3>{item.tieuDe}</h3>{!item.daDocLuc && <Status value="CHUA_THANH_TOAN" label="Mới"/>}</div><p>{item.noiDung}</p><div className="cell-subtitle">{formatDate(item.createdAt,{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})} · {String(item.loaiThongBao || 'HE_THONG').replaceAll('_',' ').toLowerCase()}</div></div><div className="notification-actions">{item.duongDan && <Link className="icon-action" aria-label="Mở liên kết" to={item.duongDan}><ExternalLink size={15}/></Link>}{!item.daDocLuc && <button className="icon-action" aria-label="Đánh dấu đã đọc" onClick={() => markRead(item)} disabled={busyId === item._id}><Check size={15}/></button>}</div></article>)}</div>}</div></section>
  </section>
}
