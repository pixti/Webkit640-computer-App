import { useState, useEffect } from 'react';
import axios from 'axios';

// [수정] categorySlug가 없을 수도 있으므로 기본값을 null로 설정
export default function useParts(categorySlug = null) {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParts = async () => {
            setLoading(true);
            setError(null);

            // [수정] categorySlug 유무에 따라 API 요청 주소를 동적으로 결정
            const url = categorySlug
                ? `http://localhost:5000/api/parts?category=${categorySlug}`
                : 'http://localhost:5000/api/parts/latest';

            try {
                const response = await axios.get(url);
                setParts(response.data);
            } catch (err) {
                setError('부품 정보를 불러오는 데 실패했습니다.');
                console.error('API 호출 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchParts();
    }, [categorySlug]); // categorySlug가 바뀌면 이 훅은 다시 실행됨

    return { parts, loading, error };
}