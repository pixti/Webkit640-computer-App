import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CommunitySection = () => {
    const [postsByBoard, setPostsByBoard] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomepagePosts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/posts/homepage');
                setPostsByBoard(res.data);
            } catch (err) {
                console.error("홈페이지 게시글 로딩 실패", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomepagePosts();
    }, []);

    if (loading) {
        return <div className="text-center p-3">커뮤니티 글을 불러오는 중...</div>;
    }

    return (
        <div className="row g-4">
            {Object.values(postsByBoard).map(({ name, slug, posts }) => (
                <div key={name} className="col-md-6">
                    <div className="card h-100">
                        <Link to={`/community/${slug}`} className="card-header-link">
                            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="h6 mb-0 fw-bold">
                                    {name} <small className="text-muted fw-normal">{name} 게시판</small>
                                </h3>
                                <i className="bi bi-chevron-right text-muted"></i>
                            </div>
                        </Link>
                        <ul className="list-group list-group-flush">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <li key={post.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                        <Link to={`/post/${post.id}`} className="text-decoration-none text-body line-clamp-1">
                                            {post.title}
                                        </Link>
                                        <small className="text-muted text-nowrap ms-2">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </small>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item text-center text-muted">게시글이 없습니다.</li>
                            )}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommunitySection;