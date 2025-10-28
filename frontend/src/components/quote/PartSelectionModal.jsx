import React from 'react';
import useParts from '../../hooks/useParts';

const PartSelectionModal = ({ category, onSelect, onClose }) => {
    const { parts, loading, error } = useParts(category.slug);

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{category.name} 선택</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading && <p>로딩 중...</p>}
                        {error && <p className="text-danger">{error}</p>}
                        <ul className="list-group">
                            {parts.map(part => {
                                // [수정] Prices 배열에서 최저가를 찾습니다.
                                const lowestPrice = part.Prices?.[0]?.price;
                                return (
                                    <li key={part.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onClick={() => onSelect(category.slug, part)}>
                                        <div>
                                            <div className="fw-bold">{part.modelName}</div>
                                            <small className="text-muted">{part.manufacturer}</small>
                                        </div>
                                        <span className="text-primary fw-bold">
                                            {lowestPrice ? `${lowestPrice.toLocaleString()}원~` : '가격 정보 없음'}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartSelectionModal;