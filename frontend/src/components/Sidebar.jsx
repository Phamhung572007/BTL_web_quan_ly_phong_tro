import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import logo from "../assets/ptit-logo.svg";
import { NAV_ITEMS } from "../constants/navigation";
import "./Sidebar.css";

export default function Sidebar() {
  const navRef = useRef(null);
  const location = useLocation();
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false });

  useLayoutEffect(() => {
    const update = () => {
      const el = navRef.current?.querySelector(".sidebar-link.active");
      if (el) {
        setIndicator({ top: el.offsetTop, height: el.offsetHeight, visible: true });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [location.pathname]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="SmartRent" className="sidebar-logo-img" />
        <strong>SmartRent</strong>
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <User size={18} />
        </div>
        <div>
          <strong>Admin</strong>
          <span>Chủ trọ</span>
        </div>
      </div>

      <nav className="sidebar-nav" ref={navRef}>
        <span
          className="sidebar-indicator"
          style={{
            transform: `translateY(${indicator.top}px)`,
            height: indicator.height,
            opacity: indicator.visible ? 1 : 0,
          }}
        />

        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === "/"} className="sidebar-link">
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout">
          <LogOut size={20} strokeWidth={1.8} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}