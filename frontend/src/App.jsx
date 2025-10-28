import React from 'react';
import { Routes, Route } from 'react-router-dom';
import useTheme from './hooks/useTheme';

// 공통 레이아웃 컴포넌트
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';

// 페이지 컴포넌트 (모든 페이지 import)
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PartListPage from './pages/PartListPage.jsx';
import PartDetailPage from './pages/PartDetailPage.jsx';
import CreatePostPage from './pages/CreatePostPage.jsx';
import QuoteBuilderPage from './pages/QuoteBuilderPage.jsx';
import MyPage from './pages/MyPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import SharedQuotePage from './pages/SharedQuotePage.jsx';
import CommunityPage from './pages/CommunityPage.jsx'; // [추가]
import PostDetailPage from './pages/PostDetailPage.jsx'; // [추가]
import AdminRoute from './components/common/AdminRoute.jsx';
import AdminPage from './pages/AdminPage.jsx';
import EditPartPage from './pages/EditPartPage.jsx';

// 헤더와 푸터가 포함된 기본 레이아웃 컴포넌트
const MainLayout = () => (
    <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
            <Routes>
                {/* 일반 사용자 경로 */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/parts/:categorySlug" element={<PartListPage />} />
                <Route path="/part/:partId" element={<PartDetailPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/create-post" element={<CreatePostPage />} />
                <Route path="/quote-builder" element={<QuoteBuilderPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/:boardSlug" element={<CommunityPage />} />
                <Route path="/post/:postId" element={<PostDetailPage />} />

                {/* 관리자 전용 경로 */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route path="" element={<AdminPage />} />
                    <Route path="edit-part/:partId" element={<EditPartPage />} />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={
                    <div className="container text-center my-5">
                        <h1>404</h1>
                        <p>페이지를 찾을 수 없습니다.</p>
                    </div>
                } />
            </Routes>
        </main>
        <Footer />
    </div>
);


function App() {
    useTheme();

    return (
        <Routes>
            {/* 공유 페이지는 독립된 레이아웃으로 렌더링 */}
            <Route path="/quote/:quotationId" element={<SharedQuotePage />} />

            {/* 나머지 모든 경로는 MainLayout을 사용 */}
            <Route path="/*" element={<MainLayout />} />
        </Routes>
    );
}

export default App;