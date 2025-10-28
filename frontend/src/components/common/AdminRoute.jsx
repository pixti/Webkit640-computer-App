import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const { user, isLoggedIn } = useAuth();

    // 로딩 중이거나 로그인이 안됐거나, 관리자가 아니면 홈페이지로 리다이렉트
    if (!isLoggedIn || user?.role !== 'admin') {
        alert('접근 권한이 없습니다.');
        return <Navigate to="/" />;
    }

    // 관리자라면 자식 컴포넌트(페이지)를 보여줌
    return <Outlet />;
};

export default AdminRoute;