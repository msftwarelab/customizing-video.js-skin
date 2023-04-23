var Wistia = function(settings) {

    var actionButton = $("#action"),
        playButton = $("#play"),
        video = $("#video"),
        played = $("#played"),
        loaded = $("#loaded"),
        volume = $("#volume"),
        time = $("#time"),
        controls = $("#controls"),
        customThumb = $("#custom_thumb"),
        qualitySelector = $("#qualitySelector"),
        volumeEl = document.getElementById('volume'),
        videoEl = document.getElementById('video'),
        playedEl = document.getElementById('played'),
        loadedEl = document.getElementById('loaded'),
        fullscreenButtonEl = document.getElementById('fullscreen'),
        conatinerEl = document.getElementById('wistia');

    var isFullscreen = false;
    var isPlaying = false;
    var timeout = false;



    var play = function() {
        isPlaying = true;
        customThumb.hide();
        if (settings.allowpause == "yes") actionButton.addClass("playing");
        playButton.hide();
        time.show();

        videoEl.addEventListener("timeupdate", function() {
            var percentage = Math.floor((100 / videoEl.duration) * videoEl.currentTime);
            time.width(percentage + "%");
            time.text(setTime(videoEl.currentTime));
            played.slider("value", percentage);
            if (video.ended || percentage == 100) {
                actionButton.removeClass("playing");
                reset();
            }
        }, false);

        window.player.ready(function(){
            this.paused() && this.play();
        });

        // var player = window.player = videojs('video');
        // player.mediainfo = player.mediainfo || {};
        // player.mediainfo.projection = '360';
        // player.vr({projection: 'AUTO', debug: true, forceCardboard: false});
        // player.play();

        video.bind('progress', function() {
            loading();
        });
    };


    var init = function() {
        const vjsSettings = {};
        if(settings.autoplay && settings.autoplay === 'yes') {
            vjsSettings.autoplay = 'muted';
        }
        window.player = videojs('video', vjsSettings);
        if (settings.showcontrol == "no") controls.hide();
        setVolume(3);
        time.hide();
        played.slider({
            orientation: "horizontal",
            max: 100,
            value: 0,
            start: seek,
            stop: seeked,
            slide: seeking,
            create: function() {
                if (settings.controlcolor.length > 0) {
                    setTimeout(function() {
                        rgbacontrol = "rgba(" + hexToRgb(settings.controlcolor).r + "," + hexToRgb(settings.controlcolor).g + "," + hexToRgb(settings.controlcolor).b + ", 0.7)";
                        rgbacontroldarker = "rgba(" + hexToRgb(settings.controlcolor).r + "," + hexToRgb(settings.controlcolor).g + "," + hexToRgb(settings.controlcolor).b + ", 0.9)";
                        rgbacontrollighter = "rgba(" + hexToRgb(settings.controlcolor).r + "," + hexToRgb(settings.controlcolor).g + "," + hexToRgb(settings.controlcolor).b + ", 0.5)";
                        $(".control-bar").css("border", "4px solid " + rgbacontrol);
                        $("#loaded").css("background-color", rgbacontrol);
                        $(".control-bar").css("background-color", rgbacontrollighter);
                        $("#fullscreen").css("background-color", rgbacontrol);
                        $("#fullscreen").hover(
                            function() { $(this).css('background-color', rgbacontroldarker) },
                            function() { $(this).css('background-color', rgbacontrol) }
                        );
                        $("#volume a:not(.fill100)").hover(
                            function() { $(this).css('background-color', settings.progresscolor) },
                            function() { $(this).css('background-color', '#fff') }
                        );
                        actionButton.css("background-color", rgbacontrol);
                        actionButton.hover(
                            function() { $(this).css('background-color', rgbacontroldarker) },
                            function() { $(this).css('background-color', rgbacontrol) }
                        );
                        playButton.css("background-color", rgbacontrol);
                        playButton.hover(
                            function() { $(this).css('background-color', rgbacontroldarker) },
                            function() { $(this).css('background-color', rgbacontrol) }
                        );
                        qualitySelector.css("background-color", rgbacontrol);
                        qualitySelector.find('button').hover(
                            function() { $(this).css('background-color', rgbacontroldarker) },
                            function() { $(this).css('background-color', rgbacontrol) }
                        );
                    }, 100);
                }
                if (settings.progresscolor.length > 0) {
                    $(".ui-slider-range").css("border-right", "4px solid " + settings.progressscolor);
                    $("#time").css("color", settings.progressscolor);
                }
            }
        });

        if (settings.autoplay == "yes") {
            window.player.on('ready', () => {
                document.getElementById('overlay').style.display = 'flex';
                setVolume(0);
                play();
            })
        }
        $('.cc-control').on('click', function(e){
            e.preventDefault;
            toggleCC();
            return false;
        })

        video.on("mousemove", function() {
            if (settings.showcontrol == "no") return;
            if (timeout) {
                clearTimeout(timeout);
            }
            controls.slideDown();
            timeout = setTimeout(function() { controls.slideUp(); }, 3000);
            /* if (isFullscreen) {
                controls.slideDown();
                timeout = setTimeout(function() { controls.slideUp(); }, 3000);
            } else {
                controls.slideDown();
            } */
        });

        $(document).keyup(function(e) {
            if (e.keyCode === 27) {
                isFullscreen = false;
                controls.slideDown();
            }
        });

        playedEl.addEventListener("click", setSeek, false);
        fullscreenButtonEl.addEventListener('click', fullscreen, false);
    };

    var toggleCC = function () {
        var video = window.player;

        let tracks = video.textTracks();
        if (typeof tracks === "undefined")
            return false;

        for (var i = 0; i < tracks.length; i++) {
            var ccBtn = controls.find(".cc-control");
            if (tracks[i].mode == 'showing') {
                tracks[i].mode = 'hidden';
                ccBtn.removeClass('enabled');
            } else if (tracks[i].mode == 'hidden') {
                tracks[i].mode = 'showing';
                ccBtn.addClass('enabled');
            }
        }

    }

    var pause = function() {
        if (settings.allowpause == "no") return false;
        isPlaying = false;
        actionButton.removeClass("playing");
        videoEl.addEventListener("timeupdate", function() {
            // action if video is paused
        }, false);
        videoEl.pause();
    };


    var reset = function() {
        isPlaying = false;
        videoEl.currentTime = 0;
        playButton.show();
        time.hide();
        //timeline.width(0);
    };

    var progress = function() {
        var percentage = Math.floor((100 / videoEl.duration) * videoEl.currentTime);
        played.slider("value", percentage);
    }

    var setVolume = function(vol) {
        videoEl.volume = vol * 0.2;
        volume.find('a').removeClass("fill100").css("background-color", "#acacac");
        for (var i = 0; i < vol; i++) {
            $("#volume a:eq(" + i + ")").addClass("fill100");
            $("#volume a:eq(" + i + ")").css("background-color", '#fff');
            /* if (settings.progresscolor.length > 0) {
                $("#volume a:eq(" + i + ")").css("background-color", settings.progresscolor);
            } */
        }


    }

    var fullscreen = function() {
        if (timeout) {
            clearTimeout(timeout);
        }
        if (!isFullscreen) {
            if (conatinerEl.requestFullscreen) {
                conatinerEl.requestFullscreen();
            } else if (conatinerEl.mozRequestFullScreen) {
                conatinerEl.mozRequestFullScreen(); // Firefox
            } else if (conatinerEl.webkitRequestFullscreen) {
                conatinerEl.webkitRequestFullscreen(); // Chrome and Safari
            } else if (conatinerEl.msRequestFullscreen) {
                conatinerEl.msRequestFullscreen(); //IE
            }
            // if (videoEl.requestFullscreen) {
            //     videoEl.requestFullscreen();
            // } else if (videoEl.mozRequestFullScreen) {
            //     conatinerEl.mozRequestFullScreen(); // Firefox
            // } else if (videoEl.webkitRequestFullscreen) {
            //     videoEl.webkitRequestFullscreen(); // Chrome and Safari
            // }else if (videoEl.msRequestFullscreen) {
            //     videoEl.msRequestFullscreen(); //IE
            // }

            isFullscreen = true;
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msRequestFullscreen) {
                document.msRequestFullscreen(); //IE
            }
            controls.slideDown();

            isFullscreen = false;
        }
        return false;
    }

    var seek = function() {
        if (isPlaying) {
            videoEl.pause();
        }
    }

    var seeking = function() {
        var v = played.slider("value");
        time.width(v + "%");
        time.text(setTime(videoEl.duration * (v / 100)));
    }

    var seeked = function() {
        var v = played.slider("value");
        videoEl.currentTime = videoEl.duration * (v / 100);
        if (isPlaying) {
            //played.slider("value",v);
            //videoEl.play();
        }
        time.text(setTime(videoEl.duration * (v / 100)));
        time.width(v + "%");
        time.show();
    }

    var loading = function() {
        var r = videoEl.buffered;
        var total = videoEl.duration;

        if(r.length) {
            var start = r.start(0);
            var end = r.end(0);

            var percentage = Math.floor((end / videoEl.duration) * 100);
            loaded.width(percentage + "%");
        }
    }

    var setTime = function(sec) {
        var s = Math.floor(sec);
        var m = 0;
        if (s < 10) s = "0" + s;
        if (s > 59 && s < 3600) {
            m = Math.floor(s / 60);
            s = s % 60;
            if (s < 10) s = "0" + s;
        }
        if (s > 3600) {
            h = Math.floor(s / 3600);
            m = Math.floor((s % 3600) / 60);
            if (m < 10) m = "0" + m;
            s = Math.floor((s % 3600) % 60);
            if (s < 10) s = "0" + s;
            return h + ":" + m + ":" + s;
        } else {
            return m + ":" + s;
        }
    }

    var setSeek = function(event) {
        if (isPlaying) {
            //event.preventDefault();
            var v = Math.floor((event.layerX * 100) / played.width());
            videoEl.currentTime = videoEl.duration * (v / 100);
            played.slider("value", v);
            videoEl.play();
        }

    }

    var hexToRgb = function(hex) {
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

    actionButton.on("click", function() {
        if (actionButton.hasClass("playing")) {
            pause();
        } else {
            play();
        }
        return false;
    });

    volume.find('a').on("click", function() {
        var v = Math.floor((event.layerX * 100) / $(this).width());
        var vol = $(this).data("line");
        if (vol == 1 && v < 50) {
            vol = 0;
        }
        setVolume(vol);
        return false;
    });

    video.on("click", function() {
        if (actionButton.hasClass("playing")) {
            pause();
        } else {
            play();
        }
        return false;
    });

    playButton.on("click", function() {
        if (actionButton.hasClass("playing")) {
            pause();
        } else {
            play();
        }
        return false;
    });

    
    video.on('contextmenu', function() {
        return false;
    });


    this.init = init;

};

$(function() {
    var video = new Wistia(settings);
    video.init();
});


function unmute()
{
    var vol = 4;
    
    $("#volume").find('a').removeClass("fill100").css("background-color", "#acacac");
    for (var i = 0; i < vol; i++) {
        $("#volume a:eq(" + i + ")").addClass("fill100");
        $("#volume a:eq(" + i + ")").css("background-color", '#fff');
        /* if (settings.progresscolor.length > 0) {
            $("#volume a:eq(" + i + ")").css("background-color", settings.progresscolor);
        } */
    }
    $('#overlay').remove();
    window.player.muted(false);
}