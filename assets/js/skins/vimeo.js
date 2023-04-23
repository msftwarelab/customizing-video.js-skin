class Vimeo extends BasePlayer {
    constructor(settings) {
        super(settings);
        this.elem.volumeControl = $("#volume-control");
        this.elem.volumeControlEl = document.getElementById('volume-control');
        this.elem.conatinerEl = document.getElementById('vimeo');
    }
    init() {
        const videoPlayer = document.querySelector("#vimeo");
        const VideoScr = videoPlayer.querySelector("#video");
        const pictureInpicture = videoPlayer.querySelector(".pip-mode");
        super.init();
        this.elem.volumeControl.slider({
            orientation: "vertical",
            max: 100,
            value: 80,
            slide: () => this.changeVolume(),
            stop: () => this.changeVolume()
        });
        pictureInpicture.addEventListener("click", () => {
            VideoScr.requestPictureInPicture();
        });
    }
    setEventListeners() {
        super.setEventListeners();
        const $volumeBar = $("#volume-bar");
        this.elem.volume.hover(() => $volumeBar.fadeIn(), () => $volumeBar.fadeOut());
    }

    progressBarCreate() {
        const progresscolor = this.settings.progresscolor;
        if (progresscolor) {
            $(".ui-slider-range").css("background-color", progresscolor);
            $(".ui-slider-handle").css("background-color", progresscolor).css("background", progresscolor);
            this.elem.actionButton.hover(
                function() { $(this).css('background-color', progresscolor) },
                function() { $(this).css('background-color', $(".control-bar").css("background-color")) }
            );
            $(".hd-control").hover(
                function() { $(this).css('color', progresscolor) },
                function() { $(this).css('color', '#fff') }
            );
        }
        const controlcolor = this.settings.controlcolor;
        if (controlcolor) {
            const rgbCc = this.hexToRgb(controlcolor);
            const rgbacontrol = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 0.75)";
            const rgbacontroldarker = "rgba(" + rgbCc.r + "," + rgbCc.g + "," + rgbCc.b + ", 1)";
            $(".control-bar").css("background-color", rgbacontrol);
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
}