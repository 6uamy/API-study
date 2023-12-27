const express = require('express');
// 라우터로 만들기
const router = express.Router();
const conn = require('../mariadb');
const {body, param, validationResult} = require('express-validator');

router.use(express.json());

const validate = (req, res, next) => {
    const err = validationResult(req);

    if (err.isEmpty()) {
        return next();
    } else {
        return res.status(400).json(err.array());
    }
}

// 로그인
router.post(
    '/login', 
    [
        body('email').notEmpty().isEmail().withMessage('이메일 입력'),
        body('password').notEmpty().isInt().withMessage('숫자 입력'),
        validate
    ]
    , (req, res) => {
        const {email, password} = req.body;

        let sql = `SELECT * FROM users WHERE email = ?`;
        conn.query(sql, email,
            function(err, results) {
                if (err) {
                    console.log(err);
                    return res.status(400).end();
                }

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
router.post(
    '/join',  
    [
        body('email').notEmpty().isEmail().withMessage('이메일 입력'),
        body('name').notEmpty().isString().withMessage('이름 입력'),
        body('password').notEmpty().isString().withMessage('비밀번호 입력'),
        body('contact').notEmpty().isString().withMessage('연락처 입력'),
        validate
    ]
    , (req, res) => {
        let sql = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`;

        const {email, name, password, contact} = req.body;
        let values = [email, name, password, contact];
        conn.query(sql, values, function(err, results) {
            if (err) {
                console.log(err);
                return res.status(400).end();
            }

            res.status(201).json(results);
        }
        );
});

// 회원 개별 조회
router.get(
    '/users',
    [
        body('email').notEmpty().isEmail().withMessage('이메일 필요'),
        validate
    ]
    , (req, res) => {
        let {email} = req.body;
        
        let sql = `SELECT * FROM users WHERE email = ?`;
        conn.query(
            sql, email,
            function(err, results) {
                if (err) {
                    return res.status(400).end();
                }

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
router.delete(
    '/users',
    [
        body('email').notEmpty().isEmail().withMessage('이메일 필요'),
        validate
    ]
    , (req, res) => {
        let {email} = req.body;

        let sql = `DELETE FROM users WHERE email = ?`;
        conn.query(
            sql, email,
            function(err, results) {
                if (err) {
                    console.log(err);
                    return res.status(400).end();
                }

                if (results.affectedRows === 0) return res.status(400).end();
                
                res.status(200).json(results);
            }
        );
});

// 모듈로 내보내기
module.exports = router;
