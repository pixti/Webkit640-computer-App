const db = require('../models');
const Category = db.Category;

// 모든 카테고리 목록 가져오기 (GET /api/categories)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['id', 'ASC']] // ID 순서대로 정렬
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

// [추가] 새 카테고리 생성
exports.createCategory = async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: '카테고리 이름과 슬러그는 필수입니다.' });
        }
        const newCategory = await Category.create({ name, slug });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};

// [추가] 카테고리 삭제
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: '삭제할 카테고리를 찾을 수 없습니다.' });
        }
        await category.destroy();
        res.status(200).json({ message: '카테고리가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
};