import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <PageHeader />
        <div className="main-body">{children}</div>
      </main>
    </div>
  );
}