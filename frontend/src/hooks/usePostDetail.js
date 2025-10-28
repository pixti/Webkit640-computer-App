import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function usePostDetail(postId) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPostAndComments = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        try {
            // 두 API를 동시에 호출하여 성능 향상
            const [postRes, commentsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/posts/${postId}`),
                axios.get(`http://localhost:5000/api/posts/${postId}/comments`)
            ]);
            setPost(postRes.data);
            setComments(commentsRes.data);
        } catch (err) {
            setError('게시글 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchPostAndComments();
    }, [fetchPostAndComments]);

    // 댓글 목록을 외부에서 업데이트할 수 있도록 setComments도 반환
    return { post, comments, loading, error, setComments };
}