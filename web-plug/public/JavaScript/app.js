/**
 * Created by yangcheng on 14-2-15.
 */
/* 自定义alert confirm*/
(function($){

    "use strict"

    /* MODAL CLASS DEFINITION
     * ====================== */
    /*
     * 构造器，为所有data-dismiss='modal'属性的标签绑定原型上的hide方法
     * */
    var Box = function ( content, options ) {
        this.options = options;
        this.$element = $(content)
            .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));
    };

    Box.prototype = {

        constructor: Box
        , toggle: function () {
            return this[!this.isShown ? 'show' : 'hide']();
        }
        /*
         * 初始化，默认执行
         * */
        , show: function () {
            var that = this;
            if (this.isShown) return;
            $('body').addClass('modal-open');//给body加上modal-open类
            this.isShown = true;//将isShown属性设置成true
            this.$element.trigger('show');
            escape.call(this);//加上键盘事件
            backdrop.call(this, function () {
                var transition = $.support.transition && that.$element.hasClass('fade');
                /*插入弹出层*/
                !that.$element.parent().length && that.$element.appendTo(document.body) //don't move modals dom position
                that.$element.show()//jQuery方法显示
                if (transition) {
                    that.$element[0].offsetWidth // force reflow
                }
                that.$element.addClass('in');
                transition ?
                    that.$element.one($.support.transition.end, function () { that.$element.trigger('shown') }) :
                    that.$element.trigger('shown');
            })
        }
        /*
         * 主要方法
         * */
        , hide: function ( e ) {
            e && e.preventDefault();
            if (!this.isShown) return;;
            var that = this;
            this.isShown = false;
            $('body').removeClass('modal-open');
            escape.call(this)//关闭按键事件
            this.$element.trigger('hide').removeClass('in');//jQuery方法，将弹出框隐藏，并将div的class去in
            $.support.transition && this.$element.hasClass('fade') ?
                hideWithTransition.call(this , e.target) :
                hideModal.call(this, e.target);
        }
    };
    function hideWithTransition( dom ) {
        var that = this
            , timeout = setTimeout(function () {
                that.$element.off($.support.transition.end);
                hideModal.call(that,dom);
            }, 500);

        this.$element.one($.support.transition.end, function () {
            clearTimeout(timeout);
            hideModal.call(that,dom);
        });
    }
    function hideModal( that ) {
        if(testLowerIE()){
            this.$element
                .hide() //删除效果更好
                .trigger('hidden');
        }
        /*if($.fn.box.defaults.alert){
            setTimeout(function(){
                var obj = $.fn.box.defaults.alertBag.shift(),callback = obj.callback,uid = obj.uid,flag;
                if(typeof callback == 'function'){ callback();}
                if(uid)$('body').find('#id'+uid).remove();
                $('.alert').each(function(){
                    if($(this).css('display').toLowerCase() == 'block'){ flag = true;}
                });
                if(!flag && $.fn.box.defaults.alertBag[0]){ $('#id'+ $.fn.box.defaults.alertBag[0].uid).box('show');}
                $.fn.box.defaults.alert = false;
            },300);
        }
        if($.fn.box.defaults.confirm){
            setTimeout(function(){
                var obj = $.fn.box.defaults.confirmBag.shift(),uid = obj.uid,successCallback = obj.successCallback,failCallback = obj.failCallback,flag;
                if($(that).hasClass('true')){
                    if(typeof successCallback == 'function')successCallback();
                }else if($(that).hasClass('false')){
                    if(typeof failCallback == 'function')failCallback();
                }
                if(uid)$('#confirm'+uid).remove();
                $('.confirm').each(function(){
                    if($(this).css('display').toLowerCase() == 'block'){ flag = true;}
                });
                if(!flag && $.fn.box.defaults.confirmBag[0]){ $('#confirm'+ $.fn.box.defaults.confirmBag[0].uid).box('show');}
                $.fn.box.defaults.confirm = false;
            },300);

        }*/
        var secondTrigger = function(flag){
            if(!flag && $.fn.box.defaults.eventQueue[0] && $.fn.box.defaults.eventQueue[0].flag == 'alert'){
                $('#id'+ $.fn.box.defaults.eventQueue[0].uid).box('show');
            }else if(!flag && $.fn.box.defaults.eventQueue[0] && $.fn.box.defaults.eventQueue[0].flag == 'confirm'){
                $('#confirm'+ $.fn.box.defaults.eventQueue[0].uid).box('show');
            }
            if(!$.fn.box.defaults.eventQueue[0]){ $.fn.box.defaults.queueEmpty = true;}
        };
        setTimeout(function(){
            var obj = $.fn.box.defaults.eventQueue.shift(),callback,uid,flag,successCallback,failCallback;
            if(obj.flag == 'alert' && !$.fn.box.defaults.queueEmpty){
                callback = obj.callback;
                uid = obj.uid;
                if(typeof callback == 'function'){ callback();}
                if(uid)$('body').find('#id'+uid).remove();
                $('.box').each(function(){
                    if($(this).css('display').toLowerCase() == 'block'){ flag = true;}
                });
                secondTrigger(flag);
            }else if(obj.flag == 'confirm' && !$.fn.box.defaults.queueEmpty){
                successCallback = obj.successCallback;
                failCallback = obj.failCallback;
                uid = obj.uid;
                if($(that).hasClass('true')){
                    if(typeof successCallback == 'function')successCallback();
                }else if($(that).hasClass('false')){
                    if(typeof failCallback == 'function')failCallback();
                }
                if(uid)$('#confirm'+uid).remove();
                $('.box').each(function(){
                    if($(this).css('display').toLowerCase() == 'block'){ flag = true;}
                });
                secondTrigger(flag);
            }
        },300);
        backdrop.call(this)
    }
    function backdrop( callback ) {
        var that = this
            , animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $('<div class="modal-backdrop box ' + animate + '" />')
                .appendTo(document.body)//遮罩层，让弹出框显示时，背景被遮罩，此时为透明的
            if(window.ActiveXObject&&!window.XMLHttpRequest){
                var oDiv = document.createElement('div');
                oDiv.className = 'modal-backdrop'+ animate;
                document.body.appendChild(oDiv);
            }
            if (this.options.backdrop != 'static') {
                //this.$backdrop.click($.proxy(this.hide, this))
            }

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')//加入in类，显示遮罩层

            doAnimate ?
                this.$backdrop.one($.support.transition.end, callback) ://当使用 one() 方法时，每个元素只能运行一次事件处理器函数
                callback();
            //打开时，执行callback()回调
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in');//删除in，遮罩层透明
            $.support.transition && this.$element.hasClass('fade')?
                this.$backdrop.one($.support.transition.end, $.proxy(removeBackdrop, this)) :
                removeBackdrop.call(this);
            //一般执行removeBackdrop()函数
        } else if (callback) {
            callback();
        }
    }
    function removeBackdrop() {
        this.$backdrop.remove();
        this.$backdrop = null;
    }
    function escape() {
        var that = this
        if (this.isShown && this.options.keyboard) {
            $(document).on('keyup.dismiss.modal', function ( e ) {
                e.which == 27 && that.hide();
            })
        } else if (!this.isShown) {
            $(document).off('keyup.dismiss.modal');
        }
    }
    function testLowerIE(){
        var browser=navigator.appName,b_version=navigator.appVersion;
        var reg = /MSIE(.*?);/;
        var arr = b_version.match(reg);
        if(arr){
            if(parseInt(arr[1],10)<10) return true
            else  return false;
        }else{
            return false;
        }
    }
    function isFunction(fn){
        return !!fn&&fn.nodeName&&fn.constructor != String&&fn.constructor != RegExp&& fn.constructor!= Array&&/function/i.test(fn+'');
    }
    $.fn.box = function ( option) {
        return this.each(function () {
            var $this = $(this)
                , data = $this.data('modal')
                , options = $.extend({}, $.fn.box.defaults, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('modal', (data = new Box(this, options)));//为modal绑定对象
            if (typeof option == 'string') data[option]();
            else if (options.show) data.show();
        });
    };
    $.fn.box.defaults = {
        backdrop: true
        , keyboard: true
        , show: true
        , alertId : 1
        , confirmId : 1
        , alert: false
        , confirm: false
        , alertBag: []
        , confirmBag: []
        , eventQueue: []
        , queueEmpty: false
    };
    $.fn.box.Constructor = Box;
    $(function () {
        $('body').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
            var $this = $(this), href
                , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
                , option = $target.data('modal') ? 'toggle' : $.extend({}, $target.data(), $this.data());
            e.preventDefault();
            $target.box(option);//让弹出框去执行jQuery原型上的方法
        });
    })
    var modal_template = [
            '<div class="modal fade box" id="$0','" style="display: none; z-index:1060;">',
                "<div class='modal-body'>",
                    "<p>$1</p>",
                "</div>",
                '<div class="modal-footer">',
                    '<a href="#" class="btn btn-primary" data-dismiss="modal">关闭</a>',
                '</div>',
            '</div>'
        ],
        modal_dom = modal_template.join('');
    /*
    * var options = {
    *   default: true or false
    *   head: '', none|其他
    *   body: '', none|其他
    *   style: {css样式},
    *   callback: callback
    * }
    * */
     window.alert = function(content,callback){
        var uid = $.fn.box.defaults.alertId++,modal_Ndom = modal_dom.replace(/\$0/,'id'+uid).replace(/\$1/,content),flag;$('body').append(modal_Ndom);
        $.fn.box.defaults.eventQueue.push({uid: uid, callback:callback,flag:'alert'});
        $.fn.box.defaults.alert = true;
        $('.box').each(function(){
            if($(this).css('display').toLowerCase() == 'block'){ flag = true;}
        });
        if(!flag){ var $modal = $('#id'+ $.fn.box.defaults.eventQueue[0].uid); $modal.box('show');}
    };
    var confirm_template = [
        '<div class="modal fade box" id="$0','" style="display: none; z-index:1060;">',
            "<div class='modal-header'>",
                "<h3>提示</h3>",
            "</div>",
            "<div class='modal-body'>",
                "<p>$1</p>",
            "</div>",
            "<div class='modal-footer'>",
                "<a href='#' class='btn btn-primary true' data-dismiss='modal'>确定</a>",
                "<a href='#' class='btn  false' data-dismiss='modal'>取消</a>",
            "</div>",
        "</div>"
    ];
    window.confirm = function(content,callback1,callback2){
        var uid = $.fn.box.defaults.confirmId++,flag;
        $('body').append(confirm_template.join('').replace(/\$1/,content).replace(/\$0/,'confirm'+uid));
        $.fn.box.defaults.eventQueue.push({uid:uid,successCallback:callback1,failCallback:callback2,flag:'confirm'});
        $.fn.box.defaults.confirm = true;
        $('.box').each(function(){
            if($(this).css('display').toLowerCase() == 'block'){ flag = true;}
        });
        if(!flag){ var $confirm = $('#confirm'+ $.fn.box.defaults.eventQueue[0].uid); $confirm.box('show');}
    };

})( window.jQuery);