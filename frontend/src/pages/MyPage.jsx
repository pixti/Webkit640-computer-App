import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import useMyEstimates from '../hooks/useMyEstimates';

// --- 메인 MyPage 컴포넌트 ---
const MyPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('estimates'); // 'estimates', 'posts', 'comments', 'settings'

    return (
        <div className="container my-5">
            <h2 className="mb-3">마이페이지</h2>
            <p className="lead text-muted">사용자: {user?.username} ({user?.nickname})</p>
            <hr />

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'estimates' ? 'active' : ''}`} onClick={() => setActiveTab('estimates')}>내 견적</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>내가 쓴 글</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>내가 쓴 댓글</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>정보 수정 및 탈퇴</button>
                </li>
            </ul>

            <div>
                {activeTab === 'estimates' && <MyEstimates />}
                {activeTab === 'posts' && <MyPosts />}
                {activeTab === 'comments' && <MyComments />}
                {activeTab === 'settings' && <UserSettings />}
            </div>
        </div>
    );
};


// --- 내부 탭 컴포넌트들 ---

// 내 견적 탭
const MyEstimates = () => {
    const { token } = useAuth();
    const { estimates, loading, error, deleteEstimate } = useMyEstimates(token);
    const navigate = useNavigate();

    const handleEstimateDelete = async (estimateId) => {
        if (window.confirm('정말로 이 견적을 삭제하시겠습니까?')) {
            const success = await deleteEstimate(estimateId);
            if (success) alert('견적이 삭제되었습니다.');
        }
    };

    const handleShareEstimate = (estimate) => {
        navigate('/create-post', { state: { quoteToShare: estimate } });
    };

    const handleLoadEstimate = (estimate) => {
        navigate('/quote-builder', { state: { estimateToLoad: estimate } });
    };

    const handleExportQuote = (estimate) => {
        const quotationId = estimate.Quotation?.id;
        if (quotationId) {
            const url = `${window.location.origin}/quote/${quotationId}`;
            navigator.clipboard.writeText(url)
                .then(() => alert('공유 링크가 클립보드에 복사되었습니다. 새 탭에 붙여넣기 해보세요!'))
                .catch(() => alert('링크 복사에 실패했습니다.'));
        } else {
            alert('이 견적에 대한 공유 정보를 찾을 수 없습니다. (DB 확인 필요)');
        }
    };

    if (loading) return <p>견적 목록을 불러오는 중...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div>
            {estimates.length > 0 ? (
                <ul className="list-group">
                    {estimates.map(estimate => (
                        <li key={estimate.id} className="list-group-item d-flex flex-wrap justify-content-between align-items-center">
                            <div className="me-auto mb-2 mb-md-0">
                                <div className="fw-bold">{estimate.name}</div>
                                <small className="text-muted">{new Date(estimate.createdAt).toLocaleDateString()} 저장됨</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary rounded-pill">{estimate.totalPrice.toLocaleString()}원</span>
                                <button onClick={() => handleLoadEstimate(estimate)} className="btn btn-sm btn-outline-info">불러오기</button>
                                <button onClick={() => handleExportQuote(estimate)} className="btn btn-sm btn-outline-success">내보내기</button>
                                <button onClick={() => handleShareEstimate(estimate)} className="btn btn-sm btn-outline-secondary">공유</button>
                                <button onClick={() => handleEstimateDelete(estimate.id)} className="btn btn-sm btn-outline-danger">삭제</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted">저장된 견적이 없습니다.</p>
            )}
        </div>
    );
};

// 내가 쓴 글 탭
const MyPosts = () => {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        if(token) {
            axios.get('http://localhost:5000/api/users/myposts', { headers: { Authorization: `Bearer ${token}` }})
                .then(res => setPosts(res.data))
                .catch(err => console.error("내가 쓴 글 로딩 실패", err));
        }
    }, [token]);

    return (
        <div className="list-group">
            {posts.length > 0 ? posts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="list-group-item list-group-item-action">
                    {post.title}
                    <small className="d-block text-muted">{new Date(post.createdAt).toLocaleDateString()}</small>
                </Link>
            )) : <p className="text-muted">작성한 글이 없습니다.</p>}
        </div>
    );
};

// 내가 쓴 댓글 탭
const MyComments = () => {
    const { token } = useAuth();
    const [comments, setComments] = useState([]);
    useEffect(() => {
        if(token) {
            axios.get('http://localhost:5000/api/users/mycomments', { headers: { Authorization: `Bearer ${token}` }})
                .then(res => setComments(res.data))
                .catch(err => console.error("내가 쓴 댓글 로딩 실패", err));
        }
    }, [token]);

    return (
        <div className="list-group">
            {comments.length > 0 ? comments.map(comment => (
                <Link key={comment.id} to={`/post/${comment.Post?.id}`} className="list-group-item list-group-item-action">
                    <p className="mb-1 text-truncate">"{comment.content}"</p>
                    <small className="text-muted">'{comment.Post?.title || '원글'}' 글에 작성</small>
                </Link>
            )) : <p className="text-muted">작성한 댓글이 없습니다.</p>}
        </div>
    );
};

// 정보 수정 및 탈퇴 탭
const UserSettings = () => {
    const { user, token, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [newNickname, setNewNickname] = useState(user?.nickname || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

    const handleNicknameChange = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/users/nickname', { nickname: newNickname }, getAuthHeaders());
            alert(res.data.message);
            const newNicknameFromServer = res.data.nickname;
            setUser(prevUser => ({ ...prevUser, nickname: newNicknameFromServer }));
            localStorage.setItem('nickname', newNicknameFromServer);
        } catch (err) {
            alert(err.response?.data?.message || '닉네임 변경에 실패했습니다.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            const res = await axios.put('http://localhost:5000/api/users/password', { currentPassword, newPassword }, getAuthHeaders());
            alert(res.data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            alert(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        }
    };

    const handleWithdrawal = async () => {
        const password = prompt('회원을 탈퇴하시려면 현재 비밀번호를 입력하세요. 이 작업은 되돌릴 수 없습니다.');
        if (password) {
            try {
                const res = await axios.post('http://localhost:5000/api/users/delete', { password }, getAuthHeaders());
                alert(res.data.message);
                logout();
                navigate('/');
            } catch (err) {
                alert(err.response?.data?.message || '회원 탈퇴에 실패했습니다.');
            }
        }
    };

    return (
        <div className="row">
            <div className="col-md-6 mb-4">
                <div className="card h-100"><div className="card-body">
                    <h5 className="card-title">닉네임 변경</h5>
                    <form onSubmit={handleNicknameChange}>
                        <div className="mb-3"><label htmlFor="nickname" className="form-label">새 닉네임</label><input type="text" className="form-control" id="nickname" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} required /></div>
                        <button type="submit" className="btn btn-primary">닉네임 변경</button>
                    </form>
                </div></div>
            </div>
            <div className="col-md-6 mb-4">
                <div className="card h-100"><div className="card-body">
                    <h5 className="card-title">비밀번호 변경</h5>
                    <form onSubmit={handlePasswordChange}>
                        <div className="mb-2"><label className="form-label">현재 비밀번호</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-control" required /></div>
                        <div className="mb-2"><label className="form-label">새 비밀번호</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-control" required /></div>
                        <div className="mb-3"><label className="form-label">새 비밀번호 확인</label><input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="form-control" required /></div>
                        <button type="submit" className="btn btn-primary">비밀번호 변경</button>
                    </form>
                </div></div>
            </div>
            <div className="col-12">
                <div className="card border-danger mt-4"><div className="card-body">
                    <h5 className="card-title text-danger">회원 탈퇴</h5>
                    <p className="card-text">회원 탈퇴 시 모든 정보가 영구적으로 삭제되며, 복구할 수 없습니다.</p>
                    <button className="btn btn-danger" onClick={handleWithdrawal}>회원 탈퇴</button>
                </div></div>
            </div>
        </div>
    );
};

export default MyPage;