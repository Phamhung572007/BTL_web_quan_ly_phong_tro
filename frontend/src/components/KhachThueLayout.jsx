import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, CalendarDays, ChevronDown, CircleHelp, FileText, Gauge, House,
  LogOut, Menu, MessageSquareText, ReceiptText, Search, Star, UserCog, Users, Wrench, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import api from '../services/api.js'

const groups = [
  {
    label: 'Không gian lưu trú',
    links: [
      { to: '/khach-thue', label: 'Tổng quan', icon: Gauge, end: true },
      { to: '/khach-thue/tim-phong', label: 'Tìm phòng trọ', icon: Search },
      { to: '/khach-thue/o-ghep', label: 'Tìm bạn ở ghép', icon: Users },
      { to: '/khach-thue/lich-xem', label: 'Lịch xem phòng', icon: CalendarDays },
    ],
  },
  {
    label: 'Hợp đồng & Thu chi',
    links: [
      { to: '/khach-thue/hop-dong', label: 'Hợp đồng của tôi', icon: FileText },
      { to: '/khach-thue/hoa-don', label: 'Hóa đơn của tôi', icon: ReceiptText },
    ],
  },
  {
    label: 'Kết nối & Hỗ trợ',
    links: [
      { to: '/khach-thue/sua-chua', label: 'Sửa chữa & sự cố', icon: Wrench },
      { to: '/khach-thue/bang-tin', label: 'Bảng tin & sự kiện', icon: MessageSquareText },
      { to: '/khach-thue/danh-gia-phong', label: 'Đánh giá phòng', icon: Star },
      { to: '/khach-thue/tai-khoan', label: 'Tài khoản cá nhân', icon: UserCog },
    ],
  },
]

const titles = {
  '/khach-thue': 'Tổng quan',
  '/khach-thue/tim-phong': 'Tìm phòng trọ',
  '/khach-thue/o-ghep': 'Tìm bạn ở ghép',
  '/khach-thue/lich-xem': 'Lịch xem phòng',
  '/khach-thue/hop-dong': 'Hợp đồng của tôi',
  '/khach-thue/hoa-don': 'Hóa đơn của tôi',
  '/khach-thue/sua-chua': 'Sửa chữa & sự cố',
  '/khach-thue/bang-tin': 'Bảng tin & sự kiện',
  '/khach-thue/danh-gia-phong': 'Đánh giá phòng',
  '/khach-thue/thong-bao': 'Thông báo',
  '/khach-thue/tai-khoan': 'Tài khoản cá nhân',
}

const roleLabels = { CHU_TRO: 'Chủ trọ', KHACH_THUE: 'Khách thuê', ADMIN: 'Quản trị viên' }
const accountStatusLabels = { HOAT_DONG: 'Đang hoạt động', NGUNG_HOAT_DONG: 'Ngừng hoạt động', BI_KHOA: 'Đã khóa' }

function tenHienThi(user, authStatus) {
  if (user) return user.hoTen || user.ten || user.name || user.email || 'Tài khoản'
  if (authStatus === 'loading') return 'Đang tải tài khoản…'
  if (authStatus === 'unavailable') return 'Chưa đồng bộ tài khoản'
  return 'Chưa đăng nhập'
}

function chuCaiDaiDien(name) {
  return Array.from(String(name || '').trim())[0]?.toLocaleUpperCase('vi-VN') || '?'
}

function moTaTaiKhoan(user, authStatus) {
  if (!user) {
    if (authStatus === 'loading') return 'Đang đồng bộ hồ sơ'
    if (authStatus === 'unavailable') return 'Chưa kết nối API tài khoản'
    return 'Đăng nhập để đồng bộ hồ sơ'
  }

  const role = roleLabels[user.vaiTro] || user.vaiTro
  const status = accountStatusLabels[user.trangThai]
    || (user.trangThai ? String(user.trangThai).replaceAll('_', ' ').toLowerCase() : 'Đã đăng nhập')
  return [role, status].filter(Boolean).join(' · ')
}

