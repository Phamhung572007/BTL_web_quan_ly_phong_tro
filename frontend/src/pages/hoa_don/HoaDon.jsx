import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Banknote, FilePlus2, RotateCcw, Sparkles } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, SavingLabel, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatDate, formatMoney, idOf, periodOptions } from '../../utils/format.js'

const now = new Date()
function roomName(invoice) { return invoice?.phong?.soPhong || invoice?.phong?.tenPhong || `Phòng ${String(invoice?.phongTroId || '').slice(-5)}` }

function InvoiceDetail({ invoice, busy, draft, onDraft, onPayment }) {
  const due = Math.max(0, Number(invoice.tongTien || 0) - Number(invoice.daThanhToan || 0))
  const charges = [
    { label: 'Tiền phòng', amount: invoice.tienPhong },
    { label: `Điện · ${invoice.chiTietDien?.tieuThu || 0} kWh`, amount: invoice.tienDien },
    { label: `Nước · ${invoice.chiTietNuoc?.tieuThu || 0} m³`, amount: invoice.tienNuoc },
    ...(invoice.cacKhoanThu || []).map((charge) => ({ label: `${charge.tenDichVu} · ${charge.soLuong} ${charge.donViTinh || ''}`, amount: charge.thanhTien })),
  ]
  return <>
    <div className="invoice-summary"><div><span>Tổng cộng</span><b>{formatMoney(invoice.tongTien)}</b></div><div><span>Đã thu</span><b className="text-green">{formatMoney(invoice.daThanhToan)}</b></div><div><span>Còn phải thu</span><b className="text-orange">{formatMoney(due)}</b></div></div>
    <div className="invoice-detail-grid"><section className="panel"><div className="panel__heading"><div><h2>Chi tiết khoản thu</h2><p>{roomName(invoice)} · tháng {invoice.thang}/{invoice.nam} · hạn {formatDate(invoice.hanThanhToan)}</p></div><Status value={invoice.trangThai}/></div><div className="invoice-charge-list">{charges.map((charge,index) => <div className="invoice-charge" key={`${charge.label}-${index}`}><span>{charge.label}</span><b>{formatMoney(charge.amount)}</b></div>)}{Number(invoice.giamTru) > 0 && <div className="invoice-charge invoice-charge--discount"><span>Giảm trừ</span><b>− {formatMoney(invoice.giamTru)}</b></div>}<div className="invoice-charge invoice-charge--total"><span>Tổng hóa đơn</span><b>{formatMoney(invoice.tongTien)}</b></div></div></section>
      <section className="panel"><div className="panel__heading"><div><h2>Lịch sử thanh toán</h2><p>{invoice.lichSuThanhToan?.length || 0} giao dịch</p></div></div><div className="invoice-payment-list">{invoice.lichSuThanhToan?.length ? invoice.lichSuThanhToan.map((payment) => <div className="invoice-payment" key={payment._id}><span><b>{formatDate(payment.thanhToanLuc,{day:'2-digit',month:'short',year:'numeric'})}</b><small>{String(payment.phuongThuc || 'KHAC').replaceAll('_',' ').toLowerCase()}</small></span><strong>{formatMoney(payment.soTien)}</strong></div>) : <EmptyState title="Chưa có thanh toán" detail="Ghi nhận thanh toán để lưu giao dịch vào Atlas."/>}</div>{due > 0 && <div className="invoice-payment-entry"><label className="field-label">Số tiền nhận<input className="field" type="number" min="1" max={due} value={draft || due} onChange={(event) => onDraft(event.target.value)}/></label><button className="button button--primary" disabled={busy} onClick={() => onPayment(invoice)}><Banknote size={14}/> Ghi nhận</button></div>}</section></div>
  </>
}

