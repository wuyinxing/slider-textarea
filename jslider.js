(function($){
    // 常量
    var DATAINDEX = 'data-tab-index',       
        DEFHIDECONG = {                     
            "width" : 0,
            "height" : 0,
            "overflow":"hidden",
            "border" : "none",
            "display" : "none"
        },
        DEFAULTSTYLE = {                    
            "overflow" : "hidden",
            "position": "relative"
        },                                  
        DURATION_ZOM_AFT = 'transition: all 2.5s ease-out; -webkit-transition: all 2.5s ease-out; transform: scaleX(1) scaleY(1); -webkit-transform: scaleX(1) scaleY(1);',
        DURATION_ZOM_BEFO = 'transform: scaleX(1.02) scaleY(1.02);-webkit-transform: scaleX(1.02) scaleY(1.02);';
    function jSlider (container, config){
            var _this = this;
            $.extend(_this, {
                "autoSlide": false,
                "effect": "hSlide",                  // 轮播效果   a、hSlide 横切换； b、fadeInOut 淡入淡出
                "effectElCls": "",                   // 效果为淡出时候 fadeInOut 渐变缩放图片元素 css class钩子
                "eventType" : "click",
                "hoverStop" :true,                   // 鼠标经过内容是否停止播放
                "contentClass" :"slide-content",     // pannel 容器class
                "pannelClass" : "tab-pannel",        // pannel class
                "navClass" :"tab-list",              // 控制器nav 容器class
                "triggerSelector" : "li",            // 控制器 触发选择器 
                "selectedClass" : "selected",        // 选中class 样式
                "viewTime" : 3000,                   // 可视停留时间 单位ms
                "speed" :300,                        // 切换 动画 速度，单位ms
                "lazyloadCls" : "ks-data-lazyload",
                "defaultIndex" : 0,                  // 默认展现第几帧  ps：如果采用懒加载，此功能 >1 不可用( 暂时无法快速计算 非事件触发多个pannel滚动 懒加载支持 )
                "autoResponsiveLayout": true,        // 是否自动响应 窗口变化
                "initStyleCallback" : null,          // 初始化render callback方法
                "slideBeforeFn": null,               // 轮播切换 前 回调方法
                "slideAfterFn": null,                // 轮播切换 后 回调方法
                "leftControlBtnCls" : null,          // 控制器 list 向左class
                "rightControlBtnCls" : null,         // 控制器 list 向右class
                "controlBtnDisabledCls": null,       // 到达首尾时候 禁止点击class
                "planneClickCallback":null,          // plannel 面板单击回调函数
                "pannelViewLength": 1                // slider作为 list面板 左右滚动时 可视面板个数, 默认为 1
            }, config);

            _this.slidContainr = $('#'+container);
            if(!_this.slidContainr){ throw('请指定轮播容器Id！'); return; }

            _this.pannelContainer = $('.'+_this.contentClass, _this.slidContainr);
            _this.aPnnels = $('.'+_this.pannelClass, _this.pannelContainer);
            _this.pannelLength = _this.aPnnels.length;
            _this.endPannelIndex = _this.pannelLength-1;
            _this.curPannelIndex = _this.defaultIndex;
            _this.curPannelEl = _this.aPnnels[_this.curPannelIndex];
            _this.pannelTextareas = $('.'+_this.lazyloadCls, _this.aPnnels);
            _this.navListContent = $('.'+_this.navClass, _this.slidContainr);
            _this.tabListDom = $(_this.triggerSelector, _this.navListContent);
            _this.listControlLeftBtn = $('.'+_this.leftControlBtnCls, _this.slidContainr);
            _this.listControlRightBtn = $('.'+_this.rightControlBtnCls, _this.slidContainr);
            _this.init();
        }
    jSlider.prototype = {
            construcotr: jSlider,
            init : function(){
                var _this = this;
                _this.getContentPannelWh();
                _this.styleInit();
                _this.addTabIndex();
                _this.eventInit();
                _this.isAutoRun(_this.autoSlide);
                _this.setPannelIndex(_this.defaultIndex);
                _this.checkLeftRightBtnState();
            },
            clearStyle: function(){
                var _this = this;
                _this.pannelContainer.attr('style', '');
                _this.scrollBox && _this.scrollBox.attr('style', '');
                _this.aPnnels.attr('style', '');
            },
            resetSlierWidthHeight: function(){
                var _this = this,
                    resetwh;
                _this.clearStyle();
                resetwh && clearTimeout(resetwh);
                resetwh = setTimeout(function(){
                    _this.getContentPannelWh();
                    _this.styleInit();
                }, 200);
            },
            getContentPannelWh: function(){
                var _this = this;
                _this.pannelContWidth = _this.pannelContainer.width();
                _this.pannelContheigth = _this.pannelContainer.height();
                _this.pannelWidth = _this.aPnnels.width();
                _this.pannelHeight = _this.aPnnels.height();
            },
            eventInit: function(){
                var _this = this;
                 _this.tabListDom.on(_this.eventType, function(ev){
                        // var targetEl = $(ev.target),
                        var targetEl = $(ev.target).parent(_this.triggerSelector),
                            indexNum = parseInt(targetEl.attr(DATAINDEX), 10);
                        if(ev.type == "click"){
                             if(indexNum === _this.curPannelIndex){ return; }
                            _this.isAutoRun(false);
                            _this.slideChange(indexNum);
                        }
                        else if(ev.type == "mouseover"){
                            if(indexNum === _this.curPannelIndex){ return; }
                            _this.isAutoRun(false);
                            if(isNaN(indexNum)) { return false;}
                            _this.slideChange(indexNum);
                        }else {
                            if ( ev && ev.preventDefault ){
                                ev.preventDefault(); 
                            }else{
                                window.event.returnValue = false; 
                            }
                            return false; 
                        }
                });
                _this.autoSlide && _this.tabListDom.on('mouseout', function(ev){
                    _this.isAutoRun(true);
                });
                if( _this.autoSlide && _this.hoverStop ){
                    _this.pannelContainer.delegate(_this.aPnnels, 'mouseover mouseout', function(ev){
                        var evtType = ev.type;

                        if(evtType === 'mouseover'){
                            _this.isAutoRun(false);
                        }else{
                            _this.isAutoRun(true);
                        }
                    });
                }
                if( _this.autoResponsiveLayout){
                    var setTimeObj;
                    $(window).resize(function(ev) {
                        ev.stopPropagation();
                        if(_this.isResetSlierWidthHeight){return;}
                        setTimeObj && clearTimeout(setTimeObj);
                        _this.isResetSlierWidthHeight = true;
                        setTimeObj = setTimeout(function(){
                            var rschObj;
                            _this.resetSlierWidthHeight();
                            _this.slideChange(0);

                            rschObj && clearTimeout(rschObj);
                            rschObj = setTimeout(function(){
                                _this.isResetSlierWidthHeight = false;
                            }, 400);

                        }, 300);
                    });
                }
                _this.listControlLeftBtn.on('click', function(ev){
                    _this.pannelSubScrollFn(this, function(){
                        _this.isDisabledBtn(this, _this.isStartIndex() );
                    });
                    _this.isDisabledBtn(this, _this.isStartIndex() );
                    _this.isDisabledBtn(_this.listControlRightBtn, _this.isViewNumEnd() );
                });
                _this.listControlRightBtn.on('click', function(ev){
                    _this.pannelNextScrollFn(this, function(){
                        _this.isDisabledBtn(this, _this.isViewNumEnd() );
                    });
                    _this.isDisabledBtn(this, _this.isViewNumEnd() );
                    _this.isDisabledBtn(_this.listControlLeftBtn, _this.isStartIndex() );
                });
                _this.pannelContainer.delegate(_this.aPnnels, 'click', function(ev){
                    var pannelTarget = $(ev.target).closest('.'+_this.pannelClass);
                    $.isFunction(_this.planneClickCallback) && _this.planneClickCallback.call(_this, pannelTarget);
                });
            },
            checkLeftRightBtnState: function(){
                var _this = this;
                _this.listControlLeftBtn && _this.isDisabledBtn(_this.listControlLeftBtn, _this.isStartIndex() );
                _this.listControlRightBtn && _this.isDisabledBtn(_this.listControlRightBtn, _this.isViewNumEnd() );
            },
            pannelNextScrollFn: function(mainBtn, scrollCallback){
                var _this = this,
                    curPannelIndex = _this.getPannelIndex(),
                    subIndex = ++curPannelIndex,
                    isViewNumEnd = _this.isViewNumEnd();
                if(!isViewNumEnd ){
                    _this.setPannelIndex( subIndex, function(){
                        $.isFunction(scrollCallback) && scrollCallback.call(_this);
                    });
                }
            },
            pannelSubScrollFn: function(mainBtn, scrollCallback){
                var _this = this,
                    curPannelIndex = _this.getPannelIndex(),
                    subIndex = --curPannelIndex,
                    isViewNumEnd = _this.isStartIndex();
                if(!isViewNumEnd ){
                    _this.setPannelIndex( subIndex , function(){
                        $.isFunction(scrollCallback) && scrollCallback.call(_this);
                    });
                }
            },
            isViewNumEnd: function(offsetIndex){
                var _this = this,
                    ViewEndNum = _this.pannelLength - _this.pannelViewLength; 
                if( !_this.pannelViewLength  ){
                    return _this.curPannelIndex == _this.endPannelIndex;
                }else if( ViewEndNum < 0 ){
                    return true;
                }else{
                    return _this.curPannelIndex + (offsetIndex || 0) == ViewEndNum;
                }
            },
            isDisabledBtn: function(target, isDisb, disCls){
                var _this = this,
                    btnDisabledCls = disCls || _this.controlBtnDisabledCls;
                if(isDisb){
                    $(target).addClass(btnDisabledCls);
                }else{
                    $(target).removeClass(btnDisabledCls);
                }
            },
            isStartIndex: function(){
                var _this = this;
                return _this.curPannelIndex == 0;
            },
            isEndIndex: function(){
                var _this = this;
                return _this.curPannelIndex == _this.endPannelIndex;
            },
            addTabIndex : function(){
                var _this = this,
                    i = 0,
                    length = _this.tabListDom.length;
                for(i; i<length; i++){
                    $(_this.tabListDom[i]).attr(DATAINDEX, i);
                }
            },
            isAutoRun : function(isrun, index){
                var _this = this,
                    autobj;
                autobj && clearTimeout(autobj);
                autobj = setTimeout(function(){
                    if(isrun){
                        if(!_this.setInterval_obj){
                            _this.setInterval_obj = setInterval(function(){
                                _this.slideChange(index);
                            }, _this.viewTime );
                        }
                    }else{
                        clearInterval(_this.setInterval_obj);
                        _this.setInterval_obj = null;
                    }
                }, 300);
            },
            slideChange : function(index, callback){
                var _this = this,
                    index = parseInt(index, 10),
                    index = (index >= 0) ? index : null;

                if(_this.pannelWidth && !isNaN(_this.pannelWidth) ){
                    _this.nexPanLeft = _this.moveBoxLeft + _this.pannelWidth;
                    _this.endPanLeft = _this.scrollWidth - _this.pannelWidth;
                    if( _this.nexPanLeft > _this.endPanLeft ){
                        _this.moveBoxLeft = 0;
                    }else{
                        _this.moveBoxLeft += _this.pannelWidth;
                    }
                    if( typeof index == 'number' ){
                        _this.moveBoxLeft = index * _this.pannelWidth;
                    }
                }
                _this.viewMorerLazyLoad();
                _this.tabListChange(index);
                var leftNo = _this.moveBoxLeft <= 0 ? 0 : -_this.moveBoxLeft;
                _this.curPannelIndex = _this.getPannelIndex(index);
                _this.curPannelEl = _this.aPnnels[_this.curPannelIndex];
                $.isFunction( _this.slideBeforeFn ) && _this.slideBeforeFn.call(_this, _this.curPannelEl);
                if($.trim(_this.effect) === 'fadeInOut'){
                    _this.scrollBox.css({
                        // "opacity": '0.3',
                        "left": leftNo
                    });
                    var effectEl = _this.effectElCls ? $('.'+_this.effectElCls, '.'+_this.pannelClass) : $('img', '.'+_this.pannelClass);
                    // effectEl.attr('style', DURATION_ZOM_BEFO);
                     // _this.scrollBox.show();
                     _this.changeAfterCallback(callback);
                    // _this.scrollBox.fadeTo('slow', '1', function(){  // slow 600
                    //     effectEl.attr('style', DURATION_ZOM_AFT);
                    //     _this.changeAfterCallback(callback);
                    // });
                }else{
                    _this.scrollBox.animate({
                        left: leftNo
                    }, _this.speed, function(){
                        _this.changeAfterCallback(callback);
                    });
                }
            },
            changeAfterCallback: function(callback){
                var _this = this;
                $.isFunction(callback) && callback.call(_this, _this.curPannelEl);
                $.isFunction( _this.slideAfterFn ) && _this.slideAfterFn.call(_this, _this.curPannelEl);
            },
            viewMorerLazyLoad: function(){
                var _this = this,
                    curIndex = _this.getPannelIndex(),
                    viewEndRightEl = _this.aPnnels[ curIndex + _this.pannelViewLength-1 ];
                _this.renderDataLazyLoad( _this.aPnnels[curIndex] );
                if(_this.pannelViewLength >1 && viewEndRightEl){
                    _this.renderDataLazyLoad( viewEndRightEl );
                }
            },
            renderDataLazyLoad: function(el){
                var _this = this;
                if(!el){return;}
                var textareas_cls = $('.'+_this.lazyloadCls, el);
                if(textareas_cls.length > 0){
                    _this.loadAreaData(textareas_cls);
                }
            },
            loadAreaData: function (textarea) {
                var _this = this,
                    content = $(textarea).parent(),
                    htmlEle = $(textarea).text() || '';
                $(textarea).remove();
                content.append( $(htmlEle) );
            },
            tabListChange : function(index){
                var _this = this,
                    tabListIndex;
                if(index){
                    tabListIndex = index;
                }else{
                    tabListIndex = _this.getPannelIndex();
                }
                _this.setTabCls(_this.tabListDom[tabListIndex]);
            },
            getPannelIndex: function(){
                var _this = this,
                    tabListIndex = _this.moveBoxLeft / _this.pannelWidth;
                return tabListIndex <= 0 ? 0 : tabListIndex;
            },
            setTabCls : function(el){
                var _this = this;
                _this.tabListDom.removeClass(_this.selectedClass);
                $(el).addClass(_this.selectedClass);
            },
            styleInit : function(){
                var _this = this;
                if(_this.initStyleCallback && $.isFunction(_this.initStyleCallback)){
                    _this.initStyleCallback.call(_this);
                }
                _this.pannelTextareas.css(DEFHIDECONG);
                var effect = $.trim(_this.effect);
                    _this.aPnnels.css({ "float" : "left"});
                    _this.scrollWidth = _this.pannelLength * _this.pannelWidth;
                    _this.scrollHeight = _this.pannelHeight;
                _this.pannelContainer.css(DEFAULTSTYLE).css({
                    "width" : _this.pannelContWidth,
                    "heigh" : _this.pannelContheigth
                });
                _this.aPnnels.css(DEFAULTSTYLE).css({
                    "width" : _this.pannelWidth,
                    "heigh" : _this.pannelHeight
                });
                var scroBoxClsDef = {
                    "width" : _this.scrollWidth,
                    "height" : _this.scrollHeight,
                    "padding" : 0,
                    "margin" : 0,
                    "left" : 0,
                    "top" : 0
                };
                if(_this.scrollBox){
                    _this.scrollBox.css(scroBoxClsDef).css(DEFAULTSTYLE);
                    return;
                }
                _this.scrollBox = $('<div>').css(scroBoxClsDef).css(DEFAULTSTYLE);
                _this.scrollBox.append(_this.aPnnels);
                _this.pannelContainer.append(_this.scrollBox);
            },
            setPannelIndex: function(index, callback){
                var _this = this;
                _this.slideChange( _this.filterPannelIndex(index), callback);
            },
            filterPannelIndex: function(index){
                var _this = this;
                if( isNaN(index) ){return 0; }
                return index <= 0 ? 0 : (index > _this.endPannelIndex) ? _this.endPannelIndex : index;
            }
        }
    $.fn.jSlider = jSlider;
    return jSlider;

})(jQuery || $)