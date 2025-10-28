import React from 'react';
import { useParams } from 'react-router-dom';
import usePublicQuote from '../hooks/usePublicQuote';

const SharedQuotePage = () => {
    const { quotationId } = useParams();
    const { estimate, loading, error } = usePublicQuote(quotationId);

    if (loading) return <div className="p-4">견적 정보를 불러오는 중...</div>;
    if (error) return <div className="p-4 text-danger">{error}</div>;
    if (!estimate) return <div className="p-4">견적을 찾을 수 없습니다.</div>;

    return (
        <div className="container my-4">
            <div className="card">
                <div className="card-header">
                    <h3>{estimate.name}</h3>
                    <small className="text-muted">작성자: {estimate.User.nickname} | 생성일: {new Date(estimate.createdAt).toLocaleDateString()}</small>
                </div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        {estimate.EstimateItems.map(item => (
                            <li key={item.id} className="list-group-item d-flex justify-content-between">
                                <div>
                                    <div className="fw-bold">{item.Part?.Category?.name}</div>
                                    {item.Part?.modelName} (x{item.quantity})
                                </div>
                                <div className="text-end">
                                    <div>{((item.Price?.price || 0) * item.quantity).toLocaleString()}원</div>
                                    <small className="text-muted">개당 {item.Price?.price.toLocaleString()}원</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card-footer text-end fs-4 fw-bold">
                    총 합계: <span className="text-primary">{estimate.totalPrice.toLocaleString()}원</span>
                </div>
            </div>
        </div>
    );
};

export default SharedQuotePage;