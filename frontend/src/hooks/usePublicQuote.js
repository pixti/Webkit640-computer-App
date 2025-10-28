import { useState, useEffect } from 'react';
import axios from 'axios';

export default function usePublicQuote(quotationId) {
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!quotationId) return;
        axios.get(`http://localhost:5000/api/quotations/${quotationId}`)
            .then(res => setEstimate(res.data))
            .catch(err => setError('견적 정보를 불러오는 데 실패했습니다.'))
            .finally(() => setLoading(false));
    }, [quotationId]);

    return { estimate, loading, error };
}