function Navigation({ onNavigate }) {
  return (
    <nav className="side-nav" aria-label="Điều hướng khách thuê">
      {groups.map((group) => (
        <div className="side-nav__group" key={group.label}>
          <div className="side-nav__label">{group.label}</div>
          {group.links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) => `side-nav__link${isActive ? ' is-active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

export default function KhachThueLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, authStatus, clearSession } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const pageTitle = titles[location.pathname] || 'Không gian khách thuê'
  const accountName = tenHienThi(user, authStatus)
  const accountInitial = chuCaiDaiDien(user?.hoTen || user?.ten || user?.name || user?.email)
  const accountDescription = moTaTaiKhoan(user, authStatus)

  useEffect(() => {
    let active = true
    api.get('/thong-bao/chua-doc')
      .then((response) => {
        if (active) setUnread(response.data?.total || 0)
      })
      .catch(() => {
        if (active) setUnread(0)
      })
    return () => { active = false }
  }, [location.pathname])

async function xuLyDangXuat() {
  try {
    await api.post('/dang-xuat')
  } catch {
    //bỏ qua nếu token đã hết hạn, vẫn xóa phiên ở trình duyệt
  } finally {
    clearSession()
    navigate('/dang-nhap', { replace: true })
  }
}

  return (
    <div className="owner-app">
      {menuOpen && (
        <button
          className="nav-scrim"
          aria-label="Đóng menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`owner-sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="brand-lockup" onClick={() => navigate('/khach-thue')} style={{ cursor: 'pointer' }}>
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Stay<span className="brand-lockup__accent">Sync</span></span>
          <button
            className="icon-button sidebar-close"
            aria-label="Đóng menu"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-switcher__icon"><House size={17} /></span>
          <span className="workspace-switcher__text">
            <small>KHÔNG GIAN</small>
            <b>Khách thuê trọ</b>
          </span>
          <ChevronDown size={15} className="workspace-switcher__chevron" />
        </div>

        <Navigation onNavigate={() => setMenuOpen(false)} />

        <div className="sidebar-bottom">
          <div
            className="sidebar-help"
            onClick={() => navigate('/khach-thue/sua-chua')}
            style={{ cursor: 'pointer' }}
          >
            <span className="sidebar-help__mark"><CircleHelp size={16} aria-hidden="true" /></span>
            <span>
              <b>Cần hỗ trợ?</b>
              <small>Gửi yêu cầu sửa chữa</small>
            </span>
          </div>

          <div
            className="account-row"
            onClick={() => navigate('/khach-thue/tai-khoan')}
            style={{ cursor: 'pointer' }}
          >
            <span className="account-avatar" aria-hidden="true">{accountInitial}</span>
            <span>
              <b title={accountName}>{accountName}</b>
              <small title={accountDescription}>{accountDescription}</small>
            </span>
            <button
              type="button"
              className="icon-button"
              title="Đăng xuất"
              aria-label="Đăng xuất"
              onClick={(e) => {
                e.stopPropagation()
                xuLyDangXuat()
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="owner-main">
        <header className="owner-topbar">
          <div className="owner-topbar__left">
            <button
              className="icon-button menu-toggle"
              aria-label="Mở menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>StaySync</span>
              <span className="breadcrumb__slash">/</span>
              <b>{pageTitle}</b>
            </div>
          </div>

          <div className="owner-topbar__right">
            <span className="today-label">Không gian khách thuê</span>
            <NavLink
              to="/khach-thue/thong-bao"
              className="icon-button notification-button"
              aria-label={`Thông báo, ${unread} chưa đọc`}
            >
              <Bell size={19} />
              {unread > 0 && <span className="notification-dot">{unread > 9 ? '9+' : unread}</span>}
            </NavLink>
            <span className="topbar-divider" />
            <NavLink
              to="/khach-thue/tai-khoan"
              className="account-avatar account-avatar--small"
              aria-label={`Avatar của ${accountName}`}
              style={{ textDecoration: 'none' }}
            >
              {accountInitial}
            </NavLink>
          </div>
        </header>

        <main className="owner-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}