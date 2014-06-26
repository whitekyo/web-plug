/**
 * Created with IntelliJ IDEA.
 * User: yangcheng
 * Date: 14-3-24
 * Time: 涓嬪崍9:05
 * To change this template use File | Settings | File Templates.
 */
/**
 * console妫�煡锛孖E6-7娌℃湁console锛孖E8-9鍙兘浼氬嚭閿�
 * @type {*|{log: Function}}
 */
(function($,_,w){
    /*针对IE8，9需要在F12中才能调用console，在debug状态中查看console*/

    var anonymity = function(){},console = w.console || {
        info: anonymity,
        log: anonymity,
        warn: anonymity,
        error: anonymity
    };
    w.console = w.console || console;
    var SW = function(){},
        /**
         * defaultConfig鍜孌efmodal鏄叧浜庢柟娉昪reateModal鐨勫垵濮嬪寲鍙傛暟
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
            //Close: '<a class="close" data-dismiss="modal" event="cancel">脳</a>',
            Body: '<div class="modal-body">',
            Footer: '<div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal" event="ensure">纭畾</a><a href="#" class="btn" data-dismiss="modal" event="cancel">鍙栨秷</a></div>'
        },
        GlobalModalQueue = [];
    //宸ュ叿绫�
    var util = {
        //isbrowser依赖client
        isbrowser: function(){
            var client = SW.client();
            for(var i in client['browser']){
                if(i == 'ie'){
                    return parseFloat(client['browser'][i]);
                }else{
                    return false;
                }
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
    //涓簂oading璁剧疆锛屽涓嬩负鍗曚緥妯″紡
    var Universe;
    function getSingleInstance(){
        var instance;
        //loading鍒堕�宸ュ巶锛岀敓浜oading鏁堟灉
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
    //nav宸ュ叿绫�
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
    //閿欒鎻愮ず
    var errorinfoTmpl = $("<div class='alert'><button type='button' class='close' data-dismiss='alert'>脳</button><h4></h4><div class='info'></div></div>"),errArr = [],formArr = [];
    SW.prototype = {
        constructor:SW,
        //UI绫�
        /**
         * createModal鏂规硶涓昏鏄В鏋愰厤缃弬鏁帮紝鏌ヨmodal闃熷垪銆傚鏋滄病鏈夊垯閫氳繃鍐呯疆鏂规硶createModalFactory鍒涘缓涓�釜鏍规嵁閰嶇疆鍙傛暟璁惧畾鐨刴odal
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
                        tmplModal = tmplModal.replace(/#/g,'<a class="close" data-dismiss="modal" event="cancel">脳</a>');
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
        upload: function(param){
            var context = param.context,async = param.async,i;
            if(context){
                context.each(function(){
                    SW.createFormForUpload($(this),param);
                    if(!_.isEmpty(async)){
                        SW.bindUploadEvent($(this),async);
                    }
                });
            }

        },
        /**
         * 鍐呯疆鏂规硶locationCus鐢ㄦ潵瑙ｆ瀽url锛屽尮閰嶆垚鍔熷悗璋冪敤loactionController鎵ц鐩稿簲鏄剧ず閫昏緫锛屾瘡娆℃竻绌洪〉闈㈡樉绀虹殑鏃跺�navUtil鎻愪緵refresh鏂规硶娓呯┖銆�
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
         * 涓巒avLocation鍏敤navUtil鍐呯疆鏂规硶鍖咃紝鍐呯疆鏂规硶controller鎵ц鐩稿簲閫昏緫
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
         * 澶勭悊琛ㄥ崟鏁板瓧鐨勬牸寮忓寲
         * 闇�寮曞叆autoNumeric.js
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
         * 閿欒鎻愮ず,灏嗘墍鏈変俊鎭瓨鍌ㄥ湪鍐呯疆鏁扮粍errArr涓粺涓�繚瀛樸�閿欒鎻愮ず锛屼富瑕佺淮鎶よ繖涓暟缁勶紝濡傛灉鏁扮粍涓病鏈夊�锛屽垯娌℃湁閿欒鎻愮ず锛屽惁鍒欐彁绀洪敊璇俊鎭�
         * context涓篺orm琛ㄥ崟锛宒om涓哄綋鍓嶈楠岃瘉鐨勬帶浠�
         */
        errorInfo: function(context,type,str,dom,location){
            var id = context.attr('id')? context.attr('id'): util.randomNumber(4),form,tmpl;
            var title,errText = '',obj = {},delObj;
            switch (type){
                case "alert-block":
                    title = "璀﹀憡 !";//Warning
                    break;
                case "alert-error":
                    title = "閿欒 !";//Error
                    break;
                case "alert-success":
                    title = "鎴愬姛 !";//Success
                    break;
                default:
                    title = "淇℃伅 !";//Info
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
                    obj.content = obj.name + '椤癸細' + _arr[1];
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
         * form涓婁笅浼哥缉
         * fold鏂规硶瑙ｆ瀽dom涓婄殑閰嶇疆鍙傛暟锛宊createFoldTab鏂规硶鏄牴鎹厤缃弬鏁板垱寤轰几缂╂銆傚苟娣诲姞鍒版寚瀹歞om涓娿�
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
         * 缃《
         */
        stick: function(flag){
            $('.main-footer').append('<div class="backWaperWaper" style="float:right;"><div class="backWaper"><a href=""><i class="icoAll ico-25"></i></a></div></div>');
            if(flag && !$('.ico-24').length){//涓�釜椤甸潰鍙湁涓�釜缃《
                var $backToTopFun = function() {
                    var st = $(document).scrollTop();
                    st > 0? $(".ico-24").fadeIn(200) : $(".ico-24").hide();
                };
                $(".backWaper").append("<div class='icoAll ico-24'></div>");
                $backToTopFun();
                $(".ico-24").click(function() {
                    $("html, body").animate({ scrollTop: 0 }, 500);

                });
                //缁戝畾婊氬姩浜嬩欢
                $(window).bind("scroll", $backToTopFun);
            }
        },
        datepicker : function() {
            var ctx = arguments.length > 0 ? arguments[0] : null,
                t = $("input.date-picker", ctx);
            if (!t.length) return 0;
            if (!$.fn.datetimepicker) return console.log('handleDatepicker init failed! datetimepicker is undefined!');
            var format = t.data("format") || "yyyy-mm-dd",startDate = t.data("startdate") || new Date(),endDate = t.data("enddate") || Infinity,
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
            return t.prop('readonly',true).datetimepicker(opt);
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
            var format = t.data("format") || "yyyy-mm-dd hh:ii",
                startDate = t.data("startdate") || new Date(),
                endDate = t.data("enddate") || Infinity,
                minStep = t.data("minstep") || 30 ,
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
            return t.prop('readonly',true).datetimepicker(opt);
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
            if (!t.length&&util.isJQueryDom(ctx)) return 0;
            if (!$.fn.iCheck) return console.log('handleIcheck init failed! icheck is undefined!');
            if(!ctx||util.isJQueryDom(ctx)){
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
            }else if($.isArray(ctx)&&ctx.length&&util.isJQueryDom(ctx[0])){
                $(ctx).each(function(){
                    var  _type = '-blue', i, j;
                    for (i = 0, j = _types.length; i < j; i++) {
                        if (this.hasClass(_types[i])) {
                            _type = '-' + _types[i];break;
                        }
                    }
                    this.iCheck({
                        checkboxClass : ('icheckbox_minimal' + _type),
                        radioClass : ('iradio_minimal' + _type)
                    });
                });
            }

        },
        share : {
            style: "toolbar=0,resizable=1,scrollbars=yes,status=1,width=450,height=400",
            info: "SunivoWeb, 简洁、直观的前端开发框架，让web开发更迅速、简单。",
            info_us : "I am very interested in SunivoWeb! ",
            qq: function () { //QQ
                window.open("http://v.t.qq.com/share/share.php?title=" + encodeURIComponent(document.title) + "&info=" + this.info + "&url=" + encodeURIComponent(location.href) + "&source=bookmark", "_blank", this.style);
            },
            sina: function () { //鏂版氮
                window.open('http://v.t.sina.com.cn/share/share.php?title=' + encodeURIComponent(document.title) + "&info=" + this.info + '&url=' + encodeURIComponent(location.href) + '&source=bookmark', "_blank", this.style);
            },
            renren: function () { //浜轰汉
                window.open('http://share.renren.com/share/buttonshare.do?link='+ encodeURIComponent(location.href) + encodeURIComponent(document.title) + "&info=" + this.info + '&url=' + encodeURIComponent(location.href) + '&source=bookmark', "_blank", this.style);
            },
            douban: function () { //澶氱湅
                window.open('http://www.douban.com/recommend/?url=' + encodeURIComponent(location.href) + "&info=" + this.info + '&title=' + encodeURIComponent(location.href), "douban", this.style);
            },
            wangyi: function() { //缃戞槗
                window.open('http://t.163.com/article/user/checkLogin.do?title=' + encodeURIComponent(document.title) + '&url=' + encodeURIComponent(location.href) + "&source=bookmark", "_blank", this.style);
            },
            twitter: function() { //鎺ㄧ壒
                window.open("https://twitter.com/intent/tweet?url=" + encodeURIComponent(location.href) + "&title=" + encodeURIComponent(document.title) + "&text=" + this.info_us + " " + encodeURIComponent(location.href) + "&source=bookmark", "_blank", this.style);
            },
            facebook: function() { //鑴镐功
                window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(location.href) + "&title=" + encodeURIComponent(document.title), "_blank", this.style);
            }
        },
        /**
         * 楠岃瘉锛屼袱绉嶆ā寮忥紝涓�闆嗘垚bootstrap鐨則ooltip鐨勬彁绀猴紝鍙﹀涓�闆嗘垚鏈簱鐨別rrorInfo鏂规硶锛屽皢閿欒淇℃伅鏀剧疆鎸囧畾浣嶇疆
         * BubbleTip:鍐掓场鎻愮ず
         * FixTip:鍥哄畾浣嶇疆鎻愮ず
         */
        formValidation: function(options){
            var obj = {
                submitHandler : function(form) {
                    form.submit();
                },
                focusCleanup: false,
                focusInvalid: false,
                ignore: ".chzn-search input",
                debug: true,
                onfocusout: function( element, event ) {
                    if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) { //submit涔嬪悗瑙﹀彂銆�
                        this.element(element);
                    }
                    if ( this.settings.errorPlacement && options.errorPlacement) { //鏀寔姣忎釜鎺т欢鑷垜妫�祴 coding by yangcheng
                        var validator = $(event.currentTarget).data('validator');
                        if($(element).parent().hasClass('chzn-search')){
                            element = $(element).closest('.chzn-container').prev()[0];
                        }
                        validator.check(element);
                        validator.showErrors();
                    }
                }
            },_context = this;
            if(options.rules){
                obj.rules = options.rules;
            }
            /**
             * 灏嗗師鐢焥elect涓庡叾鐢熸垚鐨刢hosen寮忕殑select杩涜鍏宠仈銆傛牳蹇冩槸鐩戝惉鍘熺敓select涓婄殑浜嬩欢锛屽叧鑱斿悗锛宑hosen灏卞彲浠ュ皢瑙﹀彂浜嬩欢杞Щ鍒板叾鍘熺敓鐨剆elect韬笂锛屽啀閫氳繃select鐨勯獙璇侊紝鍐嶄綔鐢ㄤ簬chosen涓婏紝鏈姛鑳藉彧闄愪簬椤甸潰鎷ユ湁chosen鐨勬儏鍐点�
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
                options._context.find('.datetime-picker','.time-picker','.date-picker').each(function(i,v){
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
            if(options._context.find('.datetime-picker','.time-picker','.date-picker').length){
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
         * 璁剧疆涓洪椤�
         */
        setHome: function(url){
            if (document.all) {
                document.body.style.behavior='url(#default#homepage)';
                document.body.setHomePage(url);
            }else{
                alert("鎮ㄥソ,鎮ㄧ殑娴忚鍣ㄤ笉鏀寔鑷姩璁剧疆椤甸潰涓洪椤靛姛鑳�璇锋偍鎵嬪姩鍦ㄦ祻瑙堝櫒閲岃缃椤甸潰涓洪椤�");
            }
        },
        /**
         * 娣诲姞鍒版敹钘忓す
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
                    alert("鍔犲叆鏀惰棌澶辫触锛岃浣跨敤Ctrl+D杩涜娣诲姞,鎴栨墜鍔ㄥ湪娴忚鍣ㄩ噷杩涜璁剧疆.");
                }
            }
        },
        /**
         * 閭鑷姩琛ュ叏
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
        placeholder: function(options){
            function isPlaceholder() {
                var input = document.createElement('input');
                return 'placeholder' in input;
            }
            function isPlaceholder2() {
                var input = document.createElement('textarea');
                return 'placeholder' in input;
            }

            function changeToOriginalColor(self) {
                var index = $(self).index();
                var color = originalColor[$(self).index()];
                $(self).css('color', color);
            }
            if(!isPlaceholder()) {
                var texts = $(':text,:password');
                var len = texts.length;
                var originalColor = [];
                for(var i = 0; i < len; i++) {
                    var self = texts[i];
                    var placeholder = $(self).attr('placeholder');
                    if($(self).val() == "" && placeholder != null) {
                        $(self).addClass("m-placeholder-input")
                        $(self).wrap('<div style="display:inline-block; position:relative" class="x-placeholder-ie-layout"></div>');
                        $(self).after('<span class="placeholer">'+placeholder+'</span>');
                    }
                }
                texts.focus(function() {
                    $(this).next("span").hide();
                })
                texts.blur(function() {
                    if($(this).val() == ""){
                        $(this).next("span").show();
                    }
                })

            };
            if(!isPlaceholder2()) {
                var texts = $('textarea');
                var len = texts.length;
                var originalColor = [];
                for(var i = 0; i < len; i++) {
                    var self = texts[i];
                    var placeholder = $(self).attr('placeholder');
                    if($(self).html() == "" && placeholder != null) {
                        $(self).addClass("m-placeholder-input")
                        $(self).wrap('<div style="display:inline-block; position:relative"></div>');
                        $(self).after('<span class="placeholer">'+placeholder+'</span>');
                    }
                }
                texts.focus(function() {
                    $(this).next("span").hide();
                })
                texts.blur(function() {
                    if($(this).html() == ""){
                        $(this).next("span").show();
                    }
                })

            }
            $(".placeholer").each(function(){
                var $father = $(this).closest('.x-placeholder-ie-layout'),$input = $(this).prev('.m-placeholder-input');
                var left = $input.position().left;
                var top = $input.position().top;
                var setting = $.extend({
                    position:"absolute",
                    left:(left + $input.offset().left - $father.offset().left) + 'px',
                    top:(top + $input.offset().top - $father.offset().top )+'px',
                    padding:"5px 0 0 5px",
                    color: $input.css('color'),
                    width: $input.width()/2+'px'
                },options);
                $(this).css(setting);
            });
            $(".placeholer").click(function(){
                $(this).hide();
                $(this).prev('.m-placeholder-input').focus();
            });
        },
        /*鏂扮増閿欒淇℃伅*/
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
        },
        /**
         * form鍒嗛〉
         */
        turn2Page : function() {
            var number = arguments.length > 0 ? arguments[0] : 1;
            var page = $("#page");
            //var filterForm = $("#filterForm");
            var filterForm = arguments.length > 0 ? arguments[1] :$("#filterForm");
            if (page.length == 0) {
                page = $("<input type='hidden' name='number' id='number'>").appendTo(filterForm);
            }
            page.val(number);
            filterForm.submit();
        },
        /**
         * ajax鍒嗛〉
         */
        ajaxTurn2Page: function(){
            var contextSel = arguments.length > 0 ? arguments[0] : null;
            var baseUrl = arguments.length > 1 ? arguments[1] : "#";
            var number = arguments.length > 2 ? arguments[2] : "1";
            $(contextSel).trigger({
                type : "startLoad",
                number : number
            });
            var form = $("form", contextSel);
            if (form.length == 0) {
                form = $(contextSel).parent("form");
            }
            if (form.length == 0) {
                form = $(contextSel).parents("form");
            }
            var param = $.extend({
                number : number
            }, this._serializeAjax(form));
            $(contextSel).load(baseUrl, param, function() {
                $(contextSel).trigger({
                    type : "pageLoaded",
                    number : number
                });
            });
        },
        _serializeAjax: function(context){
            var obj=new Object();
            $.each(context.serializeArray(),function(index,param){
                if(!(param.name in obj)){
                    obj[param.name]=param.value;
                }
            });
            return obj;
        },
        initPage: function(){
            var $formPage = $('.turnPage'),$ajaxPage = $('.ajaxTurnPage'),that = this;
            if($formPage.length){
                $formPage.closest('form').on('click','.turnPage',function(e){
                    var $target = $(e.target),number = e.target.getAttribute('number'),$form = $target.closest('form');

                    that.turn2Page(number,$form);
                });
            }else if($ajaxPage.length){
                $ajaxPage.on('click',function(e){
                    var target = e.target,number = target.getAttribute('number'),contextSel = target.getAttribute('contextSel'),baseUrl = target.getAttribute('baseUrl');
                    that.ajaxTurn2Page(contextSel,baseUrl,number);
                });
            }
        }
    };
    var clientSniff = {
        client: function(){
            var engine = {
                    ie: 0,
                    gecko: 0,
                    webkit: 0,
                    khtml: 0,
                    opera: 0,
                    ver: null
                },
                browser = {
                    ie: 0,
                    firefox: 0,
                    safari: 0,
                    konq: 0,
                    opera: 0,
                    chrome: 0,
                    ver: null
                },
                system = {
                    win: false,
                    mac: false,
                    xll: false,
                    iphone: false,
                    ipod: false,
                    ipad: false,
                    ios: false,
                    android: false,
                    nokiaN: false,
                    winMobile: false,
                    wii: false,
                    ps: false
                },
            //检测呈现引擎和浏览器
                ua = navigator.userAgent;
            if(window.opera){
                engine.ver = browser.ver = window.opera.version();
                engine.opera = browser.opera = parseFloat(engine.ver);
            }else if(/AppleWebKit\/(\S+)/.test(ua)){
                engine.ver = RegExp["$1"];
                engine.webkit = parseFloat(engine.ver);
                if(/Chrome\/(\S+)/.test(ua)){
                    browser.ver = RegExp["$1"];
                    browser.chrome = parseFloat(browser.ver);
                }else if(/Version\/(\S+)/.test(ua)){
                    browser.ver = RegExp["$1"];
                    browser.safari = parseFloat(browser.ver);
                }else {
                    var safariVersion = 1;
                    if(engine.webkit < 100){
                        safariVersion = 1;
                    }else if(engine.webkit < 312){
                        safariVersion = 1.2;
                    }else if(engine.webkit < 412){
                        safariVersion = 1.3;
                    }else {
                        safariVersion = 2;
                    }
                    browser.safari = browser.ver = safariVersion;
                }
            }else if(/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)){
                engine.ver = browser.ver = RegExp["$1"];
                engine.khtml = browser.konq = parseFloat(engine.ver);
            }else if(/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)){
                engine.ver = RegExp["$1"];
                engine.gecko = parseFloat(engine.ver);
                if(/Firefox\/(\S+)/.test(ua)){
                    browser.ver = RegExp["$1"];
                    browser.firefox = parseFloat(browser.ver);
                }
            }else if(/MSIE ([^;]+)/.test(ua)){
                engine.ver = browser.ver = RegExp["$1"];
                engine.ie = browser.ie = parseFloat(engine.ver);
            }else if(/Trident\/(\S+)/.test(ua)){
                engine.ver = browser.ver = parseFloat(RegExp["$1"]) + 4;
                engine.ie = browser.ie = parseFloat(engine.ver);
            }
            browser.ie = engine.ie;
            browser.opera = engine.opera;
            var p = navigator.platform;
            system.win = p.indexOf("Win") == 0;
            system.mac = p.indexOf("Mac") == 0;
            system.xll = (p == "Xll") || (p.indexOf("Linux") == 0);
            if(system.win){
                if(/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)){
                    if(RegExp["$1"] == "NT"){
                        switch(RegExp["$2"]){
                            case "5.0":
                                system.win = "2000";
                                break;
                            case "5.1":
                                system.win = "XP"
                                break;
                            case "6.0":
                                system.win = "Vista"
                                break;
                            case "6.1":
                                system.win = "7";
                                break;
                            default :
                                system.win = "NT";
                                break;
                        }
                    }else if(RegExp["$1"] == "9x"){
                        system.win = "ME";
                    }else {
                        system.win = RegExp["$1"];
                    }
                }
            }
            system.iphone = ua.indexOf("iPhone") > -1;
            system.ipod = ua.indexOf("iPod") > -1;
            system.ipad = ua.indexOf("iPad") > -1;
            system.nokiaN = ua.indexOf("NokiaN") > -1;

            if(system.win == "CE"){
                system.winMobile = system.win;
            }else if(system.win == "Ph"){
                if(/Window Phone OS (\d+.\d+)/.test(ua)){
                    system.win = "Phone";
                    system.winMobile = parseFloat(RegExp["$1"]);
                }
            }
            if(system.mac && ua.indexOf("Mobile") > -1){
                if(/CPU (?:iPhone )?OS(\d+_\d+)/.test(ua)){
                    system.ios = parseFloat(RegExp.$1.replace("_","."));
                }else {
                    system.ios = 2;
                }
            }
            if(/Android (\d+\.\d+)/.test(ua)){
                system.android = parseFloat(RegExp.$1);
            }
            system.wii = ua.indexOf("Wii") > -1;
            system.ps = /playstation/i.test(ua);
            return {
                engine: engine,
                browser: browser,
                system: system
            };
        }
    };
    _.extend(SW,clientSniff);
    _.extend(SW.prototype,util);
    _.extend(SW.prototype,clientSniff);
    //存放静态方法
    var tool = {
        createFormForUpload: function(context,param){
            var $a = $('<a href="javascript:void(0);">上传</a>'),cssRule;
            context.wrap('<div style="position: relative;"></div>');
            context.css({
                'z-index': '2',
                opacity: 0,
                position: 'absolute',
                'cursor' : 'pointer'
            });
            cssRule = this.getLayoutFromContextForUpload(context,param);
            context.parent().append($a.css(cssRule));
            context.css({
                width: $a.width(),
                height: $a.height()
            });
        },
        getLayoutFromContextForUpload: function(tg,param){
            var $parent = tg.parent(),parentLayout = $parent.offset(),tgLayout = tg.offset(),_cssRule = param.cssRule || {};
            return $.extend({
                left: tgLayout.left - parentLayout.left,
                top: tgLayout.top - parentLayout.top,
                position: 'absolute',
                'z-index': '1'
            },_cssRule);

        },
        bindUploadEvent: function(context,async){
            $.extend(async,{
                secureuri:false
            });
            context.on('change',function(){
                $.ajaxFileUpload(async);
            });
        }
    };
    _.extend(SW,tool);
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
        this.initPage();
    };
    window.sw = app;
})(jQuery,_,window);