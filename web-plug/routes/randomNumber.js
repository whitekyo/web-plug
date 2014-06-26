/**
 * Created by yangcheng on 14-3-7.
 */
/*
function randomString(len) {
    len = len||32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',maxPos = $chars.length,pwd = '';
    for(var i=0;i<len;i++){
        pwd += $chars.charAt(Math.floor(Math.random()));
    }
    return pwd;
}*/
exports.randomString = function(len){
    len = len||32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',maxPos = $chars.length,pwd = '';
    for(var i=0;i<len;i++){
        pwd += $chars.charAt(Math.floor(Math.random()*48));
    }
    return pwd;
};
