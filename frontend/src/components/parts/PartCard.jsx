import React from 'react';
import { Link } from 'react-router-dom';

// props로 'part' 객체 하나를 통째로 받습니다.
const PartCard = ({ part }) => {
    // 이미지가 없을 경우를 대비한 기본 이미지 URL
    const imageUrl = part.imageUrl || 'https://via.placeholder.com/300x200.png?text=No+Image';
    // [수정] Prices 배열에서 가장 첫 번째(최저가) 가격을 대표 가격으로 사용
    const representativePrice = part.Prices && part.Prices.length > 0 ? part.Prices[0].price : null;
    return (
        <div className="card h-100 shadow-sm">
            <Link to={`/part/${part.id}`} /* ... */ >
                {/* ... */}
                <div className="card-body">
                    <h5 className="card-title text-truncate">{part.modelName}</h5>
                    <p className="card-text fw-bold text-primary">
                        {representativePrice ? `${representativePrice.toLocaleString()}원~` : '가격 정보 없음'}
                    </p>
                </div>
            </Link>
        </div>
    );
};

export default PartCard;