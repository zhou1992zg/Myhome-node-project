var express = require('express');
var router = express.Router();

// 引入前台控制器
var indexController = require('../controllers/indexController');

/* 首页  */
router.get('/',indexController.index);
// 用户注册数据提交
router.post('/userInsert', indexController.userInsert);
// Ajax提交路由
router.post('/userlogin', indexController.login);
// 用户登录的页面
router.get('/userlogin',indexController.userlogin);
// 用户登录操作
router.get('/userlogindo',indexController.userlogindo);
// // 用户退出登录
// router.get('/logout',adminController.logout);
// 验证码接口
router.get('/code',indexController.code);

router.post('/userInsertdo',indexController.userInsertdo);

router.get('/usershow/:_id',indexController.usershow);


module.exports = router;

