function Expo360( parameters ){
	
	$body = $('body');
	
	//IS MOBILE BOOLEAN
    var ismobile=navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
    
    //IS IE
    var isIE = jQuery.browser.msie;
    
    //MOUSE||TOUCH BINDINGS
    var mouseDownBind = "mousedown";
    var mouseMoveBind = "mousemove";
    var mouseUpBind = "mouseup";
    var mouseOverBind = "mouseover";
    var mouseOutBind = "mouseout";
    var clickBind = "click";
    
    if(ismobile){
        mouseDownBind = "vmousedown";
        mouseMoveBind = "vmousemove";
        mouseUpBind = "vmouseup";
        mouseOverBind = "vmouseover";
        mouseOutBind = "vmouseout";
        clickBind = "vclick";
    }
	
	//
	var refreshRate = 10;
	var singleImage = false;
	var focusable = true;
	
	var oldImage = -1, currentImage = 0, numImages;
	
	var degrees = 0;
	var speedDeg = 0, speedInc = 0, speedDegDefault = 0;
	
	var dragging = false, panning = false;
	
	var positionClickedX;
	var degWhenClicked;
	
	var currentX;
	var oldDif;
	
	var buttonsDisabledAlpha = 0.3;
	
	var viewLeft = 0, viewTop=0;
	var zoomWhenPad = 1;
	var currentWidth, currentHeight;
	
	
	//MAIN EASE and INERTIA
	var ease = 5, inertia = 1;
	
	//MOUSEWHEEL
	var mouse_wheel_function = "zoom", mouse_wheel_speed=1;
	
	//ZOOM
	var draggingZoomSlider = false, draggingPlaybackSlider = false;
    var sliderWidth = 0, playbackSliderWidth=0;
	var $zoomSlider = null, $zoomMinus = null, $zoomPlus = null, $playbackSlider = null, $panButton = null, $rotateButton = null;
	var maxZoom, minZoom, zoomEase, zoomSpeed, zoom = 1, zoomCurrent = 1;
	var focusTimer;
	var focused = false;
	var $bigImage = null;
	
	//AUTOPLAY
	var autoplay = false;
	var autoplaySpeed;
	
	//MODE
	var mode = "rotate";
	
	//REVERSE
	var reverse = false;
	
	//SIZING AND POSITIONING
	var width, height;
	var iniWidth, iniHeight;
	var posX=0, posY=0;
	
	//ZOOM WINDOW
	var include_zoom_window=false;
	var zoom_window_width, zoom_window_height, zoomWindowEnabled=true;
    var viewLeftCurrent = 0, viewTopCurrent=0, paddingEase = 5;
	
	
	//FROM XML
	var imagesPath, imagesBigPath, hotspotsImagesPath, grab_hand_cursor = false, loading_text;
	var imagesSrc = Array(), hotspots = Array(), hotspotsButtons = Array(), hotspotsTooltips = Array(), $hotspotsSmall;
	var images = Array(), zoom_window_images = Array();
	var controls = Array(), controlsExtras = Array();
	var include_tooltips = false;
	
	var panel_options = Object();
	var loading_options = Object();
	var tooltips_options = Object();
	var zoom_window_options = Object();
	var tooltips_texts = Object();
	
	
	//HOLDERS
	var $root = $(parameters.where);
	var $main = $("<div></div>");
	var $view = $("<div></div>");
	var $imagesHolder = $("<div></div>");
    var $bigContent = $("<div></div>");
	var $panel = $("<div></div>");
	var $loader = $("<div></div>");
	var $zoomWindow, $zoomWindowBox, $zoomClickable;
	
	var $loadingText = $("<div></div>");
	
	
	
	///////////////////////////////////////////////
	// MAKE COMPONENTS
	function makeView(){
		//Main holder
		var plus = panel_options.height + panel_options.yOffset;
		if(plus < 0)
		  plus = 0;
		$main.css({
			"position":"relative",
			"width":width+"px",
			"height": (height+plus)+"px",
			"margin":"0",
			"padding":"0",
			"top":"0",
			"left":"0",
			"text-align":"center"
		});
		
		//big content holder
        $bigContent.css({
            "position":"absolute"
        });
		
		//images holder
		$imagesHolder.css({
			"position":"absolute"
		});
		
		//zoom window
		if(include_zoom_window){
			$zoomWindow = $("<div></div>");
			$zoomWindowBox = $("<div></div>");
			$zoomClickable = $("<div></div>");
            $filler = $("<div></div>");
			$zoomWindow.css({
				"position": "absolute",
				"top": "5px",
				"left": "5px",
				"padding": zoom_window_options.padding+"px",
				"opacity":"0",
				"display":"none"
			});
			$zoomClickable.css({
			   "width":"100%",
			   "height":"100%",
			   "position":"absolute" 
			});
			$zoomWindowBox.css({
				"position": "absolute",
				"border":"solid 1px "+zoom_window_options.selection_line_color,
				"opacity":zoom_window_options.selection_line_alpha
			});
			$filler.css({
			   "width":"100%",
			   "height":"100%",
			   "background-color":"#ffffff",
			   "opacity":"0"
			});
			$zoomWindowBox.append($filler);
			$zoomWindow.append($zoomClickable, $zoomWindowBox);
			processColorAndPattern($zoomWindow, zoom_window_options.background_color, zoom_window_options.background_alpha, zoom_window_options.background_pattern);
			
		}
		
		
		//content holder
		$view.css({
			"position":"relative",
			"width":"100%",
			"height": height+"px",
			"overflow":"hidden"
		});
		
		//menu holder
		$panel.css({
			"position":"absolute",
			"width":panel_options.width+"px",
			"height":panel_options.height+"px",
			"top":height+parseInt(panel_options.yOffset, 10)+"px",
			"left":((width-panel_options.width)/2)+parseInt(panel_options.xOffset, 10)+"px"
		});
        processColorAndPattern($panel, panel_options.background_color, panel_options.background_alpha, panel_options.background_pattern);
        addRoundCorners($panel, panel_options.round_corners);
		
		//loading screen
		$loader.css({
			"zoom" : "1",
			"position":"absolute",
			"width":"100%",
			"height":"100%",
			"text-align":"center",
			"top":0,
			"left":0
		});
		//loading text
		$loadingText.css({
			"padding":"8px 20px",
			"position":"relative",
			"top":height/2-20+"px",
			"display":"inline-block"
		});
		addRoundCorners($loadingText, loading_options.text_background_round_corner);
		
		processColorAndPattern($loader, loading_options.background_color, loading_options.background_alpha, loading_options.background_pattern);
		processColorAndPattern($loadingText, loading_options.text_background_color, loading_options.text_background_alpha, loading_options.text_background_pattern);
		
		processFont($loadingText, loading_options.text_font, loading_options.text_color, loading_options.text_size);	
		
		
		
		//MAKE MENU //////////////
		for(var i=0 ; i< controls.length; i++){
			if(	controls[i] == "left" || 
				controls[i] == "right" ||
				controls[i] == "rotate" ||
				controls[i] == "pan" ||
				controls[i] == "hyperlink" ||
				controls[i] == "reset" ||
				controls[i] == "zoom-in" ||
				controls[i] == "zoom-out"){
				var $btn = $('<a href="#"></a>').appendTo($panel);
				
				$btn.css({
					"position":"relative",
					"float":"left",
					"margin":(panel_options.height/2-panel_options.buttons_height/2)+"px "+panel_options.buttons_side_margin+"px",
					"width":panel_options.buttons_width+"px",
					"height":panel_options.buttons_height+"px",
					"top":0,
					"left":0
				});	
				
				buttonsClass($btn, panel_options.ui_folder+controls[i]+"_out.png", panel_options.ui_folder+controls[i]+"_over.png", panel_options.buttons_width, panel_options.buttons_height, panel_options.buttons_tween_time);
				
				if (isIE) 
					$btn.get(0).onselectstart = function () { return false; };
				$btn.get(0).onmousedown = function(e){e.preventDefault();};
				$btn.click(function(){return false;});
					
				//tooltip
				if(include_tooltips){
					var str = getHint(controls[i]);
					
					var $tooltip = makeTooltip(str, $btn, i);
				}
					
				if(controls[i] == "left"){
				    $btn.bind(mouseDownBind, function(){
						speedDegDefault = 7;
						$(document).bind(mouseUpBind, function(e){ 
							if(autoplay)
								speedDegDefault = autoplaySpeed;
							else
								speedDegDefault = 0;
                            return false;
						});
						return false;
					});
				}
				else if(controls[i] == "right"){
					$btn.bind(mouseDownBind, function(){
						speedDegDefault = -7;
						$(document).bind(mouseUpBind, function(e){ 
							if(autoplay)
								speedDegDefault = autoplaySpeed;
							else
								speedDegDefault = 0;
                            return false;
						});
                        return false;
					});
				}
				else if(controls[i] == "rotate"){
					$rotateButton = $btn;
					$btn.click(function(){
						mode = "rotate";
					});
				}
				else if(controls[i] == "pan"){
					$panButton = $btn;
					$btn.click(function(){
						mode = "pan";
					});
				}
				else if(controls[i] == "reset"){
					$btn.click(function(){
						zoom = minZoom;
						
						goToDegree = true;
						goToDegreeNum = 0;
					});
				}
				else if(controls[i] == "zoom-out"){
					$btn.click(function(){
						zoom = minZoom;
					});
				}
				else if(controls[i] == "zoom-in"){
					$btn.click(function(){
						zoom = maxZoom;
					});
				}
				else if(controls[i] == "hyperlink"){
					//hyperlink
					$btn.attr("href", controlsExtras[i]);
					$btn.attr("target", "_blank");
					$btn.unbind("click");
					$btn.click(function(){return true;});
				}
					
			}
			else if(controls[i] == "zoom-slider"){
				///////////////////
				//ZOOM SLIDER
				var $zoom_slider = $('<div></div>');
				
				var zoom_slider_height = Math.max(panel_options.slider_height, panel_options.dragger_height);
				$zoom_slider.css({
					"position":"relative",
					"float":"left",
                    	"height":zoom_slider_height,
					"margin": (panel_options.height/2-zoom_slider_height/2)+"px "+panel_options.zoom_subbuttons_distance+"px",
					"top":0,
					"left":0
				});	

				var $minus = $('<a href="#"></a>');
				buttonsClass($minus, panel_options.ui_folder+"minus_out.png", panel_options.ui_folder+"minus_over.png", panel_options.zoom_subbuttons_width, panel_options.zoom_subbuttons_height, panel_options.buttons_tween_time);
				
				var $plus = $('<a href="#"></a>');
				buttonsClass($plus, panel_options.ui_folder+"plus_out.png", panel_options.ui_folder+"plus_over.png", panel_options.zoom_subbuttons_width, panel_options.zoom_subbuttons_height, panel_options.buttons_tween_time);
				
				var $slider = $('<a href="#"></a>');
				buttonsClass($slider, panel_options.ui_folder+"slider_out.png", panel_options.ui_folder+"slider_over.png", panel_options.dragger_width, panel_options.dragger_height, panel_options.buttons_tween_time);
				
				var $back = $('<a href="#"></a>');
				//buttonsClass($back, panel_options.ui_folder+"slider_background.png", panel_options.ui_folder+"slider_background.png", 178, 6, 500);
				
				if(panel_options.slider_width == "auto")
				    sliderWidth = panel_options.width  -  ((controls.length-1)*(panel_options.buttons_width+panel_options.buttons_side_margin*2) + panel_options.zoom_subbuttons_width*2 + panel_options.buttons_side_margin*2 + panel_options.zoom_subbuttons_distance*2 + panel_options.divider_width*(controls.length-1) + 1);
				else
				    sliderWidth = parseInt(panel_options.slider_width, 10);
				    
				$back.css({
                   "position":"absolute",
				   "width": sliderWidth,
				   "height": panel_options.slider_height,
				   "top":zoom_slider_height/2 - panel_options.slider_height/2,
                    "left":"0"
				});
                addRoundCorners($back, panel_options.slider_round_corners);
                processColorAndPattern($back, panel_options.slider_background_color, panel_options.slider_background_alpha, panel_options.slider_background_pattern);
				
				$minus.css({
					"position":"relative",
					"float":"left",
					"width":panel_options.zoom_subbuttons_width,
                    "height":panel_options.zoom_subbuttons_height,
                    "margin": (panel_options.height/2-panel_options.zoom_subbuttons_height/2)+"px 0px",
                    "margin-left":panel_options.buttons_side_margin
				});
				$plus.css({
					"position":"relative",
					"float":"left",
                    "width":panel_options.zoom_subbuttons_width,
                    "height":panel_options.zoom_subbuttons_height,
                    "margin": (panel_options.height/2-panel_options.zoom_subbuttons_height/2)+"px 0px",
                    "margin-right":panel_options.buttons_side_margin
				});
				$slider.css({
					"position":"absolute",
					"left":-panel_options.dragger_width/2+"px",
					"width":panel_options.dragger_width
				});
				$zoom_slider.css({
                   "width": sliderWidth
                });
				
				$zoom_slider.append($back, $slider);
				$panel.append($minus, $zoom_slider, $plus);
				
				$zoomSlider = $slider;
				$zoomMinus = $minus;
				$zoomPlus = $plus;
				
				$slider.click(function () { return false; });
				if (isIE) {
					$plus.get(0).onselectstart = function () { return false; };
					$minus.get(0).onselectstart = function () { return false; };
					$slider.get(0).onselectstart = function () { return false; };
				}
				$plus.get(0).onmousedown = function(e){e.preventDefault();};
				$minus.get(0).onmousedown = function(e){e.preventDefault();};
				$slider.get(0).onmousedown = function(e){e.preventDefault();};
				
					
                var sliderFrom = -panel_options.dragger_width/2, 
                    sliderTo = sliderWidth-panel_options.dragger_width/2;
				$plus.click(function(){
					zoom += zoomSpeed;
					return false;
				});
				$plus.bind(mouseDownBind, function(){
					var interval = setInterval(function(){
						zoom += zoomSpeed;
					}, 100);
					
					$(document).bind(mouseUpBind, function(e){ 
						clearInterval(interval);
						changeFocus();
                        return false;
					});
                    return false;
				});
				$minus.click(function(){
					zoom -= zoomSpeed;
					return false;
				});
				$minus.bind(mouseDownBind, function(){
					var interval = setInterval(function(){
						zoom -= zoomSpeed;
					}, 100);
					
					$(document).bind(mouseUpBind, function(e){ 
						clearInterval(interval);
						changeFocus();
                        return false;
					});
					
					return false;
				});
				$slider.bind(mouseDownBind, function(e){
					//mouse x position when clicked
					var posIniX = e.pageX;
					var sliderX = parseInt($slider.css("left"), 10);
					draggingZoomSlider = true;
					   
					$(document).bind(mouseMoveBind, function(e){ 
						var dif = e.pageX - posIniX;
						
						var pos = sliderX+dif;
						if(pos < sliderFrom)
							pos = sliderFrom;
						if(pos > sliderTo)
							pos = sliderTo;
						
						$slider.css({
							"left":pos+"px"
						});
						
						//0 - 168
						var perc = (pos+panel_options.dragger_width/2)/sliderWidth;
						
						//minZoom - maxZoom
						// 1 - maxZoom + (1-minZoom)
						zoom = perc * (maxZoom + (1-minZoom) - 1) + 1;
						zoomCurrent = zoom;
					});
					$(document).bind(mouseUpBind, function(e){ 
						draggingZoomSlider = false;
						unbindMoveAndUp();
					});
					return false;
				});
				$back.click(function(e){
					var offset = $(this).offset();
					var pos = e.pageX - offset.left - panel_options.dragger_width/2 -3;
					
					
					if(pos < sliderFrom)
                        pos = sliderFrom;
                    if(pos > sliderTo)
                        pos = sliderTo;
					
					//0 - 168
					var perc = (pos+panel_options.dragger_width/2)/sliderWidth;
					
					//minZoom - maxZoom
					// 1 - maxZoom + (1-minZoom)
					zoom = perc * (maxZoom - minZoom) + 1;
					
					return false;
				});
				
				
				//tooltip
				if(include_tooltips){
					
					var str = "Zoom 0%";
					
					var $tooltip = makeTooltip(str, $slider, "zoom-slider");
					
					function over(){
						var rel = "zoom-slider";
						var $tooltip = updateTooltipPosition($slider, rel);
					
						$tooltip.stop().fadeTo(tooltips_options.fadeTime, 1);		
					}
					function out(){
						var rel = "zoom-slider";
						var $tooltip = $(".tooltip[rel='"+rel+"']");
						$tooltip.stop().fadeTo(tooltips_options.fadeTime, 0);	
					}
					
					$minus.hover(function(){
                        if( !$(this).hasClass("disabled") )over();
                    }, out);
					$plus.hover(function(){
                        if( !$(this).hasClass("disabled") )over();
                    }, out);
				}
				///////////////////
			}
			else if(controls[i] == "playback-slider"){
				///////////////////
				//PLAYBACK SLIDER
				var $playback_slider = $('<div></div>');
                var playback_slider_height = Math.max(panel_options.slider_height, panel_options.dragger_height);
				
				$playback_slider.css({
					"position":"relative",
					"float":"left",
					"height":playback_slider_height,
                    	"margin": (panel_options.height/2-playback_slider_height/2)+"px "+panel_options.buttons_side_margin+"px",
					"top":0,
					"left":0
				});	
				
				var $slider = $('<a href="#"></a>');
				buttonsClass($slider, panel_options.ui_folder+"slider_out.png", panel_options.ui_folder+"slider_over.png", panel_options.dragger_width, panel_options.dragger_height, panel_options.buttons_tween_time);
				
				var $back = $('<a href="#"></a>');
				//buttonsClass($back, panel_options.ui_folder+"slider_background.png", panel_options.ui_folder+"slider_background.png", 178, 6, 500);
				
				if(panel_options.slider_width == "auto")
                    playbackSliderWidth = panel_options.width  -  ((controls.length-1)*(panel_options.buttons_width+panel_options.buttons_side_margin*2) + panel_options.buttons_side_margin*2 + panel_options.divider_width*(controls.length-1) + 1);
                else
                    playbackSliderWidth = parseInt(panel_options.slider_width, 10);
                    
				var $p_slider = $('<div></div>');
				
				$back.css({
                   "position":"absolute",
                   "width": playbackSliderWidth,
                   "height": panel_options.slider_height,
                   "top":playback_slider_height/2 - panel_options.slider_height/2,
                    "left":"0"
                });
                addRoundCorners($back, panel_options.slider_round_corners);
                processColorAndPattern($back, panel_options.slider_background_color, panel_options.slider_background_alpha, panel_options.slider_background_pattern);
				
				$slider.css({
					"position":"absolute",
                    "left":-panel_options.dragger_width/2+"px",
				});
				$playback_slider.css({
				   "width": playbackSliderWidth
				});
				
				$playback_slider.append($back, $slider);
				
				$panel.append($playback_slider);
				
				$playbackSlider = $slider;
				
				$slider.click(function () { return false; });
				if (isIE) 
					$slider.get(0).onselectstart = function () { return false; };
				$slider.get(0).onmousedown = function(e){e.preventDefault();};
				
				var sliderFrom = -panel_options.dragger_width/2, 
				    sliderTo = playbackSliderWidth-panel_options.dragger_width/2;
				$slider.bind(mouseDownBind, function(e){
					//mouse x position when clicked
					var posIniX = e.pageX;
					var sliderX = parseInt($slider.css("left"), 10);
					draggingPlaybackSlider = true;
					goToDegreeNum = degrees;
					   
					$(document).bind(mouseMoveBind, function(e){ 
						var dif = e.pageX - posIniX;
						
						var pos = sliderX+dif;
                        if(pos < sliderFrom)
                            pos = sliderFrom;
                        if(pos > sliderTo)
                            pos = sliderTo;
						
						$slider.css({
							"left":pos+"px"
						});
						
						//0 - 168
						var perc = (pos+panel_options.dragger_width/2)/playbackSliderWidth;
						
						goToDegree = true;
						goToDegreeNum =  Math.round(perc * 360);
					});
					$(document).bind(mouseUpBind, function(e){ 
						draggingPlaybackSlider = false;
                        unbindMoveAndUp();
                        return false;
					});
					return false;
				});
				$back.click(function(e){
					var offset = $(this).offset();
					var pos = e.pageX - offset.left - panel_options.dragger_width/2 -3;
					
                    if(pos < sliderFrom)
                        pos = sliderFrom;
                    if(pos > sliderTo)
                        pos = sliderTo;
					
					//0 - 168
					var perc = (pos+panel_options.dragger_width/2)/playbackSliderWidth;
					
					goToDegree = true;
					goToDegreeNum =  Math.round(perc * 360);
					
					return false;
				});
				//tooltip
				if(include_tooltips){
					
					var str = "Rotate 0";
					
					var $tooltip = makeTooltip(str, $playbackSlider, "playback-slider");
					
				}
				///////////////////
				
				///////////////////
				
			}
			else if(controls[i] == "autoplay"){
				var $btn = $('<div></div>');
				
				$btn.css({
                    "position":"relative",
                    "float":"left",
                    "margin":(panel_options.height/2-panel_options.buttons_height/2)+"px "+panel_options.buttons_side_margin+"px",
                    "width":panel_options.buttons_width+"px",
                    "height":panel_options.buttons_height+"px",
                    "overflow":"hidden",
					"top":0,
					"left":0
                }); 
				
				var $play = $('<a href="#"></a>');
				buttonsClass($play, panel_options.ui_folder+"play_out.png", panel_options.ui_folder+"play_over.png", panel_options.buttons_width, panel_options.buttons_height, panel_options.buttons_tween_time);
				
				var $pause = $('<a href="#"></a>');
				buttonsClass($pause, panel_options.ui_folder+"pause_out.png", panel_options.ui_folder+"pause_over.png", panel_options.buttons_width, panel_options.buttons_height, panel_options.buttons_tween_time);
				
				$play.css({
					"position":"absolute",
                    "top":"0",
                    "left":"0"
				});
				$pause.css({
					"position":"absolute",
                    "top":"0",
                    "left":"0"
				});
				$btn.append($play, $pause);
				$panel.append($btn);
				
				if(autoplay)
					$play.stop().fadeTo(0, 0).css("display", "none");
				else
					$pause.stop().fadeTo(0, 0).css("display", "none");
					
				$btn.click(function(){
					if(autoplay){
						changeTooltipText("autoplay", tooltips_texts.play);
						autoplay = false;
						speedDegDefault = 0;
						$play.stop().css("display", "block").fadeTo(panel_options.buttons_tween_time, 1);
						$pause.stop().fadeTo(panel_options.buttons_tween_time, 0, function(){ $pause.css("display", "none"); });
					}
					else{
						changeTooltipText("autoplay", tooltips_texts.pause);
						autoplay = true;
						speedDegDefault = autoplaySpeed;
						$pause.stop().css("display", "block").fadeTo(panel_options.buttons_tween_time, 1);
						$play.stop().fadeTo(panel_options.buttons_tween_time, 0, function(){ $play.css("display", "none"); });
					}
				  	updateTooltipPosition($(this), "autoplay");
					return false;
				});
				
				//tooltip
				if(include_tooltips){
					
					var str = tooltips_texts.play;
					
					if(autoplay)
						str = tooltips_texts.pause;
					
					var $tooltip = makeTooltip(str, $btn, "autoplay");
				}
			}
			
			//ADD SEPERATOR
			if( i != controls.length-1){
				var $sep = $("<div></div>");
				$sep.css({
						"position":"relative",
						"float":"left",
						"margin":(panel_options.height/2-panel_options.divider_height/2)+"px 0px",
						"width":panel_options.divider_width,
						"height":panel_options.divider_height
					});	
				$sep.append('<img src="'+panel_options.ui_folder+'divider.png" />');
				$panel.append($sep);
			}
		}
		////////////////////
		
		
		//MOUSE WHEEL ZOOM
		if(mouse_wheel_function != "none"){
			$view.mousewheel(function(event, delta) {
			    clearSmall();
			    if(mouse_wheel_function == "zoom")
				    zoom+=delta*mouse_wheel_speed;
			    
				 else if(mouse_wheel_function == "rotate")
					speedDeg+=delta*mouse_wheel_speed;
					
				return false;
			});
		}
		///////////////////
		
		
		//APPENDS //////////////
		$loader.append($loadingText);
		
		$view.append($imagesHolder, $zoomWindow, $bigContent);
		
		$main.append($view);
		$main.append($panel);
		$main.append($loader);
		
		$root.append($main);
        $('*', $main).bind(mouseDownBind, clearSmall);
        $('*', $view).unbind(mouseDownBind);
		////////////////////
		
		if(panel_options.show == "roll_over" && !ismobile){
            $panel.css("opacity", "0");
		    $main.hover(function(){
		        if(!$panel.hasClass("blocked"))
		          $panel.stop().fadeTo(500, 1);
		    }, function(){
                $panel.stop().fadeTo(500, 0);
		    });
		}
		  
		
		loadImage(0);
	}
	///////////////////////////////////////////////
	
	
	
	///////////////////////////////////////////////
	// LOAD XML	
	$.ajax({
	    type: "GET",
	    url: parameters.xml,
	    dataType: "xml",
	    success: parseXml
	});	
	function parseXml(xml){
		var configuration = $(xml).find("ProductViewer");
		
		width = parseInt($(configuration).find("viewWidth").text(), 10);
		height = parseInt($(configuration).find("viewHeight").text(), 10);
		
		ease = parseFloat($(configuration).find("ease").text(), 10);
		paddingEase = parseFloat($(configuration).find("padding_ease").text(), 10);
		inertia = parseFloat($(configuration).find("inertia").text(), 10);
		
		mouse_wheel_function = $(configuration).find("mouse_wheel_function").text();
		mouse_wheel_speed = parseFloat($(configuration).find("mouse_wheel_speed").text(), 10);
		
		zoomSpeed = parseFloat($(configuration).find("zoomSpeed").text(), 10);
		zoomEase = parseInt($(configuration).find("zoomEase").text(), 10);
		
		if($(configuration).find("maxZoom").text() == "auto")
			maxZoom = "auto";
		else
			maxZoom = parseFloat($(configuration).find("maxZoom").text(), 10);
		
		if($(configuration).find("reverse").text() == "true")
			reverse = true;
		
		if($(configuration).find("autoplay").text() == "true")
			autoplay = true;
			
        if($(configuration).find("grab_hand_cursor").text() == "true")
            grab_hand_cursor = true;
			
		autoplaySpeed = parseInt($(configuration).find("autoplaySpeed").text(), 10);
		
		if($(configuration).find("include_tooltips").text() == "true")
			include_tooltips = true;
		if($(configuration).find("include_zoom_window").text() == "true")
			include_zoom_window = true;
		
		
		//OPTIONS PANEL
		var panel_xml = $(configuration).find("panel");
		
        panel_options.width = parseInt($(panel_xml).find("width").text(), 10);
        panel_options.height = parseInt($(panel_xml).find("height").text(), 10);
        panel_options.xOffset = parseInt($(panel_xml).find("xOffset").text(), 10);
        panel_options.yOffset = parseInt($(panel_xml).find("yOffset").text(), 10);
		panel_options.background_color = $(panel_xml).find("background_color").text();
		panel_options.background_alpha = $(panel_xml).find("background_alpha").text();
		panel_options.background_pattern = $(panel_xml).find("background_pattern").text();
        panel_options.round_corners = $(panel_xml).find("round_corners").text()+"px";
        panel_options.show = $(panel_xml).find("show").text();
        
        panel_options.buttons_side_margin = parseInt($(panel_xml).find("buttons_side_margin").text(), 10);
        panel_options.buttons_tween_time = parseInt($(panel_xml).find("buttons_tween_time").text(), 10);
        
        panel_options.ui_folder = $(panel_xml).find("ui_folder").text();
        
        panel_options.buttons_width = parseInt($(panel_xml).find("buttons_width").text(), 10);
        panel_options.buttons_height = parseInt($(panel_xml).find("buttons_height").text(), 10);
        panel_options.divider_width = parseInt($(panel_xml).find("divider_width").text(), 10);
        panel_options.divider_height = parseInt($(panel_xml).find("divider_height").text(), 10);
        
        panel_options.slider_width = $(panel_xml).find("slider_width").text();
        panel_options.slider_height = parseInt($(panel_xml).find("slider_height").text(), 10);
        panel_options.slider_background_color = $(panel_xml).find("slider_background_color").text();
        panel_options.slider_background_alpha = $(panel_xml).find("slider_background_alpha").text();
        panel_options.slider_background_pattern = $(panel_xml).find("slider_background_pattern").text();
        panel_options.slider_round_corners = $(panel_xml).find("slider_round_corners").text() +"px";
        
        panel_options.zoom_subbuttons_width = parseInt($(panel_xml).find("zoom_subbuttons_width").text(), 10);
        panel_options.zoom_subbuttons_height = parseInt($(panel_xml).find("zoom_subbuttons_height").text(), 10);
        panel_options.zoom_subbuttons_distance = parseInt($(panel_xml).find("zoom_subbuttons_distance").text(), 10);
        
        panel_options.dragger_width = parseInt($(panel_xml).find("dragger_width").text(), 10);
        panel_options.dragger_height = parseInt($(panel_xml).find("dragger_height").text(), 10);
		
		
		//LOADING
		var loading_xml = $(configuration).find("loading");
		
		loading_text = $(loading_xml).find("loading_text").text();
		
		loading_options.background_color = $(loading_xml).find("background_color").text();
		loading_options.background_alpha = $(loading_xml).find("background_alpha").text();
		loading_options.background_pattern = $(loading_xml).find("background_pattern").text();
		
		loading_options.text_font = $(loading_xml).find("text_font").text();
		loading_options.text_size = $(loading_xml).find("text_size").text();
		loading_options.text_color = $(loading_xml).find("text_color").text();
		loading_options.text_span_color = $(loading_xml).find("text_span_color").text();
		loading_options.text_background_color = $(loading_xml).find("text_background_color").text();
		loading_options.text_background_alpha = $(loading_xml).find("text_background_alpha").text();
		loading_options.text_background_pattern = $(loading_xml).find("text_background_pattern").text();
		loading_options.text_background_round_corner = $(loading_xml).find("text_background_round_corner").text()+"px";
		
		
		//CONTROLS
		var controlsXml = $(configuration).find("controls");
		$(controlsXml).find("control").each(function(index){
			var $this = $(this);
			
			if($this.text() == "hyperlink")
				controlsExtras.push($this.attr("href"));
			else
				controlsExtras.push("none");
				
			controls.push($this.text());
		});
		
		
		//TOLTIPS TEXTS
        var tooltips_texts_xml = $(configuration).find("tooltips_texts");
        tooltips_texts.rotate = $(tooltips_texts_xml).find("rotate").text();
        tooltips_texts.pan = $(tooltips_texts_xml).find("pan").text();
        tooltips_texts.rotate_slider = $(tooltips_texts_xml).find("rotate_slider").text();
        tooltips_texts.rotate_left = $(tooltips_texts_xml).find("rotate_left").text();
        tooltips_texts.rotate_right = $(tooltips_texts_xml).find("rotate_right").text();
        tooltips_texts.reset = $(tooltips_texts_xml).find("reset").text();
        tooltips_texts.zoom_slider = $(tooltips_texts_xml).find("zoom_slider").text();
        tooltips_texts.zoom_in = $(tooltips_texts_xml).find("zoom_in").text();
        tooltips_texts.zoom_out = $(tooltips_texts_xml).find("zoom_out").text();
        tooltips_texts.hyperlink = $(tooltips_texts_xml).find("hyperlink").text();
        tooltips_texts.play = $(tooltips_texts_xml).find("play").text();
        tooltips_texts.pause = $(tooltips_texts_xml).find("pause").text();
		
		
		//TOOLTIPS
		var tooltips_xml = $(configuration).find("tooltips");
		tooltips_options.text_font = $(tooltips_xml).find("text_font").text();
		tooltips_options.text_size = $(tooltips_xml).find("text_size").text();
		tooltips_options.text_color = $(tooltips_xml).find("text_color").text();
		tooltips_options.left_right_padding = $(tooltips_xml).find("left_right_padding").text();
		tooltips_options.top_bottom_padding = $(tooltips_xml).find("top_bottom_padding").text();
		tooltips_options.background_color = $(tooltips_xml).find("background_color").text();
        tooltips_options.background_alpha = $(tooltips_xml).find("background_alpha").text();
		tooltips_options.round_corners = $(tooltips_xml).find("round_corners").text()+"px";
        tooltips_options.fadeTime = parseInt($(tooltips_xml).find("fadeTime").text(), 10);
		
		
		//ZOOM WINDOW
		var zoom_window_xml = $(configuration).find("zoom_window");
		zoom_window_options.window_width = $(zoom_window_xml).find("window_width").text();
		zoom_window_options.window_height = $(zoom_window_xml).find("window_height").text();
		zoom_window_options.background_color = $(zoom_window_xml).find("background_color").text();
		zoom_window_options.background_alpha = $(zoom_window_xml).find("background_alpha").text();
		zoom_window_options.background_pattern = $(zoom_window_xml).find("background_pattern").text();
		zoom_window_options.padding = $(zoom_window_xml).find("padding").text();
		zoom_window_options.selection_line_color = $(zoom_window_xml).find("selection_line_color").text();
		zoom_window_options.selection_line_alpha = $(zoom_window_xml).find("selection_line_alpha").text();
		
		
		//HOTSPOTS
		hotspotsImagesPath = $(configuration).find("hotspotsImagesPath").text();
		var hotspotsButtonsXml = $(configuration).find("hotspotsButtons");
		$(hotspotsButtonsXml).find("button").each(function(index){
			var $this = $(this);
			
			var obj = Object();
			obj.id = $this.find("id").text();
			obj.out = $this.find("out").text();
			obj.over = $this.find("over").text();
			obj.width = $this.find("width").text();
			obj.height = $this.find("height").text();
			obj.tweenTime = $this.find("tweenTime").text();
			
			hotspotsButtons.push(obj);
		});
		
		
		//IMAGES
		imagesPath = $(configuration).find("imagesPath").text();
		imagesBigPath = $(configuration).find("imagesBigPath").text();
		
		if(imagesBigPath == "none")
		  focusable = false;
		
		var imagesXml = $(configuration).find("images");
		var nImages = 0;
		$(imagesXml).find("image").each(function(index){
		    nImages++;
			var $this = $(this);
			imagesSrc.push($this.attr("src"));
			
			var spots = $this.find("hotspot");
			if(spots.length > 0){
				var newArray = Array();
				$(spots).each(function(index){
					var $hotspot = $(this);
					
					var obj = Object();
					obj.id = $hotspot.find("button_id").text();
					obj.x = parseInt($hotspot.find("x").text(), 10);
					obj.y = parseInt($hotspot.find("y").text(), 10);
					obj.type = $hotspot.find("type").text();
                    obj.tooltip = $hotspot.find("tooltip").text();
					
					if(obj.type == "link")
						obj.content = $hotspot.find("content").text();
					if(obj.type == "small"){
					    var contObj = Object();
					    var content = $hotspot.find("content");
					    
					    contObj.width = $(content).find("width").text();
                        contObj.background_color = $(content).find("background_color").text();
                        contObj.background_alpha = $(content).find("background_alpha").text();
                        contObj.background_pattern = $(content).find("background_pattern").text();
                        contObj.padding = $(content).find("padding").text();
                        contObj.round_corners = $(content).find("round_corners").text()+"px";
                        contObj.html = $(content).find("html").text();
                        contObj.fadeTime = parseInt($(content).find("fadeTime").text(), 10);
                        
                        obj.content = contObj;
					}
					if(obj.type == "big"){
                        var contObj = Object();
                        var content = $hotspot.find("content");
                        
                        contObj.background_color = $(content).find("background_color").text();
                        contObj.background_alpha = $(content).find("background_alpha").text();
                        contObj.background_pattern = $(content).find("background_pattern").text();
                        contObj.html = $(content).find("html").text();
                        contObj.close_button_id = $(content).find("close_button_id").text();
                        contObj.closeOffsetX = parseInt($(content).find("closeOffsetX").text(), 10);
                        contObj.closeOffsetY = parseInt($(content).find("closeOffsetY").text(), 10);
                        contObj.fadeTime = parseInt($(content).find("fadeTime").text(), 10);
                        
                        obj.content = contObj;
                    }
					
					newArray.push(obj);
				});
				hotspots.push(newArray);
			}
			else
				hotspots.push(null);
		});
		if(nImages == 1)
		  singleImage = true;
		
		/*if(ismobile){
		    $(document).bind("mobileinit", function(){
                $.mobile.loadingMessage = false;
            });
		    $.getScript("js/libraries/jquery.mobile.vmouse.js")
            .done(function(script, textStatus) {
                console.log( textStatus );*/
                makeView();
            /*})
            .fail(function(jqxhr, settings, exception) {
                console.log( exception );
                makeView();
            }); 
		}
		else
		  makeView();*/
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// INITIAL IMAGES LOADING
	function loadImage(num){
		var img = new Image();
		
		img.onload = function() {
			if(num == 0){
				var imgW = img.width;
				var imgH = img.height;
				
				if(!(imgW == width && imgH == height)){
					var ratio = imgW / width;
										
					if(ratio > (imgH/height))
						ratio = imgH / height;
				
					iniWidth = imgW/ratio;
					iniHeight = imgH/ratio;
					
					zoom = 1-(ratio-1);
					zoomCurrent = zoom;
				}
				else{
					iniWidth = imgW;
					iniHeight = imgH;
					zoom = 1;
					zoomCurrent = zoom;
				}
				minZoom = zoom;
				$imagesHolder.css({
					"width":iniWidth+"px",
					"height":iniHeight+"px"
				});
				
				if(include_zoom_window){
					var ratio = 1;
					if(zoom_window_options.window_width == "auto")
						//Fixed Height
						ratio = imgH / zoom_window_options.window_height;
					
					else if(zoom_window_options.window_height == "auto")
						//Fixed Width
						ratio = imgW / zoom_window_options.window_width;
					
					else{
						alert("Error on a zoom window parameter on the xml -> width OR height must be 'auto'");
						return;
					}
					var w1 = Math.round(imgW/ratio);
					var h1 = Math.round(imgH/ratio);
					
					$zoomWindow.css({
						"width":w1+"px",
						"height":h1+"px"
					});
					
					zoom_window_width = w1;
					zoom_window_height = h1;
				}
			}
			
			$(img).css({
					"width":"100%",
					"height":"100%"
				});
			
			
			var $image = $("<div rel='"+num+"'></div>");
			$image.css({
				"position":"absolute",
				"width":"100%",
				"height":"100%"
			});
			
			$image.append(img);
			$imagesHolder.append($image);
			
			if(include_zoom_window){
				var $small = $image.clone().css({
					"padding":zoom_window_options.padding+"px",
					"width":"auto",
					"height":"auto"}).prependTo($zoomWindow);
				zoom_window_images.push($small);
			}
			
			
			images.push($image);
            $image.mousedown(clearSmall);
			
			if(num == imagesSrc.length-1)
				loadFinished();
			else
				loadImage(++num);
				
		};
		
        var str = loading_text;
        str = str.replace("loaded_images", (num+1));
        str = str.replace("total_images", imagesSrc.length);
        str = str.replace("#span#", "<span style='color:"+loading_options.text_span_color+"'>");
        str = str.replace("#spanEnd#", "</span>");
        $loadingText.html(str);
		//$("span", $loadingText).html((num+1)+"/"+imagesSrc.length);
		
		img.src = (imagesPath+imagesSrc[num]);
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// LOAD FINISHED CALLER
	var relativeExcessW;
	var relativeExcessH;
	function loadFinished(){
		$loader.fadeOut(500);
		currentImage = 0;
		numImages = imagesSrc.length;
		
		if(include_zoom_window){
			relativeExcessW = ((zoom_window_width/iniWidth) * (iniWidth-width));
			relativeExcessH = ((zoom_window_height/iniHeight) * (iniHeight-height));
		}
		//Start updating image
		updateImage();
		
		if(autoplay)
			speedDegDefault = autoplaySpeed;
			
			
		//updateTransition();
		dragAndDrop();
		
	}
	///////////////////////////////////////////////«
	
	
	///////////////////////////////////////////////
	// DRAG AND THROW
	var panPrevLeft, panPrevTop, panPrevX, panPrevY;
	function grabHandOpen($obj){
	    if(grab_hand_cursor)
            $obj.css("cursor" , "url("+panel_options.ui_folder+"grabhand_open.png) 12 12,auto");
        else
            $obj.css("cursor" , "pointer");
	}
    function grabHandClose($obj){
        if(grab_hand_cursor)
            $obj.css("cursor" , "url("+panel_options.ui_folder+"grabhand_closed.png) 12 12,auto");
        else
            $obj.css("cursor" , "pointer");
    }
	function unbindMoveAndUp(){
	    $(document).unbind(mouseMoveBind);
        $(document).unbind(mouseUpBind);
	}
	function onRotateMove(e){
	    currentX = e.pageX;
	}
	function onRotateUp(){
        grabHandOpen($imagesHolder);
        dragging = false;
        changeFocus();
        
        unbindMoveAndUp();
    }
	function onPanMove(e){
        var x = e.pageX;
        var y = e.pageY;
        
        var toX = panPrevLeft + (panPrevX-x);
        var toY = panPrevTop + (panPrevY-y);
        
        var excessWidth = (currentWidth-width)/2;
        var excessHeight = (currentHeight-height)/2;
        
        if(toX < -excessWidth)
            toX = -excessWidth;
        if(toX > excessWidth)
            toX = excessWidth;
            
        if(toY < -excessHeight)
            toY = -excessHeight;
        if(toY > excessHeight)
            toY = excessHeight;
            
        viewLeft = toX;
        viewTop = toY;
    }
    function onPanUp(){
        grabHandOpen($imagesHolder);
        panning = false;
        
        unbindMoveAndUp();
        
        return false;
    }
	function startDrag(e){
        grabHandClose($imagesHolder);
            
        if(mode == "rotate" && !singleImage){
            removeFocus();
            
            //mouse x position when clicked
            positionClickedX = e.pageX;
            
            oldDif = 0;
            degWhenClicked = degrees;
            currentX = positionClickedX;
            
            //dragging
            dragging = true;
               
            //MOUSE MOVE BIND
            $(document).bind(mouseMoveBind, onRotateMove );
            
            //MOUSE UP BIND
            $(document).bind(mouseUpBind, onRotateUp );
            
            
            return false;
        }
        else{
            //mouse x position when clicked
            panPrevX = e.pageX;
            panPrevY = e.pageY;
            
            //panning
            panning = true;
            
            panPrevLeft = viewLeft;
            panPrevTop = viewTop;
            
            zoomWhenPad = zoom;
              
            //MOUSE MOVE BIND
            $(document).bind(mouseMoveBind, onPanMove );
            
            //MOUSE UP BIND
            $(document).bind(mouseUpBind, onPanUp );
            
            return false;
        }
	}
	function dragAndDrop(){
		if (isIE) 
			$imagesHolder.get(0).onselectstart = function () { return false; };
    	$imagesHolder.get(0).onmousedown = function(e){e.preventDefault(); return false;};
			
		$imagesHolder.hover(function(){
		    grabHandOpen($imagesHolder);
		}, function(){
			$imagesHolder.css("cursor" , "auto");
		});
			
		//MOUSE DOWN BIND
        $imagesHolder.bind(mouseDownBind, startDrag );
		
		
		//ZOOM WINDOW DRAGGER
		if(include_zoom_window){
			if (isIE) 
				$zoomWindowBox.get(0).onselectstart = function () { return false; };
	    	$zoomWindowBox.get(0).onmousedown = function(e){e.preventDefault(); return false;};
				
			$zoomWindowBox.hover(function(){
			    grabHandOpen($zoomWindowBox);
			}, function(){
				$zoomWindowBox.css("cursor" , "auto");
			});
			$zoomClickable.click(function(e){
                var x = e.pageX;
                var y = e.pageY;
                
                var off = $zoomWindow.offset();
                
                var excessWidth = (currentWidth-width)/2;
                var excessHeight = (currentHeight-height)/2;
                
                var zoomWindowWidth = parseInt($zoomWindowBox.css("width"), 10);
                var zoomWindowHeight = parseInt($zoomWindowBox.css("height"), 10);
                
                var toX = -excessWidth + ((x-off.left - zoomWindowWidth/2) * (width/zoomWindowWidth));
                var toY = -excessHeight + ((y-off.top - zoomWindowHeight/2) * (height/zoomWindowHeight)); 
                
                
                if(toX < -excessWidth)
                    toX = -excessWidth;
                if(toX > excessWidth)
                    toX = excessWidth;
                    
                if(toY < -excessHeight)
                    toY = -excessHeight;
                if(toY > excessHeight)
                    toY = excessHeight;
                    
                viewLeft = toX;
                viewTop = toY;
			});
			$zoomWindowBox.bind(mouseDownBind , function(e){
			    grabHandClose($zoomWindowBox);
				//mouse x position when clicked
				var positionX = e.pageX;
				var positionY = e.pageY;
				
				//panning
				panning = true;
				
				var prevLeft = viewLeft;
				var prevTop = viewTop;
				
				zoomWhenPad = zoom;
				   
				$(document).bind(mouseMoveBind, function(e){ 
					var x = e.pageX;
					var y = e.pageY;
					
					var toX = prevLeft - ((positionX-x) * (width/parseInt($zoomWindowBox.css("width"), 10)));
					var toY = prevTop - ((positionY-y) * (height/parseInt($zoomWindowBox.css("height"), 10)));
					
					var excessWidth = (currentWidth-width)/2;
					var excessHeight = (currentHeight-height)/2;
					
					if(toX < -excessWidth)
						toX = -excessWidth;
					if(toX > excessWidth)
						toX = excessWidth;
						
					if(toY < -excessHeight)
						toY = -excessHeight;
					if(toY > excessHeight)
						toY = excessHeight;
						
					viewLeft = toX;
					viewTop = toY;
					
                    return false;
				});
				$(document).bind(mouseUpBind, function(e){ 
                    grabHandOpen($imagesHolder);
					panning = false;
					
					unbindMoveAndUp();
					
					return false;
				});
				return false;
			});
		}
		
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// TOOLTIPS CONTROL FUNCTIONS
	function makeTooltip(tip, $obj, rel){
		var $tooltip = $('<div class="tooltip"><span>'+tip+'</span></div>');
					
		var $triangle = $('<div></div>');
		
		$tooltip.css({
			"-moz-font-feature-settings": "normal",
		    "-moz-font-language-override": "normal",
		    "display": "inline-block",
		    "pointer-events": "none",
		    "position": "absolute",
		    "text-align": "center",
		    "text-decoration": "none",
			"padding": tooltips_options.top_bottom_padding+"px "+tooltips_options.left_right_padding+"px",
			"background-color":tooltips_options.background_color,
			"opacity":"0"
	 	});
		$triangle.css({
			"float":"left",
		    "position": "absolute",
		    "top":"100%",
		    "left":"50%",
		    "margin-left":"-5px",
			"width": "0px",
			"height": "0px",
			"border-left": "5px solid transparent",
			"border-right": "5px solid transparent",
			"border-top": "5px solid "+tooltips_options.background_color,
			"opacity":tooltips_options.background_alpha
		});
		processFont($tooltip, tooltips_options.text_font, tooltips_options.text_color, tooltips_options.text_size);
		addRoundCorners($tooltip, tooltips_options.round_corners);
		
		processColorAndPattern($tooltip, tooltips_options.background_color, tooltips_options.background_alpha, "none");
		
		$tooltip.append($triangle);
		
		
		$body.append($tooltip);
        $tooltip.attr("rel", rel);
        
        updateTooltipPosition($obj, rel);
        
        function over(){
            if( !$(this).hasClass("disabled") ){
                var $tooltip = updateTooltipPosition($obj, rel);
                $tooltip.stop().fadeTo(tooltips_options.fadeTime, 1);  
                if (isIE) 
                    $triangle.stop().fadeTo(tooltips_options.fadeTime, tooltips_options.background_alpha);    
            }    
        }
        function out(){
            if( !$(this).hasClass("removing") ){
                var $tooltip = $(".tooltip[rel='"+rel+"']");
                $tooltip.stop().fadeTo(tooltips_options.fadeTime, 0);  
                if (isIE)  
                    $triangle.stop().fadeTo(tooltips_options.fadeTime, 0);  
            }
        }
        if (isIE)  {
            $tooltip.stop().fadeTo(0, 0);  
            $triangle.stop().fadeTo(0, 0); 
        }
        
        $obj.bind(mouseOverBind, over);
        $obj.bind(mouseOutBind, out);
		
		return $tooltip;
	}
	function updateTooltipPosition($obj, rel){
		var linkPosition = $obj.offset();
		var $tooltip = $(".tooltip[rel='"+rel+"']");
		
		var top = linkPosition.top - $tooltip.outerHeight() - 3;
		var left = linkPosition.left - ($tooltip.width()/2) + parseInt($obj.width(), 10)/4 -1;
		
        $tooltip.css({
	    	"top": top,
	    	"left": left
	  	});
	  	return $tooltip;
	}
	function changeTooltipText(rel, newText){
		var $tooltip = $(".tooltip[rel='"+rel+"'] span");

        $tooltip.text(newText);
	}
	function getHint(control){
		var str;
		switch(control){
			case "left":
				str = tooltips_texts.rotate_left;
				break;
			case "right":
                str = tooltips_texts.rotate_right;
				break;
			case "rotate":
                str = tooltips_texts.rotate;
				break;
			case "pan":
                str = tooltips_texts.pan;
				break;
			case "hyperlink":
                str = tooltips_texts.hyperlink;
				break;
			case "reset":
                str = tooltips_texts.reset;
				break;
			case "zoom-in":
                str = tooltips_texts.zoom_in;
				break;
			case "zoom-out":
                str = tooltips_texts.zoom_out;
				break;
			case "zoom_slider":
                var perc = Math.round((zoom - minZoom)/(maxZoom - minZoom)*100) + "";
                str = tooltips_texts.zoom_slider;
                str = str.replace("zoom_number", perc);
			    break;
            case "rotate_slider":
                var deg;
                var degreesCalc = degrees;
                if(degrees < 0)
                    degreesCalc = 360+degrees;
                if(draggingPlaybackSlider)
                    deg = Math.round(goToDegreeNum)+"";
                else
                    deg = Math.round(degreesCalc)+"";
                    
                str = tooltips_texts.rotate_slider;
                str = str.replace("rotate_number", deg);
                break;
		}
		return str;
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// HOTSPOTS HANDLING
	var currentHotspots = Array(), currentHotspotsTooltips = Array();
	var smallTweenTime =200, $smallHotspot, smallWidth, smallHeight;
	function clearSmall(){
	    if($hotspotsSmall != null){
	       $hotspotsSmall.stop().fadeTo(smallTweenTime, 0, function(){
	           $(this).remove();
                $hotspotsSmall = null;
	       });
	   }
	}
    function updateSmall(){
        if($hotspotsSmall != null){
            $hotspotsSmall.css({
                "left": parseInt($smallHotspot.css("left"), 10)-smallWidth/2,
                "top": parseInt($smallHotspot.css("top"), 10)-smallHeight/2
            });
            //hotspots[currentImage][parseInt(smallRel, 10)].x
        }
    }
	function getHotspotButton(hotspot, rel){
		var num = -1;
		for(var i = 0; i<hotspotsButtons.length ; i++)
			if(hotspotsButtons[i].id == hotspot.id){
				num = i;
				break;
			}
			
		if(num == -1)
			return null;
			
		var w = parseInt(hotspotsButtons[num].width, 10);
		var h = parseInt(hotspotsButtons[num].height, 10);
		
		var $btn = $("<a href='#' rel="+rel+"></a>").css({
			"position":"absolute",
			"margin-left":Math.round(-w/2)+"px",
			"margin-top":Math.round(-h/2)+"px"
		});
		
		buttonsClass($btn, hotspotsImagesPath+hotspotsButtons[num].out, hotspotsImagesPath+hotspotsButtons[num].over, w, h, parseInt(hotspotsButtons[num].tweenTime, 10));
		
		//TOOLTIP
		if(hotspot.tooltip!="none" && hotspot.tooltip!=null){
		    var str = hotspot.tooltip;
                    
            var $tooltip = makeTooltip(str, $btn, "cont"+rel);
            currentHotspotsTooltips.push($tooltip);
		}
		
		if(hotspot.type=="link"){
			$btn.attr({"href": hotspot.content, "target" : "_blank"});
			$btn.bind(clickBind, function(){return true;});
		}
        if(hotspot.type=="small")
            $btn.bind(clickBind, function(){
                //make small hotspot
                var contentObj = hotspot.content;
                var $hotspot = $(this);
                
                var $small_content = $("<div></div>").css({
                    "width":contentObj.width,
                    "position":"absolute",
                    "padding":contentObj.padding+"px",
                    "opacity":"0"
                }).html(contentObj.html);
                
                addRoundCorners($small_content, contentObj.round_corners);
                processColorAndPattern($small_content, contentObj.background_color, contentObj.background_alpha, contentObj.background_pattern);
                
                smallTweenTime = contentObj.fadeTime;
                $imagesHolder.append($small_content.fadeTo(smallTweenTime, 1));
                
                $hotspotsSmall = $small_content;
                $smallHotspot = $hotspot;
                smallWidth = contentObj.width;
                smallHeight = $small_content.outerHeight();
                
                return false;
            });
        else if(hotspot.type == "big")
            $btn.bind(clickBind, function(){
                //make big hotspot
                var contentObj = hotspot.content;
                var $hotspot = $(this);
                var $iframe = $('<iframe src="'+contentObj.html+'" type="text/html" wmode="transparent" scrolling="auto" style="overflow:auto;" width="'+width+'" height="'+height+'" frameborder="0" allowfullscreen></iframe>');
        
                var $big_content = $("<div></div>").css({
                    "width":"100%",
                    "position":"absolute",
                    "left":"0",
                    "top":"0",
                    "-webkit-overflow-scrolling":"touch",
                    "overflow":"auto"
                }).append($iframe);//.html(contentObj.html);
                
                
                $bigContent.css({
                    "width":"100%",
                    "height":"100%",
                    "opacity":"0"
                });
                
                processColorAndPattern($bigContent, contentObj.background_color, contentObj.background_alpha, contentObj.background_pattern);
                
                //CLOSE BUTTON
                var numClose = -1;
                for(var i = 0; i<hotspotsButtons.length ; i++)
                    if(hotspotsButtons[i].id == contentObj.close_button_id){
                        numClose = i;
                        break;
                    }
                    
                if(numClose == -1)
                    return null;
                    
                var wClose = parseInt(hotspotsButtons[numClose].width, 10);
                var hClose = parseInt(hotspotsButtons[numClose].height, 10);
                
                var $closeBtn = $("<a href='#' rel="+rel+"></a>").css({
                    "position":"absolute",
                    "left":width-wClose+contentObj.closeOffsetX+"px",
                    "top":contentObj.closeOffsetY+"px"
                });
                
                buttonsClass($closeBtn, hotspotsImagesPath+hotspotsButtons[numClose].out, hotspotsImagesPath+hotspotsButtons[numClose].over, wClose, hClose, parseInt(hotspotsButtons[numClose].tweenTime, 10));
                        
                $bigContent.append($big_content, $closeBtn).stop().fadeTo(contentObj.fadeTime, 1);
                
                $closeBtn.click(function(){
                    if(panel_options.show == "roll_over")
                        $panel.removeClass("blocked").stop().fadeTo(500, 1);
                     $bigContent.stop().fadeTo(contentObj.fadeTime, 0, function(){
                         $bigContent.empty().css({
                             "width":"0",
                             "height":"0"
                         });
                     });
                     return false;
                });
                
                if(panel_options.show == "roll_over")
                    $panel.addClass("blocked").stop().fadeTo(500, 0);
                
                return false;
            });
		
		return $btn;
	}
	function clearHotspots(){
		for(var i = 0; i<currentHotspots.length ; i++){
			currentHotspots[i].addClass("disabled removing").stop().fadeTo(500, 0, function(){
				$(this).remove();
			});
		}
		for(var i = 0; i<currentHotspotsTooltips.length ; i++){
            currentHotspotsTooltips[i].stop().fadeTo(500, 0, function(){
                $(this).remove();
            });
        }
		currentHotspots = Array();
        currentHotspotsTooltips = Array();
	}
	function updateHotspots(){
		for(var i = 0; i<currentHotspots.length ; i++){
			if(hotspots[currentImage] != null){
				var hotspot = hotspots[currentImage][i];
				
				currentHotspots[i].css({
					"left" : Math.round(hotspot.x * zoomCurrent) +"px",
					"top" : Math.round(hotspot.y * zoomCurrent) +"px"
				});
				
				updateTooltipPosition(currentHotspots[i], "cont"+currentHotspots[i].attr("rel"));
			}
		}
		updateSmall();
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// BRINGS currentImage NUMBER TO FRONT
	var hotspotsTimer;
	function bringHotspots(){
        clearTimeout(hotspotsTimer);
	    if(hotspots[currentImage] != null){  
            hotspotsTimer = setTimeout(function(){
                //this image has hotspots
                if(hotspots[currentImage] != null){
                    for(var i =0; i<hotspots[currentImage].length ; i++){
                        var hotspot = hotspots[currentImage][i];
                        var $btn = getHotspotButton(hotspot, i).css({
                            "left":hotspot.x+"px",
                            "top":hotspot.y+"px",
                            "opacity":"0"
                        }).fadeTo(500, 1);
                        if($btn!=null){
                            $imagesHolder.append($btn);
                            currentHotspots.push($btn);
                        }
                    }   
                }
            }, 100);
        }
	}
	function getToFront(){
		if(currentImage >= 0 && currentImage < numImages)
			if(currentImage != oldImage){
				for(var i = 0; i<numImages ; i++){
					images[i].css("display", "none");
					
					if(include_zoom_window)
						zoom_window_images[i].css("display", "none");
				}
					
				images[currentImage].css("display", "block");
				if(include_zoom_window)
					zoom_window_images[currentImage].css("display", "block");
					
				oldImage = currentImage;
				
				clearHotspots();
				clearSmall();
				bringHotspots();
				
				changeFocus();
			}
	}
	///////////////////////////////////////////////
	
	
	
	///////////////////////////////////////////////
	// CHANGE/ADD FOCUSED IMAGE
	var focusing = false;
	var focused = false;
	var focusedNum = -1;
	function removeFocus(){
        clearTimeout(focusTimer);
		focusing = false;
		focused = false;
		focusedNum = -1;
		if($bigImage != null)
			$bigImage.remove();
	}
	function changeFocus(){
	    if(focusable){
    		removeFocus();
    		
    		if(zoom > 1 && !dragging){
    			focusTimer = setTimeout(function(){
    				updateFocus();
    			}, 500);
    		}
		}
	}
	function updateFocus(){
	    if(focusable){
            clearTimeout(focusTimer);
		    focusing = true;
		    loadBigImage();
		}
	}
	function loadBigImage(){
	    if(!dragging && focusable){
    	    if(focused)
                removeFocus();
            
    		var img = new Image();
    		var num = currentImage;
    		
    		img.onload = function() {
    			if(num == currentImage && zoom > 1){
                    if(focused)
                        removeFocus();
                        
    				focused = true;
    				focusing = false;
    				focusedNum = num;
    				
    				var $image_holder = images[num];
    				var $img = $(img);
    				
    				$img.css({
    						"width":"100%",
    						"height":"100%",
    						"position":"absolute"
    					});
            				
                        
    				$image_holder.append($img);
    				$bigImage = $img;
    			}
    		};
    		
    		img.src = (imagesBigPath+imagesSrc[num]);
		}
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// CALCULATES DEGREES ACCORDING TO SPEED
	var goToDegreeNum, goToDegree = false;
	function calculateDegree(){
		if(!dragging && !goToDegree && !draggingPlaybackSlider){
			var degreeEase = ((speedDegDefault-speedDeg)/ease);
			speedDeg += degreeEase;
			
			degrees += Math.round(speedDeg);
		}
		else if(goToDegree){
		    var degreeEase;
		    if(draggingPlaybackSlider)
			    degreeEase = ((goToDegreeNum-degrees));
			else
                degreeEase = ((goToDegreeNum-degrees)/ease);
			//speedDeg += degreeEase;
			
			degrees += degreeEase;
			
			if(Math.round(degrees) == goToDegreeNum){
				goToDegree=false;
				degrees = Math.round(degrees);
			}
		}
		
		while(degrees > 360)
			degrees -= 360;
		while(degrees < -360)
			degrees += 360;
		
		var degreesCalc = degrees;
		if(degrees < 0)
			degreesCalc = 360+degrees;
			
		currentImage =  Math.round((degreesCalc/360)*numImages);
		if(reverse){
			if(currentImage != 0)
				currentImage = numImages-currentImage;
		}
		
		getToFront();
			
		if($playbackSlider != null){
				
			updateTooltipPosition($playbackSlider, "playback-slider");
			changeTooltipText("playback-slider", getHint("rotate_slider"));
			
			if(!draggingPlaybackSlider){
				//minZoom - maxZoom
				// 0 - (maxZoom - minZoom)
				var percentage = Math.abs(degreesCalc)/360;
				var pos = percentage*playbackSliderWidth - panel_options.dragger_width/2;
				
				//var curr = parseInt($playbackSlider.css("left"));
				//var sum = ((pos-curr)/ease);
					
				$playbackSlider.css({
					"left":pos+"px"
				});
			}
		}
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// CALCULATES ZOOM 
	function calculateZoom(){
		
		//CALCULATE WIDTH AND HEIGHT ACCORDING TO ZOOM
		if(zoom < minZoom)
			zoom = minZoom;
		if(zoom > maxZoom)
			zoom = maxZoom;
			
		var zoomAdd = ((zoom-zoomCurrent)/zoomEase);
		zoomCurrent += zoomAdd;
		
		currentWidth = Math.round(iniWidth*zoomCurrent);
		currentHeight = Math.round(iniHeight*zoomCurrent);
			
			
		//CALCULATE LEFT AND TOP POSITION
		var excessWidth = (currentWidth - width)/2 ;  
		var excessHeight = (currentHeight - height)/2 ;  
		posX = Math.round(-excessWidth);
		posY = Math.round(-excessHeight);
		
		viewLeft += viewLeft * (zoomCurrent-zoomWhenPad)/2;
		viewTop += viewTop * (zoomCurrent-zoomWhenPad)/2;
		zoomWhenPad = zoomCurrent;
		
		var viewLeftCurrentAdd = ((viewLeft-viewLeftCurrent)/paddingEase);
        var viewTopCurrentAdd = ((viewTop-viewTopCurrent)/paddingEase);
        viewLeftCurrent += viewLeftCurrentAdd;
        viewTopCurrent += viewTopCurrentAdd;
		
		var toX = Math.round(posX-viewLeftCurrent);
		var toY = Math.round(posY-viewTopCurrent);
		
		if(toX > 0){
			viewLeft = posX; 
			toX = 0;
		}
		else if(toX < -excessWidth*2){
			viewLeft = -posX; 
			toX = -excessWidth*2;
		}
		
		if(toY > 0){
			viewTop = posY; 
			toY = 0;
		}
		else if(toY < -excessHeight*2){
			viewTop = -posY; 
			toY = -excessHeight*2;
		}
		
		if((focused || focusing) && zoom <= 1)
			removeFocus();
		else if(!focusing && !focused && zoom > 1)
			updateFocus();
		
		$imagesHolder.css({
			"width":currentWidth+"px",
			"height":currentHeight+"px",
			"left":toX + "px",
			"top":toY + "px"
		});
		
		if(include_zoom_window){
			$zoomWindowBox.css({
				"width": Math.round((zoom_window_width-relativeExcessW)/zoomCurrent) +"px",
				"height": Math.round((zoom_window_height-relativeExcessH)/zoomCurrent) +"px",
				"top": Math.round(-toY*(zoom_window_height/currentHeight))+"px",
				"left": Math.round(-toX*(zoom_window_width/currentWidth))+"px"
			});
		}
		
		
		if($zoomSlider != null){
			updateTooltipPosition($zoomSlider, "zoom-slider");
			changeTooltipText("zoom-slider", getHint("zoom_slider"));
			
			if(!draggingZoomSlider){
				//minZoom - maxZoom
				// 0 - (maxZoom - minZoom)
				var percentage = (zoomCurrent-minZoom)/(maxZoom -minZoom);
				var pos = percentage*sliderWidth - panel_options.dragger_width/2;
					
				$zoomSlider.css({
					"left":pos+"px"
				});
				
				if(zoom == minZoom)
					disableButton($zoomMinus);
				else 
					enableButton($zoomMinus);
					
				if(zoom == maxZoom)
					disableButton($zoomPlus);
				else 
					enableButton($zoomPlus);
			}
		}
	}
	///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// UPDATE IMAGE SHOWING
	var showedHotspots = false;
	function updateImage(){
		
		if(!singleImage)
		    calculateDegree();
		else if(!showedHotspots){
            bringHotspots();
            showedHotspots = true;
        }
		
		if(minZoom != maxZoom){
    		if(Math.round(zoom*1000) != Math.round(zoomCurrent*100))
    		  calculateZoom();
        }
		  
		updateHotspots();
		
		if(dragging){
			var dif = positionClickedX - currentX;
			var change = dif-oldDif;
			
			speedDeg = Math.round(change*inertia);
			oldDif = dif;
			
			degrees = degWhenClicked + dif;
			
			//speedInc = Math.round(change);
		}
		
		var panable = false;
		var w = Math.round(iniWidth*zoom);
		var h = Math.round(iniHeight*zoom);
		if(w>width || h>height)
			panable = true;
			
		if(include_zoom_window){
			if(panable && !zoomWindowEnabled){
				$zoomWindow.css("display", "block").stop().fadeTo(500, 1);
				zoomWindowEnabled=true;
			}
			else if(!panable && zoomWindowEnabled){
				$zoomWindow.stop().fadeTo(500, 0, function(){$zoomWindow.css("display", "none")});
				zoomWindowEnabled=false;
			}
		}
		
		if(!panable && mode=="pan")
			mode = "rotate";
		if($panButton != null){
			if(mode=="pan" || !panable)
				disableButton($panButton);
			else
				enableButton($panButton);
		}
		if($rotateButton != null){
			if(mode=="rotate")
				disableButton($rotateButton);
			else
				enableButton($rotateButton);
		}
		
		setTimeout(updateImage, refreshRate);
	}
	///////////////////////////////////////////////
	
	
	
    ///////////////////////////////////////////////
    // CONTROL FUNCTION
    this.goTo = function(degree){
        goToDegree = true;
        goToDegreeNum = degree;
    }
    this.zoomTo = function(zoomToNum){
        zoom = zoomToNum;
    }
    ///////////////////////////////////////////////
	
	
	///////////////////////////////////////////////
	// BUTTONS ENABLE AND DISABLE
	function disableButton($btn){
		if( !$btn.hasClass("disabled") ){
			$btn.addClass("disabled");
			$btn.stop().fadeTo(300, buttonsDisabledAlpha);
			$("span", $btn).stop().fadeTo(300, 0); 
			$btn.css("cursor", "default");
		}
	}
	function enableButton($btn){
		if($btn.hasClass("disabled")){
			$btn.removeClass("disabled");
			$btn.stop().fadeTo(300, 1);
            $btn.css("cursor", "pointer");
		}
	}
	///////////////////////////////////////////////
	
	
	
	///////////////////////////////////////////////
	//HELPING FUNCTIONS
	function processFont(object, font, color, size){
		object.css({	"font-family" : font,
					"color" : color,
					"font-size" : size +"px"
				});
	}
	function addRoundCorners(object, value){
		object.css({	"-webkit-border-radius" : value,
					"-moz-border-radius" : value,
					"-o-border-radius" : value,
					"border-radius" : value
				});
	}
	function processColorAndPattern(object, color, alpha, pattern){
		//	color attributes
		if(alpha != "0" && alpha != 0){
			var filter = getFilter(color, alpha);
			var rgba = getRGBA(color, alpha);
			
			object.css({	"background-color" : color,
						"filter" : filter,
						"background" : rgba
					});
			
		}
		//	pattern attributes
		if(pattern != "none")
			object.css({	"background-image" : "url("+pattern+")",
						"background-repeat" : "repeat"
					  });
	}
	
	function getFilter(color, alpha){
		var color_alpha = parseInt((parseFloat(alpha, 10)*255)).toString(16);
		var filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr=#"+color_alpha+color.substring(1, 3)+color.substring(3, 5)+color.substring(5, 7)+
										",endColorstr=#"+color_alpha+color.substring(1, 3)+color.substring(3, 5)+color.substring(5, 7)+")";
		
		return filter;
	}
	function getRGBA(color, alpha){
		var rgba = "rgba("+color.substring(1, 3)+", "+color.substring(3, 5)+", "+color.substring(5, 7)+", "+alpha+")";
		return rgba;
	}
	Array.prototype.remove = function(e) {
	    var t, _ref;
	    if ((t = this.indexOf(e)) > -1) {
	        return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
	    }
	};
	///////////////////////////////////////////////
};
