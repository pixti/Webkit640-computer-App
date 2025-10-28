import React from 'react';
import { Link, useParams } from 'react-router-dom';
import usePosts from '../hooks/usePosts';
import useBoardTypes from '../hooks/useBoardTypes'; // [수정] 외부 훅을 import

const CommunityPage = () => {
    const { boardSlug = 'all' } = useParams();
    const { posts, loading: postsLoading, error } = usePosts(boardSlug);
    const { boardTypes, loading: boardsLoading } = useBoardTypes();

    const boardInfo = boardsLoading ? null : boardTypes.find(b => b.slug === boardSlug);
    const boardName = boardSlug === 'all' ? '전체글' : (boardInfo ? boardInfo.name : boardSlug);

    const loading = postsLoading || boardsLoading;

    return (
        <div className="container my-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">커뮤니티 - {boardName}</h2>
                <Link to="/create-post" className="btn btn-primary"><i className="bi bi-pencil-fill me-2"></i>글쓰기</Link>
            </div>

            {loading && <p>게시글 목록을 불러오는 중...</p>}
            {error && <p className="text-danger">{error}</p>}

            <div className="list-group">
                {!loading && !error && posts.length > 0 ? (
                    posts.map(post => (
                        <Link key={post.id} to={`/post/${post.id}`} className="list-group-item list-group-item-action">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1 text-truncate">{post.title}</h5>
                                <small className="text-nowrap ms-3">{new Date(post.createdAt).toLocaleDateString()}</small>
                            </div>
                            <p className="mb-1 text-truncate">{post.content}</p>
                            <small>작성자: {post.User?.nickname || '알 수 없음'}</small>
                        </Link>
                    ))
                ) : (
                    !loading && <p className="text-muted">게시글이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;