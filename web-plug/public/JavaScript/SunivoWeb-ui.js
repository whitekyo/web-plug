/**
 * Created with IntelliJ IDEA.
 * User: yangcheng
 * Date: 14-3-24
 * Time: 下午9:05
 * To change this template use File | Settings | File Templates.
 */
/**
 * console检查，IE6-7没有console，IE8-9可能会出错
 * @type {*|{log: Function}}
 */
var console = console || {
    log : function(){
        return false;
    }
};
(function($,_,w){
    var SW = function(){},
        /**
         * defaultConfig和Defmodal是关于方法createModal的初始化参数
         */
            defaultConfig = {
            defaults: false,
            hasHeader: false,
            fillHeader: '',
            hasClose: false,
            /*fillClose: '',*/
            hasBody: false,
            fillBody: '',
            hasDefFooter: false,
            fillFooter: '',
            backdrop: 'static',
            keyboard: false,
            custom: null,
            callback: null,
            url: '',
            data: '',
            showNow: false,
            cssRule: {},
            defBtnEvent: {},
            bindEvent: $('body')
        },
        Defmodal = {
            Wrap : '<div class="modal fade" style="display: none;" id="#">',
            Header: '<div class="modal-header">#',
            //Close: '<a class="close" data-dismiss="modal" event="cancel">×</a>',
            Body: '<div class="modal-body">',
            Footer: '<div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal" event="ensure">确定</a><a href="#" class="btn" data-dismiss="modal" event="cancel">取消</a></div>'
        },
        GlobalModalQueue = [];
    //工具类
    var util = {
        //检查浏览器版本,如果是IE浏览器返回版本号，其他浏览器返回false
        isbrowser: function(){
            var oldReg = /MSIE\s(.*?);/,
                newReg = /Trident\/(.*?);/,
                appVersion = navigator.appVersion,
                newIe = {
                    'Trident/7.0;':'11',
                    'Trident/6.0;':'10',
                    'Trident/5.0;':'9',
                    'Trident/4.0;':'8'
                };
            if(oldReg.test(appVersion)||newReg.test(appVersion)){
                if(appVersion.match(oldReg)){
                    return parseInt(appVersion.match(oldReg)[1],10);
                }else if(appVersion.match(newReg)){
                    return parseInt(newIe[appVersion.match(newReg)[0]],10);
                }else{
                    return false;
                }
            }else{
                return false;
            }
        },
        isJQueryDom: function(j){
            return j instanceof $;
        },
        randomNumber: function(len){
            len = len||32;
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz12345678',pwd = '';
            for(var i=0;i<len;i++){
                pwd += $chars.charAt(Math.floor(Math.random()*48));
            }
            return pwd;
        }
    };
    //为loading设置，如下为单例模式
    var Universe;
    function getSingleInstance(){
        var instance;
        //loading制造工厂，生产loading效果
        function loadFactory(){
            var loadDom = '<div class="x-load" style="display: none;"><img src="../customize/img/yc/loading5.GIF"/></div>';
            return $(loadDom);
        }
        Universe = function Universe(){
            if(instance){
                return instance;
            }
            instance = this;
            var context = loadFactory();
            $('body').prepend(context);
            _.extend(this,{
                'create': function(){
                    context.fadeIn();
                },
                'remove': function(){
                    context.fadeOut();
                }
            });
        };
        return Universe;
    }
    Universe = getSingleInstance();
    //nav工具类
    var navUtil = {
        isRootElement: function(context){
            return context.parent().parent()[0].id == 'pordAttr';
        },
        findChildren: function(context){
            return context.next()?[context.next()]:[];
        },
        findFather: function(context){
            var arr = [];
            context.parents('li').each(function(i,v){
                var parentA = $(v).children('a');
                if(context.html() != parentA.html()){
                    arr.push(parentA);
                }
            });
            return arr;
        },
        _show: function(arr){
            _.each(arr,function(v){
                if(v[0]&&v[0].nodeName.toLowerCase() == 'ul'){
                    v.show(200);
                }else if(v[0]&&v[0].nodeName.toLowerCase() == 'a'){
                    v.next().show(200);
                }
            });
        },
        _hide: function(arr){
            _.each(arr,function(v){
                if(v[0]&&v[0].nodeName.toLowerCase() == 'ul'){
                    v.hide(200);
                }else if(v[0]&&v[0].nodeName.toLowerCase() == 'a'){
                    v.next().hide(200);
                }
            });
        },
        activeFather: function(arr){
            _.each(arr,function(v){
                if(navUtil.isRootElement(v)){
                    v.addClass('nav-show nav-active on');
                }else{
                    v.addClass('nav-show nav-active second-on');
                }
            });
        },
        refresh: function(_context){
            _context.find('a').removeClass('nav-show nav-active second-on on');
        }
    };
    //错误提示
    var errorinfoTmpl = $("<div class='alert'><button type='button' class='close' data-dismiss='alert'>×</button><h4></h4><div class='info'></div></div>"),errArr = [],formArr = [];
    SW.prototype = {
        constructor:SW,
        //UI类
        /**
         * createModal方法主要是解析配置参数，查询modal队列。如果没有则通过内置方法createModalFactory创建一个根据配置参数设定的modal
         *
         */
        createModal: function(config){
            var cfg = _.extend({},defaultConfig,config),id, o,context = cfg.bindEvent;
            var _defEventTip = false;
            var _cfg = { backdrop: cfg.backdrop,keyboard: cfg.keyboard};
            if(context.data('modalEvent')){
                id = context.data('modalEvent');
                o = findModalById(id,GlobalModalQueue);
            }else{
                id = util.randomNumber(5);
                var tmplModal = Defmodal.Wrap.replace(/#/g,id);
                o = createModalFactory(cfg);
                var cssRule = cfg.cssRule;
                if(cssRule){
                    $('#' + id).css(cssRule);
                }
                var _obj = {};
                _obj.id = id;
                _obj.modal = o;
                GlobalModalQueue.push(_obj);
                context.data('modalEvent',id);
            }
            if(context.length){
                context.on('click',function(){
                    $('#'+id).modal(_cfg);
                });
            }
            if(cfg.showNow){
                $('#'+id).modal(_cfg);
            }else{
                return $('#'+id);
            }
            function createModalFactory(cfg){
                var _obj = cfg.custom,_event = cfg.defBtnEvent;
                var oDiv = document.createElement('div');
                oDiv.className = 'modal fade';oDiv.id = id;
                oDiv.style.display = 'none';
                if(cfg.defaults){
                    for(var i in cfg){
                        if(/^has.*/g.test(i)){
                            var _name = i.substr(3, i.length);
                            if(cfg['fill'+ _name]){
                                tmplModal += Defmodal[_name];
                                if(_name!= 'Close'){
                                    tmplModal += cfg['fill' + _name];
                                    tmplModal += '</div>';
                                }
                            }
                        }
                    }
                    if(cfg.hasClose){
                        tmplModal = tmplModal.replace(/#/g,'<a class="close" data-dismiss="modal" event="cancel">×</a>');
                    }else{
                        tmplModal.replace(/#/g,'');
                    }
                    if(cfg.hasDefFooter){
                        _defEventTip = true;
                        tmplModal += Defmodal.Footer;
                    }else{
                        tmplModal += cfg.fillFooter;
                    }
                    tmplModal += '</div>';
                }else if(_obj){
                    if(typeof _obj == 'string'){
                        tmplModal += _obj;
                    }else if(util.isJQueryDom(_obj)){
                        $(oDiv).append(_obj);
                        tmplModal = $(oDiv);
                    }
                    if(cfg.url){
                        $(oDiv).load(cfg.url,cfg.data,cfg.callback);
                        tmplModal = $(oDiv);
                    }
                    if(tmplModal&&!util.isJQueryDom(tmplModal)){
                        tmplModal += '</div>';
                    }
                }
                $('body').append(tmplModal);
                if(_defEventTip && !_.isEmpty(_event)){
                    $('body '+ '#' + id).on('click','[data-dismiss="modal"]',function(e){
                        var target = e.target;
                        _event[target.getAttribute('event')](target);
                    });
                }
                _defEventTip = false;
                return $('#',id);
            }
            function findModalById(id,arr){
                for(var i=0;i<arr.length;i++){
                    if(arr[i].id == id){
                        return arr[i].modal;
                    }
                }
            }
        },
        loading: function(){
            return new Universe();
        },
        upload: function(){
            if($('.x-upload-btn').length){
                $('body').on('click','.x-upload-btn',function(e){
                    var $target = $(e.target),$input = $target.prev(),id,$file,$div = $target.closest('.x-upload-module');
                    if(!$div.find('[type="file"]').length){
                        id = util.randomNumber(2) + $input.attr('id');
                        $file = $('<input type="file" style="display: none;" name="'+ $input.attr('name') +'" id="' + util.randomNumber(2) + $input.attr('id') + '" />');
                        $div.append($file);
                        $div.find('[type="file"]').on('change',function(e){
                            $div.find('.x-upload-text').val(e.target.value);
                        });
                    }
                    $div.find('[type="file"]').click();
                });
            }
        },
        /**
         * 内置方法locationCus用来解析url，匹配成功后调用loactionController执行相应显示逻辑，每次清空页面显示的时候navUtil提供refresh方法清空。
         * @param _url
         * @param _context
         */
        navLocation: function( _url,_context ){
            function locationCus(__url,context){
                var url = __url.match(/^.*\/(.*)$/)[1];
                var reg = new RegExp('.*'+url+'$','g');
                context.find('a').each(function(i,v){
                    if(reg.test(v.href)){
                        loactionController($(v));
                    }
                });
            }
            function loactionController(context){
                if(navUtil.isRootElement(context)){
                    context.addClass('nav-show nav-active on');
                }else{
                    context.addClass('nav-show nav-active second-on');
                }
                var arr = navUtil.findFather(context);
                navUtil._show(arr);
                navUtil.activeFather(arr);
            }
            navUtil.refresh(_context);
            locationCus(_url,_context);
        },
        /**
         * 与navLocation公用navUtil内置方法包，内置方法controller执行相应逻辑
         * @param _context
         */
        nav: function(_context){
            function controller(context){
                if(!context.hasClass('nav-show')){
                    navUtil._show(navUtil.findChildren(context));
                    if(navUtil.isRootElement(context)){
                        context.addClass('nav-show nav-active on');
                    }else{
                        context.addClass('nav-show nav-active second-on');
                    }

                }else{
                    navUtil._hide(navUtil.findChildren(context));
                    if(navUtil.isRootElement(context)){
                        context.removeClass('nav-show nav-active on');
                    }else{
                        context.removeClass('nav-show nav-active second-on');
                    }
                }

            }
            _context.find('a').click(function(e){
                controller($(e.target));
            });
        },
        /**
         * 处理表单数字的格式化
         * 需要引入autoNumeric.js
         */
        autoNumeric: function(){
            var ctx = arguments.length > 0 ? arguments[0] : null;
            if ($.fn.autoNumeric) {
                var autoNumericList = $('.auto-numeric', ctx);
                for (var index = 0; index < autoNumericList.size(); index++) {
                    var autoNumeric = $(autoNumericList[index]);
                    autoNumeric.autoNumeric('init');
                }
            }
        },
        /**
         * 错误提示,将所有信息存储在内置数组errArr中统一保存。错误提示，主要维护这个数组，如果数组中没有值，则没有错误提示，否则提示错误信息
         * context为form表单，dom为当前被验证的控件
         */
        errorInfo: function(context,type,str,dom,location){
            var id = context.attr('id')? context.attr('id'): util.randomNumber(4),form,tmpl;
            var title,errText = '',obj = {},delObj;
            switch (type){
                case "alert-block":
                    title = "警告 !";//Warning
                    break;
                case "alert-error":
                    title = "错误 !";//Error
                    break;
                case "alert-success":
                    title = "成功 !";//Success
                    break;
                default:
                    title = "信息 !";//Info
            }
            form = findFormById(formArr,id)[0];
            if(!form){
                tmpl = errorinfoTmpl.clone(true);
                form = {
                    id: id,
                    form: context,
                    errArr: [],
                    tmpl : tmpl
                };

                formArr.push(form);
            }
            if(str){
                var _arr = str.split(':');
                if(!findErrorByName(form.errArr,_arr[0]).length){
                    obj.name = _arr[0];
                    obj.content = obj.name + '项：' + _arr[1];
                    obj.flag = true;
                    obj.context = dom;
                    form.errArr.push(obj);
                }
            }else{
                delObj = findErrorByDom(form.errArr,dom);
                if(delObj.length){
                    removeDuplicate(form.errArr,delObj);
                }
            }
            if(form.errArr.length){
                for(var i=0;i<form.errArr.length;i++){
                    if(form.errArr[i].flag){
                        errText += '<p>' + form.errArr[i].content + '</p>';
                    }
                }
            }
            if(errText){
                $(".info",form.tmpl).html(errText).closest(".alert").addClass(type).find("h4").html(title);
                if(location == 'top'){
                    context.prepend(form.tmpl);
                }else if(location == 'bootom'){
                    context.append(form.tmpl);
                }

            }else{
                form.tmpl.remove();
            }
            function findErrorByName(arr,name){
                return _.filter(arr,function(v){
                    return v.name == name;
                });
            }
            function findErrorByDom(arr,dom){
                return _.filter(arr,function(v){
                    return v.context == dom;
                });
            }
            function removeDuplicate(arr1,arr2){
                for(var i=0;i<arr2.length;i++){
                    for(var j=0; j<arr1.length;j++){
                        if(arr1[j].name == arr2[i].name){
                            arr1.splice(j,1);
                        }
                    }
                }
            }
            function findFormById(form,id){
                return _.filter(form,function(v){
                    return v.id == id;
                });
            }
        },
        /**
         * form上下伸缩
         * fold方法解析dom上的配置参数，_createFoldTab方法是根据配置参数创建伸缩框。并添加到指定dom上。
         */
        fold: function(){
            if($('[data-fold]').length){
                var $form = $('[data-fold]'),arr = $form.data('fold').split('#'),num = arr[0],row = arr[1],selector,postionSelector,other;
                if(parseInt(num,10)- 2 >= 0){
                    selector = row+':gt('+(num-2).toString()+')';
                    postionSelector = row + ':eq(' + (num-2).toString() + ')';
                }
                else{
                    return false;
                }
                function getHeight(content){
                    var height = 0;
                    content.each(function(i,v){
                        height += parseInt($(v).outerHeight(true));
                    });
                    return height;
                }
                if($form.children(':not('+ row +')').length){
                    other = $form.children(':not('+ row +')');
                }
                var insertDom = $form.find(selector),height = getHeight(insertDom);
                insertDom.wrapAll('<div class="tab-hid" style="height: 0; *min-height: 0;"></div>');
                $('.tab-hid').after(this._createFoldTab(row,height,other));
            }
        },
        _createFoldTab: function(selector,height ,other){
            var oDiv = document.createElement('div'),dealbtn = '<div class="searchMessage-tab-btn"><i class=" icon-chevron-down i-middle"></i></div>',$div = $(oDiv);
            $div.addClass(selector.substring(1)).addClass('searchMessage-tab');
            if(other) other.appendTo($div);
            $(dealbtn).appendTo($div);
            $div.on('click',function(){
                var $div = $('.tab-hid');
                if(!$div.hasClass('show-fold')){
                    if(util.isbrowser()&&util.isbrowser() <= 7){
                        $div.addClass('show-fold').css({
                            height: parseInt(height,10)
                        });
                        $('.searchMessage-tab-btn').find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
                    }else{
                        $div.animate({
                            height: parseInt(height,10)
                        },function(){
                            $div.addClass('show-fold').css({
                                'overflow':'visible',
                                'z-index': '1000'
                            });
                            $('.searchMessage-tab-btn').find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
                        });
                    }

                }else{
                    if(util.isbrowser()&&util.isbrowser() <= 7){
                        $div.removeClass('show-fold').css({
                            height: 0
                        });
                        $('.searchMessage-tab-btn').find('i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                    }else{
                        $div.animate({
                            height:0
                        },function(){
                            $div.removeClass('show-fold').css({
                                'overflow': 'hidden',
                                'z-index': '0'
                            });
                            $('.searchMessage-tab-btn').find('i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                        });
                    }

                }
            });
            return $div;
        },
        /**
         * 置顶
         */
        stick: function(flag){
            if(flag && !$('.backToTop').length){//一个页面只有一个置顶
                var $backToTopFun = function() {
                    var st = $(document).scrollTop();
                    st > 0? $(".backToTop").fadeIn(200) : $(".backToTop").hide();
                };
                $("body").append("<div class='backToTop'>回到<br />顶部</div>");
                $backToTopFun();
                $(".backToTop").click(function() {
                    $("html, body").animate({ scrollTop: 0 }, 500);
                    $(".backToTop").hide();
                });
                //绑定滚动事件
                $(window).bind("scroll", $backToTopFun);
            }
        },
        datepicker : function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t = $("input.date-picker", ctx);
            if (!t.length) return 0;
            if (!$.fn.datetimepicker) return console.log('handleDatepicker init failed! datetimepicker is undefined!');
            return t.each(function(){
                var _ = $(this);
                var format = _.data("format") || "yyyy-mm-dd",startDate = _.data("startdate") || new Date(),endDate = _.data("enddate") || Infinity,
                    opt = {
                        format:format,
                        startDate:startDate,
                        endDate:endDate,
                        weekStart: 1,
                        todayBtn:  1,
                        autoclose: 1,
                        todayHighlight: 1,
                        startView: 2,
                        minView: 2,
                        forceParse: 0
                    };
                _.prop('readonly',true).datetimepicker(opt);
            })
        },
        timepicker : function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t = $("input.time-picker", ctx);
            if (!t.length) return 0;
            if (!$.fn.datetimepicker) return console.log('handleTimepicker init failed! datetimepicker is undefined!');
            return t.prop('readonly',true).datetimepicker({
                format : 'hh:ii',
                weekStart: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 1,
                minView: 0,
                maxView: 1,
                forceParse: 0,
                minuteStep:20
            });
        },
        dateTimepicker : function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t = $("input.datetime-picker", ctx);
            if (!t.length) return 0;
            if (!$.fn.datetimepicker) return console.log('handleDateTimepicker init failed! datetimepicker is undefined!');
            return t.each(function(){
                var _ = $(this);
                var format = _.data("format") || "yyyy-mm-dd hh:ii",
                    startDate = _.data("startdate") || new Date(),
                    endDate = _.data("enddate") || Infinity,
                    minStep = _.data("minstep") || 30 ,
                    opt = {
                        format : format,
                        startDate:startDate,
                        endDate:endDate,
                        weekStart: 1,
                        autoclose: 1,
                        todayHighlight: 1,
                        startView: 2,
                        forceParse: 0,
                        minuteStep:minStep
                    };
                _.prop('readonly',true).datetimepicker(opt);
            })
        },
        chosen : function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t = $("select.chosen", ctx);
            if (!t.length) return 0;
            if (!$.fn.chosen) return console.log('handleChosen init failed! chosen is undefined!');
            return t.chosen({allow_single_deselect: true});
        },
        icheck : function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t= $("input.icheck", ctx),
                _types = ['blue', 'orange', 'red', 'green', 'yellow', 'grey', 'pink', 'purple', 'white'];
            if (!t.length) return 0;
            if (!$.fn.iCheck) return console.log('handleIcheck init failed! icheck is undefined!');
            return t.each(function() {
                var $this = $(this), _type = '-blue', i, j;
                for (i = 0, j = _types.length; i < j; i++) {
                    if ($this.hasClass(_types[i])) {
                        _type = '-' + _types[i];break;
                    }
                }
                $this.iCheck({
                    checkboxClass : ('icheckbox_minimal' + _type),
                    radioClass : ('iradio_minimal' + _type)
                });
            });
        },
        share : {
            style: "toolbar=0,resizable=1,scrollbars=yes,status=1,width=450,height=400",
            info: "SunivoWeb, 简洁、直观的前端开发框架，让web开发更迅速、简单。",
            info_us : "I am very interested in SunivoWeb! ",
            qq: function () { //QQ
                window.open("http://v.t.qq.com/share/share.php?title=" + encodeURIComponent(document.title) + "&info=" + this.info + "&url=" + encodeURIComponent(location.href) + "&source=bookmark", "_blank", this.style);
            },
            sina: function () { //新浪
                window.open('http://v.t.sina.com.cn/share/share.php?title=' + encodeURIComponent(document.title) + "&info=" + this.info + '&url=' + encodeURIComponent(location.href) + '&source=bookmark', "_blank", this.style);
            },
            renren: function () { //人人
                window.open('http://share.renren.com/share/buttonshare.do?link='+ encodeURIComponent(location.href) + encodeURIComponent(document.title) + "&info=" + this.info + '&url=' + encodeURIComponent(location.href) + '&source=bookmark', "_blank", this.style);
            },
            douban: function () { //多看
                window.open('http://www.douban.com/recommend/?url=' + encodeURIComponent(location.href) + "&info=" + this.info + '&title=' + encodeURIComponent(location.href), "douban", this.style);
            },
            wangyi: function() { //网易
                window.open('http://t.163.com/article/user/checkLogin.do?title=' + encodeURIComponent(document.title) + '&url=' + encodeURIComponent(location.href) + "&source=bookmark", "_blank", this.style);
            },
            twitter: function() { //推特
                window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent(location.href) + "&title=" + encodeURIComponent(document.title) + "&text=" + this.info_us + " " + encodeURIComponent(location.href) + "&source=bookmark", "_blank", this.style);
            },
            facebook: function() { //脸书
                window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(location.href) + "&title=" + encodeURIComponent(document.title), "_blank", this.style);
            }
        },
        /**
         * 验证，两种模式，一种集成bootstrap的tooltip的提示，另外一种集成本库的errorInfo方法，将错误信息放置指定位置
         * BubbleTip:冒泡提示
         * FixTip:固定位置提示
         */
        formValidation: function(options){
            var obj = {
                submitHandler : function(form) {
                    form.submit();
                },
                focusCleanup: false,
                focusInvalid: false,
                ignore: ".chzn-search input",


            },_context = this;
            if(options.rules){
                obj.rules = options.rules;
            }
            /**
             * 将原生select与其生成的chosen式的select进行关联。核心是监听原生select上的事件，关联后，chosen就可以将触发事件转移到其原生的select身上，再通过select的验证，再作用于chosen上，本功能只限于页面拥有chosen的情况。
             */
            function workForChosenRelevance(){
                var message = ['required','remote','email','url','date','dateISO','number','digits','creditcard','equalTo','maxlength','minlength','rangelength','range','max','min'];
                var arr = [];
                function testMessage(context){
                    for(var i=0;i<message.length;i++){
                        if(context.hasClass(message[i])){
                            return context.addClass('chosen-validate');
                        }
                    }
                }
                function bindChosen(context){
                    context.on('classNameChage',function(e){
                        var $target = $(e.target),$a = $target.next().find('a');
                        if(e.target.getAttribute('multiple')){
                            $a = $target.next().find('.chzn-choices');
                        }
                        if($target.hasClass('error')){
                            $a.attr("style","border:1px solid #f00");
                            $a.addClass("error tooltips");
                            $a.attr("data-original-title", $target.attr('data-original-title'));
                            $a.tooltip();
                        }else{
                            $a.removeClass("error").removeClass("tooltips");
                            $a.removeAttr("data-original-title");
                            $a.removeAttr("style");
                        }

                    });
                }
                function chosenCallNativeSel(e){
                    var $target = $(e.target),$sel;
                    $sel = $target.closest('.chzn-container').prev();
                    $sel.blur();
                    $sel.trigger('classNameChage');
                }
                $('.chosen').each(function(i,v){
                    var o = testMessage($(v));
                    if(o){ arr.push(o);}
                    bindChosen($(v));
                });
                $('.chosen').chosen();
                /*$('.chosen').each(function(i,v){

                 });*/
                $('form').on('click','.chzn-container',chosenCallNativeSel).on('focusin focusout','.chzn-container',chosenCallNativeSel);
            }
            function workForDateTimePickerRelevance(){
                options._context.find(".datetime-picker,.time-picker,.date-picker").each(function(i,v){
                    $(this).on('change',function(){
                        var $context = $(this);
                        if(this.value){
                            $context.removeClass("error").removeClass("tooltips");
                            $context.removeAttr("data-original-title");
                            $context.removeAttr("style");
                            _context.errorInfo(options._context,options.type,'',this,options.location);
                        }
                    });
                });
            }
            if(options._context.find('.chosen').length){
                workForChosenRelevance();
            }
            if(options._context.find(".datetime-picker,.time-picker,.date-picker").length){
                workForDateTimePickerRelevance();
            }
            if(options.moduleName == 'bubbleTip'){
                var defaults = {
                    placement: 'top',
                    trigger: 'hover'
                };
                _.extend(obj,{
                    errorPlacement: function (errors, element) {
                        var error = errors[0];
                        var target = element;
                        target.addClass("error tooltips");
                        target.attr("data-original-title", error.innerHTML);
                        target.attr("style","border:1px solid #f00");
                        if(target[0].nodeName.toLowerCase() == 'select'){ target.hide();}
                        element.tooltip(_.extend({
                            placement: options.placement,
                            trigger: options.trigger
                        },defaults));
                        $(target).trigger('classNameChage');
                    },
                    unhighlight: function (element) {
                        var $element = $(element);
                        var target = $element;
                        target.removeClass("error").removeClass("tooltips");
                        target.removeAttr("data-original-title");
                        target.removeAttr("style");
                        if(target[0].nodeName.toLowerCase() == 'select'){ target.hide();}

                    }
                });
            }else if(options.moduleName == 'fixTip'){
                var defaults = {
                    type: 'alert-error',
                    location: 'top'
                };
                options = _.extend(options,defaults);
                _.extend(obj,{
                    errorPlacement: function (errors, element) {
                        var error = errors[0];
                        var target = element;
                        target.attr("style","border:1px solid #f00");
                        if(target[0].nodeName.toLowerCase() == 'select'){ target.hide();}
                        _context.errorInfo(options._context,options.type,element.attr('name') + ':' + error.innerHTML,target[0],options.location);
                        $(target).trigger('classNameChage');
                    },

                    unhighlight: function (element) {
                        var $element = $(element);
                        var target = $element;
                        target.removeAttr("style").removeClass('error');
                        if(target[0].nodeName.toLowerCase() == 'select'){ target.hide();}
                        _context.errorInfo(options._context,options.type,'',element,options.location);
                    }
                });
            }
            $.validator.setDefaults(obj);
            options._context.validate();
        },
        /**
         * 设置为首页
         */
        setHome: function(url){
            if (document.all) {
                document.body.style.behavior='url(#default#homepage)';
                document.body.setHomePage(url);
            }else{
                alert("您好,您的浏览器不支持自动设置页面为首页功能,请您手动在浏览器里设置该页面为首页!");
            }
        },
        /**
         * 添加到收藏夹
         * @param sURL
         * @param sTitle
         */
        addFavorite: function(sURL, sTitle){
            sURL = encodeURI(sURL);
            try{
                window.external.addFavorite(sURL, sTitle);
            }catch(e) {
                try{
                    window.sidebar.addPanel(sTitle, sURL, "");
                }catch (e) {
                    alert("加入收藏失败，请使用Ctrl+D进行添加,或手动在浏览器里进行设置.");
                }
            }
        },
        /**
         * 邮箱自动补全
         */
        emailAutocomplete: function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t = $("input.email", ctx),
                rule = ["gmail.com", "hotmail.com", "live.com", "aol.com", "sina.com","sunivo.com","sina.com.cn"];
            if (!t.length) return 0;
            if (!$.fn.typeahead) return console.log('emailAutocomplete init failed! typeahead is undefined!');
            return t.attr('autocomplete','off').typeahead({
                source : function(item) {
                    var _result = [], f = item.match(/@/i), _temp, i, j = rule.length;
                    if (!f) {
                        for (i = 0; i < j; i++) {
                            _result.push(item.toLowerCase() + "@" + rule[i]);
                        }
                    } else {
                        _temp = item.split(/@/);
                        for (i = 0; i < j; i++) {
                            rule[i].match(_temp[1]) ? _result.push(_temp[0].toLowerCase() + "@" + rule[i]) : 1;
                        }
                    }
                    return _result;
                }
            });
        },
        /**
         * Placeholder
         */
        placeholder: function(){
            function isPlaceholder() {
                var input = document.createElement('input');
                return 'placeholder' in input;
            }

            function changeToOriginalColor(self) {
                var index = $(self).index();
                var color = originalColor[$(self).index()];
                $(self).css('color', color);
            }
            if(!isPlaceholder()) {
                var texts = $(':text');
                var len = texts.length;
                var originalColor = [];
                for(var i = 0; i < len; i++) {
                    var self = texts[i];
                    var placeholder = $(self).attr('placeholder');
                    if($(self).val() == "" && placeholder != null) {
                        $(self).val(placeholder);
                        originalColor[i] = $(self).css('color');
                        $(self).css('color', '#666');
                    }
                }
                texts.focus(function() {
                    if($(this).attr('placeholder') != null && $(this).val() == $(this).attr('placeholder')) {
                        $(this).val('');
                        changeToOriginalColor(this);
                    }
                }).blur(function() {
                        if($(this).attr('placeholder') != null && ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))) {
                            $(this).val($(this).attr('placeholder'));
                            $(this).css('color', '#666');
                        }
                    });
            }
        },
        /*新版错误信息*/
        infoTip: function(){
            var _ = arguments[0],
                title,
                div = "" ,
                type = arguments[1];
            switch (type){
                case "alert-block":
                    title = "Waring !";
                    break;
                case "alert-error":
                    title = "Error !";
                    break;
                case "alert-success":
                    title = "Success !";
                    break;
                default:
                    title = "Info !";
            }
            var num = arguments.length;
            for(var i = 2; i < num ; i++){
                div = div + "<div class='info'>"+arguments[i]+"</div>"
            }
            errorinfoTmpl.addClass(type).append(div).find("h4").html(title);
            _.append(errorinfoTmpl);
        }
    };

    _.extend(SW.prototype,util);
    var app = function(){
        SW.call(this);
    };
    function F(){}
    F.prototype = SW.prototype;
    var medium = new F();
    medium.constructor = app;
    app.prototype = medium;
    app.prototype.init = function(){
        this.fold();
        this.datepicker();
        this.timepicker();
        this.dateTimepicker();
        this.chosen();
        this.icheck();
    };
    window.sw = app;
})(jQuery,_,window);

