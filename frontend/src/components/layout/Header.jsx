import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useTheme from '../../hooks/useTheme.js';

function Header() {
    const { isLoggedIn, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // 검색 실행 함수
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
            setSearchQuery('');
            const mobileSearchCollapse = document.getElementById('mobileSearch');
            if (mobileSearchCollapse?.classList.contains('show')) {
                mobileSearchCollapse.classList.remove('show');
            }
        }
    };

    // [복구] 글쓰기 버튼 클릭 시 실행될 함수
    const handleCreatePostClick = () => {
        if (!isLoggedIn) {
            alert('글쓰기는 로그인 후 이용 가능합니다.');
            navigate('/login');
        } else {
            navigate('/create-post');
        }
    };

    // [추가] 관리자인지 확인하는 변수
    const isAdmin = user?.role === 'admin';

    return (
        // [최종 수정] 인라인 스타일로 zIndex 값을 직접 높게 설정합니다.
        <header
            className="navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top"
            style={{ zIndex: 1030 }} // Bootstrap의 표준보다 높은 값을 부여
        >
            <nav className="container-lg">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <i className="bi bi-cpu-fill fs-3 me-2 text-primary"></i>
                    <span className="fw-bold fs-5">컴퓨터 부품 가격 비교</span>
                </Link>

                {/* Desktop Search Bar */}
                <div className="flex-grow-1 mx-2 d-none d-lg-block">
                    <form className="input-group" onSubmit={handleSearch}>
                        <input
                            className="form-control"
                            type="search"
                            placeholder="부품 및 게시글 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="submit">
                            <i className="bi bi-search"></i>
                        </button>
                    </form>
                </div>

                {/* Mobile Search Toggle */}
                <button
                    className="btn d-lg-none ms-auto"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mobileSearch"
                    aria-expanded="false"
                    aria-controls="mobileSearch"
                >
                    <i className="bi bi-search fs-5"></i>
                </button>

                {/* Right side buttons */}
                <div className="d-flex align-items-center">
                    <button onClick={handleCreatePostClick} className="btn btn-outline-secondary d-none d-md-flex align-items-center me-2">
                        <i className="bi bi-plus-lg me-1"></i>글쓰기
                    </button>

                    <button id="theme-toggler" className="btn" type="button" onClick={toggleTheme}>
                        <i className={`bi bi-sun fs-5 ${theme === 'dark' ? 'd-none' : ''}`}></i>
                        <i className={`bi bi-moon fs-5 ${theme === 'light' ? 'd-none' : ''}`}></i>
                    </button>

                    {isLoggedIn ? (
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {user?.nickname || user?.username}님
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                {/* [추가] 관리자일 경우에만 '관리자 페이지' 메뉴 항목을 보여줍니다. */}
                                {isAdmin && (
                                    <>
                                        <li><Link className="dropdown-item fw-bold text-danger" to="/admin">관리자 페이지</Link></li>
                                        <li><hr className="dropdown-divider" /></li>
                                    </>
                                )}
                                <li><Link className="dropdown-item" to="/mypage">내 정보</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={logout}>로그아웃</button></li>
                            </ul>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary rounded-pill ms-2">로그인</Link>
                    )}
                </div>
            </nav>

            {/* Mobile Search Collapse Area */}
            <div className="collapse w-100 d-lg-none" id="mobileSearch">
                <div className="p-3 bg-body-tertiary border-top">
                    <form className="input-group" onSubmit={handleSearch}>
                        <input
                            className="form-control"
                            type="search"
                            placeholder="부품 및 게시글 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="submit">
                            <i className="bi bi-search"></i>
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}

export default Header;