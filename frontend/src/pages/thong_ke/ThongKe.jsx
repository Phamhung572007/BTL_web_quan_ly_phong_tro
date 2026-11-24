import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownRight, ArrowRight, CalendarRange, DoorOpen, Gauge, ReceiptText, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'
import { EmptyState, LoadingRows, Notice, PageHeader, Status } from '../../components/WorkspaceUI.jsx'
import { errorMessage, formatMoney, formatNumber } from '../../utils/format.js'

const monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12']

function RevenueChart({ rows = [] }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.doanhThu) || 0))
  const hasRevenue = rows.some((row) => Number(row.doanhThu) > 0)
  if (!hasRevenue) return <EmptyState title="Chưa có khoản thu trong năm này" detail="Doanh thu sẽ xuất hiện tại đây sau khi chủ trọ ghi nhận thanh toán hóa đơn." />
  return <div className="revenue-chart" role="img" aria-label="Biểu đồ doanh thu theo 12 tháng"><div className="chart-y-labels"><span>{formatMoney(max)}</span><span>{formatMoney(max / 2)}</span><span>0 ₫</span></div><div className="chart-plot"><div className="chart-grid"><i /><i /><i /></div><div className="chart-bars">{monthNames.map((label,index) => { const value = Number(rows.find((row) => Number(row.thang) === index + 1)?.doanhThu) || 0; return <div className="chart-column" key={label} title={`${label}: ${formatMoney(value)}`}><div className="chart-bar-track"><div className="chart-bar" style={{ height: `${Math.max(value ? 5 : 0,(value / max) * 100)}%` }}/></div><span>{label}</span></div> })}</div></div></div>
}

function roomLabel(room) {
  return room?.phong?.soPhong || room?.phong?.tenPhong || `Phòng ${String(room?.phongTroId || '').slice(-5)}`
}

function MobileRoomRow({ room, selected, onSelect }) {
  const reading = room.chiSoDienNuoc
  const tenants = room.nguoiThue || []
  return (
    <button
      type="button"
      className={`room-desk__mobile-room${selected ? ' is-selected' : ''}`}
      aria-label={`${roomLabel(room)}. Người thuê: ${tenants.length ? tenants.join(', ') : 'chưa có người thuê'}. ${reading ? `Chỉ số gần nhất tháng ${reading.thang}/${reading.nam}: điện ${formatNumber(reading.dien?.tieuThu, 1)} kWh, nước ${formatNumber(reading.nuoc?.tieuThu, 1)} m³.` : 'Chưa ghi điện nước.'} ${room.soHoaDonConNo || 0} hóa đơn nợ. Công nợ ${formatMoney(room.tongCongNo)}. Mở chi tiết phòng.`}
      aria-pressed={selected}
      aria-haspopup="dialog"
      onClick={(event) => onSelect(room, event.currentTarget)}
    >
      <span className="room-desk__mobile-main">
        <span className="room-desk__mobile-title"><b>{roomLabel(room)}</b><Status value={room.phong?.tinhTrang} /></span>
        <span className="room-desk__mobile-tenant">{tenants.length ? tenants.join(', ') : 'Chưa có người thuê'}</span>
        <span className="room-desk__mobile-reading">{reading ? `Đ ${formatNumber(reading.dien?.tieuThu, 1)} kWh · N ${formatNumber(reading.nuoc?.tieuThu, 1)} m³` : 'Chưa ghi điện nước'}</span>
      </span>
      <span className="room-desk__mobile-debt"><small>{room.soHoaDonConNo || 0} hóa đơn nợ</small><b>{formatMoney(room.tongCongNo)}</b></span>
      <ArrowRight size={15} aria-hidden="true" />
    </button>
  )
}

