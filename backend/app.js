const express = require('express');
const cors = require('cors');
const db = require('./models');
const seedDatabase = require('./seed');

// --- 모든 라우트와 컨트롤러를 여기에 모아서 선언합니다 ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const partRoutes = require('./routes/partRoutes');
const estimateRoutes = require('./routes/estimateRoutes'); // 수정
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');
const searchRoutes = require('./routes/searchRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const boardTypeRoutes = require('./routes/boardTypeRoutes');
const commentController = require('./controllers/commentController');
const { protect } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// DB 연결 및 초기 데이터 생성
db.sequelize.sync({ alter: true }).then(() => {
    console.log('✅ 데이터베이스 연결 및 동기화 성공');
    seedDatabase(); // 2. seed 함수 호출 (비활성화 원할 시 주석 처리)
}).catch(err => {
    console.error('❌ 데이터베이스 연결 또는 동기화 실패:', err);
});


// --- API 라우트들을 여기에 모아서 등록합니다 ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/board-types', boardTypeRoutes);

// 댓글 수정 및 삭제를 위한 별도 라우트
app.put('/api/comments/:commentId', protect, commentController.updateComment);
app.delete('/api/comments/:commentId', protect, commentController.deleteComment);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});