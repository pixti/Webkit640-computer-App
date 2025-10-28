const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

exports.protect = async (req, res, next) => {
    let token;

    // 1. 요청 헤더(Authorization)에 토큰이 있는지, 'Bearer'로 시작하는지 확인
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 'Bearer ' 부분을 잘라내고 순수 토큰만 추출
            token = req.headers.authorization.split(' ')[1];

            // 2. 토큰이 유효한지 검증 (비밀 키 'jwt_secret' 사용)
            const decoded = jwt.verify(token, 'jwt_secret');

            // 3. 토큰 정보(decoded.id)를 이용해 DB에서 사용자 정보를 찾아 요청 객체에 추가
            // 비밀번호는 제외하고 가져옴
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            next(); // 검사 통과! 다음 로직으로 진행
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: '인증에 실패했습니다. (유효하지 않은 토큰)' });
        }
    }

    if (!token) {
        res.status(401).json({ message: '인증에 실패했습니다. (토큰 없음)' });
    }
};

// [추가] 관리자 권한 확인 미들웨어
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: '접근 권한이 없습니다. (관리자 아님)' });
    }
};