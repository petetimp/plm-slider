var plmSlider = {
	
	/**
	 * Number of slides in DOM
	 * @return - number of slides
   	 **/
	numSlides : 
		function(){
			return $( "#plm-slider .wow").length;
		},
		
	slideInterval: {},
						
	runSlides: 8000,
						
	inAnimation: "",
						
	outAnimation: "",
	
	firstRun: true,
	
	pauseOnHover:true,
	
	arrows:false,
	
	dots: false,

	sliderAnimate : 
		function(){
		    if(this.firstRun){
			    plmSlider.slideInterval = setInterval(this.moveSlider,1000);//starts slider on page load after 1 second
		    }else{
		        plmSlider.slideInterval = setInterval(this.moveSlider,this.runSlides);    
		    }
		},
	
	/**
	 * Inital function that fires as soon as document is ready. Sets required properties from config object, events, and makes call to start slide
   	 **/	
	init:
		function(config){
			for (prop in config){
				if (config.hasOwnProperty(prop)) {
					this[prop] = config[prop];
				}
			}

			if(this.dots){ this.createDots(); }
			
			if(this.arrows){ $(".arrow").show(); }

			this.sliderAnimate();
			this.setEvents();
		},

	/**
	 * Sets up required event handlers for plmSlider components
	 **/	
	setEvents:
		function(){
			//Pressed the left arrow
			$(".arrow-left").click(
				function(){
					clearInterval(plmSlider.slideInterval);
					var id = "#" + $('.currSlide').attr("id");
                    plmSlider.moveSlider(id, "prev");
				}
			);
			
			//Pressed the right arrow
			$(".arrow-right").click(
				function(){
					clearInterval(plmSlider.slideInterval);
					var id = "#" + $('.currSlide').attr("id");
					plmSlider.moveSlider(id, "next");
				}
			);
			
			//Stops slider on mouseenter. Starts slider on mouseleave.
			$("#plm-slider").hover(
				function(){
				    if(plmSlider.pauseOnHover){
					    clearInterval(plmSlider.slideInterval);
				    }else{
				        return false;//if we aren't pausing on hover, don't clear interval
				    }
				},
				function(){
				    if(plmSlider.pauseOnHover){
					    plmSlider.slideInterval = setInterval(plmSlider.moveSlider, plmSlider.runSlides);
				    }else{
				        return false;//if we aren't pausing on hover, don't run interval
				    }
				}
			);
			
			//Pressed a dot
			$(document).on("click", "#slideDots li",
				function(){
					var currentSlide = "#" + $('.currSlide').attr("id");
					var futureSlide = $(this).attr("data-slide");
					var currentSlideNum = Number(currentSlide.substring(currentSlide.indexOf('-') + 1));
					var futureSlideNum = Number(futureSlide.substring(futureSlide.indexOf('-') + 1));
					var direction;
				
					if(currentSlideNum < futureSlideNum ){//moving foward
						direction = 'forwardDot';
					}else if(currentSlideNum  > futureSlideNum ){//moving backward
						direction = 'backwardDot';
					}else{//same slide - do nothing
						return false;
					}
					
					clearInterval(plmSlider.slideInterval);
					$(this).addClass("future");//this is used as a hook to navigate to the specific slide
					
					plmSlider.moveSlider(currentSlide,direction);
				}
			);
		},
	
	/**
	 * Creates dots that navigate to specific slides
	 **/
	createDots:
		function(){
			var numSlides = this.numSlides();
			var dotsHTML = "<ul id='slideDots'>";
			
			for(var i = 0; i < numSlides; i++){
				dotsHTML += "<li data-slide='#slide-" + Number(i+1) + "'><i class='fa fa-circle-o' aria-hidden='true'></i></li>";
			}
			
			dotsHTML += "</ul>";
			
			$(dotsHTML).appendTo($('#plm-slider'));
		},
		
	/**
	 * Determines direction of slide, sets appropriate animations, if we are on a edgeSlide or other slide, and fires slide animation
	 * @param id - {{string}} id selector of current slide
	 * @param direction - {{string}} direction slide is going. will be 'prev' or 'next'
	 **/	
	moveSlider:
		function(id, direction){
			var id = id || "#" + $('.currSlide').attr("id");
			var direction = direction || "next";
			var edgeSlide = false;
			//With the exception of the first time the slider runs, this block sets the 'out' animation for the current slide 
			if(!plmSlider.firstRun){
			    plmSlider.setOutAnimation($(".currSlide"));
			}else{
			    plmSlider.setInAnimation($('#slide-1'));//set the 'in' animation the first time the slider runs
			    if(plmSlider.dots){
			    	$('[data-slide="#slide-1"]').addClass("future");
			    	plmSlider.syncDots();
			    }
			}
			
			//In this code block we are setting appropriate animations based on slide direction and handling exception slides (first,last)
			if($(".wow:first").hasClass("currSlide") && (direction == "prev" || direction == "backwardDot")){//We're moving from the first slide to the last one
				edgeSlide = true;
				plmSlider.setInAnimation($("#slide-" + plmSlider.numSlides()));
				if(plmSlider.dots){
					$('[data-slide="#slide-' + plmSlider.numSlides() + '"]').addClass("future");
				}
			}else if($(".wow:last").hasClass("currSlide") && (direction == "next" || direction == "forwardDot")){//We're moving from the last slide to the first one
			    edgeSlide = true;
			    plmSlider.setInAnimation($("#slide-1"));
			    if(plmSlider.dots){
					$('[data-slide="#slide-1"]').addClass("future");
			    }
			}else{
			    if(direction == "prev"){//we're moving backward
				    plmSlider.setInAnimation($(".currSlide").prev());
				    if(plmSlider.dots){
				    	$('[data-slide="#' + $(".currSlide").prev().attr("id") + '"]').addClass("future");
				    }
			    }else if(direction == "next"){
			        plmSlider.setInAnimation($(".currSlide").next());//we're moving forward
			        if(plmSlider.dots){
			        	$('[data-slide="#' + $(".currSlide").next().attr("id") + '"]').addClass("future");
			        }
			    }else{//forward or backward with dot press
			    	plmSlider.setInAnimation($($(".future").attr("data-slide")));	
			    }
			}
		    
		    //this only happens the first time the slider runs when the page loads.
		    if(plmSlider.firstRun){
		        plmSlider.firstRun = false;
		        $("#slide-1").addClass('currSlide');
		        setTimeout(function(){$('#slide-1').show()},1000);//we set a timeout so that the 'out' and 'in' animations have time to show
		        plmSlider.triggerWow();
		        clearInterval(plmSlider.slideInterval);//clear the interval so that we can go to default interval
		        plmSlider.slideInterval = setInterval(plmSlider.moveSlider, plmSlider.runSlides);
		    }else{//normal progression
			    plmSlider.triggerWow();
    			setTimeout(
    			    function() {
    			        $(id).hide().removeClass("currSlide");
    			        if(direction == "next"){//moving forward
            				if(edgeSlide){//moving from last to first slide
            					$("#slide-1").show().addClass("currSlide");	
            				}else{
            					$(id).next().show().addClass("currSlide");//moving forward from slide to slide
            			    }	
            			}else if(direction == "prev"){//moving backward
            				if(edgeSlide){//moving from first to last slide
            					$("#slide-" + plmSlider.numSlides()).show().addClass("currSlide");	
            				}else{
            					$(id).prev().show().addClass("currSlide");//moving backward from slide to slide
            				}
    			        }else if(direction == "backwardDot"){//backward with dot press
    			        	if(edgeSlide){//moving from first to last slide
            					$("#slide-" + plmSlider.numSlides()).show().addClass("currSlide");	
            				}else{
            					$($(".future").attr("data-slide")).show().addClass("currSlide");//moving backward
            				}	
    			        }else{//forward with dot press
    			        	if(edgeSlide){//moving from last to first slide
            					$("#slide-1").show().addClass("currSlide");	
            				}else{
            					$($(".future").attr("data-slide")).show().addClass("currSlide");//moving forward
            			    }			
    			        }
    			        
    			        if(plmSlider.dots){ plmSlider.syncDots(); }
			            
    			    }, 1000 //we set a timeout so that the 'out' and 'in' animations have time to show
    			);
		    }
		},
		
	/**
	 * Toggles the circle icon for active/inactive state
	 **/	
	syncDots:
		function(){
			$('#slideDots li i').each(
				function(){
					$('#slideDots li i').removeClass("fa-circle").addClass('fa-circle-o')	
				}
			);
			$('#slideDots li.future i').removeClass("fa-circle-o").addClass("fa-circle");
			$('.future').removeClass("future");
		},	
		
	/**
	 * Triggers WOW required for animation
	 **/	 
	triggerWow:
		function(){
			try{
				new WOW().init();
			}catch(error){
				console.error("Please include the WOW.js library");
			}
			 $('.wow').each(
                function(){
                    $(this).removeClass('animated');//get rid of extra 'animated' classes for cosmetic purposes
                }    
            );
		},
		
	/**
	 * Convenience method for changing slide to out animation
	 * @param {{object}} the slide where the animation change is occurring
	 **/	
	setOutAnimation:
	    function(elem){
	        elem.removeClass(plmSlider.inAnimation).css("animation-name",plmSlider.outAnimation).addClass(plmSlider.outAnimation);    
	    },
	    
	/**
	 * Convenience method for changing slide to out animation
	 * @param {{object}} the slide where the animation change is occurring
	 **/
	setInAnimation:
	    function(elem){
	        elem.removeClass(plmSlider.outAnimation).css("animation-name",plmSlider.inAnimation).addClass(plmSlider.inAnimation);    
	    }

};