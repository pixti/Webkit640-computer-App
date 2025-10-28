import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import usePartDetail from '../hooks/usePartDetail.js';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const PartDetailPage = () => {
    const { partId } = useParams();
    const navigate = useNavigate();
    const { part, loading, error } = usePartDetail(partId);
    const { isLoggedIn, user, token } = useAuth();
    const isAdmin = isLoggedIn && user?.role === 'admin';

    const handleDelete = async () => {
        if (window.confirm('정말로 이 부품 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                const redirectPath = part?.Category?.slug ? `/parts/${part.Category.slug}` : '/';

                await axios.delete(`http://localhost:5000/api/parts/${partId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                alert('부품 정보가 성공적으로 삭제되었습니다.');
                navigate(redirectPath);
            } catch (err) {
                alert(err.response?.data?.message || '삭제에 실패했습니다. 권한을 확인해주세요.');
            }
        }
    };

    if (loading) {
        return (
            <div className="container my-4 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">부품 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!part) {
        return (
            <div className="container my-4">
                <p>부품 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    const imageUrl = part.imageUrl || 'https://via.placeholder.com/400x300.png?text=No+Image';

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                    <img src={imageUrl} className="img-fluid rounded border" alt={part.modelName} />
                </div>
                <div className="col-md-6">
                    <h1 className="display-5">{part.modelName}</h1>
                    <p className="lead text-muted">{part.manufacturer}</p>
                    <h2 className="text-primary my-3">{part.Prices?.[0]?.price ? `${part.Prices[0].price.toLocaleString()}원~` : '가격 정보 없음'}</h2>

                    <div className="card my-4">
                        <div className="card-header fw-bold">가격 정보</div>
                        <ul className="list-group list-group-flush">
                            {part.Prices && part.Prices.length > 0 ? (
                                part.Prices.map(priceInfo => (
                                    // [핵심 수정] 리스트 아이템 내부 구조를 변경합니다.
                                    <li key={priceInfo.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {priceInfo.url ? (
                                            <a href={priceInfo.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                {priceInfo.storeName || '구매하기'} <i className="bi bi-box-arrow-up-right ms-1"></i>
                                            </a>
                                        ) : (
                                            <span>{priceInfo.storeName || '온라인 최저가'}</span>
                                        )}
                                        <span className="fw-bold fs-5">{priceInfo.price.toLocaleString()}원</span>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item text-muted">등록된 가격 정보가 없습니다.</li>
                            )}
                        </ul>
                    </div>

                    <div className="card my-4">
                        <div className="card-header fw-bold">주요 스펙</div>
                        <ul className="list-group list-group-flush">
                            {part.spec && Object.keys(part.spec).length > 0 ? (
                                Object.entries(part.spec).map(([key, value]) => (
                                    <li key={key} className="list-group-item d-flex justify-content-between">
                                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>
                                        <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item text-muted">상세 스펙 정보가 없습니다.</li>
                            )}
                        </ul>
                    </div>

                    <div className="d-grid gap-2">
                        <Link to={part.Category ? `/parts/${part.Category.slug}` : '/'} className="btn btn-outline-secondary">
                            <i className="bi bi-list-ul me-2"></i>
                            목록으로 돌아가기
                        </Link>

                        {isAdmin && (
                            <>
                                {/* [신규] 수정 페이지로 이동하는 링크 버튼 */}
                                <Link to={`/admin/edit-part/${part.id}`} className="btn btn-warning mt-3">
                                    <i className="bi bi-pencil-fill me-2"></i>
                                    이 부품 수정하기 (관리자)
                                </Link>
                                <button onClick={handleDelete} className="btn btn-danger mt-1">
                                    <i className="bi bi-trash-fill me-2"></i>
                                    이 부품 삭제하기 (관리자)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartDetailPage;