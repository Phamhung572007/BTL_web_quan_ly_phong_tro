import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32 }}>Nội dung trang</main>
      </div>
    </BrowserRouter>
  );
}