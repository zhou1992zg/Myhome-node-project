// 声明一个 后台的控制器 模块
var adminController = {};

// 引入 数据库模型 模块
var itemModel = require('../models/itemModel');
var articleModel = require('../models/articleModel');
var linkModel = require('../models/linkModel');


// 登录页面
adminController.login = function(req,res){
    // 响应模版
    res.render('admin/login');
}


// 登录操作
adminController.doLogin = function (req,res) {
    // 引入管理员数据模型
    var adminModel = require('../models/adminModel');

    // 引入 md5 模块
    var md5 = require('md5');

   // console.log(req.body.code);
  //  console.log(req.session.code);

    // 判断验证码
    if(req.body.code != req.session.code){
        console.log('验证码不正确');
        res.redirect('/admin/login');
        return ;
    }

    // 获取用户名和密码 并 md5 处理密码
    var username = req.body.username.trim();
    var password = md5(req.body.password.trim());

    // 判断用户名和密码
    adminModel.findOne({username:username},function(err,data){
        //console.log(data);
            if(data == null){
                console.log('用户名不正确') 
                res.redirect('/admin/login');
            }else{
                if (password==data.password){
                    // 登录成功 把用户的信息存到session 里
                    req.session.user = data;
                    //console.log(req.session.user.a="1");
                    // 跳转到首页
                    res.redirect('/admin');
                    
                }else{
                    console.log('密码不正确')
                    res.redirect('/admin/login');
                    
                }
            }
    })
}
// 退出登录
adminController.logout = function (req,res) {
    // 清空登录信息
    req.session.user = null;
    // 跳转到登录的页面
    res.redirect('/admin/login');
}

// 首页
adminController.Index = function(req,res){
    
    // 判断用户 有没有登录
    if (!req.session.user) res.redirect('/admin/login');
    // 判断用户权限 如果是0 不能直接进入后台
    if (req.session.user.userpass == 0) res.redirect('/admin/login');
    
    // 响应模版
    console.log(req.session);
    res.render('admin/index')  
  
}

// 添加栏目
adminController.itemAdd = function(req,res){
    // 响应模版
    res.render('admin/itemAdd');     
}

// 插入栏目数据
adminController.itemInsert = function(req,res){
    // 插入数据到数据库
    itemModel.create(req.body,function (err) {
        if(err){
            console.log('数据添加数据失败');
        }else{
            // res.send('数据插入成功');
            // 跳转到首页
            res.redirect('/admin/itemList');
        }
    })
}


// 栏目列表
adminController.itemList = function (req,res) {
    // 判断用户登录状态
    if(!req.session.user) res.redirect('/admin/login');
    // 获取栏目列表
    itemModel.find().sort({order:1}).exec(function(err,data){
        if (err) {
            console.log('数据添加数据失败');
        } else {
            // 响应模版 分配数据
            res.render('admin/itemList',{datalist:data})
        }
    })

}


// 编辑栏目的页面
adminController.itemEdit = function(req,res){
    // 判断用户登录状态
    if(!req.session.user) res.redirect('/admin/login');
   // console.log(req.session);
    if(req.session.user.userpass == 2){
        itemModel.find({_id:req.params._id},function(err,data){
            if(err){
            res.send('查询数据失败') 
            }else{
                // 响应模版
                res.render('admin/itemEdit',{data:data[0]});
            }
        })
    }else{
        console.log('没有权限!'); 
        res.redirect('/admin/itemList');
    }
}

// 修改栏目数据
adminController.itemUpdate = function (req,res) {
    // 更新数据
    itemModel.update({_id:req.body._id},req.body,function(error){
        // 跳转到栏目列表
        res.redirect('/admin/itemList');
    })
}

// 删除栏目数据
adminController.itemRemove = function (req,res) {
    // 数据库删除的操作 
    itemModel.remove({ _id: req.params._id},function (error) {
        if (error) {
            res.send(error)
        } else {
            // 跳转到栏目列表
            res.redirect('/admin/itemList');
        }
    })
}

// 发布文章页面
adminController.articleAdd = function (req,res) {
    // 获取栏目列表
    itemModel.find().sort({ order: 1 }).exec(function (err, data) {
        if (err) {
            console.log('数据添加数据失败');
        } else {
            // 响应模版
            res.render('admin/articleAdd',{ itemlist: data });
        }
    })
}

