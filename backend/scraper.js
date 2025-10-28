const axios = require('axios');
const db = require('./models');
const { Op } = require('sequelize');
const stringSimilarity = require('string-similarity');

// =======================================================================
// 1. 여기에 발급받으신 네이버 API 키를 입력하세요.
// =======================================================================
const NAVER_CLIENT_ID = '';       // <-- 여기에 Client ID 입력
const NAVER_CLIENT_SECRET = ''; // <-- 여기에 Client Secret 입력
// =======================================================================


// 2. 검색할 부품 키워드 목록
// 여기에 원하는 부품 모델명을 추가하거나 변경할 수 있습니다.
const SEARCH_KEYWORDS = [
    { keyword: 'AMD 라이젠', categoryId: 1 },
    { keyword: '인텔 코어', categoryId: 1 },
    { keyword: 'MSI MAG B', categoryId: 2 },
    { keyword: 'GIGABYTE B', categoryId: 2 },
    { keyword: '삼성전자 DDR5', categoryId: 3 },
    { keyword: 'TeamGroup DDR5', categoryId: 3 },
    { keyword: 'GeForce RTX 4070 SUPER', categoryId: 4 },
    { keyword: 'GeForce RTX 4060 Ti', categoryId: 4 },
    { keyword: 'Radeon RX 7800 XT', categoryId: 4 },
    { keyword: 'SK하이닉스 Platinum P41', categoryId: 5 },
    { keyword: '삼성전자 990 PRO', categoryId: 5 },
    { keyword: 'Western Digital BLACK SN', categoryId: 5 },
    { keyword: 'darkFlash DLX21', categoryId: 6 },
    { keyword: '3RSYS S400', categoryId: 6 },
    { keyword: 'FSP HYDRO G PRO 850W', categoryId: 7 },
    { keyword: 'SuperFlower SF-850F14HG', categoryId: 7 },
];

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));
const removeHtmlTags = (str) => str ? str.replace(/<[^>]*>/g, '') : '';

async function collectNaverShoppingData() {
    console.log('🚀 네이버 쇼핑 API를 이용한 데이터 수집을 시작합니다...');

    if (NAVER_CLIENT_ID === 'YOUR_CLIENT_ID' || NAVER_CLIENT_SECRET === 'YOUR_CLIENT_SECRET') {
        console.error('\n❗️[오류] 네이버 API 키를 입력해주세요.');
        return;
    }

    for (const item of SEARCH_KEYWORDS) {
        try {
            console.log(`\n[검색 시작] 키워드: "${item.keyword}"`);

            let existingParts = await db.Part.findAll({
                where: { categoryId: item.categoryId }
            });

            const response = await axios.get('https://openapi.naver.com/v1/search/shop.json', {
                params: { query: item.keyword, display: 100, sort: 'sim' },
                headers: {
                    'X-Naver-Client-Id': NAVER_CLIENT_ID,
                    'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
                },
            });

            const products = response.data.items;
            if (!products) {
                console.log('-> API 응답에서 상품 목록(items)을 찾을 수 없습니다.');
                continue;
            }
            console.log(`-> ${products.length}개의 상품 정보를 수신했습니다.`);

            let savedCount = 0;
            for (const product of products) {
                if (product.title && product.lprice > 0 && product.link) {
                    const normalizedTitle = removeHtmlTags(product.title);

                    let bestMatch = null;
                    if (existingParts.length > 0) {
                        const titles = existingParts.map(p => p.modelName);
                        const { bestMatch: matchResult } = stringSimilarity.findBestMatch(normalizedTitle, titles);

                        if (matchResult && matchResult.rating > 0.8) {
                            const bestMatchIndex = titles.findIndex(title => title === matchResult.target);
                            if (bestMatchIndex !== -1) {
                                bestMatch = existingParts[bestMatchIndex];
                            }
                        }
                    }

                    let targetPart;
                    if (bestMatch) {
                        targetPart = bestMatch;
                    } else {
                        targetPart = await db.Part.create({
                            modelName: normalizedTitle,
                            manufacturer: product.maker || product.brand || '기타',
                            imageUrl: product.image,
                            categoryId: item.categoryId,
                            // [핵심 수정] spec 필드를 빈 객체로 저장합니다.
                            spec: {}
                        });
                        existingParts.push(targetPart);
                    }

                    await db.Price.findOrCreate({
                        where: { partId: targetPart.id, url: product.link },
                        defaults: {
                            price: Number(product.lprice),
                            storeName: product.mallName || '네이버쇼핑',
                            url: product.link,
                            partId: targetPart.id
                        }
                    });
                    savedCount++;
                }
            }
            console.log(`-> ${savedCount}개의 가격 정보를 DB에 저장/업데이트했습니다.`);
            await delay(500);

        } catch (error) {
            console.error(`[오류] "${item.keyword}" 검색 중 오류 발생:`, error.response?.data?.errorMessage || error.message);
        }
    }
    console.log('\n✅ 모든 데이터 수집 및 DB 저장 작업이 완료되었습니다.');
}

collectNaverShoppingData().catch(console.error);