import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedId = localStorage.getItem('id');
        if (storedId) {
            setUser({
                id: Number(storedId),
                username: localStorage.getItem('username'),
                nickname: localStorage.getItem('nickname'),
                role: localStorage.getItem('role'),
            });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            const { token, id, username: u, nickname: n, role: r } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('id', id);
            localStorage.setItem('username', u);
            localStorage.setItem('nickname', n);
            localStorage.setItem('role', r);

            setToken(token);
            setUser({ id, username: u, nickname: n, role: r });

            alert('로그인 성공!');
            navigate('/');
            return true;
        } catch (err) {
            alert(err.response?.data?.message || '로그인에 실패했습니다.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('id');
        localStorage.removeItem('username');
        localStorage.removeItem('nickname');
        localStorage.removeItem('role');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    // [핵심 수정] 빠져있던 register 함수의 실제 구현부를 다시 추가합니다.
    const register = async (username, nickname, password, confirmPassword) => {
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return false;
        }
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username,
                nickname,
                password,
            });
            alert('회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
            return true;
        } catch (err) {
            // 서버에서 오는 에러 메시지(예: 중복된 아이디)를 보여줍니다.
            alert(err.response?.data?.message || '회원가입에 실패했습니다.');
            return false;
        }
    };

    const value = {
        isLoggedIn: !!token,
        user,
        setUser,
        token,
        loading,
        login,
        logout,
        register, // register 함수를 context value에 포함
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);