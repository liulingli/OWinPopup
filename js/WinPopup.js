/* 
  * OwinPoPup 弹出窗口插件
  * date 2017-01-11*
  * author liuingli*
  * 使用方法，如果当前页面位于iframe内，必须用$(window.top.document)
  * 顶层window页面必须引入jquery.winPopup.css样式
  * $(window.top.document).creatWinPopup({
  *    //自定义参数
  *   	width:'500',
  *     height:'400',
  *     url :'ceshi.html'
  *     ......
  * })
*/
;(function(){
    var methods={
      	init:function(options){
      		return this.each(function(){
	            var $this = $(this);
	            var _zMax = Math.max.apply(null, $.map($('body>*',window.top.document),function (e, n) {
                        if ($(e).css('position') == 'absolute'||$(e).css('position') == 'fixed')
                        return parseInt($(e).css('z-index')) || 1;
                        return 1;
	                })); //获取当前页面最大的z-index
	            var defaluts = {
				    srcPath : '',  //配置地址
				    url : '',      //弹出窗口地址
					title : '',    //弹出窗口标题
					titleIconSrc:'img/ppicon.png',  //弹出窗口标题图标地址
					fontBtn:'type1' ,  //底部显示按钮，'type1'：显示确认按钮;'type2'显示取消和确认按钮；'type3'不显示按钮
					width : 300,    //弹出窗口宽度
					height : 150,   //弹出窗口高度
					isHasOverlay:true, //弹出窗口是否需要遮罩，需要为true,不需要为false
					resizeMinW :200,  //弹出窗口最小缩放宽度
					resizeMinH :100,  //弹出窗口最小缩放高度
					zIndex : _zMax,   //弹出窗口z-index,如果未定义则自动获取当前窗口最大的z-index
					configParam : '',   //弹出窗口地址配置参数,json格式的字符串
					isDrag:true,  //弹出窗口是否可拖曳，默认true
					isResize:true,  //弹出窗口是否可拖动改变大小，默认true
					isEnterSure:false, //点击enter键是否默认点击确认按钮，默认false
					openFun :function(){},  // 打开弹出窗口执行函数
					colseFun :function(){}, //关闭窗口执行函数
					sureFun: function(){}   //确定 按钮执行函数
	            };
	            //合并默认参数opt和defaluts
                settings = $.extend({},defaluts,options);
                methods.OWinPopup.call($this, settings);
	       });
	    },
	    OWinPopup:function(){
	    	return this.each(function(){
	    		var $this = $(this),
	    		    _setting = settings; //缓存settings
	    		var RULES = {
	    			InterceptNum:function(str){ //截取字符串后面的数字，并转化成number类型
	    				var num = str.replace(/[^0-9]/g,'');
	    				return parseInt(num);
	    			},
	    			delArray:function(Array,value){ //删除数组中某个元素
	    				for(var i=0;i<Array.length;i++){
	    					if(Array[i]==value){
	    						Array.splice(i, 1);
	    					}
	    				}
	    				return Array;
	    			},
	    			maxArray:function(Array){ //返回数组中最大的值，并删除原数组中该值
	    				var max = Array[0];
	    				for(var i=0;i<Array.length;i++){
	    					if(Array[i]>max) max = Array[i]; 							
	    				}
	    				return max;
	    			},
	    			parseJson:function(data){
	    				if((typeof data).toLowerCase()  == 'object'){ //为json对象时
	    					var config = '';
	    					for(var i in data){
	    						config += i+'='+data[i]+'&';
	    					}
	    					return config.replace(/[&]$/g,'');
	    				}
	    				return '';
	    			},
	    			checkConfig:function(data){
	    				if(_setting.url=='') alert("没有添加url地址");return;
	    				if((typeof data).toLowerCase()  == 'object'){
		    				var config = RULES.parseJson(data);
			                if(_setting.url.indexOf("?")==-1){			    
				               _setting.url = _setting.url +"?"+config;	
				               return ;
			                }
			                _setting.url = _setting.srcPath + _setting.url +"&"+config;
		               }
	                },
	                creatHtml:function(){
	                    var winW = $this.width(),
	                        winH = $this.height(),
	                        winLeft = (winW-_setting.width)/2,
	                        winTop  = (winH-_setting.height)/2;
	                    if(_setting.footBtn == 'type1'){
							var btnHtml = "<button class='winPopupBtn' id='sureBtn"+_setting.zIndex+"'>确认</button>"
						}else if(_setting.footBtn == 'type2'){
							var btnHtml = "<button class='winPopupBtn' id='sureBtn"+_setting.zIndex+"'>确认</button>"
							            + "<button class='winPopupBtn' id='cancelBtn"+_setting.zIndex+"'>取消</button>"
						}else{
							var btnHtml = '';
						}
	                	var overlayHtml = "<div id='overlay"+_setting.zIndex+"'"
	                	                + "style='width:100%;height:100%;position:absolute;top:0;left:0;background:gray;opacity:0.2;z-index:"+(_setting.zIndex+1)+"'></div>"
	                    var popWinHtml = "<div id='popWinContent"+_setting.zIndex+"' class='popWin' style='width:"+_setting.width+"px;height:"+_setting.height+"px;z-index:"+(_setting.zIndex+2)+";"
	                                   + "left:"+winLeft+"px;top:"+winTop+"px;'>"
                                       + "<div id='popWinHead"+_setting.zIndex+"' class='popWinHead'>"
					                   + "<span id='popWinTitle"+_setting.zIndex+"' class='popWinTitle'><img src='"+_setting.titleIconSrc+"' class='titleIcon'>"
									   + "<b>"+_setting.title+"</b></span>"
						               + "<span id='popWinClose"+_setting.zIndex+"' class='popWinClose'>"
									   + "<a href='javascript:void(0)' id='closeWin"+_setting.zIndex+"' title='关闭窗口'>"
									   + "<b>×</b></a></span></div>"
						               + "<div class='Hdiv'></div><img id='loadingSpan"+_setting.zIndex+"' src='"+_setting.srcPath+"img/loading.gif'/>"
						               + "<iframe name='popWinFrame"+_setting.zIndex+"' id='popWinFrame"+_setting.zIndex+"' class='popWinFrame' style='"+((btnHtml=='')?'height:calc(100% - 30px)':'')+"'"
						               + "src='"+_setting.url+"'frameborder='no' border='0' marginwidth='0' marginheight='0' scrolling='yes' allowtransparency='yes'>"
						               + "您的浏览器不支持嵌入式框架，或者当前配置为不显示嵌入式框架。"
						               + "</iframe>"
					
	                    var popWinFootHtml = "<div style='"+((btnHtml=='')?'display:none':'')+"' id='popWinFoot"+_setting.zIndex+"' class='popWinFoot'><div class='footBtn'>"+btnHtml+"</div></div>"
	                    var resizeHtml = "<div class='resizeL'></div><div class='resizeT'></div><div class='resizeR'></div><div class='resizeB'>"
	                                   + "</div><div class='resizeLT'></div><div class='resizeTR'></div><div class='resizeRB'></div><div class='resizeBL'></div></div>";
	                   
	                    //将遮罩添加到顶层window
	                    $(window.top.document.body).append(overlayHtml);
	                    //将内容添加到当前window
	                    $(window.top.document.body).append(popWinHtml+popWinFootHtml+resizeHtml);
	               }
	    		};
	            var Event = {
                    winTopResize:function(e){
                        var docWidth = $this.width(),
	                        docHeight = $this.height(),
	       					win = $this.find("[id^='popWinContent'");
	       				    lay = $this.find("[id^='overlay'");	
	        			if(win!=null){if (typeof(win.width())=="undefined"){return;}
	        				win.each(function(){
	        	 				var _winWidth = $(this).width();
 		         				    _winHeight = $(this).height();
	                            $(this).css("left", (docWidth-_winWidth)/2);
	          					$(this).css("top", (docHeight-_winHeight-docHeight*0.05)/2);           
	                        });
 		                }
                    },
                    winPopupRemove:function(zIndex){
                   	    $("#overlay"+zIndex,$this).remove();
                   	    $("#popWinContent"+zIndex,$this).remove(); 
                    },
                    winPopupClose:function(topIframe,winPopupIframe,iframeID){
                    	//当有回调函数时先执行回调函数，但回调函数返回false不删除弹出层
                   	    var returnValue = _setting.colseFun(topIframe,winPopupIframe,iframeID);
                   	  	if(returnValue == false) return false;
                   	  	Event.winPopupRemove(_setting.zIndex);
                    },
                    winPopupSure:function(topIframe,winPopupIframe,iframeID){
                    	//当有回调函数时先执行回调函数，但回调函数返回false不删除弹出层
	                   	var returnValue = _setting.sureFun(topIframe,winPopupIframe,iframeID); 
	                   	if(returnValue == false) return false;
	                   	Event.winPopupRemove(_setting.zIndex);        
                    },
                    iframeLoad:function(index){	
                   	    $("#loadingSpan"+index,$this).css("display","none");
                   	    $("#loadingSpan"+index,$this).parents(".Hdiv").css("display","none");
                        var iframeID = 'popWinFrame'+index,
		                    topIframe = $this,	
		                    winPopupIframe = $this[0].getElementById(iframeID).contentDocument;
		                    //winPopupIframe = $(window.top.document.getElementById(iframeID)).eq(0).contents().find("body");//弹框层iframe
                       var paramJson = {
                       	   'iframeID':iframeID,
                           'topIframe':topIframe,
                           'winPopupIframe':winPopupIframe
                        };
                        return paramJson;
                    }
	            };
	            //设置弹出层可以拖动改变大小和移动位置
	            var win = {
	            	winDrag:function(){
	            		var disX = 0, //初始化距离
	         				disY = 0,
			                oDrag  = $("#popWinContent"+_setting.zIndex,$this);
		          			ohandle = oDrag.find("#popWinHead"+_setting.zIndex)||oDrag;//拖曳target
	                    ohandle.css("cursor","move");
	                    ohandle.on("mousedown.winDrag",function(event){ //鼠标按下事件
	                        var event = event||window.top.event,
	                            disX = event.clientX - parseFloat(oDrag.css("left")),
		                 		disY = event.clientY - parseFloat(oDrag.css("top"));
	                 		$this.on("mousemove.winDrag",function(event){ //鼠标移动事件
		               			var event = event||window.top.event,
	                       		isL = event.clientX - disX,
		                   		isT = event.clientY - disY;
			               		maxL = $this.width() - oDrag.width();
			               		maxT = $this.height()- oDrag.height();
								 //碰撞检测
								isL<=0&&(isL=0);
								isT<=0&&(isT=0);
								isL>=maxL&&(isL=maxL);
								isT>=maxT&&(isT=maxT);
							    oDrag.css({"left":isL,"top":isT});	 
								return false;
							});
	  						$this.on("mouseup.winDrag",function(){//鼠标释放事件
			 					$this.off("mousemove.winDrag");//清除事件
			 					$this.off("mouseup.winDrag");
								this.releaseCapture && this.releaseCapture();
							});
							this.setCapture && this.setCapture();
							return false
	    				});		
	            	},
	            	winResize:function(){//弹出窗口可改变大小
					    window.top.resizeAll=function(oParent, handle, isLeft, isTop, lockX, lockY){					
				            handle.on("mousedown.winResize",function (event){
					            var event = event || window.top.event,
						            disX = event.clientX - parseFloat(handle.css("left")),
						            disY = event.clientY - parseFloat(handle.css("top")),	
						            iParentTop = parseFloat(oParent.css("top")),
						            iParentLeft = parseFloat(oParent.css("left")),
						            iParentWidth = oParent.width(),
						            iParentHeight = oParent.height();								
					            $this.on("mousemove.winResize",function (event){
						   			$(".Hdiv").css("display","block");//该元素用于解决iframe框架下获取不了事件的bug
						     		var event = event || window.top.event,		
					                   	isL = event.clientX - disX,
								       	isT = event.clientY - disY,
								      	maxW = $this.width() - parseFloat(oParent.css("left")) - 2,
								      	maxH = $this.height() - parseFloat(oParent.css("top")) - 2,			
								       	iWidth = isLeft ? iParentWidth - isL : handle.width() + isL,
								       	iHeight = isTop ? iParentHeight - isT : handle.height() + isT;	
								    isLeft&&(oParent.css("left",(iParentLeft + isL)));
								    isTop&&(oParent.css("top",(iParentTop + isT)));		
						            iWidth < _setting.resizeMinW&&(iWidth = _setting.resizeMinW);
								    iWidth > maxW&&(iWidth = maxW);
								    lockX||(oParent.css("width",iWidth));
								    iHeight < _setting.resizeMinH&&(iHeight = _setting.resizeMinH);
								    iHeight > maxH&&(iHeight = maxH);
								    lockY||(oParent.css("height",iHeight));					
						            if((isLeft && iWidth == _setting.resizeMinW) || (isTop && iHeight == _setting.resizeMinH)){
							           $this.off("mousemove.winResize");//小于设定的minwidth或minheight时移除事件
							   
						   			}
						  			return false;
								}).on("mouseup.winResize",function(){
									$(".Hdiv").css("display","none"); //清除遮罩
									$this.off("mousemove.winResize");
									$this.off("mouseup.winResize");
								});
					            return false;
				            })
					
			            }; 
					    var oParent = $("#popWinContent"+_setting.zIndex,$this);
					    var oL = oParent.find(".resizeL").eq(0);
					    var oT = oParent.find(".resizeT").eq(0);
					    var oR = oParent.find(".resizeR").eq(0);
					    var oB = oParent.find(".resizeB").eq(0);
					    var oLT = oParent.find(".resizeLT").eq(0);
					    var oTR = oParent.find(".resizeTR").eq(0);
					    var oRB = oParent.find(".resizeRB").eq(0);
					    var oBL = oParent.find(".resizeBL").eq(0);
						//四角
						window.top.resizeAll(oParent, oLT, true, true, false, false);
						window.top.resizeAll(oParent, oTR, false, true, false, false);
						window.top.resizeAll(oParent, oRB, false, false, false, false);
						window.top.resizeAll(oParent, oBL, true, false, false, false);
						//四边
						window.top.resizeAll(oParent, oL, true, false, false, true);
						window.top.resizeAll(oParent, oT, false, true, true, false);
						window.top.resizeAll(oParent, oR, false, false, false, true);
						window.top.resizeAll(oParent, oB, false, false, true, false); 	   
			        },
	            };
	            //执行方法
	            RULES.checkConfig(_setting.configParam); //将请求参数赋到地址后面
	            RULES.creatHtml(); //创建弹出层html
	            _setting.isDrag&&win.winDrag(); //给弹出层添加拖曳方法，可拖曳改变位置
	            _setting.isResize&&win.winResize(); //给弹出层添加resize方法，可拖动改变大小
	            //当窗口大小改变
	            $this.resize(function(){
	            	Event.winTopResize();
	            });	
	            //移除所有按钮的焦点，确认按钮自动获取焦点 ；解决当button处于焦点状态时。敲击enter默认触发click事件的问题
	            $("button,input[type='button']",$this).trigger("blur");
	            //$("#sureBtn"+_setting.zIndex,$this).trigger("focus");
	            
	            //单击取消按钮，执行取消回调函数，关闭弹出层,
	            $this.on("click.win","#closeWin"+_setting.zIndex+",#cancelBtn"+_setting.zIndex+"",function(){
	            	var iframeID = Event.iframeLoad(_setting.zIndex).iframeID,//获取弹出层iframeid	            	
	            	    topIframe = Event.iframeLoad(_setting.zIndex).topIframe, //获取顶层框架
	            	    winPopupIframe = Event.iframeLoad(_setting.zIndex).winPopupIframe; //获取弹出层框架
	            	var _returnVal = Event.winPopupClose(topIframe,winPopupIframe,iframeID);
	            	if(_returnVal == false) return;
	            	//解绑事件
	            	$this.off("click.win","#closeWin"+_setting.zIndex+",#cancelBtn"+_setting.zIndex);
	            	$this.off("click.win","#sureBtn"+_setting.zIndex);
	            });
	            //单击确认按钮,执行确认回调函数，关闭弹出层
	             $this.on("click.win","#sureBtn"+_setting.zIndex,function(){
	             	var iframeID = Event.iframeLoad(_setting.zIndex).iframeID, 
	             	    topIframe = Event.iframeLoad(_setting.zIndex).topIframe,
	            	    winPopupIframe = Event.iframeLoad(_setting.zIndex).winPopupIframe;
	            	var _returnVal = Event.winPopupSure(topIframe,winPopupIframe,iframeID);
	            	if(_returnVal == false) return;
	            	//解绑事件
	            	$this.off("click.win","#closeWin"+_setting.zIndex+",#cancelBtn"+_setting.zIndex);
	            	$this.off("click.win","#sureBtn"+_setting.zIndex);
	            });	             
	            //iframe load 事件
	            $("#popWinFrame"+_setting.zIndex,$this).load(function(){		            	
	            	//添加一个input hidden元素，用于获取焦点,解决敲击enter键默认点击确认按钮无反应的bug
	            	var inputHidden = "<input type='text' id='iframeHidden' style='position:fixed;bottom:0;left:0px;opacity:0;filter:alpha(opacity=0);'>";
	            	if($this.find("#iframeHidden").length==0){
	            	  $this.find("body").append(inputHidden);	
	            	}
	            	$this.find("body").find("#iframeHidden").trigger("focus");
	            	//获取当前窗口所有的弹出层iframe
	            	var iframes =  $this.find("[id^='popWinFrame']"); 	
	                var _winPopupIframe = Event.iframeLoad(_setting.zIndex).winPopupIframe; //获取弹出层iframe document对象
	            	Event.iframeLoad(_setting.zIndex); //加载动画
	            	_setting.openFun(); //执行加载完成函数	            	 
	            	//解绑事件
	            	//页面所有的iframe添加keyup事件,enter键默认点击确认	   
            		$(_winPopupIframe).on("keyup.win",function(e){
            			console.log("keyup"+_setting.zIndex)
	            		if(_setting.isEnterSure){
	            		    console.log("iframe:keyup")
	            		    var zIndexArray =[];
	            	        var iframes =  $this[0].getElementsByTagName('iframe'); //获取当前所有的iframe
	            	        for(var i=0;i<iframes.length;i++){
			            	  	var iframeId = iframes[i].id;
			            	  	if(/^popWinFrame/.test(iframeId)){
			            	  	 	var zIndex = RULES.InterceptNum(iframeId);
			            	  	 	zIndexArray.push(zIndex);
			            	  	}
	            	    	}
		            	    var zIndexMax = RULES.maxArray(zIndexArray);                         
			            	var keyCode = e.keyCode||e.which;
			            	if(keyCode==13){
			            		$("#sureBtn"+zIndex,$this).trigger("click")
			            		//Event.winPopupRemove(zIndexMax);//移除
			            	}
				        }
		            });        	
	            });
	            	            
	            //window.top的 key事件，enter键默认点击确认
	            if(_setting.isEnterSure){
	            	//如果window.top/.document绑定了keyup事件,为避免绑定多个keyup事件，先移除页面的keyup事件
	            	$this.off("keyup.win");	            	
	            	var iframes =  $this.find("[id^='popWinFrame']"); 
	            	if(iframes.length<2){
	            		$this.on("keyup.win",function(e){
			            	console.log("windowtop:keyup")
			            	var iframes =  $this[0].getElementsByTagName('iframe');
			            	var zIndexArray =[];
	            	        for(var i=0;i<iframes.length;i++){
			            	  	var iframeId = iframes[i].id;
			            	  	if(/^popWinFrame/.test(iframeId)){
			            	  	 	var zIndex = RULES.InterceptNum(iframeId);
			            	  	 	zIndexArray.push(zIndex);
			            	  	}
	            	    	}
				            var zIndexMax = RULES.maxArray(zIndexArray);  
			            	var keyCode = e.keyCode||e.which;
			            	if(keyCode==13){
			            		$("#sureBtn"+zIndexMax,$this).trigger("click")
			            		//Event.winPopupRemove(zIndexMax);//移除			            		
			            	}			            	
		                });
	                }
	            }		           
	    	});
	    }
	}
	$.fn.creatWinPopup = function(){
		var method = arguments[0];
		if(methods[method]){
			method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
		}else if(typeof(method)=='object'||!method){
            method = methods.init;
		}else{
            $.error( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
            return this;
		}
        return method.apply(this, arguments);
	}
})(jQuery);