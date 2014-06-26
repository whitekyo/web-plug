
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
var Task = new Schema({
    task: String
});
var Task = mongoose.model('Task',Task);

// all environments
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

app.get('/demo',function(req,res){
    var id = randomNumber.randomString(5);
    res.render('demo.jade',{title:'样品',id: id});
});


var globalForm = [],percentArr = [];
app.post('/upload',function(req,res){
    var form = new formidable.IncomingForm();
    var _randomId,fs = require('fs');
    form.parse(req,function(err,fields,files){
        fs.readFile(files.houseMaps.path,function(err,data){
            console.log(err);
            console.log(data);
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
    res.end();//服务器停止提供信息
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
    console.log(password);
    console.log(newpassword);
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
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
