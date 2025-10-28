import { useState, useEffect } from 'react';
import axios from 'axios';

// [수정] 훅이 query와 두 개의 필터 객체를 받도록 변경
export default function useSearch(query, { partFilters, postFilters }) {
    // [수정] results에 comments 추가
    const [results, setResults] = useState({ parts: [], posts: [], comments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setResults({ parts: [], posts: [], comments: [] });
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                // [수정] 두 종류의 필터를 모두 쿼리 스트링으로 변환
                const params = new URLSearchParams({ q: query });

                // 부품 필터 추가
                if (partFilters.categoryId) params.append('categoryId', partFilters.categoryId);
                if (partFilters.minPrice) params.append('minPrice', partFilters.minPrice);
                if (partFilters.maxPrice) params.append('maxPrice', partFilters.maxPrice);

                // 게시글 필터 추가
                const searchFields = Object.keys(postFilters.searchIn)
                    .filter(key => postFilters.searchIn[key])
                    .join(',');
                if (searchFields) params.append('postSearchFields', searchFields);

                const response = await axios.get(`http://localhost:5000/api/search?${params.toString()}`);
                setResults(response.data);
            } catch (err) {
                setError('검색 결과를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();

    }, [query, partFilters, postFilters]); // [수정] 의존성 배열에 모든 필터 추가

    return { results, loading, error };
}