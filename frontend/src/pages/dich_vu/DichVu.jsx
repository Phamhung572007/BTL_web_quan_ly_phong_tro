import { useEffect, useMemo, useState } from 'react'
import { Check, Pencil, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, SavingLabel, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate, formatMoney } from '../../utils/format.js'

const TYPES = [
  ['DIEN', 'Điện'], ['NUOC', 'Nước'], ['INTERNET', 'Internet'], ['RAC', 'Rác'],
  ['GUI_XE', 'Gửi xe'], ['VE_SINH', 'Vệ sinh'], ['KHAC', 'Khác'],
]

const EMPTY = {
  maDichVu: '', tenDichVu: '', loaiDichVu: 'KHAC', donViTinh: 'phòng/tháng', donGia: '',
  cachTinh: 'THEO_PHONG', cachApGia: 'BAC_THANG', donViDinhMuc: 'DONG_HO_THANG',
  ngayHieuLucGia: '', nguonGia: '', moTa: '', batBuoc: false, dangApDung: true, bacGia: [],
}

function toForm(service) {
  if (!service) return { ...EMPTY }
  return {
    ...EMPTY,
    ...service,
    donGia: String(service.donGia ?? ''),
    ngayHieuLucGia: service.ngayHieuLucGia ? new Date(service.ngayHieuLucGia).toISOString().slice(0, 10) : '',
    bacGia: (service.bacGia || []).map((band) => ({ ...band, nguongDen: band.nguongDen ?? '' })),
  }
}

