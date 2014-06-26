(function($,w){
    var uncheckTable,relationTable;
    function isArray(v){
        return toString.apply(v) === '[object Array]';
    }
    function isObject(v){
        return toString.apply(v) === '[object Object]';
    }
    //预留扩展
    $.fn.tradx = function(option){
        var context = $(this);
        switch (option){
            case 'check': context.iCheck('check'); break;
            case 'uncheck': context.iCheck('uncheck'); break;
            case 'enable': context.iCheck('enable');break;
            case 'disable': context.iCheck('disable'); break;
            default : break;
        }
    };

    var Setting = {
        rule: {
            'EBox':['#EseaFullBox','#EseaAssemblyBox','#EareaBox'],//出口订舱
            'IBox':['#IseaFullBox','#IseaAssemblyBox','#IareaBox'],//进口订舱
            'EseaBox':['#EseaFullBox','#EseaAssemblyBox']//海运出口订舱
        },
        description:{
            'EBox': '出口订舱',
            'IBox':'进口订舱',
            'EseaBox': '海运出口订舱'
        }
    };



    /*
     * 工具类
     * */
    //从数组中删除指定成员
    function delMenberFromArray(arr,obj){
        for(var i=0;i<arr.length;i++){
            if(arr[i] == obj){
                arr.splice(i,1);
            }
        }
    }
    //根据类名获取对应jQuery对象
    function getJDom(arr){
        var _arr = [];
        for(var i=0;i<arr.length;i++){
            _arr.push($(arr[i]));
        }
        return _arr;
    }

    /*
     * 解析关系表
     * */
    function analysisTable(relationTable){
        var arr = [];
        for(var i=0;i<relationTable.length;i++){
            var relationMenber,obj = {};
            relationMenber = propObj(relationTable[i].relation);
            obj.end = relationMenber;
            obj.start = relationTable[i].name;
            for(var property in relationTable[i].relation){
                obj.relation = property;
            }
            arr.push(obj);
        }
        return arr;
    }



    function searchUncheck(name){
        for(var i=0;i<uncheckTable.length;i++){
            for(var j=0;j<uncheckTable[i].end.length;j++){
                if(uncheckTable[i].end[j] == name){
                    handleUnchek(uncheckTable[i].end[j],uncheckTable[i].end,uncheckTable[i].start,uncheckTable[i].relation);
                }
            }
        }
    }
    function handleUnchek(end,endArr,start,flag){
        switch (flag){
            case 'and':
                var tip;
                for(var i=0;i<endArr.length;i++){
                    if($(endArr[i]).prop('checked')){
                        tip = true;
                    }
                }
                if(!tip){
                    doReset([$(start)]);
                }
                break;
            case 'or':
                var tip;
                for(var i=0;i<endArr.length;i++){
                    if($(endArr[i]).prop('checked')){
                        tip = true;
                    }
                }
                if(!tip){
                    doReset([$(start)]);
                }
                break;
            case 'ex':
                break;
        }
    }
    /*
     * 递归
     * */
    function propObj(obj,flag){
        var arr = [],__arr;
        if(isArray(obj)){
            for(var i=0;i<obj.length;i++){
                if(isObject(obj[i])){
                    for(var property in obj[i]){
                        var _arr = propObj(obj[i][property],property);
                        __arr = arr.concat(_arr);
                    }
                }else if(typeof obj[i] === 'string'){
                    arr.push(obj[i]);
                    __arr = arr;
                }
            }
        }else if(isObject(obj)){
            for(var property in obj){
                var _arr = propObj(obj[property],property);
                __arr = arr.concat(_arr);
            }
        }
        return __arr;
    }

    function searchObj(obj,flag,id){
        if(isArray(obj)){
            for(var i=0;i<obj.length;i++){
                if(isObject(obj[i])){
                    for(var property in obj[i]){
                        searchObj(obj[i][property],property,id);
                    }
                }else if(typeof obj[i] === 'string'){
                    switch (flag){
                        case 'and':
                            doChecked([$(obj[i])]);
                            break;
                        case 'or':
                            var tip,tip1;
                                for(var i=0;i<obj.length;i++){
                                    if(typeof obj[i] !== 'string'){
                                        tip = true;
                                    }
                                }
                            if(!tip){
                                for(var j=0;j<obj.length;j++){
                                    if($(obj[j]).prop('checked')){
                                        tip1 = true;
                                    }
                                }
                            }
                            if(!tip1){
                                doChecked([$(obj[0])]);
                            }
                            break;
                        case 'ex':
                            var tip,tempObj;
                            tempObj = chosenExclusion(obj);
                            if(tempObj){
                                for(var i=0;i<tempObj.length;i++){
                                    if($(tempObj[i]).attr('checked') && $(tempObj[i]).attr('id') == 'EareaBox'){
                                        doReset([$(tempObj[i]),$(id)]);
                                    }
                                }
                                doChecked([$(id)]);
                                return ;
                            }
                            for(var i=0;i<obj.length;i++){
                                if($(obj[i]).attr('checked')){
                                    tip = true;
                                }
                            }
                            if(!tip){
                                doChecked([$(obj[0])]);
                            }
                            break;
                    }
                }
            }
        }else if(isObject(obj)){
            for(var property in obj){
                searchObj(obj[property],property,id);
            }
        }
    }

    function testSameArr(arr1,arr2){
        if(arr1.length != arr2.length){
            return false;
        }
        var obj1 = {},obj2 = {};
        for(var i=0;i<arr1.length;i++){
            if(!obj1[arr1[i]]){
                obj1[arr1[i]] = 1;
            }else{
                obj1[arr1[i]] += 1;
            }
        }
        for(var i=0;i<arr2.length;i++){
            if(!obj2[arr2[i]]){
                obj2[arr2[i]] = 1;
            }else{
                obj2[arr2[i]] += 1;
            }
        }
        for(var property in obj1){
            if(obj1[property] != obj2[property]){
                return false;
            }
        }
        return true;
    }

    function chosenExclusion(arr){
        if(testSameArr(Setting.rule['EseaBox'],arr)){
            return Setting.rule['EBox'];
        }
    }

    function searchTable(name){
        for(var i=0;i<relationTable.length;i++){
            if(relationTable[i].name == name){
                return relationTable[i].relation;
            }
        }
    }
    //禁掉checkbox
    function doForbidden(arr){
        if(arr&&arr.length){
            for(var i=0;i<arr.length;i++){
                arr[i].tradx('disable');
            }
        }

    }
    //启用checkbox
    function doEnable(arr){
        if(arr&&arr.length){
            for(var i=0;i<arr.length;i++){
                arr[i].tradx('enable');
            }
        }

    }
    //复位checkbox
    function doReset(arr){
        if(arr&&arr.length){
            for(var i=0;i<arr.length;i++){
                arr[i].tradx('uncheck');
            }
        }

    }
    //全部选中
    function doChecked(arr){
        if(arr&&arr.length){
            for(var i=0;i<arr.length;i++){
                arr[i].tradx('check');
            }
        }

    }
    //处理互斥
    w.checkboxPlug = {
        initEx: function(){
            $('[data-exclusion]').each(function(){
                var exclusion_rule = $(this).data('exclusion'),context = $(this),arr_rule = exclusion_rule.split('!');
                context.on('ifChecked',function(){
                    delMenberFromArray(arr_rule,'#'+this.id);
                    doForbidden(getJDom(arr_rule));
                });
                context.on('ifUnchecked',function(){
                    doEnable(getJDom(arr_rule));
                });
            });
        },
        initBind: function(){
            $('[type="checkbox"]').on('ifChecked',function(){
                var id = '#' + this.id;
                searchObj(searchTable(id),'',id);
            });

            $('[type="checkbox"]').on('ifUnchecked',function(){
                var id = '#' + this.id;
                searchUncheck(id);
            });
        },
        setTable: function(table){
            uncheckTable = analysisTable(table);//主要为uncheck使用
            relationTable = table;
        },
        init: function(){
            this.initBind();
            this.initEx();
        }
    };
})(jQuery,window);