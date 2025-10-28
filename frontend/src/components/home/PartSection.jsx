import React from 'react';
import useParts from '../../hooks/useParts'; // 1. 우리의 똑똑해진 훅을 import
import PartCard from '../parts/PartCard';   // 2. 개별 카드를 그릴 컴포넌트 import

const PartSection = () => {
    // 3. 인자 없이 호출 -> 최신 부품 6개를 가져옴
    const { parts, loading, error } = useParts();

    // 로딩 중일 때
    if (loading) {
        return <div className="text-center">최신 부품 정보를 불러오는 중...</div>;
    }

    // 에러 발생 시
    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        // 4. 받아온 실제 parts 데이터로 3열 그리드를 만듭니다.
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {parts.map((part) => (
                <div key={part.id} className="col">
                    <PartCard part={part} />
                </div>
            ))}
        </div>
    );
};

export default PartSection;