// 插入 文章数据
adminController.articleInsert = function(req,res){
    // req.body  文本数据

    // 引入图片上传配置
    var imgUpload = require('../configs/imgUpload_config.js');

    // 文件上传的路径
    var imgPath = 'imgUploads'
    // 允许用户上传的图片
    var imgArr = ['image/jpeg', 'image/png', 'image/gif'];
    // 定义文件大小
    var fileSize = 1024*1024*4;

    // 图片上传
    var upload = imgUpload(imgPath,imgArr,fileSize).single('imgurl');
    upload(req, res, function (err) {
        if(err){
            res.send('图片上传失败');
        }else{
            // 把用户上传的图片路径写到 req.body 里
            req.body.imgurl = req.file.filename;

            // 插入数据到数据库
            articleModel.create(req.body, function (err) {
                if (err) {
                    console.log('数据添加数据失败');
                } else {
                    // res.send('数据插入成功');
                    // 跳转到首页
                    res.redirect('/admin/articleList');
                }
            })        
        }
    })
}


// 文章列表
adminController.articleList = function (req,res) {
    // 判断用户登录状态
    if(!req.session.user) res.redirect('/admin/login');
    // 每页显示多少条数据
    var pageSize = 8;

    // 当前页
    var page = req.query.page ? req.query.page:1;

    // 一共有多少条数据
    articleModel.find().count(function (errr,total) {
        // 最大页码
        var maxPage = Math.ceil(total/pageSize)

        // 判断上一页和下一页边界
        if (page < 1) page = 1;
        if (page > maxPage) page = maxPage;

        // 偏移量（就哪条数据开始查）
        var offset = pageSize*(page-1)
        // res.send('文章列表');  // populate 去查关联的集合
        articleModel.find().limit(pageSize).skip(offset).populate('itemId',{name:1}).exec(function (err, data) {
            if (err) {
                console.log('数据添加数据失败');
            } else {
                // 响应模版 发送数据
                res.render('admin/articleList', { articlelist: data, maxPage: maxPage, page: Number(page)});
            }
        })
    })
}


// 删除文章
adminController.articleRemove = function(req,res){
    // 数据库删除的操作 
    articleModel.remove({ _id: req.params._id }, function (error) {
        if (error) {
            res.send(error)
        } else {
            // 跳转到文章列表
            res.redirect('/admin/articleList');
        }
    })
}

// 编辑文章的页面
adminController.articleEdit = function (req,res) {
    // 判断用户登录状态
    if(!req.session.user) res.redirect('userlogindo');
    // 查询需要编辑的数据
    articleModel.find({ _id: req.params._id }, function (err, data) {
        if (err) {
            res.send('查询数据失败')
        } else {            
            // 获取栏目列表
            itemModel.find().sort({ order: 1 }).exec(function (err, itemdata) {
                if (err) {
                    console.log('数据添加数据失败');
                } else {
                    // 响应模版 分配数据
                    res.render('admin/articleEdit', { data: data[0], itemlist: itemdata });
                }
            })
        }
    })
}

// 修改文章文本
adminController.articleUpdate = function(req,res){
    // 判断用户登录状态
    if(!req.session.user) res.redirect('userlogindo');
    // 更新数据
    articleModel.update({ _id: req.body._id }, { $set: req.body } , function (error) {
        // 跳转到栏目列表
        res.redirect('/admin/articleList');
    })
}

// 修改文章的图片
adminController.articleUpdateImage = function (req,res) {
   // 判断用户登录状态
   if(!req.session.user) res.redirect('userlogindo');
    // 引入图片上传配置
    var imgUpload = require('../configs/imgUpload_config.js');
    // 文件上传的路径
    var imgPath = 'imgUploads'
    // 允许用户上传的图片
    var imgArr = ['image/jpeg', 'image/png', 'image/gif'];
    // 定义文件大小
    var fileSize = 1024 * 1024 * 4;

    // 图片上传
    var upload = imgUpload(imgPath, imgArr, fileSize).single('imgurl');
    upload(req, res, function (err) {
        if (err) {
            res.send('图片上传失败');
        } else {
            // 修改指定文章的封面
            articleModel.update({ _id: req.body._id }, { $set: { imgurl: req.file.filename} }, function (error) {
                if (error) {
                    console.log('数据添加数据失败');
                } else {
                    // 跳转到首页
                    res.redirect('/admin/articleList');
                }
            })
        }
    })   
}


