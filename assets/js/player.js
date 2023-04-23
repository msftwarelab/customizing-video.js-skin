class BasePlayer {
    elem = {};

    constructor(settings) {
        this.settings = settings;
        this.isFullscreen = false;
        this.isPlaying = false;
        this.isMuted = false;
        this.timeout = false;
        this.played = false;
        this.speed = 1;
        this.volumeValue = 3;

        this.elem.actionButton = $("#action");
        this.elem.playButton = $("#play");
        this.elem.video = $("#video");
        this.elem.played = $("#played");
        this.elem.loaded = $("#loaded");
        this.elem.volume = $("#volume");
        this.elem.time = $("#time");
        this.elem.vduration = $("#vduration");
        this.elem.controls = $("#controls");
        this.elem.backward = $("#backward");
        this.elem.forward = $("#forward");
        this.elem.controlsCenter = $("#controls-center");
        this.elem.customThumb = $("#custom_thumb");
        this.elem.$ccControl = $('.cc-control');
        this.elem.muteButton = $("#mute");
        this.elem.speedButton = $("#speed");
        this.elem.qualityButton = $("#quality");
        this.elem.qualitySelector = $("#qualitySelector");
        this.elem.qualitySelectorBtn = $("#qualitySelector-btn");
        this.elem.qualitySelectorMenu = $("#qualitySelector-menu");
        this.elem.speedBtn = $("#v-speed-btn");
        this.elem.qualityBtn = $("#v-quality-btn");
        this.elem.speedItem = $(".speed-item");
        this.elem.$cSpeed = $('.c-speed');

        this.elem.videoEl = document.getElementById('video');
        this.elem.playedEl = document.getElementById('played');
        this.elem.loadedEl = document.getElementById('loaded');
        this.elem.fullscreenButtonEl = document.getElementById('fullscreen');
        this.elem.volumeEl = document.getElementById('volume');
    }

    init() {
        this.setupVjs();
        if (this.settings.showcontrol === "no") this.elem.controls.hide();
        if (this.settings.type === "vzaar") this.elem.controlsCenter.hide();
        this.elem.played.slider({
            orientation: "horizontal",
            range: "min",
            max: 100,
            value: 0,
            start: () => this.progressBarSeek(),
            stop: () => this.progressBarSeeked(),
            slide: () => this.progressBarSeeking(),
            create: () => this.progressBarCreate()
        });
        if (this.settings.autoplay === "yes") {
            this.player.on('loadedmetadata', () => {
                $('#overlay').css('display','flex');
                this.play();
            })
            $('#overlay').click(() => this.unmute());
        } else {
            this.setVolume(3);
        }

        this.setEventListeners();
    }

    setupVjs() {
        this.player = videojs('video', this.settings.vjs ?? {});
        this.player.httpSourceSelector({customTarget: '#qualitySelector'});
        this.player.on("timeupdate", (e) => this.timeUpdate(e));
        this.player.on('progress', () => this.loading());
        this.player.on('error', (e) => this.resetVjs(e));
        this.player.on('ready', e => this.playerReady(e));
    }

    resetVjs(e) {
        console.log('Player error!', e);
        const currentTime = this.player.currentTime();
        this.player.src({src: this.player.currentSrc(), type: 'application/x-mpegURL'});
        this.player.load();

        this.player.on('loadedmetadata', () => {
            this.player.currentTime(currentTime);
            this.player.play();
        });
    }

    setEventListeners() {
        this.elem.actionButton.on("click", e => this.playToggle(e));
        this.elem.playButton.on("click", e => this.playToggle(e));
        this.elem.video.on("click", e => this.playToggle(e));
        this.elem.playedEl.addEventListener("click", e => this.setSeek(e), false);
        this.elem.fullscreenButtonEl.addEventListener('click', e => this.fullscreen(e), false);
        this.elem.muteButton.on("click", e => this.mute(e));
        this.elem.qualitySelectorBtn.on("click", () => this.toggleQuality());
        this.elem.video.on('contextmenu', () => false);
        this.elem.video.on("mousemove", (e) => this.toggleControls(e));
        this.elem.backward.on("click", () => this.rewind(-10));
        this.elem.forward.on("click", () => this.rewind(10));
        this.elem.speedBtn.on("click", () => $('.speed-menu').slideToggle(200));
        this.elem.qualityBtn.on("click", () => $('.quality-menu').slideToggle(200));
        this.elem.speedItem.on('click', (e) => this.setSpeed(e));
        $(document).keyup(e => {
            switch (e.keyCode) {
                case 27:
                    this.isFullscreen = false;
                    this.elem.controls.slideDown();
                    break;
                case 37:
                    e.preventDefault();
                    this.rewind(-10);
                    break;
                case 39:
                    e.preventDefault();
                    this.rewind(10);
                    break;
            }
        });

        this.elem.$ccControl.on('click', e => {
            e.preventDefault();
            this.toggleCC();
            return false;
        })
    }


    toggleCC() {
        const video = this.player;

        let tracks = video.textTracks();
        if (typeof tracks === "undefined")
            return false;

        if (this.ccOn) {
            this.ccOn = false;
            this.elem.$ccControl.removeClass('enabled');
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].mode = 'hidden';
            }
        } else {
            this.ccOn = true;
            this.elem.$ccControl.addClass('enabled');
            for (let i = 0; i < tracks.length; i++) {
                if (tracks[i].kind === 'subtitles') {
                    tracks[i].mode = 'showing';
                    break;
                }
            }
        }

    }

    toggleQuality() {
        this.elem.qualitySelectorMenu.fadeToggle(100);
    }

    timeTextUpdate(sec) {
        this.elem.time.text(this.getTime(sec));
    }

    timeUpdate(e) {
        const videoEl = this.elem.videoEl;
        var percentage = Math.floor((100 / videoEl.duration) * videoEl.currentTime);
        this.timeTextUpdate(videoEl.currentTime)
        this.elem.played.slider("value", percentage);
        if (video.ended || percentage == 100) {
            this.elem.actionButton.removeClass("playing");
            this.reset();
        }
        return percentage;
    }

    play() {
        this.isPlaying = true;
        this.elem.customThumb.hide();
        if (this.settings.allowpause === "yes") this.elem.actionButton.addClass("playing");
        this.elem.playButton.hide();
        if (this.settings.type === "vzaar") this.elem.controlsCenter.fadeIn();

        this.player.ready(() => this.player.paused() && this.player.play())

        this.playCallback();
    };

    playCallback() {
        if (this.played) {
            return;
        }

        const data = new FormData();
        data.append('id', this.settings.id);
        let playCallbackUrl = `${this.settings.url}ajax/video_play`;

        fetch(playCallbackUrl, {
            method: 'POST',
            headers: {Accept: 'application/json'},
            body: data
        }).then(() => this.played = true);
    }

    pause() {
        if (this.settings.allowpause === "no") return false;
        this.isPlaying = false;
        if (this.settings.type !== "vzaar") this.elem.playButton.show();
        this.elem.actionButton.removeClass("playing");
        this.elem.videoEl.pause();
    };

    playToggle(e) {
        if (this.elem.actionButton.hasClass("playing")) {
            this.pause();
        } else {
            this.play();
        }
        return false;
    }

    reset() {
        this.elem.playButton.show();
        this.isPlaying = false;
        this.elem.videoEl.currentTime = 0;
        this.elem.playButton.show();
    };

    progress() {
        var percentage = Math.floor((100 / this.elem.videoEl.duration) * this.elem.videoEl.currentTime);
        this.elem.played.slider("value", percentage);
    }

    setVolume(vol) {
        this.volumeValue = vol;
        this.elem.videoEl.volume = vol * 0.2;
    }

    setSpeed (e) {
        const speed = e.target.innerText;
        this.elem.videoEl.playbackRate = Number(speed.split('\n')[0]);
        this.elem.$cSpeed.text(speed.split('\n')[0] + 'x');
    }

    unmute() {
        $('#overlay').remove();
        this.player.muted(false);
        this.setVolume(4);
    }

    mute(e) {
        e.preventDefault();
        this.player.muted(!this.player.muted());
        return false;
    }

    changeVolume(e) {

    }

    fullscreen(e) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (!this.isFullscreen) {
            if (this.elem.conatinerEl.requestFullscreen) {
                this.elem.conatinerEl.requestFullscreen();
            } else if (this.elem.conatinerEl.mozRequestFullScreen) {
                this.elem.conatinerEl.mozRequestFullScreen(); // Firefox
            } else if (this.elem.conatinerEl.webkitRequestFullscreen) {
                this.elem.conatinerEl.webkitRequestFullscreen(); // Chrome and Safari
            } else if (this.elem.conatinerEl.msRequestFullscreen) {
                this.elem.conatinerEl.msRequestFullscreen(); //IE
            }
            this.isFullscreen = true;
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
            this.elem.controls.slideDown();
            this.isFullscreen = false;
        }
        return false;
    }

    progressBarSeek() {
        if (this.isPlaying) {
            this.elem.videoEl.pause();
        }
    }

    progressBarSeeking() {
        var v = this.elem.played.slider("value");
        this.timeTextUpdate(this.elem.videoEl.duration * (v / 100));
        return v;
    }

    progressBarSeeked() {
        var v = this.elem.played.slider("value");
        this.elem.videoEl.currentTime = this.elem.videoEl.duration * (v / 100);
        return v;
    }

    progressBarCreate() {

    }

    loading() {
        var r = this.elem.videoEl.buffered;
        var videoDuration = this.elem.videoEl.duration;
        if (r.length) {
            var start = r.start(0);
            var end = r.end(0);

            var percentage = Math.floor((end / this.elem.videoEl.duration) * 100);
            this.elem.loaded.width(percentage + "%");
        }
        let totalMin = Math.floor(videoDuration / 60);
        let totalSec = Math.floor(videoDuration % 60);
        // if video seconds are less than 10, then add 0 at the beginning
        totalSec < 10 ? (totalSec = "0" + totalSec) : totalSec;
        this.elem.vduration.text(`${totalMin}:${totalSec}`);
    }

    getTime(sec = 0) {
        sec = isNaN(sec)? 0 : sec;
        var s = Math.floor(sec);
        var m = 0;
        var h = 0;
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

    setSeek(event) {
        if (this.isPlaying && event.target.className.indexOf('ui-slider-handle') == -1) {
            //event.preventDefault();
            var v = Math.floor((event.layerX * 100) / this.elem.played.width());
            this.elem.videoEl.currentTime = this.elem.videoEl.duration * (v / 100);
            this.elem.played.slider("value", v);
            this.elem.videoEl.play();

        } else {
            if (this.isPlaying) this.elem.videoEl.play();
        }
    }

    rewind(param) {
        this.player.currentTime(this.player.currentTime() + param);
    }

    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    toggleControls(e) {
        if (this.settings.showcontrol === "no") return;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.settings.type === "vzaar") this.elem.controlsCenter.fadeIn();
        this.elem.controls.slideDown();
        this.timeout = setTimeout(() => {
            this.elem.controls.slideUp();
            if (this.settings.type === "vzaar") this.elem.controlsCenter.fadeOut();
        }, 3000);
    }

    playerReady(e) {
        $('.customPlayer').show();
    }
}