// BOX ALERT
!(function($) {
    var Box = function (element, options) {
        this.options = options;
        this.$element = $(element).delegate('[data-dismiss="box"]', 'click.dismiss.box', $.proxy(this.hide, this));
        this.options.remote && this.$element.find('.box-body').load(this.options.remote);
    };
    Box.prototype = {
        constructor: Box,
        toggle: function () {
            return this[!this.isShown ? 'show' : 'hide']();
        },
        show: function () {
            var that = this;
            // , e = $.Event('boxshow')
            // this.$element.trigger(e)
            if (this.isShown) return;
            this.isShown = true;
            this.escape();
            this.backdrop(function () {
                var transition = $.support.transition && that.$element.hasClass('fade');
                if (!that.$element.parent().length) {
                    that.$element.appendTo(document.body); //don't move boxs dom position
                }
                that.$element.show();
                if (transition) {
                    that.$element[0].offsetWidth; // force reflow
                }
                that.$element.addClass('in').attr('aria-hidden', false);
            });
        },
        hide: function (e) {
            e && e.preventDefault();
            //var that = this;
            if (!this.isShown) return;
            this.isShown = false;
            this.escape();
            $(document).off('focusin.box');
            this.$element.removeClass('in').attr('aria-hidden', true);
            $.support.transition && this.$element.hasClass('fade') ? this.hideWithTransition() : this.hidebox();
        },
        enforceFocus: function () {
            var that = this;
            $(document).on('focusin.box', function (e) {
                if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
                    that.$element.focus();
                }
            });
        },
        escape: function () {
            var that = this;
            if (this.isShown && this.options.keyboard) {
                this.$element.on('keyup.dismiss.box', function ( e ) {
                    e.which == 27 && that.hide();
                });
            } else if (!this.isShown) {
                this.$element.off('keyup.dismiss.box');
            }
        },
        hideWithTransition: function () {
            var that = this,timeout = setTimeout(function () {
                that.$element.off($.support.transition.end);
                that.hidebox();
            }, 500);

            this.$element.one($.support.transition.end, function () {
                clearTimeout(timeout);
                that.hidebox();
            });
        },
        hidebox: function () {
            var that = this;
            this.$element.hide();
            this.backdrop(function () {
                that.removeBackdrop();
                that.options.boxback(); // 触发回调函数
            });
        },
        removeBackdrop: function () {
            this.$backdrop && this.$backdrop.remove();
            this.$backdrop = null;
        },
        backdrop: function (callback) {
            var /*that = this,*/animate = this.$element.hasClass('fade') ? 'fade' : '';
            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate;
                this.$backdrop = $('<div class="box-backdrop ' + animate + '" />').appendTo(document.body);
                // this.$backdrop.click(
                //   this.options.backdrop == 'static' ?
                //     $.proxy(this.$element[0].focus, this.$element[0])
                //   : $.proxy(this.hide, this)
                // )
                if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow
                this.$backdrop.addClass('in');
                if (!callback) return;
                doAnimate ? this.$backdrop.one($.support.transition.end, callback) : callback();
            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass('in');
                $.support.transition && this.$element.hasClass('fade')?
                    this.$backdrop.one($.support.transition.end, callback) :
                    callback();
            } else if (callback) {
                callback();
            }
        }
    };

    $.fn.box = function (option) {
        return this.each(function () {
            var $this = $(this), data = $this.data('box'),
                options = $.extend({}, $.fn.box.defaults, $this.data(), typeof option == 'object' && option);
            if (!data) $this.data('box', (data = new Box(this, options)));
            if (typeof option == 'string') data[option]() ;
            else if (options.show) data.show();
        });
    };
    $.fn.box.defaults = {
        backdrop: true,
        keyboard: false,
        show: true,
        boxback : function(){}
    };

    $.fn.box.Constructor = Box;

})(jQuery);

