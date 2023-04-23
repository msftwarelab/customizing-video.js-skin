class Viddler extends BasePlayer {
    constructor(settings) {
        super(settings);
        this.elem.conatinerEl = document.getElementById('viddler');
    }

    setEventListeners() {
        super.setEventListeners();
        this.elem.volume.on("click", e => this.changeVolume(e));

        this.elem.speedButton.on("click", () => {
            $("#speed-popup").fadeToggle();
            const $quality = $("#quality-popup");
            if ($quality.css("display") === "block") $quality.fadeOut();
            return false;
        });

        $(".speed-choices li").on("click", e => {
            $(".speed-choices li").removeClass("current");
            $(e.target).addClass("current");
            var s = $(e.target).data("speed");
            this.elem.speedButton.text(s + "x");
            this.setSpeed(s);
            $("#speed-popup").fadeOut();
            return false;
        });
    }

    progressBarCreate() {
        const progresscolor = this.settings.progresscolor;
        if (progresscolor) {
            const rgbpc = this.hexToRgb(progresscolor);
            const rgbaprogress = "rgba(" + rgbpc.r + "," + rgbpc.g + "," + rgbpc.b + ", 0.8)";
            setTimeout(function() {
                $(".ui-slider-range").css("background-color", rgbaprogress);
                $("#play").css("background-color", rgbaprogress);
                $(".full").css("background-color", rgbaprogress);
            }, 100);
        }
        if (this.settings.controlcolor.length > 0) {
            const rgbc = this.hexToRgb(this.settings.controlcolor);
            const rgbacontrol = "rgba(" + rgbc.r + "," + rgbc.g + "," + rgbc.b + ", 0.68)";
            $("#controls").css("background", rgbacontrol);
        }
    }

    setVolume(vol) {
        super.setVolume(vol);
        this.elem.volume.find('span').attr("class", "full full" + vol);
    }

    setSpeed (speed) {
        this.elem.videoEl.playbackRate = speed;
    }

    changeVolume(event) {
        event.preventDefault();
        var vol = 0;
        var v = Math.floor((event.offsetX * 100) / this.elem.volume.width());
        if (v > 0 && v <= 20) { vol = 1; }
        if (v > 20 && v <= 40) { vol = 2; }
        if (v > 40 && v <= 60) { vol = 3; }
        if (v > 60 && v <= 80) { vol = 4; }
        if (v > 80) { vol = 5; }
        this.setVolume(vol);
        return false;
    }

    mute(e) {
        const volSpan = this.elem.volume.find("span");
        if (volSpan.hasClass("full0")) {
            volSpan.attr("class", "full full" + this.volumeValue);
            this.elem.videoEl.volume = this.volumeValue * 0.2;
        } else {
            volSpan.attr("class", "full full0");
            this.elem.videoEl.volume = 0;
        }
        return false;
    }
}