// 验证码
adminController.code = function(req,res){
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


adminController.linkAdd

// 友情链接页面
adminController.linkAdd = function(req,res){
    // 响应模版
    res.render('admin/linkAdd');
}


// 插入 友情链接数据
adminController.linkInsert = function(req,res){
    // req.body  文本数据

    // 引入图片上传配置
    var imgUpload = require('../configs/imgUpload_config.js');

    // 文件上传的路径
    var imgPath = 'imgUploads'
    // 允许用户上传的图片
    var imgArr = ['image/jpeg', 'image/png', 'image/gif'];
    // 定义文件大小
    var fileSize = 1024*1024*4;

    // 图片上传
    var upload = imgUpload(imgPath,imgArr,fileSize).single('linkimgurl');
    upload(req, res, function (err) {
        if(err){
            res.send('图片上传失败');
        }else{
            // 把用户上传的图片路径写到 req.body 里
            req.body.linkimgurl = req.file.filename;

            // 插入数据到数据库
            linkModel.create(req.body, function (err) {
                if (err) {
                    console.log('数据添加数据失败');
                } else {
                    // res.send('数据插入成功');
                    // 跳转到首页
                    res.redirect('linkList');
                }
            })        
        }
    })
}


// 友情链接列表
adminController.linkList = function (req,res) {

    // 每页显示多少条数据
    var pageSize = 8;

    // 当前页
    var page = req.query.page ? req.query.page:1;

    // 一共有多少条数据
    linkModel.find().count(function (errr,total) {
        // 最大页码
        var maxPage = Math.ceil(total/pageSize)

        // 判断上一页和下一页边界
        if (page < 1) page = 1;
        if (page > maxPage) page = maxPage;

        // 偏移量（就哪条数据开始查）
        var offset = pageSize*(page-1)
        // res.send('文章列表');  // populate 去查关联的集合
        linkModel.find().limit(pageSize).skip(offset).populate('itemId',{name:1}).exec(function (err, data) {
            if (err) {
                console.log('数据添加数据失败');
            } else {
                // 响应模版 发送数据
                res.render('admin/linkList', { articlelist: data, maxPage: maxPage, page: Number(page)});
            }
        })
    })
}


// 编辑友情链接页面
adminController.linkEdit = function (req,res) {
    // 查询需要编辑的数据
    linkModel.find({ _id: req.params._id }, function (err, data) {
        if (err) {
            res.send('查询数据失败')
        } else {            
            if (err) {
                console.log('数据添加数据失败');
            } else {
                // 响应模版 分配数据
                res.render('admin/linkEdit', { data: data[0]});
            }
        }
    })
}



// 修改友情链接文本
adminController.linkUpdate = function(req,res){
    // 更新数据
    linkModel.update({ _id: req.body._id }, { $set: req.body } , function (error) {
        // 跳转到栏目列表
        res.redirect('/admin/linkList');
    })
}

// 修改友情链接图片
adminController.linkUpdateImage = function (req,res) {
   
    // 引入图片上传配置
    var imgUpload = require('../configs/imgUpload_config.js');
    // 文件上传的路径
    var imgPath = 'imgUploads'
    // 允许用户上传的图片
    var imgArr = ['image/jpeg', 'image/png', 'image/gif'];
    // 定义文件大小
    var fileSize = 1024 * 1024 * 4;

    // 图片上传
    var upload = imgUpload(imgPath, imgArr, fileSize).single('linkimgurl');
    upload(req, res, function (err) {
        if (err) {
            res.send('图片上传失败');
        } else {
            // 修改指定文章的封面
            linkModel.update({ _id: req.body._id }, { $set: { linkimgurl: req.file.filename} }, function (error) {
                if (error) {
                    console.log('数据添加数据失败');
                } else {
                    // 跳转到首页
                    res.redirect('/admin/linkList');
                }
            })
        }
    })   
}

// 删除友情链接
adminController.linkRemove = function(req,res){
    // 数据库删除的操作 
    linkModel.remove({ _id: req.params._id }, function (error) {
        if (error) {
            res.send(error)
        } else {
            // 跳转到文章列表
            res.redirect('/admin/linkList');
        }
    })
}


// 暴露控制器
module.exports = adminController;