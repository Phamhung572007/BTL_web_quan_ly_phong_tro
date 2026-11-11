import './ThongKe.css'

function ThongKe() {
  return (
    <main className="thong-ke-page">
      <header className="thong-ke-page__header">
        <p className="thong-ke-page__eyebrow">Quản lý nhà trọ</p>
        <h1>Thống kê</h1>
        <p>Theo dõi doanh thu, công nợ và tình hình sử dụng phòng.</p>
      </header>
      <section className="thong-ke-page__content" aria-label="Nội dung thống kê" />
    </main>
  )
}

export default ThongKe
