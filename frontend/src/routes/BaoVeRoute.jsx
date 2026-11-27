import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function BaoVeRoute({ children, vaiTroChoPhep = [] }) {
  const { user, authStatus } = useAuth();
  const location = useLocation();

  // 1.đang ktra token khi F5 trang -> chờ xong mới quyết định điều hướng
  if (authStatus === 'loading') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  // 2.chưa dnhap hoặc token hết hạn/lỗi -> đẩy về trang đăng nhập
  if (authStatus !== 'authenticated' || !user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // 3.đã đăng nhập nhưng sai vai trò (vd: KHACH_THUE vào trang của CHU_TRO)
  if (vaiTroChoPhep.length > 0 && !vaiTroChoPhep.includes(user.vaiTro)) {
    const trangMacDinh = user.vaiTro === 'CHU_TRO' ? '/thong-ke' : '/khach-thue';
    return <Navigate to={trangMacDinh} replace />;
  }

  return children;
}