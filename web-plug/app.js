
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var formidable = require('formidable');
var randomNumber = require('randomNumber');
var searchQueueById = require('searchQueueById');
var fs = require('fs');
var app = express();
mongoose.connect('mongodb://127.0.0.1/todo_development');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
/*var Task = new Schema({
    task: String
});
var Task = mongoose.model('Task',Task);*/

// all environments
var User = new Schema({
    name: String,
    age: String,
    sex: String
});
var User = mongoose.model('User',User);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
*  route-config
* */
app.get('/', routes.index);
app.get('/bootstrap',routes.bootstrap);
app.get('/users', user.list);
app.get('/bootstrap3',routes.bootstrap3);
app.post('/dopost',function(req,res){
    res.send(req.body);
});
app.get('/users/:id',function(req,res){
    res.send('show content for user id ' + req.params.id);
});

app.get('/json',function(req,res){
    var user = {
        first_name: 'Lord',
        surname: 'Lucan',
        address: "I'm not telling!",
        facebook_friends: '1356200'
    };
    res.render('index.jade',{title:'User',user:user});
});

app.get('/tasks',function(req,res){
    Task.find({},function(err,docs){
        console.log(docs);
        res.render('tasks/index',{
            title: 'Todo index view',
            docs: docs
        });
    });
});

app.get('/tasks/:id/edit',function(req,res){
    Task.findById(req.params.id,function(err,doc){
        res.render('tasks/edit',{
            title: 'Edit Task View',
            task: doc
        });
    });
});

app.get('/tasks/new',function(req,res){
    res.render('tasks/new.jade',{
        title: 'New Task'
    });
});
app.post('/tasks',function(req,res){
    var task = new Task(req.body.task);
    task.save(function(err){
        if(!err){
            res.redirect('/tasks');
        }else{
            res.redirect('/tasks/new');
        }
    });
});

app.put('/tasks/:id',function(req,res){
    Task.findById(req.params.id,function(err,doc){
        doc.task = req.body.task.task;
        doc.save(function(err){
            if(!err){
                res.redirect('/tasks');
            }else{

            }
        });
    })
});
//删除
app.del('/tasks/:id',function(req,res){
    Task.findById(req.params.id,function(err,doc){
        if(!doc){
            return next(new NotFound('Document not found'));
        }
        doc.remove(function(){
            res.redirect('/tasks');
        });
    });
});
/*
* currentPage 表示当前页数
* records 表示查询的条数
* pageSize 表示一页要显示的个数
* */
app.get('/demo',function(req,res){
    var id = randomNumber.randomString(5),currentPage = 1,pageSize = 2,param = {};
    User.find({},function(err,doc){
        param.data = doc.splice(0,pageSize);
        param.currentPage = currentPage;
        param.records = doc.length;
        param.pageSize = pageSize;
        res.render('demo.jade',{title:'样品',id: id,param: param});
    });
});


var globalForm = [],percentArr = [];
app.post('/upload',function(req,res){
    var form = new formidable.IncomingForm();
    console.log('进来了');
    var _randomId,fs = require('fs');
    var content = {},basePath = __dirname,picPath = basePath + '\\public\\node-pic';
    fs.stat(picPath,function(err,stats){
        if(err){
            console.log('创建新文件咯');
            fs.mkdirSync(picPath);
        }else{
            console.log('我已经创建好咯，不需要创建了');
        }

    });

    form.parse(req,function(err,fields,files){
        var name = files.houseMaps.name,newName = name.split('.')[0]+ randomNumber.randomString(8)  +'.'+  name.split('.')[1];
        fs.readFile(files.houseMaps.path,function(err,data){
            console.log(picPath + '\\' + newName);
            fs.writeFileSync(picPath + '\\' + newName,data);
            fs.stat(picPath + '\\' + newName,function(err,stats){
                if(err){
                    content.error = '图片上传不成功';
                }else {
                    content.url = 'node-pic/' + newName;
                }
                console.log(content);
                res.setHeader("Content-Type", "text/html");
                res.send(content);//服务器停止提供信息
            });
        });
        /*var filename = randomNumber.randomString(8)+files.filedata.name;
         _randomId = fields.randomId;
         fs.open('D:\\tmp\\'+ filename,'w+',files,function(err,fd){
         if(err) throw err;
         });
         globalForm.push({randomId: _randomId,form: form,process:'0'});*/
    });

    /*var count = 1;
    form.on('progress',function(bytesReceived,bytesExpected,ending){
        var percent = Math.round(bytesReceived/bytesExpected * 100);
        var opts = {
            name : "uploadprogress",
            value : percent,
            expires : 500
        };
        req.session.opts = opts;
        count++;
        if(count%50 === 0){
            percentArr.push({form:form,percent:percent});
            console.log(percentArr);
        }
    });*/
    //res.render('demo.jade',{id: randomId});
    /*form.on('end',function(req,res){
        res.send(req.body);
    });*/

    //res.send({id:obj.id});
});
/*app.post('/uploadFile',function(req,res){
    var form = new formidable.IncomingForm(),randomId,searchForm;
    var count = 0,obj = {};
    randomId = req.body.randomId;
    searchForm = searchQueueById.searchFormQueueById(randomId,globalForm);
    if(searchForm){
        searchForm.on('progress',function(bytesReceived,bytesExpected,ending){
            count++;
            if(count%50 === 0){
                //obj = {bytesReceived:bytesReceived,bytesExpected:bytesExpected,ending:ending,flag:true};
                res.send({bytesReceived:bytesReceived,bytesExpected:bytesExpected,ending:ending,flag:true});
            }else{
                //obj = {flag:false,ending:ending};
                res.send({flag:false,ending:ending});
            }
        });
        //res.send(obj);
        searchForm.on('end',function(){
            res.render('demo.jade');
        });
    }else{
        res.send({flag:true});
    }
});*/

app.get('/ajaxValidation',function(req,res){
    //console.log(req.query.username);
    var username = req.query.username,flag = true,context = '';
    if(username == 'yangcheng'){
        flag = false;
        context = 'username已经存在';
        res.send({errorContent: context});
    }else{
        res.send('true');
    }

});
app.get('/ajaxPassword',function(req,res){
    var password =req.query.password,newpassword = req.query.newpassword,context = '';
    if(password != newpassword){
        context = '密码输出错误';
        res.send({errorContent: context});
    }else{
        res.send('true');
    }
});
app.post('/ajaxinput',function(req,res){
    res.send('true');
});

/*分页*/

app.post('/pageCreate',function(req,res){
    var name = req.body.name?req.body.name:'',
        age = req.body.age?req.body.age: '';
    User.create({
        name: name,
        age: age
    },function(err,doc){
        res.end();
    });

});

app.post('/getPage',function(req,res){
    var pageSize = req.body.pageSize,
        currentPage = req.body.number,
        param = {},arr;
    User.find({},function(err,doc){
        arr = doc.splice(currentPage*pageSize,pageSize);
        param.currentPage = currentPage;
        param.records = doc.length;
        param.pageSize = pageSize;
        param.context = getContext(arr);
        res.send({param: param});
    });
});

function getContext(data){
    var l = data.length,context = '';
    for(var i=0;i<l;i++){
        var _context = '';
        _context = '<tr>';
        _context += '<td>' + data[i].name + '</td>' + '<td>' + data[i].age + '</td>';
        _context += '</tr>';
        context += _context;
    }
    return context;
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
