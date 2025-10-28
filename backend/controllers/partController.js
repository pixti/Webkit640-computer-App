const db = require('../models');
const Part = db.Part;
const Category = db.Category;
const { Op } = require('sequelize');
const Price = db.Price; // Price 모델 import 추가

// 카테고리별 부품 목록 (최저가 포함)
exports.getPartsByCategory = async (req, res) => {
    try {
        const { category: categorySlug } = req.query;
        if (!categorySlug) return res.status(400).json({ message: '카테고리를 지정해야 합니다.' });

        const category = await Category.findOne({ where: { slug: categorySlug } });
        if (!category) return res.status(404).json({ message: '존재하지 않는 카테고리입니다.'});

        const parts = await Part.findAll({
            where: { categoryId: category.id },
            // [수정] 각 부품에 연결된 가격 정보도 함께 가져옴
            include: [{
                model: Price,
                order: [['price', 'ASC']], // 가격이 가장 낮은 순으로 정렬
            }]
        });
        res.status(200).json(parts);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// 부품 상세 정보 (모든 가격 정보 포함)
exports.getPartById = async (req, res) => {
    try {
        const { id } = req.params;
        const part = await Part.findByPk(id, {
            include: [
                Category,
                { model: Price, order: [['price', 'ASC']] } // 모든 가격 정보를 오름차순으로
            ]
        });
        // ...
        res.status(200).json(part);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// [수정] 홈페이지용: 최신 부품 목록 (최저가 포함)
exports.getLatestParts = async (req, res) => {
    try {
        const latestParts = await Part.findAll({
            order: [['createdAt', 'DESC']],
            limit: 6,
            include: [{ // [추가] 가격 정보를 함께 가져옵니다.
                model: Price,
                order: [['price', 'ASC']],
            }]
        });
        res.status(200).json(latestParts);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// GET /api/parts/search?q=...
exports.searchParts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: '검색어를 입력해야 합니다.' });

        const parts = await Part.findAll({
            where: { [Op.or]: [ { modelName: { [Op.like]: `%${q}%` } }, { manufacturer: { [Op.like]: `%${q}%` } } ] },
            include: [Category]
        });
        res.status(200).json(parts);
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// DELETE /api/parts/:id
exports.deletePart = async (req, res) => {
    try {
        const { id } = req.params;
        const part = await Part.findByPk(id);
        if (!part) return res.status(404).json({ message: '삭제할 부품을 찾을 수 없습니다.' });

        await part.destroy();
        res.status(200).json({ message: '부품이 성공적으로 삭제되었습니다.' });
    } catch (error) { res.status(500).json({ message: '서버 오류' }); }
};

// [수정] 신규 부품 생성: 'link' 대신 'url'을 받도록 변경
exports.createPart = async (req, res) => {
    try {
        const { modelName, manufacturer, spec, imageUrl, categoryId, price, storeName, url } = req.body; // link -> url

        if (!modelName || !categoryId) {
            return res.status(400).json({ message: '모델명과 카테고리는 필수 항목입니다.' });
        }

        const result = await db.sequelize.transaction(async (t) => {
            const newPart = await Part.create({
                modelName, manufacturer, spec, imageUrl, categoryId,
            }, { transaction: t });

            if (price && url) { // link -> url
                await Price.create({
                    price: Number(price),
                    storeName: storeName || '대표 최저가',
                    url: url, // link -> url
                    partId: newPart.id,
                }, { transaction: t });
            }
            return newPart;
        });
        res.status(201).json(result);
    } catch (error) {
        console.error("부품 생성 오류:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

// [수정] 기존 부품 정보 수정: 'link' 대신 'url'을 받도록 변경 (이미 되어있었지만 명확히 함)
exports.updatePart = async (req, res) => {
    try {
        const { id } = req.params;
        const { modelName, manufacturer, spec, imageUrl, categoryId, price, storeName, url } = req.body;

        const result = await db.sequelize.transaction(async (t) => {
            const part = await Part.findByPk(id, { transaction: t });
            if (!part) {
                throw new Error('NOT_FOUND');
            }

            await part.update({
                modelName, manufacturer, spec, imageUrl, categoryId
            }, { transaction: t });

            const [priceInfo, created] = await Price.findOrCreate({
                where: { partId: id },
                defaults: { price: Number(price) || 0, storeName, url },
                transaction: t
            });

            if (!created) {
                await priceInfo.update({
                    price: Number(price) || 0, storeName, url
                }, { transaction: t });
            }
            return part;
        });
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ message: '수정할 부품을 찾을 수 없습니다.' });
        }
        console.error("부품 수정 오류:", error);
        res.status(500).json({ message: '서버 오류' });
    }
};