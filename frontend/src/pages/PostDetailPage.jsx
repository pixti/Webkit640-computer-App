import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import usePostDetail from '../hooks/usePostDetail';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const { isLoggedIn, token, user, loading: authLoading } = useAuth();
    const { post, comments, loading: postLoading, error, setComments } = usePostDetail(postId);

    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');

    const [newCommentContent, setNewCommentContent] = useState('');

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');

    useEffect(() => {
        if (post) {
            setEditedTitle(post.title);
            setEditedContent(post.content);
        }
    }, [post]);

    const isPostOwner = !authLoading && !postLoading && post && user && (post.userId == user.id || user.role === 'admin');

    const handlePostUpdate = async () => {
        if (!editedTitle.trim() || !editedContent.trim()) {
            alert('제목과 내용은 비워둘 수 없습니다.');
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/posts/${postId}`,
                { title: editedTitle, content: editedContent, boardTypeId: post.boardTypeId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('게시글이 수정되었습니다.');
            window.location.reload();
        } catch (err) {
            alert('게시글 수정에 실패했습니다.');
        }
    };

    const handlePostDelete = async () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까? 관련 댓글도 모두 삭제됩니다.')) {
            try {
                await axios.delete(`http://localhost:5000/api/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
                alert('게시글이 삭제되었습니다.');
                navigate('/community');
            } catch (err) {
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentContent.trim()) return;
        try {
            const res = await axios.post(
                `http://localhost:5000/api/posts/${postId}/comments`,
                { content: newCommentContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(prevComments => [...prevComments, res.data]);
            setNewCommentContent('');
        } catch (err) {
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleCommentUpdate = async () => {
        if (!editedCommentContent.trim()) {
            alert('댓글 내용은 비워둘 수 없습니다.');
            return;
        }
        try {
            const res = await axios.put(`http://localhost:5000/api/comments/${editingCommentId}`,
                { content: editedCommentContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(comments.map(c => c.id === editingCommentId ? res.data : c));
            setEditingCommentId(null);
            setEditedCommentContent('');
        } catch (err) {
            alert('댓글 수정에 실패했습니다.');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:5000/api/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
                setComments(prev => prev.filter(c => c.id !== commentId));
            } catch (err) {
                alert('댓글 삭제에 실패했습니다.');
            }
        }
    };

    if (authLoading) return <div className="container my-4 text-center">사용자 정보를 확인하는 중...</div>;
    if (postLoading) return <div className="container my-4 text-center">게시글을 불러오는 중...</div>;
    if (error) return <div className="container my-4 text-danger">{error}</div>;
    if (!post) return <div className="container my-4">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="container my-4">
            {/* Post Section */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                    <div className="me-auto">
                        {isEditingPost ? (
                            <input type="text" className="form-control" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} />
                        ) : (
                            <h2 className="mb-0">{post.title}</h2>
                        )}
                        {post.BoardType && !isEditingPost && (
                            <Link to={`/community/${post.BoardType.slug}`} className="badge bg-secondary text-decoration-none mt-1">
                                {post.BoardType.name}
                            </Link>
                        )}
                    </div>
                    <div className="mt-2 mt-md-0 ms-md-2">
                        {isPostOwner && (
                            isEditingPost ? (
                                <>
                                    <button onClick={handlePostUpdate} className="btn btn-sm btn-success me-2">저장</button>
                                    <button onClick={() => setIsEditingPost(false)} className="btn btn-sm btn-secondary">취소</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditingPost(true)} className="btn btn-sm btn-outline-secondary me-2">수정</button>
                                    <button onClick={handlePostDelete} className="btn btn-sm btn-outline-danger me-2">삭제</button>
                                </>
                            )
                        )}
                        <Link to="/community" className="btn btn-sm btn-secondary">목록</Link>
                    </div>
                </div>
                <div className="card-body">
                    <div className="text-muted small mb-3">
                        <span>작성자: {post.User?.nickname}</span> |
                        <span> 작성일: {new Date(post.createdAt).toLocaleString()}</span> |
                        <span> 조회수: {post.viewCount}</span>
                    </div>
                    {isEditingPost ? (
                        <textarea className="form-control" rows="15" value={editedContent} onChange={e => setEditedContent(e.target.value)}></textarea>
                    ) : (
                        <div className="card-text" style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}>
                            {post.content}
                        </div>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="card mt-4">
                <div className="card-header"><h5>댓글 ({comments.length})</h5></div>
                <ul className="list-group list-group-flush">
                    {comments.length > 0 ? comments.map(comment => {
                        const isCommentOwner = user && (comment.userId == user.id || user.role === 'admin');
                        const isEditingThisComment = editingCommentId === comment.id;
                        return (
                            <li key={comment.id} className="list-group-item">
                                {isEditingThisComment ? (
                                    // [문법 오류 수정] 주석 대신 실제 JSX를 넣습니다.
                                    <div>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={editedCommentContent}
                                            onChange={e => setEditedCommentContent(e.target.value)}
                                        />
                                        <div className="text-end mt-2">
                                            <button onClick={handleCommentUpdate} className="btn btn-sm btn-success me-2">저장</button>
                                            <button onClick={() => setEditingCommentId(null)} className="btn btn-sm btn-secondary">취소</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <strong>{comment.User?.nickname}</strong>
                                                <small className="ms-2 text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
                                            </div>
                                            {isCommentOwner && (
                                                <div className="d-flex gap-2">
                                                    <button onClick={() => { setEditingCommentId(comment.id); setEditedCommentContent(comment.content); }} className="btn btn-sm btn-link text-muted p-0">수정</button>
                                                    <button onClick={() => handleCommentDelete(comment.id)} className="btn btn-sm btn-link text-danger p-0">삭제</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                    </div>
                                )}
                            </li>
                        );
                    }) : <li className="list-group-item text-muted">아직 댓글이 없습니다.</li>}
                </ul>
            </div>

            {/* New Comment Form */}
            <div className="card mt-4">
                <div className="card-body">
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            placeholder={isLoggedIn ? '댓글을 입력하세요.' : '로그인 후 댓글을 작성할 수 있습니다.'}
                            disabled={!isLoggedIn}
                            required
                        ></textarea>
                        <div className="text-end mt-2">
                            <button type="submit" className="btn btn-primary" disabled={!isLoggedIn}>댓글 등록</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;