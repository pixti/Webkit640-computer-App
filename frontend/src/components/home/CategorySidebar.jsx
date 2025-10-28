import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useCategories from '../../hooks/useCategories';
import useBoardTypes from '../../hooks/useBoardTypes.js'; // [수정] 올바른 경로로 import
import axios from 'axios'; // axios를 import 해야 합니다.

const CategorySidebar = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const { categories, loading: catsLoading } = useCategories();
    const { boardTypes, loading: boardsLoading } = useBoardTypes();

    const handleCreatePostClick = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('글쓰기는 로그인 후 이용 가능합니다.');
            navigate('/login');
        } else {
            navigate('/create-post');
        }
    };

    return (
        <div className="vstack gap-4">
            {/* 주요 기능 카드 */}
            <div className="card">
                <div className="card-header fw-bold">주요 기능</div>
                <div className="list-group list-group-flush">
                    <Link to="/quote-builder" className="list-group-item list-group-item-action text-primary fw-bold">
                        <i className="bi bi-calculator-fill me-2"></i> 견적 만들기
                    </Link>
                    <a href="/create-post" onClick={handleCreatePostClick} className="list-group-item list-group-item-action text-primary fw-bold">
                        <i className="bi bi-pencil-square me-2"></i> 글쓰기
                    </a>
                </div>
            </div>

            {/* 커뮤니티 카테고리 카드 */}
            <div className="card">
                <div className="card-header fw-bold">커뮤니티</div>
                <div className="list-group list-group-flush">
                    <Link to="/community" className="list-group-item list-group-item-action fw-bold">전체 글 보기</Link>
                    {boardsLoading ? (
                        <span className="list-group-item">로딩 중...</span>
                    ) : (
                        boardTypes.map((board) => (
                            <Link key={board.id} to={`/community/${board.slug}`} className="list-group-item list-group-item-action">
                                {board.name}
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* 부품 카테고리 카드 */}
            <div className="card">
                <div className="card-header fw-bold">부품 카테고리</div>
                <div className="list-group list-group-flush">
                    {catsLoading ? (
                        <span className="list-group-item">로딩 중...</span>
                    ) : (
                        categories.map((category) => (
                            <Link key={category.id} to={`/parts/${category.slug}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                <span>{category.name}</span>
                                <i className="bi bi-chevron-right text-muted"></i>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategorySidebar;