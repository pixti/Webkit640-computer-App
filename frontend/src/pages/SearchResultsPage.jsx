import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useSearch from '../hooks/useSearch.js';
import PartCard from '../components/parts/PartCard.jsx';
import useCategories from '../hooks/useCategories';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const { categories } = useCategories();

    // --- [수정] 필터 상태를 부품/게시글로 분리 ---
    const [showPartFilters, setShowPartFilters] = useState(false);
    const [partFilters, setPartFilters] = useState({ categoryId: '', minPrice: '', maxPrice: '' });

    const [showPostFilters, setShowPostFilters] = useState(false);
    const [postFilters, setPostFilters] = useState({
        searchIn: { title: true, content: true, author: true }
    });

    // [수정] useSearch 훅에 두 필터 객체를 모두 전달
    const { results, loading, error } = useSearch(query, { partFilters, postFilters });

    // --- 필터 핸들러 함수들 ---
    const handlePartFilterChange = (e) => setPartFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePartFilterReset = () => setPartFilters({ categoryId: '', minPrice: '', maxPrice: '' });

    const handlePostFilterChange = (e) => {
        const { name, checked } = e.target;
        setPostFilters(prev => ({
            ...prev,
            searchIn: { ...prev.searchIn, [name]: checked }
        }));
    };

    const { parts, posts, comments } = results;

    return (
        <div className="container my-4">
            <h2 className="mb-4">"{query}"에 대한 검색 결과</h2>

            {loading && <div className="text-center my-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="vstack gap-4">
                    {/* 부품 검색 결과 섹션 */}
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">부품 검색 결과 ({parts.length})</h5>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowPartFilters(!showPartFilters)}>
                                <i className="bi bi-funnel-fill me-1"></i> 필터 {showPartFilters ? '닫기' : '열기'}
                            </button>
                        </div>
                        {showPartFilters && (
                            <div className="card-body bg-light">
                                <div className="row g-2 align-items-end">
                                    <div className="col-lg-4"><label className="form-label small">카테고리</label><select name="categoryId" value={partFilters.categoryId} onChange={handlePartFilterChange} className="form-select form-select-sm"><option value="">전체</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                    <div className="col-lg-3"><label className="form-label small">최소 가격</label><input type="number" name="minPrice" value={partFilters.minPrice} onChange={handlePartFilterChange} className="form-control form-control-sm" /></div>
                                    <div className="col-lg-3"><label className="form-label small">최대 가격</label><input type="number" name="maxPrice" value={partFilters.maxPrice} onChange={handlePartFilterChange} className="form-control form-control-sm" /></div>
                                    <div className="col-lg-2"><button className="btn btn-sm btn-secondary w-100" onClick={handlePartFilterReset}>초기화</button></div>
                                </div>
                            </div>
                        )}
                        <div className="card-body">
                            {parts.length > 0 ? <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">{parts.map(p => <div key={`part-${p.id}`} className="col"><PartCard part={p} /></div>)}</div> : <p className="text-muted m-0">일치하는 부품이 없습니다.</p>}
                        </div>
                    </div>

                    {/* 게시글 검색 결과 섹션 */}
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">게시글 검색 결과 ({posts.length})</h5>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowPostFilters(!showPostFilters)}>
                                <i className="bi bi-funnel-fill me-1"></i> 필터 {showPostFilters ? '닫기' : '열기'}
                            </button>
                        </div>
                        {showPostFilters && (
                            <div className="card-body bg-light">
                                <label className="form-label small">검색 범위</label>
                                <div className="d-flex gap-3">
                                    <div className="form-check"><input className="form-check-input" type="checkbox" name="title" checked={postFilters.searchIn.title} onChange={handlePostFilterChange} id="checkTitle" /><label className="form-check-label" htmlFor="checkTitle">제목</label></div>
                                    <div className="form-check"><input className="form-check-input" type="checkbox" name="content" checked={postFilters.searchIn.content} onChange={handlePostFilterChange} id="checkContent" /><label className="form-check-label" htmlFor="checkContent">내용</label></div>
                                    <div className="form-check"><input className="form-check-input" type="checkbox" name="author" checked={postFilters.searchIn.author} onChange={handlePostFilterChange} id="checkAuthor" /><label className="form-check-label" htmlFor="checkAuthor">작성자</label></div>
                                </div>
                            </div>
                        )}
                        <div className="list-group list-group-flush">
                            {posts.length > 0 ? posts.map(p => <Link key={`post-${p.id}`} to={`/post/${p.id}`} className="list-group-item list-group-item-action"><div className="d-flex w-100 justify-content-between"><h6 className="mb-1 text-truncate">{p.title}</h6><small>{new Date(p.createdAt).toLocaleDateString()}</small></div><small className="text-muted">작성자: {p.User?.nickname || '알 수 없음'}</small></Link>) : <div className="card-body text-muted"><p className="m-0">일치하는 게시글이 없습니다.</p></div>}
                        </div>
                    </div>

                    {/* [신규] 댓글 검색 결과 섹션 */}
                    <div className="card">
                        <div className="card-header"><h5 className="mb-0">댓글 검색 결과 ({comments.length})</h5></div>
                        <div className="list-group list-group-flush">
                            {comments.length > 0 ? comments.map(c => <Link key={`comment-${c.id}`} to={`/post/${c.Post?.id}`} className="list-group-item list-group-item-action"><p className="mb-1 text-truncate">"{c.content}"</p><small className="text-muted">'{c.Post?.title || '원글'}' 글에서 {c.User?.nickname || '사용자'}님이 작성</small></Link>) : <div className="card-body text-muted"><p className="m-0">일치하는 댓글이 없습니다.</p></div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;