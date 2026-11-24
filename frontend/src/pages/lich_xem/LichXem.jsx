import { useEffect, useState } from 'react'
import { CalendarClock, Check, RotateCcw, X } from 'lucide-react'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate, idOf } from '../../utils/format.js'

const asLocalInput = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const roomName = (item) => item.phong?.soPhong || item.phong?.tenPhong || `Phòng ${String(item.phongTroId || '').slice(-5)}`

export default function LichXem() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [newTimes, setNewTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const query = new URLSearchParams({ limit: '100' })
      if (filter) query.set('trangThai', filter)
      const response = await api.get(`/lich-xem?${query}`)
      const list = response.data || []
      setItems(list)
      setNewTimes((current) => Object.fromEntries(list.map((item) => [item._id, current[item._id] || asLocalInput(item.thoiGianMongMuon)])))
    } catch (loadError) { setError(errorMessage(loadError, 'Không thể tải lịch xem phòng.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filter])

  async function act(item, action, body = {}) {
    setBusyId(item._id); setError(''); setSuccess('')
    try {
      await api.patch(`/lich-xem/${item._id}/${action}`, body)
      setSuccess(action === 'duyet' ? 'Đã duyệt lịch xem.' : action === 'doi-lich' ? 'Đã gửi đề xuất đổi lịch.' : 'Đã hủy lịch xem.')
      await load()
    } catch (actionError) { setError(errorMessage(actionError, 'Không thể cập nhật lịch xem.')) }
    finally { setBusyId('') }
  }

  return <section className="page">
    <PageHeader title="Lịch xem phòng" description="Duyệt yêu cầu, đề xuất thời gian khác và theo dõi trạng thái lịch xem." actions={<button className="button" onClick={load}><RotateCcw size={14}/> Tải lại</button>}/>
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}
    <div className="toolbar"><label className="field-label">Trạng thái<select className="select filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">Tất cả trạng thái</option><option value="CHO_XAC_NHAN">Chờ xác nhận</option><option value="DA_DUYET">Đã duyệt</option><option value="DE_XUAT_DOI_LICH">Đề xuất đổi lịch</option><option value="DA_XAC_NHAN">Đã xác nhận</option><option value="DA_HOAN_TAT">Hoàn tất</option><option value="DA_HUY">Đã hủy</option></select></label><span className="toolbar-spacer"/><span className="toolbar-count">{items.length} lịch</span></div>
    <section className="panel"><div className="panel__heading"><div><h2>Yêu cầu xem phòng</h2><p>Danh sách mới nhất từ MongoDB Atlas.</p></div><CalendarClock size={17}/></div><div className="panel__body--flush">{loading ? <LoadingRows columns={6}/> : items.length === 0 ? <EmptyState title="Không có lịch xem" detail="Lịch khách đặt sẽ xuất hiện ở đây khi API phòng trọ và đăng nhập được kết nối."/> : <div className="appointment-list">{items.map((item) => <article className="appointment-row" key={idOf(item)}><div className="appointment-date"><b>{new Date(item.thoiGianDaDuyet || item.thoiGianMongMuon).toLocaleDateString('vi-VN',{day:'2-digit'})}</b><span>{new Date(item.thoiGianDaDuyet || item.thoiGianMongMuon).toLocaleDateString('vi-VN',{month:'short'})}</span></div><div className="appointment-main"><div className="appointment-title"><b>{roomName(item)}</b><Status value={item.trangThai}/></div><div className="cell-subtitle">{formatDate(item.thoiGianDaDuyet || item.thoiGianMongMuon,{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})} · Người đặt: {item.nguoiDat?.hoTen || item.nguoiDat?.email || String(item.nguoiDatId || '').slice(-6)}</div>{item.ghiChuNguoiDat && <p className="appointment-note">“{item.ghiChuNguoiDat}”</p>}{item.lyDoHuy && <p className="appointment-note">Lý do hủy: {item.lyDoHuy}</p>}</div><div className="appointment-actions">{['CHO_XAC_NHAN','DE_XUAT_DOI_LICH'].includes(item.trangThai) && <button className="button button--small button--primary" onClick={() => act(item,'duyet')} disabled={busyId === item._id}><Check size={13}/> Duyệt</button>}{!['DA_HOAN_TAT','DA_HUY','TU_CHOI'].includes(item.trangThai) && <><label className="field-label appointment-time">Đề xuất mới<input className="field" type="datetime-local" value={newTimes[item._id] || ''} onChange={(event) => setNewTimes((current) => ({...current,[item._id]:event.target.value}))}/></label><button className="button button--small" disabled={busyId === item._id || !newTimes[item._id]} onClick={() => act(item,'doi-lich',{thoiGianDeXuat:new Date(newTimes[item._id]).toISOString(),ghiChu:'Chủ trọ đề xuất thời gian khác.'})}>Đổi lịch</button><button className="icon-action icon-action--danger" aria-label={`Hủy lịch ${roomName(item)}`} disabled={busyId === item._id} onClick={() => { if (window.confirm(`Hủy lịch xem ${roomName(item)}?`)) act(item,'huy',{lyDoHuy:'Chủ trọ hủy lịch xem.'}) }}><X size={15}/></button></>}</div></article>)}</div>}</div></section>
  </section>
}
