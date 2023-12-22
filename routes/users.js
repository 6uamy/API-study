const express = require('express');
// 라우터로 만들기
const router = express.Router();

const conn = require('../mariadb');

router.use(express.json());

// 로그인
router.post('/login', (req, res) => {
    const {email, password} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(sql, email,
        function(err, results) {
            let loginUser = results[0];
            if (loginUser && loginUser.password === password) {
                res.status(200).json({
                    message: `${loginUser.name}님 로그인에 성공하셨습니다.`
                });
            } else {
                res.status(404).json({
                    message: '아이디 또는 비밀번호가 틀렸습니다.'
                });
            }
        }
    );
});

// 회원가입
router.post('/join', (req, res) => {
    let sql = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`;

    // email, name, password, contact
    if (req.body.email) {
        const {email, name, password, contact} = req.body;
        let values = [email, name, password, contact];
        conn.query(sql, values, function(err, results) {
                res.status(201).json(results);
            }
        );
    } else {
        res.status(400).json({
            message: '입력 값을 다시 확인해주세요.'
        });
    }
});

// 회원 개별 조회
router.get('/users', (req, res) => {
    let {email} = req.body;
    
    let sql = `SELECT * FROM users WHERE email = ?`;
    conn.query(
        sql, email,
        function(err, results) {
            //const {email, name} = results;
            if (results.length) {
                res.status(200).json(results);
            } else {
                res.status(404).json({
                    message: '요청하신 회원 정보가 존재하지 않습니다.'
                });
            }
        }
    );
});

// 회원 개별 탈퇴
router.delete('/users', (req, res) => {
    let {email} = req.body;

    let sql = `DELETE FROM users WHERE email = ?`;
    conn.query(
        sql, email,
        function(err, results) {
            res.status(200).json(results);
        }
    );

    // res.status(404).json({
    //     message: '요청하신 회원 정보가 존재하지 않습니다.'
    // });
});

// 모듈로 내보내기
module.exports = router;
