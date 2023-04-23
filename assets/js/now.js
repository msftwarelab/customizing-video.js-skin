var Now = function(settings) {

    var actionButton = $("#action"),
        playButton = $("#play"),
        muteButton = $("#mute"),
        video = $("#video"),
        played = $("#played"),
        loaded = $("#loaded"),
        volume = $("#volume"),
        volumeControl = $("#volume-control"),
        time = $("#time"),
        controls = $("#controls"),
        customThumb = $("#custom_thumb"),
        volumeControlEl = document.getElementById('volume-control'),
        videoEl = document.getElementById('video'),
        playedEl = document.getElementById('played'),
        loadedEl = document.getElementById('loaded'),
        fullscreenButtonEl = document.getElementById('fullscreen'),
        conatinerEl = document.getElementById('now-video');

    var isFullscreen = false;
    var isPlaying = false;
    var volumeValue = 60;
    var timeout = false;

    var init = function() {
        window.player = videojs('video');
        if (settings.showcontrol == "no") controls.remove();
        videoEl.volume = 0.8;
        played.slider({
            orientation: "horizontal",
            max: 100,
            value: 0,
            start: seek,
            stop: seeked,
            slide: seeking,
            create: function() {
                if (settings.progresscolor.length > 0) {
                    setTimeout(function() {
                        $(".ui-slider-range").css("background-color", settings.progresscolor).css("background", settings.progresscolor);
                        $(".ui-slider-handle").css("background-color", settings.progresscolor).css("background", settings.progresscolor);
                        $(".control-bar").css("background-color", settings.progresscolor).css("background", settings.progresscolor);
                        playButton.css("background-color", settings.progresscolor).css("background", settings.progresscolor);
                    }, 100);
                }
                if (settings.controlcolor.length > 0) {
                    $("#controls").css("background", "none").css("background-color", settings.controlcolor);
                }
            }
        });

        volumeControl.slider({
            orientation: "vertical",
            max: 100,
            value: 80,
            slide: setVolume,
            stop: setVolume
        });

        if (settings.autoplay == "yes") {
            window.player.on('loadedmetadata', () => {
                document.getElementById('overlay').style.display = 'flex';
                volumeControl.slider({
                    orientation: "vertical",
                    max: 100,
                    value: 0,
                    slide: setVolume,
                    stop: setVolume
                });
                videoEl.volume = 0;
                play();
            })
        }

        /* video.on("mousemove", function() {
            if (settings.showcontrol == "no") return;
            if (isFullscreen) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                controls.slideDown();
                timeout = setTimeout(function() { controls.slideUp(); }, 3000);
            } else {
                controls.slideDown();
            }
            console.log(isFullscreen);
        }); */

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



    var play = function() {
        isPlaying = true;

        if (settings.allowpause == "yes") actionButton.addClass("playing");
        playButton.hide();
        customThumb.hide();
        videoEl.addEventListener("timeupdate", function() {
            var percentage = Math.floor((100 / videoEl.duration) * videoEl.currentTime);
            time.text(setTime(videoEl.currentTime) + " / " + setTime(videoEl.duration));
            played.slider("value", percentage);
            if (video.ended || percentage == 100) {
                actionButton.removeClass("playing");
                reset();
            }
        }, false);

        window.player.ready(function(){
            this.play();
        });

        video.bind('progress', function() {
            loading();
        });
    };

    var pause = function() {
        if (settings.allowpause == "no") return false;
        isPlaying = false;

        playButton.show();
        actionButton.removeClass("playing");
        videoEl.addEventListener("timeupdate", function() {
            // action if video is paused
        }, false);
        videoEl.pause();
    };


    var reset = function() {
        playButton.show();
        isPlaying = false;
        videoEl.currentTime = 0;
        //timeline.width(0);
    };

    var progress = function() {
        var percentage = Math.floor((100 / videoEl.duration) * videoEl.currentTime);
        played.slider("value", percentage);
    }

    var setVolume = function() {
        var vol = volumeControl.slider("value");
        if (vol < 10) {
            volume.find("span.mute").removeClass('hide');
            videoEl.volume = 0;
        } else {
            videoEl.volume = (vol / 100)?(vol / 100):0;
            volume.find("span.mute").addClass('hide');
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
            // } else if (videoEl.msRequestFullscreen) {
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
        time.text(setTime(videoEl.duration * (v / 100)) + " / " + setTime(videoEl.duration));
    }

    var seeked = function() {
        var v = played.slider("value");
        videoEl.currentTime = videoEl.duration * (v / 100);
        if (isPlaying) {
            //played.slider("value",v);
            //videoEl.play();
        }
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
        return m + ":" + s;

    }

    var setSeek = function(event) {
        if (isPlaying && event.target.className.indexOf('ui-slider-handle') == -1) {
            //event.preventDefault();
            var v = Math.floor((event.layerX * 100) / played.width());
            videoEl.currentTime = videoEl.duration * (v / 100);
            played.slider("value", v);
            videoEl.play();
        } else {
            if (isPlaying) videoEl.play();
        }
    }

    volume.hover(function() {
        $("#volume-bar").fadeIn();
    }, function() {
        $("#volume-bar").fadeOut();
    });

    actionButton.on("click", function() {
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

    /*volume.on("click", function() {
    	if(volume.find("span.mute").css("opacity") == "0") {
    		volume.find("span.mute").removeClass('hide');
    		videoEl.volume = volumeValue / 100;
    	} else {
    		volume.find("span.mute").addClass('hide');
    		videoEl.volume = 0;
    	}
    	return false;
    });*/

    volume.find('a').on("click", function() {
        var vol = $(this).data("line");
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

    video.on('contextmenu', function() {
        return false;
    });


    this.init = init;

};
$(function() {
    var video = new Now(settings);
    video.init();
});

function unmute()
{
    $("#volume-control").slider({
        orientation: "vertical",
        max: 100,
        value: 80,
    });
    $('#overlay').remove();
    window.player.muted(false);
    window.player.volume(0.8)
}