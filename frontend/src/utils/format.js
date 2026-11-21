const currency = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

export function formatMoney(value) {
  return `${currency.format(Number(value) || 0)} ₫`
}

export function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits }).format(Number(value) || 0)
}

export function formatDate(value, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', options).format(date)
}

export function monthYearLabel(month, year) {
  return `Tháng ${Number(month) || 0}/${Number(year) || 0}`
}

export function idOf(value) {
  return String(value?._id || value?.id || value || '')
}

export function errorMessage(error, fallback = 'Chưa thể tải dữ liệu. Vui lòng thử lại.') {
  return error?.response?.data?.message || error?.message || fallback
}

export function statusTone(value) {
  const status = String(value || '').toUpperCase()
  if (['DA_THANH_TOAN', 'DA_DUYET', 'DA_XAC_NHAN', 'DA_DANG', 'DA_HOAN_TAT', 'HOAT_DONG'].includes(status)) return 'green'
  if (['QUA_HAN', 'TU_CHOI', 'DA_HUY', 'HUY', 'DA_AN'].includes(status)) return 'red'
  if (['CHO_XAC_NHAN', 'CHO_DUYET', 'DE_XUAT_DOI_LICH', 'THANH_TOAN_MOT_PHAN'].includes(status)) return 'amber'
  if (['CHUA_THANH_TOAN', 'NHAP', 'DANG_XU_LY', 'CHO_GHI'].includes(status)) return 'blue'
  return 'gray'
}

export function statusLabel(value) {
  const labels = {
    DA_THANH_TOAN: 'Đã thanh toán', CHUA_THANH_TOAN: 'Chưa thanh toán',
    THANH_TOAN_MOT_PHAN: 'Thanh toán một phần', QUA_HAN: 'Quá hạn', HUY: 'Đã hủy',
    CHO_XAC_NHAN: 'Chờ xác nhận', DA_DUYET: 'Đã duyệt', DA_XAC_NHAN: 'Đã xác nhận',
    DE_XUAT_DOI_LICH: 'Đề xuất đổi lịch', DA_HOAN_TAT: 'Hoàn tất', TU_CHOI: 'Từ chối',
    CHO_DUYET: 'Chờ duyệt', DA_DANG: 'Đang đăng', DA_AN: 'Đã ẩn', NHAP: 'Bản nháp',
    DANG_THUE: 'Đang thuê', TRONG: 'Còn trống', BAO_TRI: 'Bảo trì',
  }
  return labels[String(value || '').toUpperCase()] || String(value || 'Chưa cập nhật').replaceAll('_', ' ').toLowerCase()
}

export function periodOptions(count = 12) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return { thang: date.getMonth() + 1, nam: date.getFullYear() }
  })
}