function RoomDetail({ room, narrow, closeButtonRef, panelRef, onClose }) {
  if (!room) return null
  return (
    <>
      {narrow && <button className="room-desk__scrim" type="button" aria-label="Đóng chi tiết phòng" onClick={onClose} />}
      <aside
        className={`room-desk__detail${narrow ? ' room-desk__detail--narrow' : ''}${narrow && room ? ' is-mobile-open' : ''}`}
        ref={panelRef}
        role={narrow ? 'dialog' : 'region'}
        aria-modal={narrow ? 'true' : undefined}
        aria-labelledby="room-detail-title"
      >
        <div className="room-desk__detail-head">
          <div><h3 id="room-detail-title">{roomLabel(room)}</h3><p>{room.tenDay || 'Dãy trọ'} · {room.phong?.tinhTrang ? room.phong.tinhTrang.replaceAll('_', ' ').toLowerCase() : 'Chưa cập nhật trạng thái'}</p></div>
          <span className="room-desk__detail-controls">
            <DoorOpen size={18} color="#2563d9" aria-hidden="true" />
            {narrow && <button ref={closeButtonRef} className="icon-button room-desk__detail-close" type="button" aria-label="Đóng chi tiết phòng" onClick={onClose}><X size={18} /></button>}
          </span>
        </div>
        <div className="room-desk__context">
          <div><span>Người thuê</span><b>{room.nguoiThue?.length ? room.nguoiThue.join(', ') : 'Chưa có người thuê đang ở'}</b></div>
          <div><span>Chỉ số gần nhất</span><b>{room.chiSoDienNuoc ? `Tháng ${room.chiSoDienNuoc.thang}/${room.chiSoDienNuoc.nam} · Điện ${formatNumber(room.chiSoDienNuoc.dien?.tieuThu, 1)} kWh · Nước ${formatNumber(room.chiSoDienNuoc.nuoc?.tieuThu, 1)} m³` : 'Chưa có bản ghi điện nước'}</b></div>
        </div>
        <div className="room-desk__invoices">
          {room.hoaDons?.length ? room.hoaDons.map((invoice) => <div className="room-desk__invoice" key={invoice._id}><span><b>Tháng {invoice.thang}/{invoice.nam}</b><small>Hạn {invoice.hanThanhToan ? new Date(invoice.hanThanhToan).toLocaleDateString('vi-VN') : '—'}</small></span><span className="room-desk__invoice-right"><Status value={invoice.trangThai}/><b>{formatMoney(invoice.conNo)}</b></span></div>) : <p className="room-desk__no-invoices">Không có hóa đơn đang còn nợ.</p>}
        </div>
        <div className="room-desk__actions"><Link className="button button--primary" to={`/hoa-don?phongTroId=${room.phongTroId}`}><ReceiptText size={14}/> Mở hóa đơn</Link><Link className="button" to={`/dien-nuoc?phongTroId=${room.phongTroId}`}><Gauge size={14}/> Chỉ số phòng</Link></div>
      </aside>
    </>
  )
}

