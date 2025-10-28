import React from 'react';
import { Link } from 'react-router-dom';
import CategorySidebar from '../components/home/CategorySidebar.jsx';
import CommunitySection from '../components/home/CommunitySection.jsx';
import PartSection from '../components/home/PartSection.jsx';

const HomePage = () => {
    return (
        <main className="container-lg my-4">
            <div className="row g-4">
                {/* 왼쪽 메인 컨텐츠 */}
                <div className="col-lg-9">
                    <div className="vstack gap-4">
                        {/* 환영 박스 */}
                        <div className="card">
                            <div className="card-body p-4">
                                <h1 className="h4 fw-bold">👋 컴퓨터 부품 가격 비교 사이트에 오신 것을 환영합니다!</h1>
                                <div className="mt-4">
                                    <h2 className="h6 fw-bold">나만의 PC 견적 만들기</h2>
                                    <p className="small text-muted">
                                        <Link to="/quote-builder">견적 만들기</Link> 페이지에서 원하는 부품을 직접 선택하여 최적의 PC를 조립해보세요.
                                    </p>
                                    <h2 className="h6 fw-bold mt-3">커뮤니티에서 소통하세요</h2>
                                    <p className="small text-muted">
                                        완성된 견적을 다른 사용자들과 공유하거나, PC에 대한 질문을 자유롭게 남길 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 커뮤니티 섹션 */}
                        <CommunitySection />

                        {/* 부품 섹션 */}
                        <div className="mt-2">
                            <h2 className="h5 fw-bold mb-3">최신 부품 정보 보기</h2>
                            <PartSection />
                        </div>
                    </div>
                </div>

                {/* 오른쪽 사이드바 */}
                <div className="col-lg-3">
                    <CategorySidebar />
                </div>
            </div>
        </main>
    );
};

export default HomePage;