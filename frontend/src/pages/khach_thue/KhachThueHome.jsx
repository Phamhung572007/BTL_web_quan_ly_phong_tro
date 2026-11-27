import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, FileText, MessageSquareText,
  ReceiptText, Search, Star, Users, Wrench,
} from 'lucide-react'
import { PageHeader } from '../../components/WorkspaceUI.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import api from '../../services/api.js'
import { layHoSoOGhepCuaToiApi } from '../../services/o_ghep_service.js'
import { formatMoney, idOf } from '../../utils/format.js'
import './KhachThueHome.css'

export default function KhachThueHome() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [thongKe, setThongKe] = useState({
    soTinPhong: 0,
    soLichXem: 0,
    soSuaChua: 0,
    coHoSoOGhep: false,
  })
  const [dsTinMoi, setDsTinMoi] = useState([])
  const [dsBaiViet, setDsBaiViet] = useState([])
  const [dangTai, setDangTai] = useState(true)

  useEffect(() => {
    let active = true

    async function taiDuLieu() {
      setDangTai(true)
      const [tinRes, lichRes, suaChuaRes, oGhepRes, baiVietRes] = await Promise.allSettled([
        api.get('/tin-dang', { params: { limit: 4 } }),
        api.get('/lich-xem'),
        api.get('/yeu-cau-sua-chua'),
        layHoSoOGhepCuaToiApi(),
        api.get('/bai-viet', { params: { limit: 3 } }),
      ])

      if (!active) return

      const tinList = tinRes.status === 'fulfilled'
        ? tinRes.value.data?.items || tinRes.value.data || []
        : []
      const lichList = lichRes.status === 'fulfilled'
        ? lichRes.value.data?.items || lichRes.value.data || []
        : []
      const suaChuaList = suaChuaRes.status === 'fulfilled'
        ? suaChuaRes.value.data?.items || suaChuaRes.value.data || []
        : []
      const hoSoOGhep = oGhepRes.status === 'fulfilled' ? oGhepRes.value.data : null
      const baiVietList = baiVietRes.status === 'fulfilled'
        ? baiVietRes.value.data?.items || baiVietRes.value.data || []
        : []

      setDsTinMoi(Array.isArray(tinList) ? tinList.slice(0, 4) : [])
      setDsBaiViet(Array.isArray(baiVietList) ? baiVietList.slice(0, 3) : [])
      setThongKe({
        soTinPhong: Array.isArray(tinList) ? tinList.length : 0,
        soLichXem: Array.isArray(lichList) ? lichList.length : 0,
        soSuaChua: Array.isArray(suaChuaList) ? suaChuaList.length : 0,
        coHoSoOGhep: Boolean(hoSoOGhep && idOf(hoSoOGhep)),
      })
      setDangTai(false)
    }

    taiDuLieu()
    return () => { active = false }
  }, [])

  const loiTat = [
    {
      to: '/khach-thue/tim-phong',
      title: 'Tìm phòng trọ',
      desc: 'Lọc phòng trống theo giá, diện tích & đặt lịch hẹn',
      icon: Search,
    },
    {
      to: '/khach-thue/o-ghep',
      title: 'Tìm bạn ở ghép',
      desc: 'Đăng hồ sơ & tìm người ở ghép phù hợp',
      icon: Users,
    },
    {
      to: '/khach-thue/hop-dong',
      title: 'Hợp đồng của tôi',
      desc: 'Xem thời hạn thuê, tiền cọc và điều khoản',
      icon: FileText,
    },
    {
      to: '/khach-thue/hoa-don',
      title: 'Hóa đơn hàng tháng',
      desc: 'Theo dõi chỉ số điện nước & lịch sử thanh toán',
      icon: ReceiptText,
    },
    {
      to: '/khach-thue/sua-chua',
      title: 'Báo hỏng & sửa chữa',
      desc: 'Gửi yêu cầu bảo trì kèm ảnh tới chủ trọ',
      icon: Wrench,
    },
    {
      to: '/khach-thue/danh-gia-phong',
      title: 'Đánh giá phòng',
      desc: 'Gửi nhận xét chất lượng phòng & dịch vụ',
      icon: Star,
    },
  ]

  return (
    <section className="page kth-page">
      <PageHeader
        title={`Xin chào, ${user?.hoTen || 'Khách thuê'}`}
        description="Tổng quan lưu trú, tìm kiếm phòng trọ, hợp đồng, hóa đơn và hỗ trợ kỹ thuật."
        actions={(
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate('/khach-thue/sua-chua')}
            >
              <Wrench size={15} />
              <span>Báo sự cố</span>
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => navigate('/khach-thue/tim-phong')}
            >
              <Search size={15} />
              <span>Tìm phòng ngay</span>
            </button>
          </>
        )}
      />

      {/* 4 thẻ chỉ số tổng quan */}
      <div className="kth-stats">
        <div className="kth-stat-card" onClick={() => navigate('/khach-thue/tim-phong')}>
          <div className="kth-stat-top">
            <span>Phòng đang mở thuê</span>
            <Search size={16} />
          </div>
          <strong>{dangTai ? '…' : thongKe.soTinPhong}</strong>
          <small>Tin đăng phòng mới nhất</small>
        </div>

        <div className="kth-stat-card" onClick={() => navigate('/khach-thue/lich-xem')}>
          <div className="kth-stat-top">
            <span>Lịch hẹn xem phòng</span>
            <CalendarDays size={16} />
          </div>
          <strong>{dangTai ? '…' : thongKe.soLichXem}</strong>
          <small>Theo dõi trạng thái duyệt lịch</small>
        </div>

        <div className="kth-stat-card" onClick={() => navigate('/khach-thue/sua-chua')}>
          <div className="kth-stat-top">
            <span>Yêu cầu sửa chữa</span>
            <Wrench size={16} />
          </div>
          <strong>{dangTai ? '…' : thongKe.soSuaChua}</strong>
          <small>Tiến độ xử lý từ chủ trọ</small>
        </div>

        <div className="kth-stat-card" onClick={() => navigate('/khach-thue/o-ghep')}>
          <div className="kth-stat-top">
            <span>Hồ sơ tìm ở ghép</span>
            <Users size={16} />
          </div>
          <strong className="kth-stat-highlight">
            {dangTai ? '…' : thongKe.coHoSoOGhep ? 'Đang hoạt động' : 'Chưa đăng'}
          </strong>
          <small>Kết nối bạn cùng phòng</small>
        </div>
      </div>

      {/* Lối tắt chức năng */}
      <div className="kth-panel">
        <div className="kth-panel-head">
          <div>
            <h2>Tiện ích dành cho khách thuê</h2>
            <p>Truy cập nhanh các chức năng lưu trú trên hệ thống StaySync</p>
          </div>
        </div>

        <div className="kth-shortcuts">
          {loiTat.map(({ to, title, desc, icon: Icon }) => (
            <button
              key={to}
              type="button"
              className="kth-shortcut-item"
              onClick={() => navigate(to)}
            >
              <span className="kth-shortcut-icon">
                <Icon size={18} />
              </span>
              <span>
                <b>{title}</b>
                <small>{desc}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2 cột dữ liệu nhanh */}
      <div className="kth-grid-2">
        <div className="kth-panel">
          <div className="kth-panel-head">
            <div>
              <h2>Phòng trọ mới cập nhật</h2>
              <p>Các phòng đang sẵn sàng cho thuê</p>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => navigate('/khach-thue/tim-phong')}
            >
              Xem tất cả <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          {dsTinMoi.length === 0 ? (
            <div className="kth-empty-box">
              Chưa có tin đăng phòng mới. Bấm &ldquo;Tìm phòng ngay&rdquo; để xem danh sách phòng.
            </div>
          ) : (
            <div className="kth-list">
              {dsTinMoi.map((tin) => (
                <div className="kth-list-row" key={idOf(tin)}>
                  <div>
                    <b>{tin.tieuDe || 'Phòng trọ tiện nghi'}</b>
                    <small>{tin.diaChi || tin.khuVuc || 'Khu vực trung tâm'}</small>
                  </div>
                  <div className="kth-list-actions">
                    <span className="kth-price">
                      {Number(tin.giaThue) > 0 ? `${formatMoney(tin.giaThue)}/tháng` : 'Thỏa thuận'}
                    </span>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => navigate(`/khach-thue/tim-phong?tinId=${idOf(tin)}`)}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="kth-panel">
          <div className="kth-panel-head">
            <div>
              <h2>Bảng tin & sự kiện khu trọ</h2>
              <p>Thông báo mới nhất từ ban quản lý</p>
            </div>
            <button
              type="button"
              className="text-link"
              onClick={() => navigate('/khach-thue/bang-tin')}
            >
              Xem bảng tin <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          {dsBaiViet.length === 0 ? (
            <div className="kth-empty-box">
              Hiện chưa có bài viết hoặc thông báo mới nào từ chủ trọ.
            </div>
          ) : (
            <div className="kth-list">
              {dsBaiViet.map((bv) => (
                <div className="kth-list-row" key={idOf(bv)}>
                  <div>
                    <b>{bv.tieuDe}</b>
                    <small>{bv.noiDung?.slice(0, 85) || 'Thông báo khu trọ'}</small>
                  </div>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => navigate('/khach-thue/bang-tin')}
                  >
                    <MessageSquareText size={14} />
                    <span>Đọc</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}