export default function ThongKe() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [debts, setDebts] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const detailCloseRef = useRef(null)
  const detailPanelRef = useRef(null)
  const lastRoomTriggerRef = useRef(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setIsNarrow(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!mobileDetailOpen || !isNarrow) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileDetailOpen(false)
      if (event.key === 'Tab') {
        const focusable = detailPanelRef.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    detailCloseRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
      lastRoomTriggerRef.current?.focus()
    }
  }, [mobileDetailOpen, isNarrow])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const results = await Promise.allSettled([api.get('/thong-ke/tong-quan'),api.get(`/thong-ke/doanh-thu?nam=${year}`),api.get('/thong-ke/dieu-phoi-phong?limit=100')])
    if (results[0].status === 'fulfilled') setSummary(results[0].value.data)
    if (results[1].status === 'fulfilled') setRevenue(results[1].value.data || [])
    if (results[2].status === 'fulfilled') setDebts(results[2].value.data || [])
    const failure = results.find((result) => result.status === 'rejected')
    if (failure) setError(errorMessage(failure.reason,'Không thể tải một phần dữ liệu thống kê.'))
    setLoading(false)
  },[year])
  useEffect(() => { load() },[load])

  const occupancy = useMemo(() => summary?.tongSoPhong ? Math.round((summary.phongDangThue / summary.tongSoPhong) * 100) : 0,[summary])
  const buildings = useMemo(() => {
    const found = new Map()
    for (const room of debts) {
      const id = String(room.phong?.dayTroId?._id || room.phong?.dayTroId || '')
      if (id && !found.has(id)) found.set(id,room.tenDay || room.phong?.dayTro?.tenDay || `Dãy · ${id.slice(-5)}`)
    }
    return Array.from(found,([id,label]) => ({id,label}))
  },[debts])
  const filteredDebts = useMemo(() => debts.filter((room) => {
    const name = `${roomLabel(room)} ${room.phongTroId}`.toLowerCase()
    const dayId = String(room.phong?.dayTroId?._id || room.phong?.dayTroId || '')
    return name.includes(roomSearch.trim().toLowerCase()) && (!buildingFilter || dayId === buildingFilter)
  }).sort((a,b) => (Number(b.tongCongNo || 0) - Number(a.tongCongNo || 0)) || roomLabel(a).localeCompare(roomLabel(b),'vi')),[debts,roomSearch,buildingFilter])
  const selectedRoom = useMemo(() => filteredDebts.find((room) => String(room.phongTroId) === selectedRoomId) || filteredDebts[0] || null,[filteredDebts,selectedRoomId])

  return <section className="page">
    <PageHeader title="Bàn điều phối chủ trọ" description="Tìm phòng, xem người thuê, chỉ số gần nhất và công nợ rồi mở tác vụ tiếp theo ngay tại đây." />
    {error && <Notice>{error}</Notice>}
    <div className="room-desk-toolbar"><label className="field-label">Dãy trọ<select className="select" value={buildingFilter} onChange={(event) => setBuildingFilter(event.target.value)}><option value="">Tất cả dãy</option>{buildings.map((building) => <option key={building.id} value={building.id}>{building.label}</option>)}</select></label><div className="search-field"><Search size={15}/><input className="field" value={roomSearch} onChange={(event) => setRoomSearch(event.target.value)} placeholder="Tìm số phòng hoặc mã phòng" aria-label="Tìm số phòng hoặc mã phòng"/></div><span className="toolbar-spacer"/><Link className="button button--warm dashboard-primary-action" to="/dien-nuoc"><Gauge size={14}/> Ghi chỉ số điện nước</Link></div>
    <div className="overview-strip" aria-label="Chỉ số tổng quan"><div className="overview-stat"><span>Tỷ lệ lấp đầy</span><strong>{summary ? `${occupancy}%` : '—'}</strong><small>{summary ? `${summary.phongDangThue} / ${summary.tongSoPhong} phòng đang thuê` : 'Đang tải từ dữ liệu chủ trọ'}</small></div><div className="overview-stat"><span>Đã thu tháng này</span><strong>{summary ? formatMoney(summary.doanhThuThangNay) : '—'}</strong><small>Giao dịch đã ghi nhận</small></div><div className="overview-stat"><span>Công nợ còn lại</span><strong>{summary ? formatMoney(summary.tongCongNo) : '—'}</strong><small>{summary?.hoaDonConNo || 0} hóa đơn còn nợ</small></div><div className="overview-stat"><span>Lịch xem chờ duyệt</span><strong>{summary?.lichXemChoDuyet ?? '—'}</strong><small>Yêu cầu mới</small></div></div>
    <section className="panel debt-panel">
      <div className="panel__heading"><div><h2>Theo dõi theo phòng</h2><p>Chọn một phòng để xem người thuê, chỉ số, hóa đơn và công nợ cùng chỗ</p></div><Link className="text-link" to="/hoa-don">Toàn bộ hóa đơn <ArrowRight size={14}/></Link></div>
      {loading && debts.length === 0 ? <div className="panel__body--flush"><LoadingRows columns={5} rows={5}/></div> : filteredDebts.length === 0 ? <EmptyState title={debts.length ? 'Không tìm thấy phòng' : 'Chưa có phòng trong hệ thống'} detail={debts.length ? 'Thử tìm theo mã phòng hoặc chọn dãy khác.' : 'Các phòng thuộc chủ trọ sẽ xuất hiện tại đây khi dữ liệu Atlas được kết nối.'}/> : <div className="room-desk">
        <div className="room-desk__list"><div className="table-wrap"><table className="data-table room-desk__table"><thead><tr><th>Phòng</th><th>Người thuê</th><th>Chỉ số gần nhất</th><th>Hóa đơn nợ</th><th>Còn nợ</th></tr></thead><tbody>{filteredDebts.slice(0,12).map((room) => { const selected = String(selectedRoom?.phongTroId) === String(room.phongTroId); const buildingId = String(room.phong?.dayTroId?._id || room.phong?.dayTroId || ''); const reading = room.chiSoDienNuoc; const tenantNames = room.nguoiThue || []; return <tr key={room.phongTroId} tabIndex={0} role="button" aria-selected={selected} className={selected ? 'is-selected' : ''} onClick={() => setSelectedRoomId(String(room.phongTroId))} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedRoomId(String(room.phongTroId)) } }}><td><div className="cell-title">{roomLabel(room)} <Status value={room.phong?.tinhTrang}/></div><div className="cell-subtitle">{room.tenDay || (buildingId ? `Dãy · ${buildingId.slice(-5)}` : `Mã ${String(room.phongTroId).slice(-6)}`)}</div></td><td>{tenantNames.length ? tenantNames[0] : '—'}{tenantNames.length > 1 && <div className="cell-subtitle">+{tenantNames.length - 1} người</div>}</td><td>{reading ? <><div>{reading.thang}/{reading.nam}</div><div className="cell-subtitle">Đ {formatNumber(reading.dien?.tieuThu,1)} · N {formatNumber(reading.nuoc?.tieuThu,1)}</div></> : 'Chưa ghi'}</td><td>{room.soHoaDonConNo}</td><td className="numeric"><b>{formatMoney(room.tongCongNo)}</b></td></tr> })}</tbody></table></div></div>
        <div className="room-desk__mobile-list" aria-label="Danh sách phòng">{filteredDebts.slice(0,12).map((room) => <MobileRoomRow key={room.phongTroId} room={room} selected={String(selectedRoom?.phongTroId) === String(room.phongTroId)} onSelect={(nextRoom, trigger) => { setSelectedRoomId(String(nextRoom.phongTroId)); lastRoomTriggerRef.current = trigger; setMobileDetailOpen(true) }} />)}</div>
        <RoomDetail room={selectedRoom} narrow={isNarrow && mobileDetailOpen} closeButtonRef={detailCloseRef} panelRef={detailPanelRef} onClose={() => setMobileDetailOpen(false)} />
      </div>}
      <div className="dashboard-footnote"><ArrowDownRight size={13}/> Số liệu lấy từ hóa đơn và lịch sử thanh toán trong MongoDB Atlas.</div>
    </section>
    <div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel__heading"><div><h2>Doanh thu 12 tháng</h2><p>Tiền thực thu theo lịch sử thanh toán</p></div><div className="revenue-panel__controls"><span className="revenue-total">{formatMoney(revenue.reduce((total,row) => total + (Number(row.doanhThu) || 0),0))}</span><select className="select stats-year" value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Chọn năm thống kê">{[year,year-1,year-2].map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="button button--small" onClick={load} aria-label="Làm mới thống kê"><CalendarRange size={14}/></button></div></div><div className="panel__body"><RevenueChart rows={revenue}/></div></section>
      <section className="panel occupancy-panel"><div className="panel__heading"><div><h2>Tình trạng phòng</h2><p>Tổng số phòng thuộc quyền quản lý</p></div><DoorOpen size={17} color="#2563d9"/></div><div className="occupancy-body"><div className="occupancy-count"><strong>{summary?.phongDangThue ?? '—'}</strong><span>đang thuê</span></div><div className="occupancy-bar" role="img" aria-label={`${occupancy}% phòng đang thuê`}><i style={{width:`${occupancy}%`}}/></div><div className="occupancy-legend"><span><i className="legend-dot legend-dot--blue"/> Đang thuê <b>{summary?.phongDangThue ?? '—'}</b></span><span><i className="legend-dot legend-dot--empty"/> Còn trống <b>{summary?.phongTrong ?? '—'}</b></span><span><i className="legend-dot legend-dot--amber"/> Bảo trì <b>{summary?.phongBaoTri ?? '—'}</b></span></div></div></section></div>
  </section>
}
