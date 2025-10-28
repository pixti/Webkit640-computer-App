import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';
import PartSelectionModal from '../components/quote/PartSelectionModal';
import axios from 'axios';

const QuoteBuilderPage = () => {
    const { isLoggedIn, token } = useAuth();
    const { categories, loading: catsLoading } = useCategories();
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedParts, setSelectedParts] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalCategory, setModalCategory] = useState(null);

    useEffect(() => {
        const estimateToLoad = location.state?.estimateToLoad;
        if (estimateToLoad) {
            const initialParts = {};
            estimateToLoad.EstimateItems.forEach(item => {
                if (item.Part && item.Part.Category) {
                    const partData = {
                        ...item.Part,
                        Prices: [item.Price]
                    };
                    const categorySlug = item.Part.Category.slug;
                    initialParts[categorySlug] = { part: partData, quantity: item.quantity };
                }
            });
            setSelectedParts(initialParts);
            // 불러오기 후 state 초기화 (뒤로가기 등으로 다시 돌아왔을 때 재실행 방지)
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, navigate]);

    const totalPrice = useMemo(() => {
        return Object.values(selectedParts).reduce((sum, item) => {
            const price = item.part.Prices?.[0]?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    }, [selectedParts]);

    const handleOpenModal = (category) => {
        setModalCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalCategory(null);
    };

    const handleSelectPart = (categorySlug, part) => {
        setSelectedParts(prev => ({
            ...prev,
            [categorySlug]: { part: part, quantity: 1 },
        }));
        handleCloseModal();
    };

    const handleRemovePart = (categorySlug) => {
        setSelectedParts(prev => {
            const newParts = { ...prev };
            delete newParts[categorySlug];
            return newParts;
        });
    };

    const handleQuantityChange = (categorySlug, amount) => {
        setSelectedParts(prev => {
            const currentItem = prev[categorySlug];
            const newQuantity = currentItem.quantity + amount;
            if (newQuantity < 1) return prev;
            return {
                ...prev,
                [categorySlug]: { ...currentItem, quantity: newQuantity }
            };
        });
    };

    const handleSaveQuote = async () => {
        if (!isLoggedIn) {
            alert('견적 저장은 로그인이 필요합니다.');
            return;
        }
        const quoteName = prompt('저장할 견적의 이름을 입력해주세요.');
        if (!quoteName) {
            alert('견적 이름이 입력되지 않아 저장이 취소되었습니다.');
            return;
        }

        const quoteData = {
            name: quoteName,
            items: Object.values(selectedParts)
        };

        try {
            const response = await axios.post('http://localhost:5000/api/estimates', quoteData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message);
        } catch (err) {
            alert(err.response?.data?.message || '견적 저장에 실패했습니다.');
        }
    };

    const handleResetQuote = () => {
        if (window.confirm('현재 견적을 모두 비우시겠습니까?')) {
            setSelectedParts({});
        }
    };

    return (
        <div className="container my-4">
            <div className="row g-4">
                <div className="col-lg-8">
                    <h2>PC 견적 만들기</h2>
                    <div className="card">
                        <ul className="list-group list-group-flush">
                            {catsLoading ? <li className="list-group-item">카테고리 로딩 중...</li> :
                                categories.map(category => {
                                    const selectedItem = selectedParts[category.slug];
                                    return (
                                        <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                            <div className="fw-bold">{category.name}</div>
                                            <div className="text-end">
                                                {selectedItem ? (
                                                    <div className="d-flex align-items-center">
                                                        <div className="text-end me-2">
                                                            <div className="fw-semibold text-truncate">{selectedItem.part.modelName}</div>
                                                            <small className="text-muted">{selectedItem.part.Prices?.[0]?.price.toLocaleString()}원</small>
                                                        </div>
                                                        <div className="input-group input-group-sm" style={{width: '120px'}}>
                                                            <button className="btn btn-outline-secondary" type="button" onClick={() => handleQuantityChange(category.slug, -1)}>-</button>
                                                            <input type="text" className="form-control text-center" value={selectedItem.quantity} readOnly />
                                                            <button className="btn btn-outline-secondary" type="button" onClick={() => handleQuantityChange(category.slug, 1)}>+</button>
                                                        </div>
                                                        <button onClick={() => handleRemovePart(category.slug)} className="btn btn-sm btn-outline-danger ms-2">X</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleOpenModal(category)} className="btn btn-sm btn-outline-primary">부품 선택하기</button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card sticky-top" style={{ top: '100px' }}>
                        <div className="card-header fw-bold">견적 관리</div>
                        <div className="card-body">
                            <h5 className="card-title">현재 견적 총액</h5>
                            <p className="card-text fs-3 fw-bold text-primary">{totalPrice.toLocaleString()} 원</p>
                            <div className="d-grid gap-2">
                                <button onClick={handleSaveQuote} className="btn btn-success" disabled={!isLoggedIn || Object.keys(selectedParts).length === 0}>
                                    <i className="bi bi-save-fill me-2"></i>{isLoggedIn ? '현재 견적 저장' : '로그인 후 저장 가능'}
                                </button>
                                <button onClick={handleResetQuote} className="btn btn-outline-danger" disabled={Object.keys(selectedParts).length === 0}>
                                    <i className="bi bi-arrow-counterclockwise me-2"></i> 견적 초기화
                                </button>
                            </div>
                        </div>
                        {isLoggedIn && (
                            <div className="card-footer bg-transparent">
                                <div className="d-grid">
                                    <Link to="/mypage" className="btn btn-outline-secondary">
                                        <i className="bi bi-list-ul me-2"></i> 내 견적 목록 보기 / 불러오기
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <PartSelectionModal
                    category={modalCategory}
                    onSelect={handleSelectPart}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default QuoteBuilderPage;