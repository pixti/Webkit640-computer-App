import { useState, useEffect } from 'react';
import axios from 'axios';

export default function usePartDetail(partId) {
    const [part, setPart] = useState(null); // 단일 객체이므로 초기값은 null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!partId) {
            setLoading(false);
            return;
        }

        const fetchPartDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/parts/${partId}`);
                setPart(response.data);
            } catch (err) {
                setError('부품 상세 정보를 불러오는 데 실패했습니다.');
                console.error('API 호출 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPartDetail();
    }, [partId]); // partId가 바뀔 때마다 다시 데이터를 가져옴

    return { part, loading, error };
}