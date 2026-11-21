import { useEffect, useState } from 'react'
import { FileText, Pencil, Plus, RotateCcw, Send, Trash2, X } from 'lucide-react'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, SavingLabel, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate } from '../../utils/format.js'

const BLANK = { loaiBaiViet: 'TIN_TUC', tieuDe: '', tomTat: '', noiDung: '', anhDaiDien: '', tags: '', trangThai: 'NHAP', ngayBatDauSuKien: '', ngayKetThucSuKien: '' }
const toForm = (item) => item ? { ...BLANK, ...item, tags: (item.tags || []).join(', '), ngayBatDauSuKien: item.ngayBatDauSuKien ? new Date(item.ngayBatDauSuKien).toISOString().slice(0, 10) : '', ngayKetThucSuKien: item.ngayKetThucSuKien ? new Date(item.ngayKetThucSuKien).toISOString().slice(0, 10) : '' } : { ...BLANK }

export default function BangTin() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ ...BLANK })
  const [editingId, setEditingId] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true); setError('')
    try { const response = await api.get('/bai-viet/cua-toi?limit=100'); setItems(response.data || []) }
    catch (loadError) { setError(errorMessage(loadError, 'Không thể tải bài viết.')) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  function start(item) { setEditingId(item?._id || ''); setForm(toForm(item)); setOpen(true); setError(''); setSuccess('') }
  function setField(key,value) { setForm((current) => ({ ...current,[key]:value })) }
  async function save(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('')
    const payload = { ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), ngayBatDauSuKien: form.ngayBatDauSuKien || null, ngayKetThucSuKien: form.ngayKetThucSuKien || null }
    try {
      if (editingId) await api.put(`/bai-viet/${editingId}`,payload)
      else await api.post('/bai-viet',payload)
      setSuccess(editingId ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết.')
      setOpen(false); await load()
    } catch (saveError) { setError(errorMessage(saveError,'Không thể lưu bài viết.')) }
    finally { setSaving(false) }
  }
  async function remove(item) {
    if (!window.confirm(`Xóa bài viết “${item.tieuDe}”?`)) return
    setError(''); setSuccess('')
    try { await api.delete(`/bai-viet/${item._id}`); setSuccess('Đã xóa bài viết.'); await load() }
    catch (removeError) { setError(errorMessage(removeError,'Không thể xóa bài viết.')) }
  }

  return <section className="page">
    <PageHeader title="Bảng tin & sự kiện" description="Soạn tin tức, sự kiện và lưu bản nháp vào MongoDB Atlas; bài chờ duyệt được hiển thị theo trạng thái." actions={<button className="button button--warm" onClick={() => start()}><Plus size={14}/> Viết bài</button>}/>
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}
    {open && <section className="panel editor-panel"><div className="panel__heading"><div><h2>{editingId ? 'Sửa bài viết' : 'Bài viết mới'}</h2><p>Nội dung được lưu trực tiếp trong cơ sở dữ liệu.</p></div><button className="icon-action" onClick={() => setOpen(false)} aria-label="Đóng"><X size={16}/></button></div><form className="panel__body editor-form" onSubmit={save}>
      <div className="form-grid form-grid--two"><label className="field-label">Loại bài<select className="select" value={form.loaiBaiViet} onChange={(event) => setField('loaiBaiViet',event.target.value)}><option value="TIN_TUC">Tin tức</option><option value="SU_KIEN">Sự kiện</option><option value="CONG_DONG">Cộng đồng</option></select></label><label className="field-label">Trạng thái<select className="select" value={form.trangThai} onChange={(event) => setField('trangThai',event.target.value)}><option value="NHAP">Bản nháp</option><option value="CHO_DUYET">Gửi duyệt</option></select></label><label className="field-label form-span-two">Tiêu đề<input className="field" required minLength="5" maxLength="180" value={form.tieuDe} onChange={(event) => setField('tieuDe',event.target.value)}/></label><label className="field-label form-span-two">Tóm tắt<input className="field" maxLength="500" value={form.tomTat} onChange={(event) => setField('tomTat',event.target.value)}/></label><label className="field-label form-span-two">Nội dung<textarea className="textarea editor-content" required minLength="10" maxLength="50000" value={form.noiDung} onChange={(event) => setField('noiDung',event.target.value)}/></label><label className="field-label">Ảnh đại diện (URL)<input className="field" type="url" value={form.anhDaiDien} onChange={(event) => setField('anhDaiDien',event.target.value)}/></label><label className="field-label">Thẻ, cách nhau bằng dấu phẩy<input className="field" value={form.tags} onChange={(event) => setField('tags',event.target.value)} placeholder="thông báo, phòng trọ"/></label>{form.loaiBaiViet === 'SU_KIEN' && <><label className="field-label">Bắt đầu<input className="field" type="date" value={form.ngayBatDauSuKien || ''} onChange={(event) => setField('ngayBatDauSuKien',event.target.value)}/></label><label className="field-label">Kết thúc<input className="field" type="date" value={form.ngayKetThucSuKien || ''} onChange={(event) => setField('ngayKetThucSuKien',event.target.value)}/></label></>}</div>
      <div className="form-actions"><button className="button button--primary" disabled={saving}><Send size={14}/>{form.trangThai === 'CHO_DUYET' ? 'Gửi duyệt' : 'Lưu bản nháp'}</button><button type="button" className="button" onClick={() => setOpen(false)}>Đóng</button><SavingLabel active={saving}/></div>
    </form></section>}
    <section className="panel"><div className="panel__heading"><div><h2>Bài viết của tôi</h2><p>{items.length} bài viết · sắp xếp theo lần cập nhật.</p></div><button className="icon-action" aria-label="Tải lại" onClick={load}><RotateCcw size={15}/></button></div><div className="panel__body--flush">{loading ? <LoadingRows columns={5}/> : items.length === 0 ? <EmptyState title="Chưa có bài viết" detail="Tạo bản nháp hoặc gửi thông báo, tin tức và sự kiện đi duyệt." action={<button className="button button--primary" onClick={() => start()}><Plus size={14}/> Viết bài</button>}/> : <div className="article-list">{items.map((item) => <article className="article-row" key={item._id}><div className="article-mark"><FileText size={17}/></div><div className="article-main"><div className="article-title"><h3>{item.tieuDe}</h3><Status value={item.trangThai}/></div><p>{item.tomTat || item.noiDung?.slice(0,180)}</p><div className="cell-subtitle">{item.loaiBaiViet?.replaceAll('_',' ')} · Cập nhật {formatDate(item.updatedAt)}{item.ngayBatDauSuKien ? ` · Sự kiện ${formatDate(item.ngayBatDauSuKien)}` : ''}</div></div><div className="row-actions"><button className="icon-action" aria-label={`Sửa ${item.tieuDe}`} onClick={() => start(item)}><Pencil size={15}/></button><button className="icon-action icon-action--danger" aria-label={`Xóa ${item.tieuDe}`} onClick={() => remove(item)}><Trash2 size={15}/></button></div></article>)}</div>}</div></section>
  </section>
}
