const db = require('../models');
const bcrypt = require('bcryptjs');     // [추가] 비밀번호 비교를 위해 import
const jwt = require('jsonwebtoken'); // [추가] JWT 토큰 생성을 위해 import
const { User, UserStatus } = db; // UserStatus를 db에서 직접 가져옵니다.

exports.register = async (req, res) => {
    try {
        const { username, nickname, password } = req.body;

        const existingUser = await User.findOne({
            where: { [db.Sequelize.Op.or]: [{ username }, { nickname }] }
        });

        if (existingUser) {
            return res.status(409).json({ message: '이미 사용 중인 아이디 또는 닉네임입니다.' });
        }

        // '정상' 상태의 ID를 찾거나, 없으면 새로 생성합니다.
        const [status] = await UserStatus.findOrCreate({
            where: { status: '정상' },
        });

        // 새로운 유저를 생성하면서, statusId를 연결해줍니다.
        const newUser = await User.create({
            username,
            nickname,
            password, // password 필드가 이제 존재하므로 정상적으로 저장됩니다.
            statusId: status.id, // '정상' 상태의 ID를 FK로 저장
        });

        res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.' });

    } catch (error) {
        console.error('회원가입 처리 중 에러:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
};

// [최종 수정] 로그인 함수
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            where: { username },
            include: UserStatus
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        const userStatus = user.UserStatus?.status;

        if (userStatus === '정상') {
            // [핵심 수정] payload와 응답 JSON에 모두 user.id를 포함시킵니다.
            const payload = { id: user.id, username: user.username, nickname: user.nickname, role: user.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'jwt_secret', { expiresIn: '1h' });

            res.status(200).json({
                token,
                id: user.id, // <-- 이 부분이 추가되었습니다!
                username: user.username,
                nickname: user.nickname,
                role: user.role
            });

        } else if (userStatus === '정지') {
            res.status(403).json({ message: '관리자에 의해 정지된 계정입니다. 고객센터에 문의하세요.' });
        } else if (userStatus === '탈퇴') {
            res.status(403).json({ message: '이미 탈퇴 처리된 계정입니다.' });
        } else {
            res.status(500).json({ message: '알 수 없는 계정 상태입니다.' });
        }
    } catch (error) {
        console.error('로그인 처리 중 에러:', error);
        res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
    }
};