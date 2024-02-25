const multer=require('multer');
const path=require('path');
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/')
    },
    filename:function(req,file,cb){
        var ext=path.originalname.substring(file.originalname.lastIndexOf("."));
        cb(null,file.filename+'-'+Date.now()+ext)
    }
})
var upload=multer({
    storage:storage,
    fileFilter:function(req,file,callback){
        if(
            file.mimetype==="image/png"||
            file.mimetype==="image/jpg"||
            file.mimetype==="image/jpeg"
        ){
            callback(null,true)
        }else{
            console.log('only jpg & png file supported!')
            callback(null,false)
        }
    },
    limits:{
        fileSize:1024*1024*6
    }
})
module.exports=upload;