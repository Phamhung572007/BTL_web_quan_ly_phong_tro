import './SuaChua.css'

function SuaChua() {
  return (
    <main className="sua-chua-page">
      <header className="sua-chua-page__header">
        <p className="sua-chua-page__eyebrow">Quản lý nhà trọ</p>
        <h1>Yêu cầu sửa chữa</h1>
        <p>Tiếp nhận sự cố và theo dõi tiến độ xử lý yêu cầu sửa chữa.</p>
      </header>

      <section className="sua-chua-page__content" aria-label="Nội dung sửa chữa">
        {/* TODO: Thêm danh sách yêu cầu, bộ lọc trạng thái và cập nhật tiến độ. */}
      </section>
    </main>
  )
}

export default SuaChua
