/*
* Zoomy 1.3.2 a2 - jQuery plugin
* http://redeyeops.com/plugins/zoomy
*
* Copyright (c) 2010 Jacob Lowe (http://redeyeoperations.com)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* Built for jQuery library
* http://jquery.com
*
* Addition fixes and modifications done by Larry Battle ( blarry@bateru.com )
* Code has been refactored and the logic has been corrected.
*
*/


(function ($) {
        
// global zoomys state, Indexed, 0 = no zoom, 1 = zoom;
    
    'use strict';
    var ZoomyS = {
	    count : []
    };
	
	
    $.fn.zoomy = function (event, options) {

	//defaults && option list
	    var defaults = {
		    zoomSize: 200,
		    round: true,
		    glare: true,
		    clickable: false,
		    attr: 'href',
		    zoomInit: null,  //callback for when zoom initializes
		    zoomStart: null, // callback for when zoom starts
		    zoomStop: null // callback for when the zoom ends
	    },
		    defaultEvent = 'click',
		    
		    get = {
			    ratio : function (x, y) {
				    var z = x / y;
				    return z;
			    },
			    position : {
				    stop : function (x, stop, zoomSize) {
						var p = (x - zoomSize) + stop;
						return p;
				    },
				
				    mouse : function (x, y, halfSize) {
					
					    var p = x - y - halfSize;	
					    return p;
					
				    },
				    
				    zoom : function (x, y, z, halfSize) {
					
					    var p = Math.round((x - y) / z) - halfSize;
					    return p;
					
				    }
			    },
			    
			    // Collision Object
			    
			    colObj : function (a, b, c, d) {
				
				    var bgPos = '-' + a + 'px ' + '-' + b + 'px',
					    o = {
						    backgroundPosition: bgPos,
						    left: c,
						    top: d
					    };
				    return o;
			    }
		    },
		    
		    change = {
			
				// Move Zoom Cursor
				
				move : function (zoom, e) {
				    
				    var id = zoom.attr('rel'),
					    param = ZoomyS[id].params,
					    posX = get.position.mouse(e.pageX, param.offset.left, param.half),
					    posY = get.position.mouse(e.pageY, param.offset.top, param.half),
					    leftX = get.position.zoom(e.pageX, param.offset.left, param.ratioX, param.half),
					    topY = get.position.zoom(e.pageY, param.offset.top, param.ratioY, param.half),
					    zoomX = param.zoomX,
					    zoomY = param.zoomY,
					    stop = param.stop,
					    bottomStop = param.bottomStop,
					    rightStop = param.rightStop,
					    
					    // Collision Detection Possiblities
					    
					    arrPosb = {
						
						// In the Center
						
						    0 : [leftX, topY, posX, posY],
						    
						// On Left Side
						
						    1 : [0, topY, -stop, posY],
						    
						// On the Top Left Corner
						
						    2 : [0, 0, -stop, -stop],
						    
						//On the Bottom Left Corner
						
						    3 : [0, zoomY, -stop, bottomStop],
						    
						// On the Top
						
						    4 : [leftX, 0, posX, -stop],
						    
						//On the Top Right Corner
						
						    5 : [zoomX, 0, rightStop, -stop],
						    
						//On the Right Side
						    
						    6 : [zoomX, topY, rightStop, posY],
						    
						
						//On the Bottom Right Corner
						
						    7 : [zoomX, zoomY, rightStop, bottomStop],
						    
						//On the Bottom    
						
						    8 : [leftX, zoomY, posX, bottomStop]
					    },
					    
					    // Test for collisions
					    
					    a = -stop <= posX,
					    e2 = -stop > posX,
					    b = -stop <= posY,
					    f = -stop > posY,
					    d = bottomStop > posY,
					    g = bottomStop <= posY,
					    c = rightStop > posX,
					    j = rightStop <= posX,
					    
					    
					    // Results
					    
					    cssArrIndex = (a && b && c && d) ? 0 : (e2) ? (b && d) ? 1 : (f) ? 2 : (g) ? 3 : null : (f) ? (c) ? 4 : 5 : (j) ? (d) ? 6 : 7 : (g) ? 8 : null,
					    
					    //Create CSS object to move Zoomy
					    
					    move = get.colObj(arrPosb[cssArrIndex][0], arrPosb[cssArrIndex][1], arrPosb[cssArrIndex][2], arrPosb[cssArrIndex][3], arrPosb[cssArrIndex][4], arrPosb[cssArrIndex][5]);
					    
					    
					    //Uncomment to see Index number for collision type
					    //console.log(cssArrIndex)
					    
				    // And Actual Call
					    
				    zoom.css(move || {});
	
			    },
			    
			    // Change classes for original image effect
			    
			    classes : function (ele) {
				    var i = ele.find('.zoomy').attr('rel');
				    if (ZoomyS[i].state === 0 || ZoomyS[i].state === null) {
					
					    ele.removeClass('inactive');
					    
				    } else {
					
					    ele.addClass('inactive');
					    
				    }
			    },
			    
			    // Enter zoom area start up Zoom again
	    
			    enter : function (ele, zoom) {
				    var i = zoom.attr('rel');
				    ZoomyS[i].state = 1;
				    zoom.css('visibility', 'visible');
				    change.classes(ele);
			    },
			    
			    // Leave zoom area
			    
			    leave : function (ele, zoom, x) {
				    var i = zoom.attr('rel');
				    if (x !== null) {
					    ZoomyS[i].state = null;
				    } else {
					    ZoomyS[i].state = 0;
				    }
				    zoom.css('visibility', 'hidden');
				    change.classes(ele);
			    },
			    
			    // Callback handler (startZoom && stopZoom)
			    
			    callback : function (type, zoom) {
				    var callbackFunc = type,
					    zoomId = zoom.attr('rel');
				
				    if (callbackFunc !== null && typeof callbackFunc === 'function') {
					    
					    callbackFunc(ZoomyS[zoomId]);
					    
				    }
				
			    }
			
			
		    },
		    
		    // Styling Object, holds pretty much all styling except for some minor tweeks
		    
		    style = {
			
			    round : function (x) {
					if (!options.round) {
						return "";
					} else {
						var cssObj = {};
						if (x === undefined) {
							cssObj['-webkit-border-radius'] = cssObj['-moz-border-radius'] = cssObj['border-radius'] = options.zoomSize / 2 + 'px';
						} else {
							cssObj['-webkit-border-radius'] = cssObj['-moz-border-radius'] = cssObj['border-radius'] = options.zoomSize / 2 + 'px ' + options.zoomSize / 2 + 'px 0px 0px';
						}
						
						if ($.browser.msie && parseInt($.browser.version, 10) === 9) {
							$('.zoomy').find('span').css('margin', '0');
						}
						
						return cssObj;
		    
					}
			    },
			
			    glare : function (zoom) {
				    zoom.children('span').css({
					    height: options.zoomSize / 2,
					    width: options.zoomSize - 10
				    }).css(style.round(0));
			    },
			    
			    // Store some static variables For change.move
			    
			    store : function (ele, zoom) {
				
				    var id = zoom.attr('rel'),
					    dimensions = {
						
						    zoomImgX : ZoomyS[id].zoom.x,
						    zoomImgY : ZoomyS[id].zoom.y,
						    tnImgX : ZoomyS[id].css.width,
						    tnImgY : ZoomyS[id].css.height,
						    zoomSize : options.zoomSize,
						    halfSize : options.zoomSize / 2
				
					    },
					    
					    ratio = get.ratio(dimensions.tnImgX, dimensions.zoomImgX),
					    
					    stop = Math.round(dimensions.halfSize - (dimensions.halfSize * ratio)),
					    
					    params = {
						
						    offset : ele.offset(),
						    ratioX : ratio,
						    ratioY : get.ratio(dimensions.tnImgY, dimensions.zoomImgY),
						    zoomY : dimensions.zoomImgY - dimensions.zoomSize,
						    zoomX : dimensions.zoomImgX - dimensions.zoomSize,
						    stop : stop,
						    rightStop : get.position.stop(dimensions.tnImgX, stop, dimensions.zoomSize),
						    bottomStop : get.position.stop(dimensions.tnImgY, stop, dimensions.zoomSize),
						    half : dimensions.halfSize
							    
					    };
				    
				    ZoomyS[id].params = params;
			    },
			    
			    params : function (ele, zoom) {
				    var img = ele.children('img'),
				    
					    // TODO: Create function to filter out percents
					    
					    margin = {
							'marginTop': img.css('margin-top'),
							'marginRight': img.css('margin-right'),
							'marginBottom': img.css('margin-bottom'),
							'marginLeft': img.css('margin-left')
					    },
						
					    floats = {
						    'float': img.css('float')
					    },
					    
					    //Zoomy needs these to work
					    
					    zoomMin = {
						    'display': 'block',
						    height: img.height(),
						    width: img.width(),
						    'position': 'relative'
						
					    },
					    
					    //A lil bit of geneology o.0
					    
					    parentCenter = function () {
						    
						    //Checking for parent text-align center
						    
						    var textAlign = ele.parent('*:first').css('text-align');
						    if (textAlign === 'center') {
							    margin.marginRight = 'auto';
							    margin.marginLeft = 'auto';
							
						    }
	
					    },
					    id = zoom.attr('rel'),
					    css = {};
					    
				    
				    
				    if (floats['float'] === 'none') {
					    parentCenter();
				    }
				    
				    $.extend(css, margin, floats, zoomMin);
				    
				    ZoomyS[id].css = css;
			
				    if (!options.glare) {
					    zoom.children('span').css({
						    height: options.zoomSize - 10,
						    width: options.zoomSize - 10
					    });
				    }
			
				    
				    zoom.css({
					    height: options.zoomSize,
					    width: options.zoomSize
				    }).css(style.round());
			    
			
			
				    img.css('margin', '0px');
			
			
				    
				    ele.css(css);
				    
				    
				    style.store(ele, zoom);

		    
			    }
			
			
			
		    },
		    
		    // Build Object, Elements are added to the DOM here
		    
		    build = {
			
			    // Load Zoom Image
			    
			    image : function (image, zoom) {
				    var id = zoom.attr('rel');
				    //Move the Zoomy out of the screen view while loading img
				    zoom.show('').css({top: '-999999px', left: '-999999px'});
			
				    if (zoom.find('img').attr('src') !== image) {
					    zoom.find('img').attr('src', image).load(function () {
						    ZoomyS[id].zoom = {
							    'x': zoom.find('img').width(),
							    'y': zoom.find('img').height()
						    };
	
						    if (options.glare) {
							
								zoom.append('<span/>')
									.css({
										'background-image': 'url(' + image + ')'
									})
									.find('img')
									.remove();
								
								style.glare(zoom);
								
						    } else {
								
								zoom.css({
									'background-image': 'url(' + image + ')'
								})
								    .find('img')
								    .remove();
						    }
						    
					    }).each(function () {
						
						    if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
							
							    $(this).trigger("load");
							    
						    }
					    });
			
				    }
			    },
			    
			    // Add zoom element to page
			    zoom : function (ele, i) {
				
				    //Adding Initial State  
				    
				    ZoomyS[i] = {
					    state: null,
					    index : i
				    };
				    
				    ZoomyS.count.push(0);
				    
				    // Picking from the right attibute
				    
				    var attribute = function () {
					    if (typeof (ele.attr(options.attr)) === 'string' && options.attr !== 'href') {
						    return ele.attr(options.attr);
					    } else {
						    return ele.attr('href');
					    }
				    },
				    
					    image = attribute(),
					    zoom = null,
					    initCallback = options.zoomInit,
					    eventHandler = function () {
						    var eventlist = [],	//List of Actual Events
							    zoomStart = function () {
								    change.enter(ele, zoom);
										    
								    /* Start Zoom Callback */
										
								    change.callback(options.zoomStart, zoom);
							    },
							    zoomStop = function (x) {
								    change.leave(ele, zoom, x);
										    
								    /* Start Zoom Callback */
										
								    change.callback(options.zoomStop, zoom);
							    },
							    events = {		//List of Possible Events
								    event: function (e) {
									
									    if (!options.clickable) {
										    e.preventDefault();
									    }
									
									    if (ZoomyS[i].state === 0 || ZoomyS[i].state === null) {
									       
										    zoomStart();
										    
										    //Fix on click show and positioning issues
										    
										    change.move(zoom, e);
										
									    } else if (ZoomyS[i].state === 1 && event !== 'mouseover' && event !== 'mouseenter') {
										    
										    zoomStop(0);
										
									    }
									    
									    
									    
								    },
								    'mouseover': function () {
									    if (ZoomyS[i].state === 0) {
										    zoomStart();
									    }
								
								    },
								    'mouseleave': function () {
								
									    if (ZoomyS[i].state === 1) {
										
										    zoomStop(null);
											    
									    }
									
								    },
								    'mousemove': function (e) {
									    if (ZoomyS[i].state !== 0 && ZoomyS[i].state !== null) {
									    
										    change.move(zoom, e);
									    
									    }
									
								    },
								    'click': function (e) {
									    e.preventDefault();
								    }
							    };
						    
						    
						    
						    
						    // Making sure there is only one mouse over event & Click returns false when it suppose to
						    
						    if (event === 'mouseover') {
							    eventlist[event] = events.event;
						    } else {
							    eventlist[event] = events.event;
							    eventlist.mouseover = events.mouseover;
						    }
						    
						    if (!options.clickable && event !== 'click') {
							    eventlist.click = events.click;
						    }
						    eventlist.mousemove = events.mousemove;
						    eventlist.mouseleave = events.mouseleave;
						    
						    
						    
						    // Binding Events to element
						    
						    ele.bind(eventlist);
						
					    };
					    
				    eventHandler();
					
				    //Creating Zoomy Element
				    ele.addClass('parent-zoom').append('<div class="zoomy zoom-obj-' + i + '" rel="' + i + '"><img id="tmp"/></div>');
				    
				    
				    //Setting the Zoom Variable towards the right zoom object
				    
				    zoom = $('.zoom-obj-' + i);
					    
				    
				    if (initCallback !== null && typeof initCallback === 'function') {
					    initCallback(ele);
				    }
				    
				    
				    
				    // Load zoom image 
				    
				    build.image(image, zoom);
				    
				    
				    
				    // Set basic parameters
				    
				    style.params(ele, zoom);
				    
				    
				
			    },
			    
			    
			    // Initialize element to add to page, check for initial image to be loaded
			    
			    init : function (ele, img) {
				    
				    
				    img.one("load", function () {
					
					    // Ready to build zoom
			    
					    build.zoom(ele, ZoomyS.count.length);
			    
				    }).each(function () {
			
					    if (this.complete || ($.browser.msie && parseInt($.browser.version, 10) === 6)) {
				
						    $(this).trigger("load");
				    
					    }
				    });
				
			    }
			
			
			
		    };

	    

		    
		    
		    
		    
	    //Fallback if there is no event but there are options
	
	    if (typeof (event) === 'object' && options === undefined) {
		
		    options = event;

		    event = defaultEvent;
		    
	    } else if (event === undefined) {
		
		    event = defaultEvent;
		    
	    }
	
	    //overriding defaults with options
	
	    options = $.extend(defaults, options);
	    

	    $(this).each(function () {
		
		    var ele = $(this),
			    img = ele.find('img');
			    
			    
		    // Start Building Zoom
		
		    build.init(ele, img);
		   
		    
	    });
	    
	    
    

    };
    
    
}(jQuery));