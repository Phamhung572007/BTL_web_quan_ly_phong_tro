import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Building2, CalendarDays, ChevronDown, CircleHelp, FileText, Gauge, House,
  LogIn, Menu, Megaphone, MessageSquareText, ReceiptText, Settings2, Star, UserRound, Users, Wrench, X,
} from 'lucide-react'

const groups = [
  {
    label: 'Không gian',
    links: [
      { to: '/thong-ke', label: 'Tổng quan', icon: Gauge },
      { to: '/day-tro', label: 'Dãy trọ', icon: Building2 },
      { to: '/phong-tro', label: 'Phòng trọ', icon: House },
      { to: '/nguoi-thue', label: 'Người thuê', icon: Users },
      { to: '/hop-dong', label: 'Hợp đồng', icon: FileText },
      { to: '/tin-dang', label: 'Tin đăng phòng', icon: Megaphone },
    ],
  },
  {
    label: 'Thu chi',
    links: [
      { to: '/dien-nuoc', label: 'Điện nước', icon: Gauge },
      { to: '/hoa-don', label: 'Hóa đơn', icon: ReceiptText },
      { to: '/dich-vu', label: 'Dịch vụ & đơn giá', icon: Settings2 },
    ],
  },
  {
    label: 'Kết nối',
    links: [
      { to: '/lich-xem', label: 'Lịch xem phòng', icon: CalendarDays },
      { to: '/sua-chua', label: 'Sửa chữa', icon: Wrench },
      { to: '/bang-tin', label: 'Bảng tin & sự kiện', icon: MessageSquareText },
      { to: '/danh-gia-phong', label: 'Đánh giá phòng', icon: Star },
    ],
  },
]

const titles = {
  '/thong-ke': 'Tổng quan', '/day-tro': 'Dãy trọ', '/phong-tro': 'Phòng trọ',
  '/nguoi-thue': 'Người thuê', '/hop-dong': 'Hợp đồng', '/tin-dang': 'Tin đăng phòng',
  '/dien-nuoc': 'Điện nước', '/hoa-don': 'Hóa đơn', '/dich-vu': 'Dịch vụ & đơn giá',
  '/lich-xem': 'Lịch xem phòng', '/sua-chua': 'Sửa chữa', '/bang-tin': 'Bảng tin & sự kiện',
  '/danh-gia-phong': 'Đánh giá phòng', '/thong-bao': 'Thông báo',
}

function Navigation({ onNavigate }) {
  return (
    <nav className="side-nav" aria-label="Điều hướng chủ trọ">
      {groups.map((group) => (
        <div className="side-nav__group" key={group.label}>
          <div className="side-nav__label">{group.label}</div>
          {group.links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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

export default function ChuTroLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const menuToggleRef = useRef(null)
  const pageTitle = titles[location.pathname] || 'Không gian chủ trọ'

  useEffect(() => {
    if (!menuOpen) return undefined
    const focusable = () => sidebarRef.current?.querySelectorAll('a[href], button:not([disabled])') || []
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
      if (event.key === 'Tab') {
        const items = focusable()
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    requestAnimationFrame(() => focusable()[0]?.focus())
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      menuToggleRef.current?.focus()
    }
  }, [menuOpen])

  return (
    <div className="owner-app">
      {menuOpen && <button className="nav-scrim" type="button" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} />}
      <aside ref={sidebarRef} id="owner-navigation" className={`owner-sidebar${menuOpen ? ' is-open' : ''}`} aria-label="Điều hướng chủ trọ">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Stay<span className="brand-lockup__accent">Sync</span></span>
          <button className="icon-button sidebar-close" type="button" aria-label="Đóng menu" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-switcher__icon"><Building2 size={17} /></span>
          <span className="workspace-switcher__text"><small>KHÔNG GIAN</small><b>Quản lý nhà trọ</b></span>
          <ChevronDown size={15} className="workspace-switcher__chevron" />
        </div>
        <Navigation onNavigate={() => setMenuOpen(false)} />
        <div className="sidebar-bottom">
          <div className="sidebar-help"><span className="sidebar-help__mark"><CircleHelp size={16} aria-hidden="true" /></span><span><b>Cần hỗ trợ?</b><small>Xem hướng dẫn sử dụng</small></span></div>
          <Link className="account-row account-row--login" to="/dang-nhap" onClick={() => setMenuOpen(false)}>
            <span className="account-avatar" aria-hidden="true"><UserRound size={16} /></span>
            <span><b>Đăng nhập</b><small>Để mở dữ liệu chủ trọ</small></span>
            <LogIn size={15} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="owner-main">
        <header className="owner-topbar">
          <div className="owner-topbar__left">
            <button ref={menuToggleRef} className="icon-button menu-toggle" type="button" aria-label="Mở menu" aria-controls="owner-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
            <div className="breadcrumb"><span>StaySync</span><span className="breadcrumb__slash">/</span><b>{pageTitle}</b></div>
          </div>
          <div className="owner-topbar__right"><span className="today-label">Không gian chủ trọ</span></div>
        </header>
        <main className="owner-content"><Outlet /></main>
      </div>
    </div>
  )
}
