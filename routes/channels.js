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

router.use(express.json());

let db = new Map();
let dbId = 1;

router
    .route('/')
    // 회원 채널 전체 조회
    .get((req, res) => {
        let {userId} = req.body;

        let sql = `SELECT * FROM channels WHERE user_id = ?`;
        if (userId) {
            conn.query(sql, userId,
                function(err, results) {
                    if (results.length) {
                        res.status(200).json(results);
                    } else {
                        channelNotFound(res);
                    }
                }
            );
        } else {
            res.status(400).end();
        }
    })
    // 채널 생성
    .post((req, res) => {
        let sql = `INSERT INTO channels (name, user_id) VALUES (?, ?)`;

        const {name, userId} = req.body;
        // name, userId
        if (name && Number(userId)) {
            const {name, userId} = req.body;
            let values = [name, userId];
            conn.query(sql, values, 
                function(err, results) {
                    res.status(201).json(results);
                }
            );
        } else {
            res.status(400).json({
                message: '입력 값을 다시 확인해주세요.'
            });
        }
    });

router
    .route('/:id')
    // 채널 개별 조회
    .get((req, res) => {
        let {id} = req.params;
        id = parseInt(id);

        let sql = `SELECT * FROM channels WHERE id = ?`;
        conn.query(sql, id,
            function(err, results) {
                if (results.length) {
                    res.status(200).json(results);
                } else {
                    channelNotFound(res);
                }
            }
        );
    })
    // 채널 개별 수정
    .put((req, res) => {
        let {id} = req.params;
        id = parseInt(id);

        let channel = db.get(id);
        if (channel) {
            const oldTitle = channel.channelTitle;
            const newTitle = req.body.channelTitle;
            channel.channelTitle = newTitle;
            db.set(id, channel);

            res.status(201).json({
                message: `채널명이 성공적으로 수정되었습니다. 기존: ${oldTitle} > 수정: ${newTitle}`
            });
        } else {
            res.status(404).json({
                message: '채널 정보를 찾을 수 없습니다.'
            });
        }
    })
    // 채널 개별 삭제
    .delete((req, res) => {
        let {id} = req.params;
        id = parseInt(id);

        const channel = db.get(id);
        if (channel) {
            db.delete(id);
            res.status(200).json({
                message: `${channel.channelTitle} 채널이 삭제되었습니다.`
            });
        } else {
            res.status(404).json({
                message: '채널 정보를 찾을 수 없습니다.'
            });
        }
    });

function channelNotFound(res) {
    res.status(404).json({
        message: '채널 정보를 찾을 수 없습니다.'
    });
}

module.exports = router;
