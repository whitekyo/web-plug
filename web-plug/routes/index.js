
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