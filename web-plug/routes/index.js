
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.bootstrap = function(req,res){
    res.render('bootstrap',{ title: 'Bootstrap'});
}

exports.bootstrap3 = function(req,res){
    res.render('bootstrap3',{ title: 'Bootstraps'});
};

exports.dialog = function(req,res){
    res.render('dialog',{title: 'Dialogs'});
};

exports.css = function(req,res){
    res.render('css',{title: 'Compatibility Of Css'});
};