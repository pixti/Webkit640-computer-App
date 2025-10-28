import React from 'react';
import { useParams } from 'react-router-dom';
import useParts from '../hooks/useParts';
import useCategories from '../hooks/useCategories'; // [수정] 정적 파일 대신 훅 사용
import PartCard from '../components/parts/PartCard';

const PartListPage = () => {
    const { categorySlug } = useParams();
    const { parts, loading: partsLoading, error: partsError } = useParts(categorySlug);
    const { categories, loading: catsLoading } = useCategories(); // 카테고리 목록 가져오기

    // 카테고리 목록에서 현재 slug에 해당하는 카테고리 이름을 찾음
    const categoryInfo = catsLoading ? null : categories.find(cat => cat.slug === categorySlug);
    const categoryKoreanName = categoryInfo ? categoryInfo.name : '부품';

    if (partsLoading || catsLoading) {
        return <div className="container my-4">로딩 중...</div>;
    }

    if (partsError) {
        return <div className="container my-4 text-danger">{partsError}</div>;
    }

    return (
        <div className="container my-4">
            <h2 className="mb-4">{categoryKoreanName} 목록</h2>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {parts.length > 0 ? (
                    parts.map(part => (
                        <div key={part.id} className="col">
                            <PartCard part={part} />
                        </div>
                    ))
                ) : (
                    <div className="col-12"><p>해당 카테고리의 부품이 없습니다.</p></div>
                )}
            </div>
        </div>
    );
};

export default PartListPage;