export default function DichVu() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ ...EMPTY })
  const [editingId, setEditingId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/dich-vu?limit=100')
      setItems(response.data || [])
    } catch (loadError) {
      setError(errorMessage(loadError, 'Không thể tải danh sách dịch vụ.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visible = useMemo(() => items.filter((item) => {
    const matchesName = `${item.tenDichVu} ${item.maDichVu}`.toLowerCase().includes(search.toLowerCase())
    return matchesName && (!typeFilter || item.loaiDichVu === typeFilter)
  }), [items, search, typeFilter])

  function startCreate() {
    setEditingId('')
    setForm({ ...EMPTY })
    setSuccess('')
    setError('')
    setFormOpen(true)
  }

  function startEdit(item) {
    setEditingId(item._id)
    setForm(toForm(item))
    setSuccess('')
    setError('')
    setFormOpen(true)
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateBand(index, key, value) {
    setForm((current) => ({
      ...current,
      bacGia: current.bacGia.map((band, bandIndex) => bandIndex === index ? { ...band, [key]: value } : band),
    }))
  }

  function addBand() {
    setForm((current) => ({
      ...current,
      bacGia: [...current.bacGia, { bac: current.bacGia.length + 1, nguongTu: current.bacGia.length ? current.bacGia.at(-1).nguongDen || '' : 0, nguongDen: '', donGia: '' }],
    }))
  }

  function removeBand(index) {
    setForm((current) => ({ ...current, bacGia: current.bacGia.filter((_, itemIndex) => itemIndex !== index).map((band, itemIndex) => ({ ...band, bac: itemIndex + 1 })) }))
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const payload = {
      ...form,
      dayTroId: form.dayTroId || null,
      donGia: Number(form.donGia),
      ngayHieuLucGia: form.ngayHieuLucGia || null,
      bacGia: form.bacGia.map((band, index) => ({
        bac: index + 1,
        nguongTu: Number(band.nguongTu),
        nguongDen: band.nguongDen === '' ? null : Number(band.nguongDen),
        donGia: Number(band.donGia),
      })),
    }
    try {
      if (editingId) await api.put(`/dich-vu/${editingId}`, payload)
      else await api.post('/dich-vu', payload)
      setSuccess(editingId ? 'Đã cập nhật đơn giá dịch vụ.' : 'Đã thêm dịch vụ mới.')
      setFormOpen(false)
      setEditingId('')
      setForm({ ...EMPTY })
      await load()
    } catch (saveError) {
      setError(errorMessage(saveError, 'Không thể lưu dịch vụ.'))
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Xóa hoặc ngừng áp dụng dịch vụ “${item.tenDichVu}”?`)) return
    setError('')
    setSuccess('')
    try {
      const response = await api.delete(`/dich-vu/${item._id}`)
      setSuccess(response.message || 'Đã cập nhật dịch vụ.')
      await load()
    } catch (removeError) {
      setError(errorMessage(removeError, 'Không thể xóa dịch vụ.'))
    }
  }

  const isMeter = ['DIEN', 'NUOC'].includes(form.loaiDichVu)

  return (
    <section className="page">
      <PageHeader title="Dịch vụ & đơn giá" description="Thiết lập khoản thu áp dụng cho phòng và cách tính do máy chủ sử dụng." actions={<button className="button button--warm" onClick={startCreate}><Plus size={15} /> Thêm dịch vụ</button>} />
      {error && <Notice>{error}</Notice>}
      {success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}
      {formOpen && (
        <section className="panel service-editor">
          <div className="panel__heading"><div><h2>{editingId ? 'Cập nhật dịch vụ' : 'Thiết lập dịch vụ mới'}</h2><p>Giá được lưu trong MongoDB Atlas và dùng khi lập hóa đơn.</p></div><button className="icon-action" aria-label="Đóng biểu mẫu" onClick={() => setFormOpen(false)}><X size={17} /></button></div>
          <form className="panel__body service-form" onSubmit={save}>
            <div className="form-grid form-grid--three">
              <label className="field-label">Mã dịch vụ<input className="field" required maxLength={40} value={form.maDichVu} onChange={(event) => updateField('maDichVu', event.target.value.toUpperCase())} placeholder="VD: WIFI" /></label>
              <label className="field-label">Tên dịch vụ<input className="field" required maxLength={120} value={form.tenDichVu} onChange={(event) => updateField('tenDichVu', event.target.value)} placeholder="Tên hiển thị trên hóa đơn" /></label>
              <label className="field-label">Loại<select className="select" value={form.loaiDichVu} onChange={(event) => updateField('loaiDichVu', event.target.value)}>{TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="field-label">Đơn vị tính<input className="field" required value={form.donViTinh} onChange={(event) => updateField('donViTinh', event.target.value)} placeholder="kWh, m³, người/tháng…" /></label>
              <label className="field-label">Đơn giá cơ bản<input className="field" type="number" min="0" step="1" required value={form.donGia} onChange={(event) => updateField('donGia', event.target.value)} placeholder="0" /></label>
              <label className="field-label">Cách tính<select className="select" value={form.cachTinh} onChange={(event) => updateField('cachTinh', event.target.value)}><option value="THEO_PHONG">Theo phòng</option><option value="THEO_NGUOI">Theo người</option><option value="THEO_DONG_HO">Theo đồng hồ</option><option value="CO_DINH">Cố định</option></select></label>
              {isMeter && <>
                <label className="field-label">Định mức<select className="select" value={form.donViDinhMuc} onChange={(event) => updateField('donViDinhMuc', event.target.value)}><option value="DONG_HO_THANG">Theo đồng hồ</option><option value="NGUOI_THANG">Theo người/tháng</option><option value="HO_DINH_MUC">Theo định mức hộ</option></select></label>
                <label className="field-label">Áp dụng giá<select className="select" value={form.cachApGia} onChange={(event) => updateField('cachApGia', event.target.value)}><option value="BAC_THANG">Giá bậc thang</option><option value="DON_GIA_BAC_2">Một đơn giá bậc 2</option></select></label>
              </>}
              <label className="field-label">Ngày hiệu lực<input className="field" type="date" value={form.ngayHieuLucGia} onChange={(event) => updateField('ngayHieuLucGia', event.target.value)} /></label>
              <label className="field-label">Nguồn đơn giá<input className="field" value={form.nguonGia} onChange={(event) => updateField('nguonGia', event.target.value)} placeholder="Nguồn tham chiếu (nếu có)" /></label>
            </div>
            {isMeter && <div className="tier-editor">
              <div className="tier-editor__head"><div><h3>Bậc giá</h3><p>Nhập ngưỡng bắt đầu, ngưỡng kết thúc và đơn giá cho mỗi bậc.</p></div><button type="button" className="button button--small" onClick={addBand}><Plus size={13} /> Thêm bậc</button></div>
              {form.bacGia.length === 0 ? <p className="tier-empty">Chưa có bậc giá. Nếu dịch vụ tính theo giá cố định, để trống bảng này.</p> : <div className="tier-list">
                {form.bacGia.map((band, index) => <div className="tier-row" key={index}>
                  <span className="tier-number">Bậc {index + 1}</span>
                  <label className="field-label">Từ<input className="field" type="number" min="0" value={band.nguongTu} onChange={(event) => updateBand(index, 'nguongTu', event.target.value)} /></label>
                  <label className="field-label">Đến<input className="field" type="number" min="0" value={band.nguongDen} onChange={(event) => updateBand(index, 'nguongDen', event.target.value)} placeholder="Không giới hạn" /></label>
                  <label className="field-label">Đồng giá<input className="field" type="number" min="0" value={band.donGia} onChange={(event) => updateBand(index, 'donGia', event.target.value)} /></label>
                  <button type="button" className="icon-action" aria-label={`Xóa bậc ${index + 1}`} onClick={() => removeBand(index)}><Trash2 size={15} /></button>
                </div>)}
              </div>}
            </div>}
            <label className="field-label">Ghi chú<textarea className="textarea" value={form.moTa} onChange={(event) => updateField('moTa', event.target.value)} placeholder="Thông tin bổ sung cho chủ trọ" /></label>
            <div className="form-checks"><label><input type="checkbox" checked={form.batBuoc} onChange={(event) => updateField('batBuoc', event.target.checked)} /> Bắt buộc trong hóa đơn</label><label><input type="checkbox" checked={form.dangApDung} onChange={(event) => updateField('dangApDung', event.target.checked)} /> Đang áp dụng</label></div>
            <div className="form-actions"><button className="button button--primary" type="submit" disabled={saving}><Check size={14} /> {saving ? 'Đang lưu…' : 'Lưu dịch vụ'}</button><button className="button" type="button" onClick={() => { setFormOpen(false); setEditingId(''); setForm({ ...EMPTY }) }}><RotateCcw size={14} /> Hủy</button><SavingLabel active={saving} /></div>
          </form>
        </section>
      )}
      <div className="toolbar service-toolbar">
        <div className="search-field"><Search size={15} /><input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hoặc tên dịch vụ" /></div>
        <select className="select filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Lọc theo loại dịch vụ"><option value="">Tất cả loại</option>{TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <span className="toolbar-spacer" />
        <span className="toolbar-count">{visible.length} dịch vụ</span>
      </div>
      <section className="panel">
        <div className="panel__heading"><div><h2>Danh sách dịch vụ</h2><p>Đơn giá được chụp vào hóa đơn tại thời điểm lập.</p></div><button className="icon-action" aria-label="Tải lại danh sách" onClick={load}><RotateCcw size={15} /></button></div>
        <div className="panel__body--flush">
          {loading ? <LoadingRows columns={6} /> : visible.length === 0 ? <EmptyState title={items.length ? 'Không tìm thấy dịch vụ' : 'Chưa có dịch vụ nào'} detail={items.length ? 'Thử bỏ bớt điều kiện lọc.' : 'Thêm điện, nước, internet hoặc khoản thu khác để bắt đầu.'} action={!items.length && <button className="button button--primary" onClick={startCreate}><Plus size={14} /> Thêm dịch vụ</button>} /> : (
            <div className="table-wrap"><table className="data-table"><thead><tr><th>Dịch vụ</th><th>Đơn giá</th><th>Cách tính</th><th>Hiệu lực</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
              {visible.map((item) => <tr key={item._id}>
                <td><div className="cell-title">{item.tenDichVu}</div><div className="cell-subtitle">{item.maDichVu} · {item.donViTinh}</div>{item.bacGia?.length > 0 && <div className="cell-subtitle">{item.bacGia.length} bậc giá · {item.cachApGia === 'DON_GIA_BAC_2' ? 'lấy giá bậc 2' : 'tính lũy tiến'}</div>}</td>
                <td className="numeric">{formatMoney(item.donGia)}{item.bacGia?.length > 0 && <div className="cell-subtitle">Từ {formatMoney(item.bacGia[0].donGia)}</div>}</td>
                <td>{item.cachTinh === 'THEO_NGUOI' ? 'Theo người' : item.cachTinh === 'THEO_DONG_HO' ? 'Theo đồng hồ' : item.cachTinh === 'CO_DINH' ? 'Cố định' : 'Theo phòng'}</td>
                <td>{item.ngayHieuLucGia ? formatDate(item.ngayHieuLucGia) : '—'}</td>
                <td><Status value={item.dangApDung ? 'HOAT_DONG' : 'DA_AN'} label={item.dangApDung ? 'Đang áp dụng' : 'Đã ngừng'} /></td>
                <td><div className="row-actions"><button className="icon-action" aria-label={`Sửa ${item.tenDichVu}`} onClick={() => startEdit(item)}><Pencil size={15} /></button><button className="icon-action icon-action--danger" aria-label={`Xóa ${item.tenDichVu}`} onClick={() => remove(item)}><Trash2 size={15} /></button></div></td>
              </tr>)}
            </tbody></table></div>
          )}
        </div>
      </section>
    </section>
  )
}
