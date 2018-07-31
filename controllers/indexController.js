// 声明一个 前台的控制器 模块
var indexController = {};

// 引入 数据库模型 模块
var itemModel = require('../models/itemModel');
var articleModel = require('../models/articleModel');
var userModel = require('../models/userModel');
var linkModel = require('../models/linkModel');



// 首页
indexController.index = function(req, res,) {
    // 判断用户登录状态
    if(!req.session.user) res.redirect('userlogindo');
    // 获取用户首页列表
    itemModel.find().sort({order:1}).exec(function(err,data){
        if (err) {
            console.log('数据添加数据失败');
        } else {
        	getArticleDataList(0)
        	// 根据 itemId 去查 10 条文章
        	function getArticleDataList(i){
        		articleModel.find({itemId:data[i]._id}).limit(10).exec(function(error,data1){
        			data[i].articleList = data1;
        			if(i < data.length - 1){
        				// 继续查询下一个栏目的 10 条文章
        				getArticleDataList(++i);
        			}else{
                        linkModel.find().limit(10).exec(function(error,data2){
                            if(error){
                                res.render('查询数据失败！')
                            }else{	
                                console.log(data2);
                                // 已经是最后一个栏目了 直接 响应模版 分配数据
						        res.render('index', {itemlist:data,datalist:data,linklist:data2});
                            }
                        });
			            
        			}
        		});
            }
            }
    })
}


//用户注册页面
indexController.userlogin = function(req, res,) {
    res.render('userlogin');
}


//用户注册数据提交
indexController.userInsert = function(req, res,) {
    // 引入 md5 模块
    var md5 = require('md5');

    // 取消用户名和密码两端的空白字符
    var username = req.body.username.trim()
    // md5 加密
    var pwd1 = md5(req.body.pwd1.trim());

    var pwd2 = md5(req.body.pwd2.trim());
    // userdata 组装用户数据

    var userpass = req.body.userpass;

    var userdata = {
        username: username,
        pwd1: pwd1,
        pwd2: pwd2,
        userpass: userpass,
    }
        if(pwd1 == pwd2){
            userModel.create(userdata,function (err) {
                if(err){
                    res.send('添加用户数据失败 ');
                }else{
                    res.send('添加用户数据成功 ');
                }
            })
        }else{

            res.send('密码不相等');
    }
}

//用户登陆页面
indexController.userlogindo = function(req, res,) {
    res.render('userlogindo');
}


// 验证码
indexController.code = function(req,res){
    // 需要引入 验证码模块
    var captchapng = require('captchapng');
    // 生成一个随机 数字
    var code = parseInt(Math.random() * 9000 + 1000);
    // 存到 session 里
    req.session.code = code;

    // 实例化验证码对象
    var p = new captchapng(80, 30, code ); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
    // 生成  base64 编码的图片
    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    // 发送数据
    res.send(imgbase64)
}

//用户登陆数据对比
indexController.userInsertdo = function(req, res,) {
    // 引入管理员数据模型
    var userModel = require('../models/userModel');

    // 引入 md5 模块
    var md5 = require('md5');

    // 判断验证码
    if(req.body.code != req.session.code){
        console.log('验证码不正确');
        res.redirect('/userlogindo');
        return ;
    }

    // 获取用户名和密码 并 md5 处理密码
    var username = req.body.username.trim();
    var pwd1 = md5(req.body.pwd1.trim());
       
    // 判断用户名和密码
    userModel.findOne({username:username},function(err,data){
            if(data == null){
                console.log('用户名不正确') 
                res.redirect('userlogindo');
            }else{
                if (pwd1==data.pwd1){
                    // 登录成功 把用户的信息存到session 里
                    req.session.user = data;
                    // 跳转到首页
                    res.redirect('/');
                }else{
                    console.log('密码不正确')
                    res.redirect('/userlogindo');
                }
            }
    })
}


// 展示页面
indexController.usershow= function (req,res) {
    // 查询需要编辑的数据
    articleModel.find({ _id: req.params._id }, function (err, data) {
        if (err) {
            res.send('查询数据失败')
        } else {            
            res.render('usershow',{data:data});
        }
    })
}



/**
 * 注册页 post 
 */
indexController.login = function (req, res) {
    var username = req.body.username.trim();
    userModel.findOne({username:username},function(err,data){
            // if(err){
            //     console.log('数据库查询数据失败');
            // }else{
                console.log(data);
                res.send({data});  
            // }
    })
    
  }








// 暴露控制器
module.exports = indexController;