export default function HoaDon() {
  const { id: detailId } = useParams()
  const [searchParams] = useSearchParams()
  const roomFilter = searchParams.get('phongTroId') || ''
  const [items, setItems] = useState([])
  const [rooms, setRooms] = useState([])
  const [period, setPeriod] = useState({ thang: now.getMonth() + 1, nam: now.getFullYear() })
  const [status, setStatus] = useState('')
  const [roomId, setRoomId] = useState('')
  const [paymentDraft, setPaymentDraft] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roomError, setRoomError] = useState('')

  async function load() {
    setLoading(true); setError('')
    const params = new URLSearchParams({ ...period, limit: '100' })
    if (status) params.set('trangThai', status)
    if (roomFilter) params.set('phongTroId', roomFilter)
    const [invoiceResult, roomResult] = await Promise.allSettled([api.get(detailId ? `/hoa-don/${detailId}` : `/hoa-don?${params}`), api.get('/phong-tro?limit=100')])
    if (invoiceResult.status === 'fulfilled') setItems(detailId ? [invoiceResult.value.data].filter(Boolean) : invoiceResult.value.data || [])
    else setError(errorMessage(invoiceResult.reason, 'Không thể tải hóa đơn.'))
    if (roomResult.status === 'fulfilled') { setRooms(roomResult.value.data || []); setRoomError('') }
    else setRoomError('Danh sách phòng chưa khả dụng. Có thể tạo hóa đơn hàng loạt cho các phòng đang thuê qua API.')
    setLoading(false)
  }
  useEffect(() => { load() }, [period.thang, period.nam, status, detailId, roomFilter])

  const totals = useMemo(() => items.reduce((acc, invoice) => ({
    total: acc.total + Number(invoice.tongTien || 0), paid: acc.paid + Number(invoice.daThanhToan || 0), debt: acc.debt + Math.max(0, Number(invoice.tongTien || 0) - Number(invoice.daThanhToan || 0)),
  }), { total: 0, paid: 0, debt: 0 }), [items])

  async function createBulk() {
    if (!window.confirm(`Tạo hóa đơn kỳ ${period.thang}/${period.nam} cho các phòng đang thuê? Phòng đã có hóa đơn sẽ được bỏ qua.`)) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const response = await api.post('/hoa-don/tao-tu-dong', period)
      const created = response.meta?.created ?? response.data?.filter((row) => row.trangThai === 'DA_TAO').length
      setSuccess(response.message || `Đã tạo ${created || 0} hóa đơn.`)
      await load()
    } catch (saveError) { setError(errorMessage(saveError, 'Không thể tạo hóa đơn tự động.')) }
    finally { setSaving(false) }
  }

  async function createOne(event) {
    event.preventDefault()
    if (!roomId) return setError('Chọn một phòng trước khi lập hóa đơn.')
    setSaving(true); setError(''); setSuccess('')
    try {
      await api.post('/hoa-don/tao-moi', { phongTroId: roomId, ...period })
      setSuccess('Đã tạo hóa đơn cho phòng.')
      await load()
    } catch (saveError) { setError(errorMessage(saveError, 'Không thể tạo hóa đơn.')) }
    finally { setSaving(false) }
  }

  async function receivePayment(invoice) {
    const due = Math.max(0, Number(invoice.tongTien || 0) - Number(invoice.daThanhToan || 0))
    const raw = paymentDraft[invoice._id] || String(due)
    const amount = Number(raw)
    if (!amount || amount > due) return setError(`Số tiền cần lớn hơn 0 và không vượt quá ${formatMoney(due)}.`)
    setSaving(true); setError(''); setSuccess('')
    try {
      await api.patch(`/hoa-don/${invoice._id}/thanh-toan`, { soTien: amount, phuongThuc: 'TIEN_MAT' })
      setSuccess(`Đã ghi nhận thanh toán ${formatMoney(amount)} cho ${roomName(invoice)}.`)
      await load()
    } catch (saveError) { setError(errorMessage(saveError, 'Không thể cập nhật thanh toán.')) }
    finally { setSaving(false) }
  }

  return <section className="page">
    <PageHeader title={detailId ? 'Chi tiết hóa đơn' : 'Hóa đơn tháng'} description={detailId ? 'Xem khoản thu đã chụp và các giao dịch thanh toán.' : 'Tạo hóa đơn từ tiền phòng, chỉ số và đơn giá đã chụp trong kỳ; theo dõi thanh toán từ dữ liệu Atlas.'} actions={detailId ? <Link className="button" to="/hoa-don"><ArrowLeft size={14}/> Danh sách hóa đơn</Link> : <><button className="button" onClick={load}><RotateCcw size={14}/> Tải lại</button><button className="button button--warm" onClick={createBulk} disabled={saving}><Sparkles size={14}/> Tạo hóa đơn hàng loạt</button></>} />
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success" onClose={() => setSuccess('')}>{success}</Notice>}{!detailId && roomError && <Notice tone="info">{roomError}</Notice>}
    {detailId ? (loading ? <div className="panel"><LoadingRows columns={4}/></div> : items[0] ? <InvoiceDetail invoice={items[0]} busy={saving} draft={paymentDraft[items[0]._id]} onDraft={(value) => setPaymentDraft((current) => ({...current,[items[0]._id]:value}))} onPayment={receivePayment}/> : <EmptyState title="Không tìm thấy hóa đơn" detail="Hóa đơn có thể đã bị xóa hoặc bạn không có quyền xem."/>) : <>
    <div className="invoice-summary"><div><span>Tổng hóa đơn kỳ</span><b>{formatMoney(totals.total)}</b></div><div><span>Đã thu</span><b className="text-green">{formatMoney(totals.paid)}</b></div><div><span>Còn phải thu</span><b className="text-orange">{formatMoney(totals.debt)}</b></div></div>
    <section className="panel invoice-create"><div className="panel__heading"><div><h2>Lập hóa đơn cho một phòng</h2><p>Hóa đơn chỉ được tạo khi phòng có hợp đồng và dữ liệu cần thiết.</p></div><FilePlus2 size={17}/></div><form className="panel__body invoice-create__form" onSubmit={createOne}><label className="field-label">Kỳ hóa đơn<select className="select" value={`${period.thang}-${period.nam}`} onChange={(event) => { const [thang, nam] = event.target.value.split('-').map(Number); setPeriod({ thang, nam }) }}>{periodOptions(18).map((option) => <option key={`${option.thang}-${option.nam}`} value={`${option.thang}-${option.nam}`}>Tháng {option.thang}/{option.nam}</option>)}</select></label><label className="field-label">Phòng<select className="select" value={roomId} onChange={(event) => setRoomId(event.target.value)}><option value="">Chọn phòng…</option>{rooms.map((room) => <option key={idOf(room)} value={idOf(room)}>{room.soPhong || room.tenPhong || `Phòng ${idOf(room).slice(-5)}`}</option>)}</select></label><button className="button button--primary" disabled={saving || !rooms.length}><FilePlus2 size={14}/> Tạo hóa đơn</button><SavingLabel active={saving}/></form></section>
    <div className="toolbar invoice-toolbar"><label className="field-label">Trạng thái<select className="select filter-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả</option><option value="CHUA_THANH_TOAN">Chưa thanh toán</option><option value="THANH_TOAN_MOT_PHAN">Thanh toán một phần</option><option value="DA_THANH_TOAN">Đã thanh toán</option><option value="QUA_HAN">Quá hạn</option></select></label><span className="toolbar-spacer"/><span className="toolbar-count">{items.length} hóa đơn</span></div>
    <section className="panel"><div className="panel__heading"><div><h2>Danh sách hóa đơn</h2><p>Kỳ {period.thang}/{period.nam} · thanh toán có thể ghi toàn phần hoặc một phần.</p></div></div><div className="panel__body--flush">{loading ? <LoadingRows columns={7}/> : items.length === 0 ? <EmptyState title="Chưa có hóa đơn trong kỳ" detail="Tạo một hóa đơn cho phòng hoặc phát hành hàng loạt cho các phòng đang thuê." action={<button className="button button--primary" onClick={createBulk}><Sparkles size={13}/> Tạo hóa đơn hàng loạt</button>}/> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Phòng</th><th>Kỳ</th><th>Hạn thanh toán</th><th>Tổng tiền</th><th>Đã thanh toán</th><th>Còn nợ</th><th>Trạng thái</th><th>Ghi nhận thu</th></tr></thead><tbody>{items.map((invoice) => { const due = Math.max(0, Number(invoice.tongTien || 0) - Number(invoice.daThanhToan || 0)); return <tr key={invoice._id}><td><div className="cell-title">{roomName(invoice)}</div></td><td>{invoice.thang}/{invoice.nam}</td><td>{formatDate(invoice.hanThanhToan)}</td><td className="numeric">{formatMoney(invoice.tongTien)}</td><td className="numeric">{formatMoney(invoice.daThanhToan)}</td><td className="numeric">{formatMoney(due)}</td><td><Status value={invoice.trangThai}/></td><td>{due > 0 ? <div className="payment-action"><input className="field" type="number" min="1" max={due} value={paymentDraft[invoice._id] ?? due} onChange={(event) => setPaymentDraft((current) => ({ ...current, [invoice._id]: event.target.value }))} aria-label={`Số tiền nhận của ${roomName(invoice)}`}/><button className="button button--small button--primary" disabled={saving} onClick={() => receivePayment(invoice)}><Banknote size={13}/> Thu</button></div> : <span className="text-green">Đã thu đủ</span>}</td></tr> })}</tbody></table></div>}</div></section>
    </>}
  </section>
}
