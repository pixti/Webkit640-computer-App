import { useState, useEffect } from 'react';
import axios from 'axios';

export default function usePosts(boardSlug) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // [수정] boardType 대신 boardSlug를 쿼리 파라미터로 사용합니다.
                const response = await axios.get(`http://localhost:5000/api/posts?boardSlug=${boardSlug}`);
                setPosts(response.data);
            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [boardSlug]);

    return { posts, loading, error };
}