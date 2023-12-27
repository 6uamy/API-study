/** 채널 API 설계
 *  
 *  채널 생성: POST /channels
 *  - req: body (channelTitle)
 *  - res 201: '${channelTitle}님의 채널을 응원합니다.'
 *  
 *  채널 개별 수정: PUT /channels/:id
 *  - req: URL (id), body (channelTitle)
 *  - res 200: '채널명이 성공적으로 수정되었습니다. 기존: ${} > 수정: ${}'
 * 
 *  채널 개별 삭제: DELETE /channels/:id
 *  - req: URL (id)
 *  - res 200: '삭제 되었습니다.' > 메인 페이지
 * 
 *  채널 전체 조회: GET /channels
 *  - req: x
 *  - res 200: 채널 전체 데이터 list, json arr...
 * 
 *  채널 개별 조회: GET /channels/:id
 *  - req: URL (id) 
 *  - res 200: 채널 개별 데이터
 */  

// express 모듈 셋팅
const express = require('express');
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

router
    .route('/')
    // 회원 채널 전체 조회
    .get(
        [
            body('userId').notEmpty().isInt().withMessage('숫자 입력'),
            validate
        ]
        , (req, res, next) => {
            let {userId} = req.body;
            let sql = `SELECT * FROM channels WHERE user_id = ?`;

            conn.query(sql, userId,
                function(err, results) {
                    if (err) {
                        console.log(err);
                        return res.status(400).end();
                    }

                    if (results.length) {
                        res.status(200).json(results);
                    } else {
                        channelNotFound(res);
                    }
                }
            );
    })
    // 채널 생성
    .post(
        [
            body('userId').notEmpty().isInt().withMessage('숫자 입력'),
            body('name').notEmpty().isString().withMessage('문자 입력'),
            validate
        ]
        , (req, res) => {
            let sql = `INSERT INTO channels (name, user_id) VALUES (?, ?)`;

            const {name, userId} = req.body;
            let values = [name, userId];
            conn.query(sql, values, 
                function(err, results) {
                    if (err) {
                        console.log(err);
                        return res.status(400).end();
                    }

                    res.status(201).json(results);                                                                                                                                                                                                                           
                }
            );
    });

router
    .route('/:id')
    // 채널 개별 조회
    .get(
        [
            param('id').notEmpty().withMessage('채널 아이디 필요'),
            validate
        ]
        , (req, res) => {
            let {id} = req.params;
            id = parseInt(id);

            let sql = `SELECT * FROM channels WHERE id = ?`;
            conn.query(sql, id,
                function(err, results) {
                    if (err) {
                        console.log(err);
                        return res.status(400).end();
                    }

                    if (results.length) {
                        res.status(200).json(results);
                    } else {
                        channelNotFound(res);
                    }
                }
            );
    })
    // 채널 개별 수정
    .put(
        [
            param('id').notEmpty().withMessage('채널 아이디 필요'),
            body('name').notEmpty().isString().withMessage('채널 명 입력'),
            validate
        ]
        , (req, res) => {
            let {id} = req.params;
            id = parseInt(id);
            let {name} = req.body;

            let sql = `UPDATE channels SET name = ? WHERE id = ?`;
            let values = [name, id];
            conn.query(sql, values,
                function(err, results) {
                    if (err) {
                        console.log(err);
                        return res.status(400).end();
                    }

                    if (results.affectedRows === 0) return res.status(400).end();

                    res.status(201).json(results);
                }
            );
    })
    // 채널 개별 삭제
    .delete(
        [
            param('id').notEmpty().isInt().withMessage('채널 아이디 필요'),
            validate
        ]
        , (req, res) => {
            let {id} = req.params;
            id = parseInt(id);

            let sql = `DELETE FROM channels WHERE id = ?`;
            conn.query(sql, id,
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

function channelNotFound(res) {
    res.status(404).json({
        message: '채널 정보를 찾을 수 없습니다.'
    });
}

module.exports = router;
