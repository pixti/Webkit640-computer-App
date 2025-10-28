const db = require('../models');
const { User, UserStatus } = db; // UserStatus도 가져옵니다.
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// 1. 닉네임 변경
exports.updateNickname = async (req, res) => {
    try {
        const { nickname } = req.body;
        const userId = req.user.id; // 미들웨어에서 넣어준 현재 로그인한 사용자의 ID

        // [수정] 닉네임 중복 여부를 더 간결하게 확인합니다.
        // 다른 사용자가 이미 해당 닉네임을 사용하고 있는지 확인
        const existingUser = await User.findOne({ where: { nickname } });
        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
        }

        // [수정] 현재 사용자를 찾아서 바로 업데이트합니다.
        const [updatedRows] = await User.update(
            { nickname: nickname },
            { where: { id: userId } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // [추정] 성공 시, 새로운 닉네임을 응답에 포함시켜 프론트가 바로 업데이트할 수 있도록 합니다.
        res.status(200).json({ message: '닉네임이 성공적으로 변경되었습니다.', nickname: nickname });

    } catch (error) {
        console.error("닉네임 변경 오류:", error);
        res.status(500).json({ message: '서버 오류' });
    }
};


// 2. 비밀번호 변경
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // 현재 비밀번호가 맞는지 확인
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 새 비밀번호 암호화 및 저장
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

// [최종 수정] 회원 탈퇴 (상태 변경 방식)
exports.deleteUser = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // '탈퇴' 상태의 ID를 찾습니다.
        const withdrawnStatus = await UserStatus.findOne({ where: { status: '탈퇴' } });
        if (!withdrawnStatus) {
            // '탈퇴' 상태가 DB에 없는 비상 상황
            return res.status(500).json({ message: '탈퇴 처리 중 서버 오류가 발생했습니다.' });
        }

        // 사용자의 상태를 '탈퇴'로 변경합니다.
        user.statusId = withdrawnStatus.id;
        await user.save();

        res.status(200).json({ message: '회원 탈퇴가 성공적으로 처리되었습니다.' });
    } catch (error) {
        console.error("회원 탈퇴 오류:", error);
        res.status(500).json({ message: '서버 오류' });
    }
};


// --- 관리자 전용 기능 ---

// 1. 모든 사용자 목록 조회 (또는 검색)
exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { nickname: { [Op.like]: `%${search}%` } }
                ]
            };
        }
        const users = await db.User.findAll({
            where: whereClause,
            include: { model: db.UserStatus, attributes: ['status'] },
            attributes: { exclude: ['password'] } // 비밀번호 제외
        });
        res.status(200).json(users);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// 2. 모든 사용자 상태 목록 조회
exports.getAllUserStatuses = async (req, res) => {
    try {
        const statuses = await db.UserStatus.findAll();
        res.status(200).json(statuses);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// 3. 특정 사용자 상태 변경
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { statusId } = req.body;

        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        user.statusId = statusId;
        await user.save();

        // 변경된 사용자 정보를 다시 조회해서 반환
        const updatedUser = await db.User.findByPk(userId, {
            include: { model: db.UserStatus, attributes: ['status'] },
            attributes: { exclude: ['password'] }
        });

        res.status(200).json(updatedUser);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// --- [신규] 마이페이지용 기능 추가 ---

// 1. 내가 쓴 글 목록 가져오기
exports.getMyPosts = async (req, res) => {
    try {
        const userId = req.user.id; // protect 미들웨어가 넣어준 로그인된 사용자의 ID
        const posts = await db.Post.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: '내가 쓴 글을 불러오는 데 실패했습니다.' });
    }
};

// 2. 내가 쓴 댓글 목록 가져오기
exports.getMyComments = async (req, res) => {
    try {
        const userId = req.user.id;
        const comments = await db.Comment.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            // 댓글이 달린 원본 게시글 정보도 함께 보냅니다.
            include: [{ model: db.Post, attributes: ['id', 'title'] }]
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: '내가 쓴 댓글을 불러오는 데 실패했습니다.' });
    }
};