// ALERT BOX
!(function($, window) {
    window.alert = function(str1, callback, lan) {
        str1 = str1 + "";
        str1 = str1.replace(/</g, "&lt;");
        str1 = str1.replace(/>/g, "&gt;");
        str1 = str1.replace(/\//g, "&#47;");
        if (typeof callback === "string") {lan = callback; callback = undefined;}
        callback = callback || (function() {});
        var _pageLan = $("html").attr("lang") || '';
        if (_pageLan.toUpperCase() == 'EN') lan = 'en';
        var $box = $("<div class='modal fade hide alert-box'><div class='modal-body'>" + str1 + "</div><div class='modal-footer'><button class='btn btn-warning callback-btn' type='button' data-dismiss='box'>" + ((lan && lan == "en") ? "OK" : "确定") + "</button></div></div>").appendTo(document.body);
        $box.box({boxback : function() {
            $box.remove(); setTimeout(callback, 400); $box = null;
        }}).box("show");
        // return str1; /  /不能有返回值
    };

    window.confirm = function(str2, callback, lan) {
        str2 = str2 + "";
        str2 = str2.replace(/</g, "&lt;");
        str2 = str2.replace(/>/g, "&gt;");
        str2 = str2.replace(/\//g, "&#47;");
        callback = callback || function() {};
        var _pageLan = $("html").attr("lang") || '';
        if (_pageLan.toUpperCase() == 'EN') lan = 'en';
        var $box = (lan && lan == "en") ? $("<div class='modal fade hide alert-box'><div class='modal-body'>" + str2 + "</div><div class='modal-footer'><button class='btn' type='button' data-dismiss='box'>No</button><button class='btn btn-warning callback-btn' type='button' data-dismiss='box'>Yes</button></div></div>") :
            $("<div class='modal fade hide alert-box'><div class='modal-body'>" + str2 + "</div><div class='modal-footer'><button class='btn btn-warning callback-btn' type='button' data-dismiss='box'>确定</button><button class='btn' type='button' data-dismiss='box'>取消</button></div></div>");
        $box.appendTo(document.body);
        $box.box({boxback : function() {$box.remove();}})
            .find(".callback-btn").one("click", function() {setTimeout(callback, 450);});
        // return str2;
    };
})(jQuery, window);