import './HopDong.css'

function HopDong() {
  return (
    <main className="hop-dong-page">
      <header className="hop-dong-page__header">
        <p className="hop-dong-page__eyebrow">Quản lý nhà trọ</p>
        <h1>Hợp đồng</h1>
        <p>Lập mới, theo dõi thời hạn và quản lý hợp đồng thuê phòng.</p>
      </header>
      <section className="hop-dong-page__content" aria-label="Nội dung hợp đồng" />
    </main>
  )
}

export default HopDong
