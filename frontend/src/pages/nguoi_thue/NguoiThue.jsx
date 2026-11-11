import './NguoiThue.css'

function NguoiThue() {
  return (
    <main className="nguoi-thue-page">
      <header className="nguoi-thue-page__header">
        <p className="nguoi-thue-page__eyebrow">Quản lý nhà trọ</p>
        <h1>Người thuê</h1>
        <p>Quản lý hồ sơ, thông tin liên hệ và phòng đang thuê.</p>
      </header>

      <section className="nguoi-thue-page__content" aria-label="Nội dung người thuê">
        {/* TODO: Thêm danh sách người thuê, tìm kiếm và biểu mẫu hồ sơ. */}
      </section>
    </main>
  )
}

export default NguoiThue
