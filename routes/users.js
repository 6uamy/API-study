const express = require('express');
// 라우터로 만들기
const router = express.Router();

router.use(express.json());

let db = new Map();

// 로그인
router.post('/login', (req, res) => {
    const {userId, pwd} = req.body;
    let loginUser = {};

    db.forEach((user, id) => {
        // id 확인
        if (user.userId === userId) {
            loginUser = user;
        }
    });

    if (isExsist(loginUser)){
        // pwd 확인
        if (loginUser.pwd === pwd) {
            res.status(200).json({
               message: `${userId}님 환영합니다.`
            });
        } else{
            res.status(400).json({
                message: '비밀번호가 틀렸습니다.'
            });
        }
    } else {
        res.status(404).json({
            message: '없는 아이디 정보 입니다.'
        });
    }
});

// 빈 객체인지를 확인하는 함수
function isExsist(obj) {
    if (obj.constructor === Object && Object.keys(obj).length !== 0) {
        return true;
    }

    return false;
}

// 회원가입
router.post('/join', (req, res) => {
    if (req.body.userId) {
        const {userId, pwd, name} = req.body;
        db.set(userId, req.body);
        res.status(201).json({
        message: `${name}님 환영합니다.`
        });
    } else {
        res.status(400).json({
            message: '입력 값을 다시 확인해주세요.'
        });
    }
    
    console.log(db);
});

// 회원 개별 조회
router.get('/users', (req, res) => {
    let {userId} = req.body;
    const user = db.get(userId);
    if (user) {
        res.status(200).json({
            userId: user.userId,
            name: user.name
        });
    } else {
        res.status(404).json({
            message: '요청하신 회원 정보가 존재하지 않습니다.'
        });
    }
});

// 회원 개별 탈퇴
router.delete('/users', (req, res) => {
    let {userId} = req.body;
    const user = db.get(userId);
    if (user) {
        db.delete(userId);
        res.status(200).json({
            message: `${user.name}님 다음에 또 뵙겠습니다.`
        });
    } else {
        res.status(404).json({
            message: '요청하신 회원 정보가 존재하지 않습니다.'
        });
    }
});

// 모듈로 내보내기
module.exports = router;
