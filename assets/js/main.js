var settings = {
	autoplay : 'no',
	showcontrol : 'yes',
	allowpause : 'yes',
	controlcolor : '',
	progresscolor : '',
	quality : 'yes',
};

$(document).ready(function() {
	let embedUrl = baseurl;
	if(cname) {
		embedUrl = `https://${cname}/${basedir}/`
	}
	$('.custom_thumb_button').click(function () {
		$('#thumb').trigger('click')
	});

	$('ul.video-list li:nth-child(2n+1)').addClass('video-list-li');
	generateScript();

	$(".autoplay").on("click", function() {
		var _this = $(this);
		$(".autoplay").removeClass("active");
		_this.addClass("active");
		$("#autoplay").val(_this.data("value"));
		generateScript();
		return false;
	});

	$(".quality").on("click", function() {
		var _this = $(this);
		var quality = _this.data("value");
		$(".quality").removeClass("active");
		_this.addClass("active");
		$("#videoquality").val(quality);
		if(quality == "yes") {
			//$("#mp4").attr("src", $("#mp4").data("medium")));
			if($("#mp4").data("high").length > 0)
				$("#mp4").attr("src", $("#mp4").data("high"));

			if($("#webm").data("high").length > 0)
				$("#webm").attr("src", $("#webm").data("high"));
		} else {
			$("#mp4").attr("src", $("#mp4").data("medium"));
			$("#webm").attr("src", $("#webm").data("medium"));
		}
		generateScript();
		return false;
	});

	$(".allowpause").on("click", function() {
		var _this = $(this);
		$(".allowpause").removeClass("active");
		_this.addClass("active");
		$("#allowpause").val(_this.data("value"));
		generateScript();
		return false;
	});

	$(".logo").on("click", function() {
		var _this = $(this);
		$(".logo").removeClass("active");
		_this.addClass("active");
		$("#hideytlogo").val(_this.data("value"));
		generateScript();
		return false;
	});

	$(".showcontrol").on("click", function() {
		var _this = $(this);
		$(".showcontrol").removeClass("active");
		_this.addClass("active");
		$("#showcontrol").val(_this.data("value"));
		generateScript();
		return false;
	});

	$("#videowidthbox").keyup(function() {
		$("#videowidth").val($(this).val());
	});

	$("#videoheightbox").keyup(function() {
		$("#videoheight").val($(this).val());
	});

	$("#save").on("click", function() {
		let thumbUrl = $("#thumb-url").val();
		if(thumbUrl && !isValidUrl(thumbUrl)) {
			alert('Invalid thumbnail url');
		}

		$('#loader').show();	// Show loader
		const data = new FormData(document.getElementById("video-form"));

		$.ajax({
			type: "POST",
			url: baseurl + "ajax/video_save",
			data: data,
			processData: false,
			contentType: false,
			success: function(response) {
				if(response.status == "success" ) {
					const x = response.data.width;
					const y = response.data.height;
					const ar = (x/y);
					var html = `<iframe style='display:block;margin:auto;width:${x}px;max-width:100%;aspect-ratio:${ar};' src='${embedUrl}video/${response.data.id}' frameborder="0" allow="autoplay; gyroscope; picture-in-picture;" allowfullscreen></iframe>`;
					$("#code-holder").text(html);
					$("#copy").attr("data-path",html);
					$("#code").show();
				} else {
					alert(response.message ?? 'An error occurred while sending the message. Please try again later, or email us directly.')
				}
				$('#loader').hide();	// Hide loader
			},
			error: function(){
				alert('An error occurred while sending the message. Please try again later, or email us directly.');
				$('#loader').hide(); // Hide loader
			}
		});
		return false;
	});

	$('input.numeric').keypress(function() {
		return (/\d/.test(String.fromCharCode(event.which) ));
	});


	let defaultcolor = $('#controlbarcolor').val();
	if(!defaultcolor) {
		if(skin == "wistia") defaultcolor = "#ffc90e";
		if(skin == "vimeo") defaultcolor = "#172322";
		if(skin == "viddler") defaultcolor = "#000000";
		if(skin == "vzaar") defaultcolor = "#000000";
		if(skin == "now") defaultcolor = "#121a1f";
	}

	$("#controlcolor").css("background-color",defaultcolor);
	$('#controlbarcolor,#controlcolor')
		.colorpicker({
			color: defaultcolor,
			format: 'hex'
		}).on('changeColor', function (ev) {
		var color = ev.color.toHex();
		var el = document.getElementById("controlcolor");
		el.style.background = color;
		generateScript();
		if (skin == "now") {
			$("#controls").css("background", "none").css("background-color", color);
		}

		if (skin == "vzaar") {
			rgbacontrol = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 0.68)";
			$("#controls").css("background", rgbacontrol);
		}

		if (skin == "viddler") {
			rgbacontrol = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 0.68)";
			$("#controls").css("background", rgbacontrol);
		}

		if (skin == "vimeo") {
			rgbacontrol = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 0.75)";
			rgbacontroldarker = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 1)";
			$("#action").css("background", rgbacontrol);
			$(".control-bar").css("background", rgbacontrol);
			$(".progress").css("border", "1px solid " + rgbacontroldarker);
			$("#action").hover(
				function () {
					$(this).css('background', $(".ui-slider-range").css("background-color"))
				},
				function () {
					$(this).css('background', rgbacontrol)
				}
			);
			$("#loaded").css("background", color);
		}

		if (skin == "wistia") {
			rgbacontrol = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 0.7)";
			rgbacontroldarker = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 0.9)";
			rgbacontrollighter = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b + ", 0.5)";
			$(".control-bar").css("border", "4px solid " + rgbacontrol);
			$("#loaded").css("background-color", rgbacontrol);
			$(".control-bar").css("background-color", rgbacontrollighter);
			$("#volume").css("background-color", rgbacontrollighter);
			$("#volume .volume-control").css("background-color", rgbacontrol);
			$("#volume .volume-control").hover(
				function () {
					$(this).css('background-color', rgbacontroldarker)
				},
				function () {
					$(this).css('background-color', rgbacontrol)
				}
			);
			$("#fullscreen").css("background-color", rgbacontrol);
			$("#fullscreen").hover(
				function () {
					$(this).css('background-color', rgbacontroldarker)
				},
				function () {
					$(this).css('background-color', rgbacontrol)
				}
			);
			$("#action").css("background-color", rgbacontrol);
			$("#action").hover(
				function () {
					$(this).css('background-color', rgbacontroldarker)
				},
				function () {
					$(this).css('background-color', rgbacontrol)
				}
			);
			$("#play").css("background-color", rgbacontrol);
			$("#play").hover(
				function () {
					$(this).css('background-color', rgbacontroldarker)
				},
				function () {
					$(this).css('background-color', rgbacontrol)
				}
			);
		}
	});

	defaultcolor = $('#progressbarcolor').val();
	if(!defaultcolor) {
		if (skin == "vimeo") defaultcolor = "#00adef";
		if (skin == "vzaar") defaultcolor = "#ffffff";
		if (skin == "viddler") defaultcolor = "#64b6ff";
		if (skin == "now") defaultcolor = "#d66405";
		if (skin == "wistia") defaultcolor = "#ffffff";
	}
	$("#progresscolor").css("background-color",defaultcolor);
	$('#progressbarcolor,#progresscolor').colorpicker({
		color: defaultcolor,
		format: 'hex'
	}).on('changeColor', function(ev) {
		var color = ev.color.toHex();
		var el = document.getElementById("progresscolor");
		el.style.background = color;
		$("#progressbarcolor").val(color);
		generateScript();
		if(skin == "viddler") {
			rgbaprogress = "rgba(" + hexToRgb(color).r + "," + hexToRgb(color).g + "," + hexToRgb(color).b+", 0.8)";
			$(".ui-slider-range").css("background-color",rgbaprogress);
			$("#play").css("background-color",rgbaprogress);
			$(".full").css("background-color",rgbaprogress);
		}

		if(skin == "vimeo") {
			$(".ui-slider-range").css("background-color",color);
			$(".fill100").css("background-color",color);
			$("#volume a").hover(
				function(){ $(this).css('background-color', color) },
				function(){ $(this).css('background-color', '#fff') }
			);
			$("#action").hover(
				function(){ $(this).css('background-color', color) },
				function(){ $(this).css('background-color', $(".control-bar").css("background-color")) }
			);
			$(".hd-control").hover(
				function(){ $(this).css('color', color) },
				function(){ $(this).css('color', '#fff') }
			);
		}

		if(skin == "vzaar") {
			$(".ui-slider-range").css("background-color",color);
			//$(".ui-slider-handle").css("background-color",color);
			$("#volume a.active").css("background-color",color);
			$("#volume a:not(.active)").hover(
				function(){ $(this).css('background-color', color) },
				function(){ $(this).css('background-color', '#acacac') }
			);
			$(".hd-control").hover(
				function(){ $(this).css('color', color) },
				function(){ $(this).css('color', '#acacac') }
			);
		}

		if(skin == "now") {
			$(".ui-slider-range").css("background-color",color).css("background",color);
			$(".ui-slider-handle").css("background-color",color).css("background",color);
			$(".control-bar").css("background-color",color).css("background",color);
			$("#play").css("background-color",color).css("background",color);
		}

		if(skin == "wistia") {
			$(".ui-slider-range").css("border-right","4px solid "+color);
			$("#time").css("color",color);
		}

	});

	$( "#played" ).slider({
		orientation: "horizontal",
		range: "min"
	});
	$( "#played" ).slider( "value", 0 );
	// Copy embed code on button click
	$('#copy').click(function(e) {
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(this).data('path')).select();
		document.execCommand("copy");
		$temp.remove();
		alert('Your code is copied');
		e.preventDefault();
	});
});

function generateScript(){
	var autoplay = $("#autoplay").val();
	var showcontrol = $("#showcontrol").val();
	var allowpause = $("#allowpause").val();
	var progressbarcolor = $("#progressbarcolor").val();
	var controlbarcolor = $("#controlbarcolor").val();
	var quality = $("#videoquality").val();
	var type = $("#videotype").val();
	if(typeof(progressbarcolor) != "undefined" && progressbarcolor != ""){
		progressbarcolor = progressbarcolor.split("#")[1];
	}
	if(typeof(controlbarcolor) != "undefined" && controlbarcolor != ""){
		controlbarcolor = controlbarcolor.split("#")[1];
	}
	var script = '<script type="text/javascript" id="julbulscript" src="'+baseurl+'assets/js/changeStyleScript.js?base='+baseurl+'&type='+type+'&autoplay='+autoplay+'&controlbarcolor='+controlbarcolor+'&showcontrol='+showcontrol+'&allowpause='+allowpause+'&progressbarcolor='+progressbarcolor+'&quality='+quality+'"></script>';
	$('#getScript #code-holder').text(script);

}
function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
function isValidUrl(string) {
	try {
		new URL(string);
		return true;
	} catch (err) {
		return false;
	}
}