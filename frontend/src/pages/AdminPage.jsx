import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import useCategories from '../hooks/useCategories';

// --- 게시판 종류 데이터를 가져오는 훅 ---
const useBoardTypes = () => {
    const [boardTypes, setBoardTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBoardTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/board-types');
            setBoardTypes(res.data);
        } catch (err) {
            setError('게시판 목록 로딩 실패');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardTypes();
    }, []);

    return { boardTypes, loading, error, setBoardTypes };
};


// --- 메인 관리자 페이지 컴포넌트 ---
const AdminPage = () => {
    return (
        <div className="container my-5">
            <h2 className="mb-4">관리자 페이지</h2>
            <UserManagement />
            <hr className="my-4"/>
            <div className="row g-4">
                <div className="col-lg-6 col-xl-4"><CategoryManagement /></div>
                <div className="col-lg-6 col-xl-4"><BoardTypeManagement /></div>
                <div className="col-lg-12 col-xl-4"><PartManagement /></div>
            </div>
        </div>
    );
};

// [최종 수정] 사용자 관리 컴포넌트
const UserManagement = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // [수정] useEffect를 두 개로 분리하여 각자 역할에 집중
    useEffect(() => {
        // 컴포넌트가 처음 로드될 때 모든 사용자 상태 목록을 한 번만 불러옴
        const fetchStatuses = async () => {
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:5000/api/users/statuses', { headers: { Authorization: `Bearer ${token}` } });
                setStatuses(res.data);
            } catch (err) { console.error("상태 목록 로딩 실패", err); }
        };
        fetchStatuses();
    }, [token]);

    useEffect(() => {
        // 검색어가 바뀔 때마다 사용자 목록을 다시 불러옴
        const fetchUsers = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/users?search=${searchTerm}`, { headers: { Authorization: `Bearer ${token}` } });
                setUsers(res.data);
            } catch (err) { console.error("사용자 검색 실패", err); }
            finally { setLoading(false); }
        };
        fetchUsers();
    }, [token, searchTerm]); // searchTerm이 바뀔 때마다 이 useEffect가 다시 실행됨

    const handleSearch = (e) => {
        e.preventDefault();
        // 검색 버튼은 입력된 searchTerm으로 useEffect를 트리거하기만 하면 됨
        // (실제로는 입력할 때마다 바로 검색되므로, 이 함수가 꼭 필요하지는 않음)
    };

    const handleStatusChange = async (targetUser, newStatusId) => {
        const newStatus = statuses.find(s => s.id === parseInt(newStatusId));
        if (!newStatus) return;

        if (newStatus.status === '탈퇴') {
            const confirmation = prompt(`정말로 '${targetUser.nickname}' 사용자를 탈퇴 처리하시겠습니까?\n이 작업은 되돌릴 수 없습니다.\n\n확인하시려면 사용자의 아이디(${targetUser.username})를 입력해주세요.`);
            if (confirmation !== targetUser.username) {
                alert('입력한 아이디가 일치하지 않아 취소되었습니다.');
                return; // 변경 취소
            }
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/users/${targetUser.id}/status`,
                { statusId: newStatusId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(u => u.id === targetUser.id ? res.data : u));
            alert(`'${targetUser.nickname}' 사용자의 상태가 '${newStatus.status}'(으)로 변경되었습니다.`);
        } catch (err) {
            alert('상태 변경에 실패했습니다.');
        }
    };

    return (
        <div className="card">
            <div className="card-header"><h5>사용자 관리</h5></div>
            <div className="card-body">
                <form onSubmit={handleSearch} className="input-group mb-3">
                    <input type="text" className="form-control" placeholder="아이디 또는 닉네임으로 검색" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <button className="btn btn-outline-secondary" type="submit">검색</button>
                </form>
                {loading ? <p>로딩 중...</p> : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead><tr><th>ID</th><th>아이디</th><th>닉네임</th><th>가입일</th><th>상태</th></tr></thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.nickname}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ minWidth: '150px' }}>
                                        <select
                                            className="form-select form-select-sm"
                                            value={user.statusId}
                                            onChange={(e) => handleStatusChange(user, e.target.value)}
                                            disabled={user.role === 'admin'}
                                        >
                                            {statuses.map(status => (
                                                <option key={status.id} value={status.id}>{status.status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 카테고리 관리 컴포넌트 ---
const CategoryManagement = () => {
    const { token } = useAuth();
    const { categories, setCategories } = useCategories();
    const [newCategory, setNewCategory] = useState({ name: '', slug: '' });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/categories', newCategory, { headers: { Authorization: `Bearer ${token}` } });
            setCategories([...categories, res.data]);
            setNewCategory({ name: '', slug: '' });
            alert('카테고리가 추가되었습니다.');
        } catch (err) {
            alert(err.response?.data?.message || '카테고리 추가에 실패했습니다.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까? 관련된 부품 정보도 영향을 받을 수 있습니다.')) {
            try {
                await axios.delete(`http://localhost:5000/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setCategories(categories.filter(c => c.id !== id));
                alert('카테고리가 삭제되었습니다.');
            } catch (err) {
                alert(err.response?.data?.message || '카테고리 삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div className="card h-100">
            <div className="card-header"><h5>부품 카테고리 관리</h5></div>
            <div className="card-body">
                <form onSubmit={handleAdd} className="mb-3">
                    <input type="text" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="카테고리 이름 (예: 쿨러/팬)" required className="form-control mb-2" />
                    <input type="text" value={newCategory.slug} onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })} placeholder="슬러그 (영문, 예: cooler)" required className="form-control mb-2" />
                    <button type="submit" className="btn btn-success w-100">카테고리 추가</button>
                </form>
                <hr />
                <ul className="list-group">
                    {categories.map(cat => (
                        <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{cat.name} ({cat.slug})</span>
                            <button onClick={() => handleDelete(cat.id)} className="btn btn-sm btn-outline-danger">삭제</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- 게시판 관리 컴포넌트 ---
const BoardTypeManagement = () => {
    const { token } = useAuth();
    const { boardTypes, setBoardTypes } = useBoardTypes();
    const [newBoardType, setNewBoardType] = useState({ name: '', slug: '' });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/board-types', newBoardType, { headers: { Authorization: `Bearer ${token}` } });
            setBoardTypes([...boardTypes, res.data]);
            setNewBoardType({ name: '', slug: '' });
            alert('게시판이 추가되었습니다.');
        } catch (err) {
            alert(err.response?.data?.message || '게시판 추가에 실패했습니다.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 게시판을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:5000/api/board-types/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setBoardTypes(boardTypes.filter(b => b.id !== id));
                alert('게시판이 삭제되었습니다.');
            } catch (err) {
                alert(err.response?.data?.message || '게시판 삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div className="card h-100">
            <div className="card-header"><h5>커뮤니티 게시판 관리</h5></div>
            <div className="card-body">
                <form onSubmit={handleAdd} className="mb-3">
                    <input type="text" value={newBoardType.name} onChange={e => setNewBoardType({ ...newBoardType, name: e.target.value })} placeholder="게시판 이름 (예: PC갤러리)" required className="form-control mb-2" />
                    <input type="text" value={newBoardType.slug} onChange={e => setNewBoardType({ ...newBoardType, slug: e.target.value })} placeholder="슬러그 (예: pc-gallery)" required className="form-control mb-2" />
                    <button type="submit" className="btn btn-success w-100">게시판 추가</button>
                </form>
                <hr />
                <ul className="list-group">
                    {boardTypes.map(bt => (
                        <li key={bt.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>{bt.name} ({bt.slug})</span>
                            <button onClick={() => handleDelete(bt.id)} className="btn btn-sm btn-outline-danger">삭제</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


// --- 신규 부품 등록 컴포넌트 ---
const PartManagement = () => {
    const { token } = useAuth();
    const { categories } = useCategories();
    // [수정] state의 'link'를 'url'로 변경
    const [partData, setPartData] = useState({ modelName: '', manufacturer: '', price: '', storeName: '', imageUrl: '', url: '', categoryId: '', spec: '' });

    const handleChange = (e) => setPartData({ ...partData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        let specData = null;
        if (partData.spec) {
            try { specData = JSON.parse(partData.spec); }
            catch (err) { alert('스펙(JSON) 형식이 올바르지 않습니다.'); return; }
        }
        const finalPartData = { ...partData, price: Number(partData.price) || null, spec: specData };
        try {
            await axios.post('http://localhost:5000/api/parts', finalPartData, { headers: { Authorization: `Bearer ${token}` } });
            alert('새로운 부품과 가격 정보가 성공적으로 등록되었습니다.');
            // [수정] state 초기화 시 'link'를 'url'로 변경
            setPartData({ modelName: '', manufacturer: '', price: '', storeName: '', imageUrl: '', url: '', categoryId: '', spec: '' });
        } catch (err) {
            alert(err.response?.data?.message || '부품 등록에 실패했습니다.');
        }
    };

    return (
        <div className="card h-100">
            <div className="card-header"><h5>신규 부품 등록</h5></div>
            <div className="card-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3"><label className="form-label">모델명</label><input type="text" name="modelName" value={partData.modelName} onChange={handleChange} className="form-control" required /></div>
                    <div className="mb-3"><label className="form-label">제조사</label><input type="text" name="manufacturer" value={partData.manufacturer} onChange={handleChange} className="form-control" /></div>
                    <div className="mb-3"><label className="form-label">대표 가격</label><input type="number" name="price" value={partData.price} onChange={handleChange} className="form-control" /></div>
                    <div className="mb-3"><label className="form-label">이미지 URL</label><input type="text" name="imageUrl" value={partData.imageUrl} onChange={handleChange} className="form-control" /></div>
                    <div className="mb-3"><label className="form-label">쇼핑몰 명</label><input type="text" name="storeName" value={partData.storeName} onChange={handleChange} className="form-control" placeholder="예: 다나와" /></div>
                    {/* [수정] input의 name을 'link'에서 'url'로 변경 */}
                    <div className="mb-3"><label className="form-label">상품 페이지 URL</label><input type="text" name="url" value={partData.url} onChange={handleChange} className="form-control" /></div>
                    <div className="mb-3">
                        <label className="form-label">카테고리</label>
                        <select name="categoryId" value={partData.categoryId} onChange={handleChange} className="form-select" required>
                            <option value="">카테고리를 선택하세요</option>
                            {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">스펙 (JSON 형식)</label>
                        <textarea name="spec" value={partData.spec} onChange={handleChange} className="form-control" rows="3" placeholder='예: {"cores": 16}'></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">부품 등록</button>
                </form>
            </div>
        </div>
    );
};

export default AdminPage;