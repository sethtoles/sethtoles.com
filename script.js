var $root = $("html, body"),
	$window = $(window),
	transform = (typeof(document.body.style.webkitTransform)) ? "-webkit-transform" : (typeof(document.body.style.msTransform)) ? "-ms-transform" : "transform";

function sizeWatch(){
	var	winHeight = $window.height(),
		winWidth = $window.width(),
		winRatio = winWidth/winHeight,
		maxSplHeight = winWidth/1.647,
		rbc = $("a.rowButtonCurrent")[0],
		$splash = $("#splash").height((winRatio < 1.647) ? winHeight : maxSplHeight + ((winHeight - maxSplHeight) * 0.35));
	$("div.icon").css({"width": ((winRatio < 1.2) ? "14%" : (.168 * winHeight)), "top": ((winRatio < 1.647) ? "" : (.6 * maxSplHeight) + "px")
	});
	$("#splashSpacer").height(winHeight);
	if($("#dcBox:visible")[0]){dcBoxPosition();}
	if(rbc){
		$("#overlay").css({transform: "translate(0,-" + $($.attr(rbc, "href")).outerHeight() + "px)"});
		contentRowHeight();
	}
	//window.scrollTo(0, $("#splashSpacer").offset().top);
}

function scrollWatch(){
	if($("#dcBox:visible")[0]){dcBoxPosition();}
	var scrollTop = $window.scrollTop(),
		topMargin = 30,
		sidebar = $("#sidebar"),
		sidebarHeight = sidebar.height() + (2 * parseFloat(sidebar.css("marginTop"))),
		listHeight = $("main").outerHeight();
	if($("#splashSpacer").offset().top < scrollTop + topMargin){
		sidebar.css({"position": "absolute", "top": listHeight - sidebarHeight + "px"});
	}else{
		var categories = $("section.category");
		if(sidebarHeight + scrollTop > listHeight){
			sidebar.css({"position": "absolute", "top": listHeight - sidebarHeight + "px"});
		}else{
			sidebar.css({"position": "fixed", "top": ""});
		}
		for(var i = 0; i < categories.length; i++){
			var category = categories.get(i);
				fromTop = $(category).offset().top;
			if(fromTop < scrollTop + topMargin && scrollTop + topMargin < fromTop + $(category).height()){
				if(!$(category).hasClass("navCurrent")){
					$("li.navCurrent").removeClass("navCurrent");
					$("#N"+category.id).addClass("navCurrent");
				}
			}
		}
	}
}

function dcBoxPosition(source, cb){
	var scrY = $window.scrollTop() + 45,
		detail = source || $(".detailOpen"),
		dtlY = detail.offset().top,
		dtlH = detail.height(),
		dcBox = $("#dcBox"),
		dcbH = dcBox.height();
		if(dtlY > scrY){
			dcBox.css({"position": "absolute", "top": dtlY + "px"});
		}else if(dtlY + dtlH - dcbH < scrY){
			dcBox.css({"position": "absolute", "top": dtlY + dtlH - dcbH + "px"});
		}else{
			dcBox.css({"position": "fixed", "top": "45px"});
		}
		if(cb && typeof(cb) == "function"){
			cb();
		}
}

function contentRowHeight(){
	$("#resume, #about, #hire").css({"max-height": $window.height() - $("#buttonRow").height() + "px"});
}

var cLocSaver = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
}());
		
$(document).ready(function(){
	sizeWatch();
	scrollWatch();
	$("#email").text("sethtoles@gmail.com");
	$("#cell").text("(202) 494-7456");
	$window.resize(function(){sizeWatch()});
	$(document).scroll(scrollWatch);
	$("a.scroll").click(function(e){
			$target = $($.attr(this, "href"));
			$root.animate({
	        scrollTop: $target.offset().top - $target.height()/3.3
	    }, 800);
		e.preventDefault();
	});
	$("a.rowButton").click(function(e){
		if(!$(this).hasClass("rowButtonCurrent")){
			contentRowHeight(); //MOVE THIS TO EVENT AFTER RESIZE!!
			var rbc = $("a.rowButtonCurrent")[0];
			if(rbc){
				var animate = true;
				$(rbc).removeClass("rowButtonCurrent");
			}
			$("#dimmer").addClass("dim");
			var $this = $(this).addClass("rowButtonCurrent"),
				href = $this.attr("href"),
				move = (href == "#resume") ? 0 : (href == "#about") ? -33.333 : -66.666,
				winHeight = $window.height();
			animate ? $("#contentRow").css({transform: "translate(" + move + "%, 0)"}) : $("#contentRow").css({transform: "translate(" + move + "%, 0)"}).show();
			$("#overlay").css({transform: "translate(0,-" + $(href).outerHeight() + "px)"});
		}
		e.preventDefault();
	});
	$(".close, #dimmer").click(function(e){
		$("#dimmer").removeClass("dim");
		$("a.rowButtonCurrent").removeClass("rowButtonCurrent");
		$("#overlay").css({transform: "translate(0,0)"});
		setTimeout(function(){$("#contentRow").hide();}, 1000);
		$("body").css({"overflow": ""});
		e.preventDefault();
		e.stopPropagation();
	});
	$(".preview").click(function(e){
		var oldPreview = $(".previewHidden").removeClass("previewHidden"),
			oldDetail = $(".detailOpen").stop(true, true).removeClass("detailOpen").slideUp(1000),
			newPreview = $(this).addClass("previewHidden");
		$("#dcBox").fadeOut(800, function(){
			dcBoxPosition(newPreview, function(){
				$("#dcBox").fadeIn(800);
			})
		});
		$(newPreview.attr("href"))
			.stop(true, true)
			.addClass("detailOpen")
			.slideDown(1000);
		if(oldPreview[0] && oldPreview.offset().top < newPreview.offset().top){
			$root.animate({
		        scrollTop: $window.scrollTop() - oldDetail.height() + $(oldPreview).children(".thumb").height()
		    }, 1000);
		}
		e.preventDefault();
	});
	$("#dcBox").click(function(){
		$(this).fadeOut(800);
		$(".detailOpen").stop(true, true).removeClass("detailOpen").slideUp(1000);
		$(".previewHidden").removeClass("previewHidden");
	});
	$("#curtain").fadeOut(1000);
});