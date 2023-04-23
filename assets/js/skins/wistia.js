class Wistia extends BasePlayer {
    constructor(settings) {
        super(settings);
        this.elem.volumeControl = $("#volume-control");
        this.elem.volumeControlEl = document.getElementById('volume-control');
        this.elem.conatinerEl = document.getElementById('wistia');
    }

    init() {
        super.init();
        this.elem.volumeControl.slider({
            orientation: "vertical",
            max: 100,
            value: 80,
            slide: () => this.changeVolume(),
            stop: () => this.changeVolume()
        });
    }
    setEventListeners() {
        super.setEventListeners();
        const $volumeBar = $("#volume-bar");
        this.elem.volume.hover(() => $volumeBar.fadeIn(), () => $volumeBar.fadeOut());
    }

    play() {
        super.play();
        this.elem.time.show();
    }

    timeUpdate(e) {
        const percentage = super.timeUpdate(e);
    }

    progressBarCreate() {
        const controlcolor = this.settings.controlcolor;
        const $control = $(".control-bar");
        const $caption = $(".cc-control");
        if (controlcolor) {
            const rgbCc = this.hexToRgb(controlcolor);
            const rgbacontrol = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 0.8)";
            const rgbacontroldarker = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 0.9)";
            const rgbacontrollighter = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 0.7)";
            $("#fullscreen").hover(
                function() { $(this).css('background-color', rgbacontroldarker) },
                function() { $(this).css('background-color', "transparent") }
            );
            this.elem.controls.css("background-color", rgbacontrol);
            this.elem.playButton.css("background-color", rgbacontrol)
            this.elem.playButton.hover(
                function() { $(this).css('background-color', rgbacontroldarker) },
                function() { $(this).css('background-color', rgbacontrol) }
            );
            this.elem.actionButton.hover(
                function() { $(this).css('background-color', rgbacontroldarker) },
                function() { $(this).css('background-color', "transparent") }
            );
            $caption.hover(
                function() { $(this).css('background-color', rgbacontroldarker) },
                function() { $(this).css('background-color', "transparent") }
            );
            this.elem.volume.hover(
                function() { $(this).css('background-color', rgbacontroldarker) },
                function() { $(this).css('background-color', "transparent") }
            );
            this.elem.qualitySelector.find('button').hover(
                function() { $(this).css('background-color', rgbacontroldarker) },
                function() { $(this).css('background-color', "transparent") }
            );
        }
        const progresscolor = this.settings.progresscolor;
        if (progresscolor) {
            $(".ui-slider-range").css("border-right", "4px solid " + progresscolor);
            this.elem.time.css("color", "white");
        }
    }

    changeVolume () {
        var vol = this.elem.volumeControl.slider("value");
        if (vol < 10) {
            this.elem.volume.find("span.mute").removeClass('hide');
            this.setVolume(0);
        } else {
            this.setVolume((vol / 20) ? (vol / 20) : 0);
            this.elem.volume.find("span.mute").addClass('hide');
        }
    }

    mute(e) {
        const volSpan = this.elem.volume.find("span");
        if(this.volumeValue !== 0) {
            volSpan.css('bottom', "0%");
            this.setVolume(0);
        } else {
            volSpan.css('bottom', "80%");
            this.setVolume(4);
        }
    }

    progressBarSeeking() {
        const v = super.progressBarSeeking();
    }

    progressBarSeeked() {
        const v = super.progressBarSeeked();
        this.elem.time.text(this.getTime(this.elem.videoEl.duration * (v / 100)));
        this.elem.time.show();
    }

    // setSpeed (speed) {
    //     this.elem.videoEl.playbackRate = speed;
    // }

    reset() {
        super.reset();
        this.elem.time.hide();
    }
}