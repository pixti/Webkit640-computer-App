const db = require('./models');
const bcrypt = require('bcryptjs');

// 부품 상세스펙 텍스트를 파싱하여 간단한 JSON 객체로 만드는 헬퍼 함수
const parseSpec = (specText) => {
    const spec = {};
    if (!specText) return spec;

    const keywords = ['코어', '스레드', '클럭', '소켓', 'DDR', 'TDP', 'PBP-MTP', 'VGA 길이', 'CPU쿨러 높이', '리프레시', 'M.2', 'PCIe', 'ATX'];
    // specText를 공백 또는 쉼표로 분리
    const items = specText.split(/[\s,]+/);

    items.forEach(item => {
        for (const keyword of keywords) {
            if (item.includes(keyword) && !spec[keyword]) {
                spec[keyword] = item;
            }
        }
    });
    return spec;
};

// [핵심 수정 1] 모든 부품 객체에 'storeName: '다나와''를 추가했습니다.
const initialParts = [
    // CPU
    { categoryId: 1, modelName: 'AMD 라이젠7-5세대 7800X3D (라파엘) (멀티팩 정품)', manufacturer: 'AMD', price: 502010, imageUrl: 'https://img.danawa.com/prod_img/500000/934/627/img/19627934_1.jpg', specText: 'AMD(소켓AM5) 8코어 16스레드 DDR5 5nm 기본 클럭:4.2GHz 최대 클럭:5.0GHz L3 캐시:96MB TDP:120W', url: 'https://prod.danawa.com/info/?pcode=19627934', storeName: '다나와' },
    { categoryId: 1, modelName: 'AMD 라이젠7-6세대 9800X3D (그래니트 릿지) (멀티팩 정품)', manufacturer: 'AMD', price: 666260, imageUrl: 'https://img.danawa.com/prod_img/500000/547/531/img/70531547_1.jpg', specText: 'AMD(소켓AM5) 8코어 16스레드 DDR5 TSMC 4nm 기본 클럭:4.7GHz L3 캐시:96MB TDP:120W', url: 'https://prod.danawa.com/info/?pcode=70531547', storeName: '다나와' },
    { categoryId: 1, modelName: '인텔 코어 울트라9 시리즈2 285K (애로우레이크) (정품)', manufacturer: 'Intel', price: 954530, imageUrl: 'https://img.danawa.com/prod_img/500000/459/059/img/69059459_1.jpg', specText: '인텔(소켓1851) P8+E16코어 24스레드 DDR5 TSMC 3nm', url: 'https://prod.danawa.com/info/?pcode=69059459', storeName: '다나와' },
    { categoryId: 1, modelName: '인텔 코어 울트라5 시리즈2 225 (애로우레이크) (정품)', manufacturer: 'Intel', price: 279660, imageUrl: 'https://img.danawa.com/prod_img/500000/084/123/img/74123084_1.jpg', specText: '인텔(소켓1851) P6+E4코어 10스레드 DDR5 TSMC 3nm', url: 'https://prod.danawa.com/info/?pcode=74123084', storeName: '다나와' },
    // 메모리 (RAM)
    { categoryId: 3, modelName: '삼성전자 DDR5-5600 (16GB)', manufacturer: '삼성전자', price: 143350, imageUrl: 'https://img.danawa.com/prod_img/500000/780/911/img/18911780_1.jpg', specText: '데스크탑용 DDR5 5600MHz (PC5-44800)', url: 'https://prod.danawa.com/info/?pcode=18911780', storeName: '다나와' },
    { categoryId: 3, modelName: '삼성전자 DDR5-5600 (32GB)', manufacturer: '삼성전자', price: 316540, imageUrl: 'https://img.danawa.com/prod_img/500000/043/644/img/20644043_1.jpg', specText: '데스크탑용 DDR5 5600MHz (PC5-44800)', url: 'https://prod.danawa.com/info/?pcode=20644043', storeName: '다나와' },
    { categoryId: 3, modelName: '마이크론 Crucial DDR4-3200 CL22 (8GB)', manufacturer: '마이크론', price: 65140, imageUrl: 'https://img.danawa.com/prod_img/500000/102/369/img/20369102_1.jpg', specText: '데스크탑용 DDR4 3200MHz (PC4-25600)', url: 'https://prod.danawa.com/info/?pcode=20369102', storeName: '다나와' },
    { categoryId: 3, modelName: '타무즈 DDR5-5600 CL46 (16GB)', manufacturer: '타무즈', price: 118230, imageUrl: 'https://img.danawa.com/prod_img/500000/278/998/img/31998278_1.jpg', specText: '데스크탑용 DDR5 5600MHz (PC5-44800)', url: 'https://prod.danawa.com/info/?pcode=31998278', storeName: '다나와' },
    // ... 이하 모든 부품에 storeName: '다나와' 추가됨 ...
    { categoryId: 2, modelName: 'MSI MAG B850M 박격포 WIFI', manufacturer: 'MSI', price: 275250, imageUrl: 'https://img.danawa.com/prod_img/500000/648/397/img/79397648_1.jpg', specText: 'AMD(소켓AM5) AMD B850 DDR5 M-ATX', url: 'https://prod.danawa.com/info/?pcode=79397648', storeName: '다나와' },
    { categoryId: 2, modelName: 'MSI MAG B860M 박격포 WIFI', manufacturer: 'MSI', price: 279000, imageUrl: 'https://img.danawa.com/prod_img/500000/266/340/img/74340266_1.jpg', specText: '인텔(소켓1851) 인텔 B860 DDR5 M-ATX', url: 'https://prod.danawa.com/info/?pcode=74340266', storeName: '다나와' },
    { categoryId: 2, modelName: 'ASUS TUF Gaming B850M-PLUS STCOM', manufacturer: 'ASUS', price: 250830, imageUrl: 'https://img.danawa.com/prod_img/500000/029/884/img/73884029_1.jpg', specText: 'AMD(소켓AM5) AMD B850 DDR5 M-ATX', url: 'https://prod.danawa.com/info/?pcode=73884029', storeName: '다나와' },
    { categoryId: 2, modelName: 'ASRock B650M Pro X3D 에즈윈', manufacturer: 'ASRock', price: 163650, imageUrl: 'https://img.danawa.com/prod_img/500000/641/509/img/76509641_1.jpg', specText: 'AMD(소켓AM5) AMD B650 DDR5 M-ATX', url: 'https://prod.danawa.com/info/?pcode=76509641', storeName: '다나와' },
    { categoryId: 4, modelName: 'MSI 지포스 RTX 5070 Ti 벤투스 3X OC D7 16GB', manufacturer: 'MSI', price: 1341440, imageUrl: 'https://img.danawa.com/prod_img/500000/837/550/img/76550837_1.jpg', specText: 'RTX 5070 Ti GDDR7 16GB PCIe5.0x16', url: 'https://prod.danawa.com/info/?pcode=76550837', storeName: '다나와' },
    { categoryId: 4, modelName: 'PALIT 지포스 RTX 5060 Ti INFINITY 3 D7 16GB', manufacturer: 'PALIT', price: 717000, imageUrl: 'https://img.danawa.com/prod_img/500000/490/037/img/81037490_1.jpg', specText: 'RTX 5060 Ti GDDR7 16GB PCIe5.0x16', url: 'https://prod.danawa.com/info/?pcode=81037490', storeName: '다나와' },
    { categoryId: 4, modelName: 'ASUS PRIME 라데온 RX 9070 XT OC D6 16GB', manufacturer: 'ASUS', price: 1019890, imageUrl: 'https://img.danawa.com/prod_img/500000/292/461/img/77461292_1.jpg', specText: 'RX 9070 XT GDDR6 16GB PCIe5.0x16', url: 'https://prod.danawa.com/info/?pcode=77461292', storeName: '다나와' },
    { categoryId: 4, modelName: 'MSI 지포스 RTX 5090 슈프림 SOC D7 32GB', manufacturer: 'MSI', price: 4749170, imageUrl: 'https://img.danawa.com/prod_img/500000/939/550/img/76550939_1.jpg', specText: 'RTX 5090 GDDR7 32GB PCIe5.0x16', url: 'https://prod.danawa.com/info/?pcode=76550939', storeName: '다나와' },
    { categoryId: 6, modelName: 'HYTE Y70 Touch Infinite (스노우 화이트)', manufacturer: 'HYTE', price: 679010, imageUrl: 'https://img.danawa.com/prod_img/500000/234/844/img/61844234_1.jpg', specText: '미들타워 E-ATX VGA:422mm CPU쿨러:180mm', url: 'https://prod.danawa.com/info/?pcode=61844234', storeName: '다나와' },
    { categoryId: 6, modelName: '앱코 G40 시그니처 (화이트)', manufacturer: '앱코', price: 55500, imageUrl: 'https://img.danawa.com/prod_img/500000/748/900/img/16900748_1.jpg', specText: '미들타워 ATX VGA:340mm CPU쿨러:175mm', url: 'https://prod.danawa.com/info/?pcode=16900748', storeName: '다나와' },
    { categoryId: 6, modelName: 'Antec C8 MESH (화이트)', manufacturer: 'Antec', price: 140330, imageUrl: 'https://img.danawa.com/prod_img/500000/418/439/img/33439418_1.jpg', specText: '빅타워 ATX VGA:440mm CPU쿨러:175mm', url: 'https://prod.danawa.com/info/?pcode=33439418', storeName: '다나와' },
    { categoryId: 6, modelName: '3RSYS T2000 Quiet (블랙)', manufacturer: '3RSYS', price: 124000, imageUrl: 'https://img.danawa.com/prod_img/500000/654/045/img/92045654_1.jpg', specText: '빅타워 ATX VGA:420mm CPU쿨러:180mm', url: 'https://prod.danawa.com/info/?pcode=92045654', storeName: '다나와' },
    { categoryId: 5, modelName: 'SK하이닉스 Platinum P41 M.2 NVMe (2TB)', manufacturer: 'SK하이닉스', price: 289000, imageUrl: 'https://img.danawa.com/prod_img/500000/984/000/img/17000984_1.jpg', specText: 'M.2(2280) PCIe4.0x4 TLC 순차읽기:7,000MB/s', url: 'https://prod.danawa.com/info/?pcode=17000984', storeName: '다나와' },
    { categoryId: 5, modelName: '삼성전자 990 PRO M.2 NVMe (2TB)', manufacturer: '삼성전자', price: 302000, imageUrl: 'https://img.danawa.com/prod_img/500000/722/297/img/18297722_1.jpg', specText: 'M.2(2280) PCIe4.0x4 TLC 순차읽기:7,450MB/s', url: 'https://prod.danawa.com/info/?pcode=18297722', storeName: '다나와' },
    { categoryId: 5, modelName: '삼성전자 9100 PRO M.2 NVMe (1TB)', manufacturer: '삼성전자', price: 285190, imageUrl: 'https://img.danawa.com/prod_img/500000/702/716/img/78716702_1.jpg', specText: 'M.2(2280) PCIe5.0x4 TLC 순차읽기:14,700MB/s', url: 'https://prod.danawa.com/info/?pcode=78716702', storeName: '다나와' },
    { categoryId: 5, modelName: 'Western Digital WD BLACK SN850X M.2 NVMe (4TB)', manufacturer: 'WD', price: 473850, imageUrl: 'https://img.danawa.com/prod_img/500000/379/788/img/17788379_1.jpg', specText: 'M.2(2280) PCIe4.0x4 TLC 순차읽기:7,300MB/s', url: 'https://prod.danawa.com/info/?pcode=17788379', storeName: '다나와' },
    { categoryId: 7, modelName: 'MSI MAG A650BN 80PLUS 브론즈', manufacturer: 'MSI', price: 56900, imageUrl: 'https://img.danawa.com/prod_img/500000/025/283/img/15283025_1.jpg', specText: 'ATX 파워 650W 80 PLUS 브론즈', url: 'https://prod.danawa.com/info/?pcode=15283025', storeName: '다나와' },
    { categoryId: 7, modelName: 'darkFlash 퍼펙트모스트 850W 80PLUS 골드', manufacturer: 'darkFlash', price: 118230, imageUrl: 'https://img.danawa.com/prod_img/500000/642/938/img/75938642_1.jpg', specText: 'ATX 파워 850W 80 PLUS 골드 풀모듈러', url: 'https://prod.danawa.com/info/?pcode=75938642', storeName: '다나와' },
    { categoryId: 7, modelName: 'SuperFlower SF-1200F14XP LEADEX VII PRO PLATINUM', manufacturer: 'SuperFlower', price: 298560, imageUrl: 'https://img.danawa.com/prod_img/500000/043/038/img/32038043_1.jpg', specText: 'ATX 파워 1200W 80 PLUS 플래티넘', url: 'https://prod.danawa.com/info/?pcode=32038043', storeName: '다나와' },
    { categoryId: 7, modelName: '마이크로닉스 Classic II 풀체인지 800W', manufacturer: '마이크로닉스', price: 93900, imageUrl: 'https://img.danawa.com/prod_img/500000/751/642/img/49642751_1.jpg', specText: 'ATX 파워 800W 80 PLUS 브론즈', url: 'https://prod.danawa.com/info/?pcode=49642751', storeName: '다나와' },
];


