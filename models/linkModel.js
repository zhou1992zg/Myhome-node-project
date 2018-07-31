// 引入数据库配置模块
var mongoose = require('../configs/db_config.js');

// 定义 user 数据的 骨架(用来约束 itmes 这个集合的)
var linkSchema = new mongoose.Schema({
    // 友链名称
    linkname: String,
    // 友链描述
    description:String,
    // 文章封面
    linkimgurl:String,
    // 友链地址
    linkadd:String,
    // 发布时间
    ctime: {
        type:Date,
        default:  new Date()   // 默认值
    },    
})

// 3.创建数据库模型      (在数据库里创建集合的时候 会自动帮你变成 复数)
var linkModel = mongoose.model('link', linkSchema);

// 暴露数据库模型
module.exports = linkModel;