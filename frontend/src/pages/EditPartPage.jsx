import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useCategories from '../hooks/useCategories';
import usePartDetail from '../hooks/usePartDetail';

const EditPartPage = () => {
    const { partId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { categories } = useCategories();
    const { part: initialPart, loading } = usePartDetail(partId);

    // [수정] state의 'link'를 'url'로 변경
    const [partData, setPartData] = useState({
        modelName: '', manufacturer: '', price: '', storeName: '', imageUrl: '', url: '', categoryId: '', spec: ''
    });

    useEffect(() => {
        if (initialPart) {
            setPartData({
                modelName: initialPart.modelName || '',
                manufacturer: initialPart.manufacturer || '',
                price: initialPart.Prices?.[0]?.price || '',
                storeName: initialPart.Prices?.[0]?.storeName || '',
                imageUrl: initialPart.imageUrl || '',
                url: initialPart.Prices?.[0]?.url || '', // [수정] link -> url
                categoryId: initialPart.categoryId || '',
                spec: initialPart.spec ? JSON.stringify(initialPart.spec, null, 2) : '',
            });
        }
    }, [initialPart]);

    const handleChange = (e) => setPartData({ ...partData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        let specData = null;
        if (partData.spec) {
            try { specData = JSON.parse(partData.spec); }
            catch (err) { alert('스펙(JSON) 형식이 올바르지 않습니다.'); return; }
        }
        const finalPartData = { ...partData, spec: specData };
        try {
            await axios.put(`http://localhost:5000/api/parts/${partId}`, finalPartData, { headers: { Authorization: `Bearer ${token}` } });
            alert('부품 정보가 성공적으로 수정되었습니다.');
            navigate(`/part/${partId}`);
        } catch (err) {
            alert(err.response?.data?.message || '부품 수정에 실패했습니다.');
        }
    };

    if (loading) return <div className="container my-4">부품 정보 로딩 중...</div>;

    return (
        <div className="container my-5">
            <h2>부품 정보 수정</h2>
            <hr />
            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3"><label className="form-label">모델명</label><input type="text" name="modelName" value={partData.modelName} onChange={handleChange} className="form-control" required /></div>
                        <div className="mb-3"><label className="form-label">제조사</label><input type="text" name="manufacturer" value={partData.manufacturer} onChange={handleChange} className="form-control" /></div>
                        <div className="mb-3"><label className="form-label">대표 가격</label><input type="number" name="price" value={partData.price} onChange={handleChange} className="form-control" /></div>
                        <div className="mb-3"><label className="form-label">쇼핑몰 명</label><input type="text" name="storeName" value={partData.storeName} onChange={handleChange} className="form-control" /></div>
                        {/* [수정] input의 name을 'link'에서 'url'로 변경 */}
                        <div className="mb-3"><label className="form-label">상품 페이지 URL</label><input type="text" name="url" value={partData.url} onChange={handleChange} className="form-control" /></div>
                        <div className="mb-3"><label className="form-label">이미지 URL</label><input type="text" name="imageUrl" value={partData.imageUrl} onChange={handleChange} className="form-control" /></div>
                        <div className="mb-3">
                            <label className="form-label">카테고리</label>
                            <select name="categoryId" value={partData.categoryId} onChange={handleChange} className="form-select" required>
                                <option value="">카테고리를 선택하세요</option>
                                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">스펙 (JSON 형식)</label>
                            <textarea name="spec" value={partData.spec} onChange={handleChange} className="form-control" rows="5"></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">수정 완료</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPartPage;