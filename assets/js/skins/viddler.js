class Viddler extends BasePlayer {
    constructor(settings) {
        super(settings);
        this.elem.volumeControl = $("#volume-control");
        this.elem.volumeControlEl = document.getElementById('volume-control');
        this.elem.conatinerEl = document.getElementById('viddler');
    }

    init() {
        super.init();
        const videoPlayer = document.querySelector("#viddler");
        const VideoScr = videoPlayer.querySelector("#video");
        const totalVideoDuration = videoPlayer.querySelector(".video_duration");
        this.elem.volumeControl.slider({
            orientation: "vertical",
            max: 100,
            value: 80,
            slide: () => this.changeVolume(),
            stop: () => this.changeVolume()
        });
        VideoScr.addEventListener("loadeddata", (e) => {
            let videoDuration = e.target.duration;
            let totalMin = Math.floor(videoDuration / 60);
            let totalSec = Math.floor(videoDuration % 60);
            // if video seconds are less than 10, then add 0 at the beginning
            totalSec < 10 ? (totalSec = "0" + totalSec) : totalSec;
            totalVideoDuration.innerHTML = `${totalMin} : ${totalSec}`;
        });
    }

    setEventListeners() {
        super.setEventListeners();
        const $volumeBar = $("#volume-bar");
        this.elem.volume.hover(() => $volumeBar.fadeIn(), () => $volumeBar.fadeOut());
    }

    timeUpdate(e) {
        const percentage = super.timeUpdate(e);
    }

    progressBarCreate() {
        const progresscolor = this.settings.progresscolor;
        if (progresscolor) {
            $(".ui-slider-range").css("background-color", progresscolor);
            $(".ui-slider-handle").css("background-color", progresscolor).css("background", progresscolor);
            $(".fill100").css("background-color", progresscolor);
            $("#volume span:not(.fill100)").hover(
                function() { $(this).css('background-color', progresscolor) },
                function() { $(this).css('background-color', '#fff') }
            );
            $(".hd-control").hover(
                function() { $(this).css('color', progresscolor) },
                function() { $(this).css('color', '#fff') }
            );
        }
        const controlcolor = this.settings.controlcolor;
        if (controlcolor > 0) {
            const rgbCc = hexToRgb(controlcolor);
            const rgbacontrol = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 0.75)";
            const rgbacontroldarker = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 1)";
            // $(".control-bar").css("background", rgbacontrol);
            $(".progress").css("border", "1px solid " + rgbacontroldarker);
            this.elem.actionButton.css("background", rgbacontrol)
                .hover(
                function() { $(this).css('background', $(".ui-slider-range").css("background-color")) },
                function() { $(this).css('background', rgbacontrol) }
            );
            this.elem.loaded.css("background", rgbacontrol);
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

    reset() {
        super.reset();
        this.elem.time.hide();
    }
}