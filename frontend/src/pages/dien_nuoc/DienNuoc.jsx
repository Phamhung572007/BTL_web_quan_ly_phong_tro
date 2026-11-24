import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, FilePenLine, RotateCcw, Save, Zap } from 'lucide-react'
import api from '../../services/api.js'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, LoadingRows, Notice, PageHeader, SavingLabel } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate, formatMoney, formatNumber, idOf, periodOptions } from '../../utils/format.js'

const now = new Date()
const INITIAL = { dienCu: '', dienMoi: '', nuocCu: '', nuocMoi: '', ghiChu: '' }
const toInput = (value) => value == null ? '' : String(value)

function roomName(room) {
  return room?.soPhong || room?.tenPhong || room?.maPhong || `Phòng ${idOf(room).slice(-5)}`
}

export default function DienNuoc() {
  const [searchParams] = useSearchParams()
  const requestedRoomId = searchParams.get('phongTroId') || ''
  const [rooms, setRooms] = useState([])
  const [records, setRecords] = useState([])
  const [period, setPeriod] = useState({ thang: now.getMonth() + 1, nam: now.getFullYear() })
  const [roomId, setRoomId] = useState('')
  const [form, setForm] = useState({ ...INITIAL })
  const [editingId, setEditingId] = useState('')
  const [bulk, setBulk] = useState(false)
  const [bulkRows, setBulkRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [roomError, setRoomError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    const [readingResult, roomResult] = await Promise.allSettled([
      api.get(`/chi-so-dien-nuoc?thang=${period.thang}&nam=${period.nam}&limit=100`),
      api.get('/phong-tro?limit=100'),
    ])
    if (readingResult.status === 'fulfilled') setRecords(readingResult.value.data || [])
    else setError(errorMessage(readingResult.reason, 'Không thể tải chỉ số điện nước.'))
    if (roomResult.status === 'fulfilled') {
      const list = roomResult.value.data || []
      setRooms(list)
      setRoomError('')
      setBulkRows(Object.fromEntries(list.map((room) => [idOf(room), { ...INITIAL }])) )
    } else {
      setRoomError('Danh sách phòng chưa khả dụng. Cần API GET /phong-tro của module phòng trọ để nhập chỉ số theo phòng.')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [period.thang, period.nam])
  useEffect(() => {
    if (requestedRoomId && rooms.some((room) => idOf(room) === requestedRoomId)) selectRoom(requestedRoomId)
  }, [requestedRoomId, rooms, records])
  const existing = useMemo(() => new Map(records.map((record) => [String(record.phongTroId), record])), [records])
  const selectRoom = (value) => {
    setRoomId(value)
    const found = existing.get(value)
    setEditingId(found?._id || '')
    setForm(found ? {
      dienCu: toInput(found.dien?.chiSoCu), dienMoi: toInput(found.dien?.chiSoMoi),
      nuocCu: toInput(found.nuoc?.chiSoCu), nuocMoi: toInput(found.nuoc?.chiSoMoi), ghiChu: found.ghiChu || '',
    } : { ...INITIAL })
  }
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateBulk = (id, key, value) => setBulkRows((current) => ({ ...current, [id]: { ...(current[id] || INITIAL), [key]: value } }))

  async function submitSingle(event) {
    event.preventDefault()
    if (!roomId) return setError('Chọn phòng trước khi lưu chỉ số.')
    const payload = {
      phongTroId: roomId, ...period, ghiChu: form.ghiChu,
      dien: { chiSoCu: Number(form.dienCu), chiSoMoi: Number(form.dienMoi) },
      nuoc: { chiSoCu: Number(form.nuocCu), chiSoMoi: Number(form.nuocMoi) },
    }
    setSaving(true); setError(''); setSuccess('')
    try {
      if (editingId) await api.put(`/chi-so-dien-nuoc/${editingId}`, payload)
      else await api.post('/chi-so-dien-nuoc', payload)
      setSuccess(editingId ? 'Đã cập nhật chỉ số.' : 'Đã ghi chỉ số cho phòng.')
      await load()
    } catch (saveError) { setError(errorMessage(saveError, 'Không thể lưu chỉ số.')) }
    finally { setSaving(false) }
  }

  async function submitBulk(event) {
    event.preventDefault()
    const items = rooms.filter((room) => {
      const row = bulkRows[idOf(room)] || INITIAL
      return [row.dienCu, row.dienMoi, row.nuocCu, row.nuocMoi].some((value) => value !== '')
    }).map((room) => {
      const row = bulkRows[idOf(room)]
      return { phongTroId: idOf(room), ghiChu: row.ghiChu, dien: { chiSoCu: Number(row.dienCu), chiSoMoi: Number(row.dienMoi) }, nuoc: { chiSoCu: Number(row.nuocCu), chiSoMoi: Number(row.nuocMoi) } }
    })
    if (!items.length) return setError('Nhập ít nhất một phòng trước khi lưu hàng loạt.')
    setSaving(true); setError(''); setSuccess('')
    try {
      const response = await api.post('/chi-so-dien-nuoc/nhap-hang-loat', { ...period, items })
      setSuccess(response.message || `Đã nhập chỉ số cho ${items.length} phòng.`)
      setBulkRows(Object.fromEntries(rooms.map((room) => [idOf(room), { ...INITIAL }])))
      await load()
    } catch (saveError) { setError(errorMessage(saveError, 'Không thể nhập hàng loạt.')) }
    finally { setSaving(false) }
  }

  return <section className="page">
    <PageHeader title="Chỉ số điện nước" description="Ghi nhận công tơ theo kỳ; đơn giá và tiền bậc thang được tính tại backend từ cấu hình trong Atlas." actions={<button className="button" onClick={load}><RotateCcw size={14} /> Tải lại</button>} />
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}
    <div className="toolbar meter-toolbar"><label className="field-label">Kỳ ghi<select className="select" value={`${period.thang}-${period.nam}`} onChange={(event) => { const [thang, nam] = event.target.value.split('-').map(Number); setPeriod({ thang, nam }); setEditingId(''); setRoomId(''); setForm({ ...INITIAL }) }}>{periodOptions(18).map((option) => <option key={`${option.thang}-${option.nam}`} value={`${option.thang}-${option.nam}`}>Tháng {option.thang}/{option.nam}</option>)}</select></label><span className="toolbar-spacer"/><div className="segmented"><button className={!bulk ? 'is-active' : ''} onClick={() => setBulk(false)}><FilePenLine size={14}/> Từng phòng</button><button className={bulk ? 'is-active' : ''} onClick={() => setBulk(true)}><ClipboardList size={14}/> Nhập hàng loạt</button></div></div>
    {roomError && <Notice tone="info">{roomError}</Notice>}
    <section className="panel meter-entry">
      <div className="panel__heading"><div><h2>{bulk ? 'Nhập nhiều phòng' : editingId ? 'Cập nhật chỉ số phòng' : 'Ghi chỉ số phòng'}</h2><p>Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ. Mỗi phòng chỉ ghi một lần trong kỳ.</p></div><span className="meter-heading-icon"><Zap size={17}/></span></div>
      {bulk ? <form className="panel__body" onSubmit={submitBulk}>
        {rooms.length === 0 ? <EmptyState title="Chưa có phòng để nhập" detail="Kết nối API quản lý phòng trọ để tải danh sách phòng thuộc chủ trọ."/> : <>
          <div className="bulk-meter-table"><div className="bulk-meter-head"><span>Phòng</span><span>Điện cũ</span><span>Điện mới</span><span>Nước cũ</span><span>Nước mới</span></div>{rooms.map((room) => { const values = bulkRows[idOf(room)] || INITIAL; return <div className="bulk-meter-row" key={idOf(room)}><b>{roomName(room)}</b>{[['dienCu','Điện cũ'],['dienMoi','Điện mới'],['nuocCu','Nước cũ'],['nuocMoi','Nước mới']].map(([key,label]) => <label className="meter-cell" key={key}><span className="sr-only">{label}</span><input className="field" aria-label={`${roomName(room)} · ${label}`} type="number" min="0" step="any" value={values[key]} onChange={(event) => updateBulk(idOf(room),key,event.target.value)} /></label>)}</div>})}</div>
          <div className="form-actions"><button className="button button--primary" disabled={saving}><Save size={14}/> Lưu chỉ số đã nhập</button><SavingLabel active={saving}/></div>
        </>}
      </form> : <form className="panel__body meter-form" onSubmit={submitSingle}>
        <label className="field-label">Phòng<select className="select" value={roomId} onChange={(event) => selectRoom(event.target.value)} required><option value="">Chọn phòng…</option>{rooms.map((room) => <option key={idOf(room)} value={idOf(room)}>{roomName(room)}{existing.has(idOf(room)) ? ' · đã ghi' : ''}</option>)}</select></label>
        <div className="meter-input-grid"><div className="meter-kind"><span className="meter-kind__title"><Zap size={14}/> Điện (kWh)</span><label className="field-label">Chỉ số cũ<input className="field" type="number" min="0" step="any" required value={form.dienCu} onChange={(event) => updateForm('dienCu',event.target.value)}/></label><label className="field-label">Chỉ số mới<input className="field" type="number" min="0" step="any" required value={form.dienMoi} onChange={(event) => updateForm('dienMoi',event.target.value)}/></label></div><div className="meter-kind meter-kind--water"><span className="meter-kind__title">Nước (m³)</span><label className="field-label">Chỉ số cũ<input className="field" type="number" min="0" step="any" required value={form.nuocCu} onChange={(event) => updateForm('nuocCu',event.target.value)}/></label><label className="field-label">Chỉ số mới<input className="field" type="number" min="0" step="any" required value={form.nuocMoi} onChange={(event) => updateForm('nuocMoi',event.target.value)}/></label></div></div>
        <label className="field-label">Ghi chú<textarea className="textarea" maxLength={1000} value={form.ghiChu} onChange={(event) => updateForm('ghiChu',event.target.value)} placeholder="Ghi chú tình trạng đồng hồ…"/></label>
        <div className="form-actions"><button className="button button--primary" disabled={saving || !rooms.length}><Save size={14}/>{editingId ? 'Cập nhật chỉ số' : 'Lưu chỉ số'}</button><SavingLabel active={saving}/></div>
      </form>}
    </section>
    <section className="panel meter-history"><div className="panel__heading"><div><h2>Lịch sử kỳ {period.thang}/{period.nam}</h2><p>{records.length} phòng đã ghi nhận</p></div></div><div className="panel__body--flush">{loading ? <LoadingRows columns={7}/> : records.length === 0 ? <EmptyState title="Chưa có chỉ số trong kỳ" detail="Các bản ghi đã lưu trên MongoDB Atlas sẽ xuất hiện tại đây."/> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Phòng</th><th>Điện tiêu thụ</th><th>Tiền điện</th><th>Nước tiêu thụ</th><th>Tiền nước</th><th>Ngày ghi</th><th></th></tr></thead><tbody>{records.map((record) => <tr key={record._id}><td><div className="cell-title">{roomName(rooms.find((room) => idOf(room) === String(record.phongTroId)) || record.phong || { _id: record.phongTroId })}</div></td><td>{formatNumber(record.dien?.tieuThu,2)} kWh</td><td className="numeric">{formatMoney(record.dien?.thanhTien)}</td><td>{formatNumber(record.nuoc?.tieuThu,2)} m³</td><td className="numeric">{formatMoney(record.nuoc?.thanhTien)}</td><td>{formatDate(record.ngayGhi)}</td><td><button className="button button--small" onClick={() => { selectRoom(String(record.phongTroId)); document.querySelector('.meter-entry')?.scrollIntoView({behavior:'smooth',block:'start'}) }}><FilePenLine size={13}/> Sửa</button></td></tr>)}</tbody></table></div>}</div></section>
  </section>
}
