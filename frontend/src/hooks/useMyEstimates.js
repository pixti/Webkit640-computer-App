import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useMyEstimates(token) {
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyEstimates = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/api/estimates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstimates(response.data);
        } catch (err) {
            setError('내 견적 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMyEstimates();
    }, [fetchMyEstimates]);

    const deleteEstimate = useCallback(async (estimateId) => {
        if (!token) {
            alert('로그인이 필요합니다.');
            return false;
        }
        try {
            await axios.delete(`http://localhost:5000/api/estimates/${estimateId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstimates(prevEstimates => prevEstimates.filter(est => est.id !== estimateId));
            return true;
        } catch (err) {
            alert(err.response?.data?.message || '견적 삭제에 실패했습니다.');
            return false;
        }
    }, [token]);

    return { estimates, loading, error, deleteEstimate };
}