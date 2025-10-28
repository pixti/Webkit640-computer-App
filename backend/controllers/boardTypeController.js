const db = require('../models');
const BoardType = db.BoardType;

/**
 * 1. 모든 게시판 종류 목록 가져오기 (GET /api/board-types)
 */
exports.getAllBoardTypes = async (req, res) => {
    try {
        const boardTypes = await BoardType.findAll({
            order: [['id', 'ASC']] // ID 순서대로 정렬
        });
        res.status(200).json(boardTypes);
    } catch (error) {
        console.error("게시판 종류 조회 오류:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// [수정] 새 게시판 종류 생성 - name과 slug를 모두 받도록 변경
exports.createBoardType = async (req, res) => {
    try {
        // 프론트에서 name과 slug를 모두 받습니다.
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: '게시판 이름과 슬러그는 필수입니다.' });
        }

        // 이름 또는 슬러그 중복 확인
        const existingBoardType = await BoardType.findOne({ where: { [db.Sequelize.Op.or]: [{ name }, { slug }] }});
        if (existingBoardType) {
            return res.status(409).json({ message: '이미 존재하는 게시판 이름 또는 슬러그입니다.' });
        }

        const newBoardType = await BoardType.create({ name, slug });
        res.status(201).json(newBoardType);
    } catch (error) {
        console.error("게시판 생성 오류:", error);
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};


/**
 * 3. 게시판 종류 삭제 (DELETE /api/board-types/:id) - 관리자 전용
 */
exports.deleteBoardType = async (req, res) => {
    try {
        const { id } = req.params;
        const boardType = await BoardType.findByPk(id);

        if (!boardType) {
            return res.status(404).json({ message: '삭제할 게시판을 찾을 수 없습니다.' });
        }

        // (주의) 이 게시판에 속한 게시글이 있을 경우 삭제가 실패할 수 있습니다.
        // 실제 운영 시에는 관련 게시글을 다른 게시판으로 옮기거나, 함께 삭제하는 정책이 필요합니다.
        await boardType.destroy();

        res.status(200).json({ message: '게시판이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("게시판 삭제 오류:", error);
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};