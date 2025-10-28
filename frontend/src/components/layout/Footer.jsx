import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-body-tertiary border-top mt-auto py-4">
            <div className="container">
                <div className="row text-center text-md-start">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h5 className="fw-bold">컴퓨터 부품 가격 비교</h5>
                        <p className="small text-muted">최적의 PC 부품을 최저가로 찾아보세요.</p>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h5 className="fw-semibold">제작자</h5>
                        <p className="small text-muted mb-0">박재형</p>
                        <p className="small text-muted">기존 프로젝트를 React로 리팩토링</p>
                    </div>
                    <div className="col-md-4">
                        <h5 className="fw-semibold">기술 스택</h5>
                        <p className="small text-muted mb-0">React, Vite, Bootstrap, Axios</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;