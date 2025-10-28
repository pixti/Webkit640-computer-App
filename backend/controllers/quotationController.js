const db = require('../models');
const { Quotation, Estimate, EstimateItem, Part, Price, Category, User } = db;

// 공개된 견적 정보 가져오기 (GET /api/quotations/:id)
exports.getPublicQuoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const quotation = await Quotation.findByPk(id, {
            include: [{
                model: Estimate,
                include: [
                    { model: User, attributes: ['nickname'] },
                    {
                        model: EstimateItem,
                        include: [
                            { model: Part, include: [Category] },
                            { model: Price }
                        ]
                    }
                ]
            }]
        });

        if (!quotation) {
            return res.status(404).json({ message: '해당 견적을 찾을 수 없습니다.' });
        }

        // 총 가격 계산
        const plainEstimate = quotation.Estimate.get({ plain: true });
        const totalPrice = plainEstimate.EstimateItems.reduce((sum, item) => {
            return sum + ((item.Price?.price || 0) * item.quantity);
        }, 0);

        const result = { ...plainEstimate, totalPrice };

        res.status(200).json(result);
    } catch (error) {
        console.error('공개 견적 조회 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};