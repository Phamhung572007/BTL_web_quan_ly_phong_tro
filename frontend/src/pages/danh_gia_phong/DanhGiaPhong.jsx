import { useEffect, useState } from 'react'
import { Eye, EyeOff, MessageSquareText, RotateCcw, Send, Star } from 'lucide-react'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate, idOf } from '../../utils/format.js'

const roomName = (item) => item.phong?.soPhong || item.phong?.tenPhong || `Phòng ${String(item.phongTroId || '').slice(-5)}`

export default function DanhGiaPhong() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [replies, setReplies] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const query = new URLSearchParams({ limit: '100' }); if (filter) query.set('trangThai',filter)
      const response = await api.get(`/danh-gia-phong/quan-ly?${query}`)
      const list = response.data || []; setItems(list)
      setReplies((current) => Object.fromEntries(list.map((item) => [item._id,current[item._id] ?? item.phanHoiChuTro?.noiDung ?? ''])))
    } catch (loadError) { setError(errorMessage(loadError,'Không thể tải đánh giá phòng.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filter])

  async function update(item, payload, message) {
    setBusyId(item._id); setError(''); setSuccess('')
    try { await api.put(`/danh-gia-phong/${item._id}`,payload); setSuccess(message); await load() }
    catch (actionError) { setError(errorMessage(actionError,'Không thể cập nhật đánh giá.')) }
    finally { setBusyId('') }
  }

  return <section className="page">
    <PageHeader title="Đánh giá phòng" description="Duyệt và phản hồi đánh giá từ người thuê; trạng thái được cập nhật qua API." actions={<button className="button" onClick={load}><RotateCcw size={14}/> Tải lại</button>}/>
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}
    <div className="toolbar"><label className="field-label">Trạng thái<select className="select filter-select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">Tất cả</option><option value="CHO_DUYET">Chờ duyệt</option><option value="DA_DUYET">Đã duyệt</option><option value="DA_AN">Đã ẩn</option><option value="TU_CHOI">Từ chối</option></select></label><span className="toolbar-spacer"/><span className="toolbar-count">{items.length} đánh giá</span></div>
    <section className="panel"><div className="panel__heading"><div><h2>Phản hồi người thuê</h2><p>Đánh giá có thể được duyệt, ẩn hoặc trả lời công khai.</p></div><MessageSquareText size={17}/></div><div className="panel__body--flush">{loading ? <LoadingRows columns={5}/> : items.length === 0 ? <EmptyState title="Chưa có đánh giá" detail="Đánh giá gửi về các phòng thuộc dãy của bạn sẽ xuất hiện tại đây."/> : <div className="review-list">{items.map((item) => <article className="review-card" key={idOf(item)}><div className="review-card__top"><div><div className="review-room">{roomName(item)}</div><div className="review-author">Người thuê · {String(item.nguoiDanhGiaId || '').slice(-6)} · {formatDate(item.createdAt)}</div></div><Status value={item.trangThai}/></div><div className="review-rating" aria-label={`${item.diem} trên 5 sao`}>{Array.from({length:5},(_,index) => <Star key={index} size={15} fill={index < Number(item.diem) ? 'currentColor' : 'none'} className={index < Number(item.diem) ? 'star-filled' : ''}/>)}</div>{item.tieuDe && <h3 className="review-title">{item.tieuDe}</h3>}<p className="review-content">{item.noiDung}</p>{item.phanHoiChuTro?.noiDung && <div className="review-reply"><b>Phản hồi của chủ trọ</b><p>{item.phanHoiChuTro.noiDung}</p></div>}<div className="review-actions"><label className="field-label review-reply-field">Trả lời<textarea className="textarea" maxLength="2000" placeholder="Viết phản hồi lịch sự, cụ thể…" value={replies[item._id] || ''} onChange={(event) => setReplies((current) => ({...current,[item._id]:event.target.value}))}/></label><div className="review-action-buttons">{item.trangThai !== 'DA_DUYET' && <button className="button button--small button--primary" disabled={busyId === item._id} onClick={() => update(item,{trangThai:'DA_DUYET'},'Đã duyệt đánh giá.')}><Eye size={13}/> Duyệt</button>}{item.trangThai !== 'DA_AN' && <button className="button button--small" disabled={busyId === item._id} onClick={() => update(item,{trangThai:'DA_AN'},'Đã ẩn đánh giá.')}><EyeOff size={13}/> Ẩn</button>}<button className="button button--small" disabled={busyId === item._id || !(replies[item._id] || '').trim()} onClick={() => update(item,{phanHoiChuTro:{noiDung:replies[item._id]}},'Đã gửi phản hồi.')}><Send size={13}/> Gửi phản hồi</button></div></div></article>)}</div>}</div></section>
  </section>
}
