import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // 이제 이 파일이 존재합니다!

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberId, setRememberId] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        const savedId = localStorage.getItem('savedId');
        if (savedId) {
            setUsername(savedId);
            setRememberId(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (rememberId) {
            localStorage.setItem('savedId', username);
        } else {
            localStorage.removeItem('savedId');
        }
        await login(username, password);
    };

    return (
        <div className="container-lg d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow-sm p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    <div className="text-center mb-4">
                        <Link className="navbar-brand d-flex flex-column align-items-center text-decoration-none text-body" to="/">
                            <i className="bi bi-cpu-fill fs-1 mb-2 text-primary"></i>
                            <span className="fw-bold fs-4">컴퓨터 부품 가격 비교</span>
                        </Link>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="inputUsername" className="form-label">아이디</label>
                            <input
                                type="text" className="form-control" id="inputUsername"
                                value={username} onChange={(e) => setUsername(e.target.value)}
                                placeholder="아이디를 입력하세요" required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="inputPassword" className="form-label">비밀번호</label>
                            <input
                                type="password" className="form-control" id="inputPassword"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요" required
                            />
                        </div>
                        <div className="form-check mb-4 small">
                            <input
                                className="form-check-input" type="checkbox" id="rememberIdCheck"
                                checked={rememberId} onChange={(e) => setRememberId(e.target.checked)}
                            />
                            <label className="form-check-label text-muted" htmlFor="rememberIdCheck">아이디 기억</label>
                        </div>
                        <div className="d-grid mb-3">
                            <button type="submit" className="btn btn-primary btn-lg">로그인</button>
                        </div>
                    </form>
                    <div className="text-center mt-4">
                        <p className="small text-muted mb-1">계정이 없으신가요?</p>
                        <Link to="/register" className="btn btn-sm btn-outline-secondary">회원가입</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;