
jQuery.extend({

    createUploadIframe: function(id, uri)
	{
			//create frame
            var frameId = 'jUploadFrame' + id;
            //兼容低版本IE
            if(window.ActiveXObject) {
                //var io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');
                var io = document.createElement('iframe');
                io.id = frameId, io.name = frameId;
                if(typeof uri== 'boolean'){
                    io.src = 'javascript:false';
                }
                else if(typeof uri== 'string'){
                    io.src = uri;
                }
            }
            else {
                var io = document.createElement('iframe');
                io.id = frameId;
                io.name = frameId;
            }
            io.style.position = 'absolute';
            io.style.top = '-1000px';
            io.style.left = '-1000px';

            document.body.appendChild(io);//将iframe创建完加入dom渲染

            return io			
    },
    createUploadForm: function(id, fileElementId)
	{
		//create form
		var formId = 'jUploadForm' + id;
		var fileId = 'jUploadFile' + id;
		var form = $('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');
		var oldElement = $('#' + fileElementId);
		var newElement = $(oldElement).clone();//创建一个备份
		$(oldElement).attr('id', fileId);//将原来的file控件的id修改为fileId
		$(oldElement).before(newElement);//将备份内容插到前面
		$(oldElement).appendTo(form);//一起塞进拼成的form表单里
		//set attributes
		$(form).css('position', 'absolute');
		$(form).css('top', '-1200px');
		$(form).css('left', '-1200px');
		$(form).appendTo('body');//加入dom渲染
		return form;
    },

    ajaxFileUpload: function(s) {
        // TODO introduce global settings, allowing the client to modify them for all requests, not only timeout
        s = jQuery.extend({}, jQuery.ajaxSettings, s);
        var id = s.fileElementId;//获取上传的input的id
		var form = jQuery.createUploadForm(id, s.fileElementId);//创建form，加入form，并返回form
		var io = jQuery.createUploadIframe(id, s.secureuri);//创建iframe，加入iframe，并返回iframe
		var frameId = 'jUploadFrame' + id;
		var formId = 'jUploadForm' + id;		
        // Watch for a new set of requests
        if ( s.global && ! jQuery.active++ )
		{
			jQuery.event.trigger( "ajaxStart" );
		}
        var requestDone = false;
        // Create the request object
        var xml = {}
        if ( s.global )
            jQuery.event.trigger("ajaxSend", [xml, s]);
        // Wait for a response to come back
        //回调方法
        var uploadCallback = function(isTimeout)
		{
			var io = document.getElementById(frameId);
            try 
			{
				if(io.contentWindow)
				{
					 xml.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:null;
                	 xml.responseXML = io.contentWindow.document.XMLDocument?io.contentWindow.document.XMLDocument:io.contentWindow.document;

				}else if(io.contentDocument)
				{
					 xml.responseText = io.contentDocument.document.body?io.contentDocument.document.body.innerHTML:null;
                	xml.responseXML = io.contentDocument.document.XMLDocument?io.contentDocument.document.XMLDocument:io.contentDocument.document;
				}						
            }catch(e)
			{
				jQuery.handleError(s, xml, null, e);
			}
            if ( xml || isTimeout == "timeout") 
			{				
                requestDone = true;
                var status;
                try {
                    status = isTimeout != "timeout" ? "success" : "error";
                    // Make sure that the request was successful or notmodified
                    if ( status != "error" )
					{
                        // process the data (runs the xml through httpData regardless of callback)
                        var data = jQuery.uploadHttpData( xml, s.dataType );    
                        // If a local callback was specified, fire it and pass it the data
                        if ( s.success )
                            s.success( data, status );
    
                        // Fire the global callback
                        if( s.global )
                            jQuery.event.trigger( "ajaxSuccess", [xml, s] );
                    } else
                        jQuery.handleError(s, xml, status);
                } catch(e) 
				{
                    status = "error";
                    jQuery.handleError(s, xml, status, e);
                }

                // The request was completed
                if( s.global )
                    jQuery.event.trigger( "ajaxComplete", [xml, s] );

                // Handle the global AJAX counter
                if ( s.global && ! --jQuery.active )
                    jQuery.event.trigger( "ajaxStop" );

                // Process result
                if ( s.complete )
                    s.complete(xml, status);

                jQuery(io).unbind()

                setTimeout(function()
                    {	try
                        {
                            $(io).remove();
                            $(form).remove();

                        } catch(e)
                        {
                            jQuery.handleError(s, xml, null, e);
                        }

                    }, 100)

                xml = null

            }
        }
        // Timeout checker
        //s中没有定义timeout
        if ( s.timeout > 0 ) 
		{
            setTimeout(function(){
                // Check to see if the request is still happening
                if( !requestDone ) uploadCallback( "timeout" );
            }, s.timeout);
        }
        try 
		{
           // var io = $('#' + frameId);
			var form = $('#' + formId);
			$(form).attr('action', s.url);
			$(form).attr('method', 'POST');
			$(form).attr('target', frameId);//指向iframe，因为iframe被position了，所以看不到
            if(form.encoding)
			{
                form.encoding = 'multipart/form-data';				
            }
            else
			{				
                form.enctype = 'multipart/form-data';//设置enctype，能让form提交文件，后台能接到
            }
            console.log($(form));
            $(form).submit();//提交form

        } catch(e) 
		{			
            jQuery.handleError(s, xml, null, e);
        }
        if(window.attachEvent){//支持IE低版本
            document.getElementById(frameId).attachEvent('onload', uploadCallback);
        }
        else{
            document.getElementById(frameId).addEventListener('load', uploadCallback, false);
        } 		
        return {abort: function () {}};	

    },
    //解析数据
    uploadHttpData: function( r, type ) {
        var data = !type;
        data = type == "xml" || data ? r.responseXML : r.responseText;
        data = data.replace(/<.*?>/g,'');
        // If the type is "script", eval it in global context
        if ( type == "script" )
            jQuery.globalEval( data );
        // Get the JavaScript object, if JSON is used.
        if ( type == "json" )
            eval( "data = " + data );
        // evaluate scripts within html
        if ( type == "html" )
            jQuery("<div>").html(data).evalScripts();
			//alert($('param', data).each(function(){alert($(this).attr('value'));}));
        return data;
    }
})

