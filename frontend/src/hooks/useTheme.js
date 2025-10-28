import { useState, useEffect } from 'react';

export default function useTheme() {
    // 1. 로컬 스토리지에서 저장된 테마를 가져오거나, 없으면 'light'를 기본값으로 사용
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // 2. theme 상태가 바뀔 때마다 HTML 문서 전체에 테마 속성을 적용
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    // 3. 테마를 'light' -> 'dark' 또는 'dark' -> 'light'로 전환하는 함수
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme); // 변경된 테마를 로컬 스토리지에 저장
    };

    // 4. 외부에서 사용할 수 있도록 현재 테마 상태와 토글 함수를 반환
    return { theme, toggleTheme };
}