const seedDatabase = async () => {
    try {
        console.log('초기 데이터베이스 시딩 시작...');

        // --- 1. 기본 카테고리/상태 데이터 생성 ---
        await db.UserStatus.bulkCreate([
            { id: 1, status: '정상' }, { id: 2, status: '정지' }, { id: 3, status: '탈퇴' },
        ], { ignoreDuplicates: true });

        await db.Category.bulkCreate([
            { id: 1, name: 'CPU', slug: 'cpu' },
            { id: 2, name: '메인보드', slug: 'motherboard' },
            { id: 3, name: '메모리 (RAM)', slug: 'memory' },
            { id: 4, name: '그래픽카드', slug: 'gpu' },
            { id: 5, name: 'SSD', slug: 'ssd' },
            { id: 6, name: '케이스', slug: 'case' },
            { id: 7, name: '파워서플라이', slug: 'power' },
        ], { ignoreDuplicates: true });

        await db.BoardType.bulkCreate([
            { id: 1, name: '견적 공유 게시판', slug: 'quote-share' },
            { id: 2, name: '질문 게시판', slug: 'qna' },
            { id: 3, name: '자유 게시판', slug: 'free' },
            { id: 4, name: '핫딜 게시판', slug: 'hot-deals' },
        ], { ignoreDuplicates: true });
        console.log('✅ 기본 카테고리/상태 생성 완료.');

        // --- 2. 초기 사용자 계정 생성 ---
        const userCount = await db.User.count();
        if (userCount === 0) {
            console.log('초기 사용자 계정 생성 중...');
            await db.User.create({ username: '1234', password: '1234pw', nickname: '일반회원', statusId: 1, role: 'user' });
            await db.User.create({ username: '1235', password: '1234pw', nickname: '정지회원', statusId: 2, role: 'user' });
            await db.User.create({ username: 'admintest', password: '1234pw', nickname: '관리자', statusId: 1, role: 'admin' });
            console.log('✅ 초기 사용자 계정 생성 완료.');
        }

        // --- 3. 초기 부품 및 가격 데이터 생성 ---
        const partCount = await db.Part.count();
        if (partCount === 0) {
            console.log('초기 부품 및 가격 데이터 생성 중...');
            for (const part of initialParts) {
                const newPart = await db.Part.create({
                    modelName: part.modelName,
                    manufacturer: part.manufacturer,
                    spec: parseSpec(part.specText),
                    imageUrl: part.imageUrl,
                    categoryId: part.categoryId,
                });
                // [핵심 수정 2] part 객체에서 url과 storeName을 가져와 사용합니다.
                await db.Price.create({
                    price: part.price,
                    url: part.url,
                    storeName: part.storeName,
                    partId: newPart.id,
                });
            }
            console.log('✅ 초기 부품 및 가격 데이터 생성 완료.');
        }

        // --- 4. 초기 게시글 및 댓글 생성 ---
        const postCount = await db.Post.count();
        if (postCount === 0) {
            console.log('초기 게시글 및 댓글 생성 중...');
            const adminUser = await db.User.findOne({ where: { username: 'admintest' }});
            const normalUser = await db.User.findOne({ where: { username: '1234' }});
            const freeBoard = await db.BoardType.findOne({ where: { slug: 'free' }});

            if (adminUser && normalUser && freeBoard) {
                const firstPost = await db.Post.create({
                    title: '초기 DB 테스트용 게시글 입니다.',
                    content: 'DB 초기화 후 자동으로 생성된 게시글입니다.',
                    boardTypeId: freeBoard.id,
                    userId: adminUser.id,
                });

                await db.Comment.create({
                    content: '초기 DB 테스트용 댓글 입니다.',
                    postId: firstPost.id,
                    userId: normalUser.id,
                });
                console.log('✅ 초기 게시글 및 댓글 생성 완료.');
            }
        }

        console.log('--- 모든 초기 데이터 설정 완료 ---');

    } catch (error) {
        console.error('❌ 초기 데이터 생성 실패:', error);
    }
};

module.exports = seedDatabase;