import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useBoardTypes() {
    const [boardTypes, setBoardTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBoardTypes = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get('http://localhost:5000/api/board-types');
                setBoardTypes(res.data);
            } catch (err) {
                setError('게시판 목록 로딩에 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBoardTypes();
    }, []);

    return { boardTypes, loading, error, setBoardTypes };
}