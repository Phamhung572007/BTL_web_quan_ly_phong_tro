import './DienNuoc.css'

function DienNuoc() {
  return (
    <main className="dien-nuoc-page">
      <header className="dien-nuoc-page__header">
        <p className="dien-nuoc-page__eyebrow">Quản lý nhà trọ</p>
        <h1>Điện nước</h1>
        <p>Ghi nhận chỉ số điện, nước và theo dõi mức tiêu thụ theo kỳ.</p>
      </header>
      <section className="dien-nuoc-page__content" aria-label="Nội dung điện nước" />
    </main>
  )
}

export default DienNuoc
