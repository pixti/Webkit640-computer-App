import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import useBoardTypes from '../hooks/useBoardTypes'; // 게시판 훅 import

// [최종 수정] 견적 객체를 요청하신 포맷의 텍스트로 변환하는 헬퍼 함수
function generateQuoteText(quote) {
    if (!quote || !quote.EstimateItems) return '';

    // 부품 목록 생성
    const itemsText = quote.EstimateItems.map(item => {
        const partName = item.Part?.modelName || '알 수 없는 부품';
        const price = item.Price?.price || 0;
        const quantity = item.quantity;
        return `${partName}, ${price.toLocaleString()}원, ${quantity}개`;
    }).join('\n'); // 각 항목을 줄바꿈으로 연결

    // 최종 텍스트 조합
    let text = "부품명, 가격, 수량\n";
    text += itemsText;
    text += "\n-----\n";
    text += `총 가격 : ${quote.totalPrice.toLocaleString()}원`;

    return text;
}

const CreatePostPage = () => {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { boardTypes } = useBoardTypes();

    const quoteToShare = location.state?.quoteToShare;

    const [title, setTitle] = useState(quoteToShare ? `${quoteToShare.name} 견적 공유합니다.` : '');
    const [content, setContent] = useState('');
    const [boardTypeId, setBoardTypeId] = useState('');

    useEffect(() => {
        if (quoteToShare) {
            setContent(generateQuoteText(quoteToShare));
            const quoteBoard = boardTypes.find(b => b.name === '견적 공유');
            if (quoteBoard) setBoardTypeId(quoteBoard.id);
        }
    }, [quoteToShare, boardTypes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!boardTypeId) {
            alert('게시판 카테고리를 선택해주세요.');
            return;
        }
        const postData = {
            title,
            content,
            boardTypeId,
            // [수정] quoteId 대신 estimateId를 보냅니다. quoteToShare는 사실 estimate 객체입니다.
            estimateId: quoteToShare ? quoteToShare.id : null,
        };
        try {
            const res = await axios.post('http://localhost:5000/api/posts', postData, { headers: { Authorization: `Bearer ${token}` } });
            alert('게시글이 성공적으로 작성되었습니다.');
            // [수정] /post/ 가 아닌 /community/post/:id 로 이동해야 할 수 있습니다. 라우터를 확인하세요.
            navigate(`/post/${res.data.id}`);
        } catch (err) {
            alert(err.response?.data?.message || '게시글 작성에 실패했습니다.');
        }
    };

    return (
        <div className="container my-4">
            <div className="card">
                <div className="card-header"><h3>새 게시글 작성</h3></div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">게시판 카테고리 선택</label>
                            <select className="form-select" value={boardTypeId} onChange={e => setBoardTypeId(e.target.value)} required>
                                <option value="" disabled>-- 선택하세요 --</option>
                                {boardTypes.map(bt => ( <option key={bt.id} value={bt.id}>{bt.name}</option> ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">제목</label>
                            <input id="title" type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="content" className="form-label">내용</label>
                            <textarea id="content" className="form-control" rows="10" value={content} onChange={e => setContent(e.target.value)} required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">작성 완료</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// useBoardTypes 훅은 별도 파일로 분리했으므로 여기서는 제거
export default CreatePostPage;