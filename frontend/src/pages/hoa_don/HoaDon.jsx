import './HoaDon.css'

function HoaDon() {
  return (
    <main className="hoa-don-page">
      <header className="hoa-don-page__header">
        <p className="hoa-don-page__eyebrow">Quản lý nhà trọ</p>
        <h1>Hóa đơn</h1>
        <p>Tạo hóa đơn hàng tháng và theo dõi tình trạng thanh toán.</p>
      </header>
      <section className="hoa-don-page__content" aria-label="Nội dung hóa đơn" />
    </main>
  )
}

export default HoaDon
