// express 모듈 셋팅
const express = require('express');
const app = express();
app.listen(7777);

// users, channels 모듈 가져오기
const userRouter = require('./routes/users');
const channelRouter = require('./routes/channels');

// 실제 모듈 사용하기
app.use('/', userRouter);
app.use('/channels', channelRouter);
