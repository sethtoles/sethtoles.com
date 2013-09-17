var $root = $("html, body"),
	$window = $(window),
	$oldDetail = null,
	scrollLock = null;

function sizeWatch(){
	var	winHeight = $window.height(),
		winWidth = $window.width(),
		winRatio = winWidth/winHeight,
		maxSplHeight = winWidth/1.647,
		$rbc = $("a.rowButtonCurrent");
	$("#splash").height((winRatio < 1.647) ? winHeight : maxSplHeight + ((winHeight - maxSplHeight) * 0.35));
	$("div.icon").css({"width": ((winRatio < 1.2) ? "14%" : (.168 * winHeight)), "top": ((winRatio < 1.647) ? "" : (.6 * maxSplHeight) + "px")});
	$("#splashSpacer").height(winHeight);
	if($("#dcBox:visible")[0]){dcBoxPosition();}
	if($rbc){sizeOverlay($($rbc.attr("data-href")), true);}
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

function dcBoxPosition(fixed, cb){
	var $dcBox = $("#dcBox");
	if(fixed){
		$dcBox.css({"position": "fixed", "top": "30px"});
	}else{
		var dcbH = $dcBox.height(),
			scrY = $window.scrollTop() + 30,
			$detail = $(".detail").filter(":visible"),
			dtlY = $detail.offset().top,
			dtlH = $detail.height();
		if(dtlY > scrY){
			$dcBox.css({"position": "absolute", "top": dtlY + "px"});
		}else if(dtlY + dtlH - dcbH < scrY){
			$dcBox.css({"position": "absolute", "top": dtlY + dtlH - dcbH + "px"});
		}else{
			$dcBox.css({"position": "fixed", "top": "30px"});
		}
	}
	if(cb && typeof(cb) == "function"){
		cb();
	}
}

function sizeOverlay($current, resizing){
	if(resizing){$("#overlay").css({"transition-property": "none"});}
	$current.css({"overflow-y": "visible", "max-height": ""});
	var maxHeight = $window.height() - $("#buttonRow").height(),
		height = $current.height();
	$current.css({"overflow-y": (height > maxHeight) ? "scroll" : "visible", "max-height": maxHeight + "px"});
	$("#overlay").css({"transform": "translate(0,-" + Math.min(height, maxHeight) + "px)", "transition-property": ""});
}

function scrollToDetail($newDetail, $oldPreview){
	var $prev = $newDetail.parent().prev(),
		y = $prev.offset().top + $prev.outerHeight();
	if($oldDetail){
		$video = $($oldDetail).find("iframe");
		if($video[0]){
			$video[0].contentWindow.postMessage('{"method": "pause"}', $video.attr('src').split('?')[0]);
		}
		if($oldDetail == $newDetail){
			$newDetail = null;
			y = Math.min(y, $window.scrollTop());
		}else if($oldDetail.offset().top < y){
			y -= $oldDetail.outerHeight() - $oldPreview.outerHeight();
		}
		$oldDetail.slideUp(800).prev().slideDown(800);
	}
	$root.animate({scrollTop: y}, 800);
	return $newDetail;
}

function checkURL(){
	var hash = window.location.hash;
	if(hash){
		var $hash = $(hash);
		if($hash.hasClass("detail")){
			$oldDetail = scrollToDetail($hash, $hash.prev().hide()).show();
			dcBoxPosition(true, function(){$("#dcBox").show();});
		}else{
			alert("You have tried to load a nonexistent item: " + hash + ".\nLet's continue like this never happened...");
			window.scrollTo(0, $("#splashSpacer").offset().top);
		}
	}else{
		window.scrollTo(0, $("#splashSpacer").offset().top);
	}
}
		
$(document).ready(function(){
	$("#curtain").text("Loading...");
	sizeWatch();
	scrollWatch();
	$("#email").text("sethtoles@gmail.com").attr("href", "mailto:sethtoles@gmail.com");
	$("#cell").text("(202) 494-7456");
	$window.resize(function(){sizeWatch()});
	$(document).scroll(scrollWatch);
	$("a.scroll").click(function(){
			$target = $($.attr(this, "data-href"));
			$root.animate({
	        scrollTop: $target.offset().top - $target.height()/3.3
	    }, 800);
	});
	$("a.rowButton").click(function(){
		var $this = $(this);
		if(!$this.hasClass("rowButtonCurrent")){
			var rbc = $("a.rowButtonCurrent")[0];
				href = $this.attr("data-href"),
				move = (href == "#resume") ? 0 : (href == "#about") ? -33.333 : -66.666;
			if(rbc){
				$(rbc).removeClass("rowButtonCurrent");
				$("#contentRow").css({"transform": "translate(" + move + "%, 0)"});
			}else{
				$("#dimmer").addClass("dim");
				scrollLock = $window.scrollTop();
				$window.scroll(function(){$window.scrollTop(scrollLock);});
				$("#contentRow").css({"transform": "translate(" + move + "%, 0)"}).show();
			}
			$this.addClass("rowButtonCurrent");
			sizeOverlay($(href));
		}
	});
	$(".close, #dimmer").click(function(e){
		$("#dimmer").removeClass("dim");
		scrollLock = null;
		$window.off("scroll");
		$("a.rowButtonCurrent").removeClass("rowButtonCurrent");
		$("#overlay").css({"transform": "translate(0,0)"});
		setTimeout(function(){$("#contentRow").hide();}, 800);
		e.stopPropagation();
	});
	$(".preview").click(function(){
		var $this = $(this),
			$detail = $($this.attr("data-href")).slideDown(800);
		$oldDetail = scrollToDetail($detail, $this);
		$this.slideUp(800);
		$("#dcBox").fadeOut(800, function(){
			dcBoxPosition(true, function(){
				$("#dcBox").fadeIn(800);
			})
		});
	});
	$("#dcBox").click(function(){
		$oldDetail = scrollToDetail($oldDetail);
		$(this).fadeOut(600);
	});
	$("<img/>").attr("src", "images/splash.jpg").load(function() {
		$(this).remove();
		$("#splash").css("background-image", "url(images/splash.jpg)");
		checkURL();
		$("#curtain").text("").fadeOut(1000);
	});
});