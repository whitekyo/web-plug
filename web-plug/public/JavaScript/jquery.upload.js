/**
* jQuery upload v1.2
* http://www.ponxu.com
*
* @author xwz
*/
(function($) {
    var noop = function(){ return true; };
    var frameCount = 0;

    $.uploadDefault = {
        url: '',
        fileName: 'filedata',
        dataType: 'json',
        params: {},
        onSend: noop,
        onComplate: noop
    };

    $.upload = function(options) {
        var opts = $.extend(jQuery.uploadDefault, options);
        if (opts.url == '') {
            return;
        }

        /*var canSend = opts.onSend();
        if (!canSend) {
            return;
        }*/
        if($('.yc_upload').length){
            $('.yc_upload').remove();
            $('iframe[name^="upload_frame"]').remove();
        }
        var frameName = 'upload_frame_' + (frameCount++);
        var iframe = $('<iframe style="position:absolute;top:-9999px" />').attr('name', frameName);
        var form = $('<form method="post" style="display:none;" enctype="multipart/form-data" class="yc_upload"/>').attr('name', 'form_' + frameName);
        form.attr("target", frameName).attr('action', opts.url);

        // form中增加数据域
        var formHtml = '<input type="file" name="' + opts.fileName + '" onchange="onChooseFile(this)">';
        for (key in opts.params) {
            formHtml += '<input type="hidden" name="' + key + '" value="' + opts.params[key] + '">';
        }
        //传递randomID
        if(document.getElementById('randomId')){
            formHtml += '<input type="hidden" name="randomId"  value="'+document.getElementById('randomId').value +'">';
        }
        form.append(formHtml);
        iframe.appendTo("body");
        form.appendTo("body");

        // iframe 在提交完成之后
        iframe.load(function() {
            var contents = $(this).contents().get(0);
            var data = $(contents).find('body').html();
            if ('json' == opts.dataType) {
                //data = window.eval('(' + data + ')');
            }
            //opts.onComplate(data);
            /*setTimeout(function() {
                    iframe.remove();
                    form.remove();
                }, 5000);*/
        });

        // 文件框
        var fileInput = $('input[type=file][name=' + opts.fileName + ']', form);
        fileInput.click();

    };
})(jQuery);
var onChooseFile = function(fileInputDOM) {
    var form = $(fileInputDOM).parent(),fileDom = form.find('[type="file"]');
    form.submit();
    //console.log(form);
    //setTimeout(UploadFile(form[0].action+'File'),1000);
};
function UploadFile(url){
    /*var form = new FormData(),xhr = new XMLHttpRequest();
    for(var property in param){
        form.append(property,param[property]);
    }*/
    var randomId;
    if(document.getElementById('randomId')){
        randomId = document.getElementById('randomId').value;
    }
    $.ajaxSetup(
        {cache: false}
    );
    var params = {
        url: url,
        type: 'post',
        dataType: 'json',
        data: {randomId: randomId},
        success: function(data){
            var bytesReceived = data.bytesReceived?parseInt(data.bytesReceived):0,bytesExpected = data.bytesExpected?parseInt(data.bytesExpected):0,ending = data.ending,width = bytesExpected?Math.round(bytesReceived/bytesExpected*100)+'%':'0%';
            if(data.flag){//需要再次请求
                changeProgress(width,$('.uploadProgress'));
                setTimeout(function(){
                    $.ajax(params);
                },1000);
            }
            if(ending){
                return;
            }
            //alert('上传成功');
        },
        error: function(err){
            alert(err);
        }
    };
    $.ajax(params);
}

function changeProgress(width,context){
    context.find('.bar').animate({
        width: width
    });
}


