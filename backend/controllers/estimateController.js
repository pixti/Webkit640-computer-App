const db = require('../models');
const { Estimate, EstimateItem, Part, Price, Category, User, Quotation } = db;

/**
 * 1. 견적 저장 (POST /api/estimates)
 */
exports.saveEstimate = async (req, res) => {
    const { name, items } = req.body;
    const userId = req.user.id;

    if (!name || !items || items.length === 0) {
        return res.status(400).json({ message: '견적 이름과 부품 목록은 필수입니다.' });
    }

    try {
        const result = await db.sequelize.transaction(async (t) => {
            // 기초 정보 (estimates) 저장
            const newEstimate = await Estimate.create({ name, userId }, { transaction: t });

            // 상세 정보 (estimateitems) 저장
            const estimateItemsData = req.body.items.map(item => ({
                estimateId: newEstimate.id,
                partId: item.part.id,
                priceId: item.part.Prices[0].id,
                quantity: item.quantity,
            }));
            const newEstimateItems = await EstimateItem.bulkCreate(estimateItemsData, { transaction: t, returning: true });

            // 최상위 견적 정보 (quotations) 저장
            // 여기서는 첫 번째 아이템을 대표로 연결합니다.
            await Quotation.create({
                estimateId: newEstimate.id,
                estimateItemId: newEstimateItems[0].id
            }, { transaction: t });

            return newEstimate;
        });
        res.status(201).json({ message: '견적이 성공적으로 저장되었습니다.', estimate: result });
    } catch (error) {
        console.error('견적 저장 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

/**
 * 2. 내 견적 목록 불러오기 (GET /api/estimates)
 */
exports.getMyEstimates = async (req, res) => {
    try {
        const userId = req.user.id;
        const estimates = await Estimate.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [
                { // [핵심 수정] Quotation 정보를 함께 가져옵니다.
                    model: Quotation,
                    attributes: ['id'] // id만 필요
                },
                {
                    model: EstimateItem,
                include: [
                    { model: Part, include: [Category] },
                    { model: Price }
                ]
            }]
        });

        // 각 견적의 총 가격을 서버에서 계산하여 추가
        const results = estimates.map(estimate => {
            const plainEstimate = estimate.get({ plain: true });
            const totalPrice = plainEstimate.EstimateItems.reduce((sum, item) => {
                // item.Price가 null이 아닐 경우에만 계산에 포함
                return sum + ((item.Price?.price || 0) * item.quantity);
            }, 0);
            return { ...plainEstimate, totalPrice };
        });

        res.status(200).json(results);
    } catch (error) {
        console.error('내 견적 불러오기 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

/**
 * 3. 내 견적 삭제 (DELETE /api/estimates/:id)
 */
exports.deleteMyEstimate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: estimateId } = req.params;

        const estimate = await Estimate.findOne({ where: { id: estimateId, userId } });
        if (!estimate) {
            return res.status(404).json({ message: '삭제할 견적을 찾을 수 없거나 권한이 없습니다.' });
        }
        await estimate.destroy();
        res.status(200).json({ message: '견적이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('내 견적 삭제 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};