class Vzaar extends BasePlayer {

    constructor(settings) {
        super(settings);
        this.elem.conatinerEl = document.getElementById('vzaar');
    }

    setEventListeners() {
        super.setEventListeners();
        this.elem.volume.find('a').on("click", e => this.changeVolume(e));
        $('#btnRewind').click(() => this.rewind(-5))
        $('#btnForward').click(() => this.rewind(5))
    }

    progressBarCreate() {
        const progresscolor = this.settings.progresscolor ?? null;
        if (progresscolor) {
            setTimeout(function() {
                $(".ui-slider-range").css("background-color", progresscolor);
                //$(".ui-slider-handle").css("background-color",progresscolor);
                $("#volume a.active").css("background-color", progresscolor);
                $("#volume a:not(.active)").hover(
                    function() { $(this).css('background-color', progresscolor) },
                    function() { $(this).css('background-color', '#acacac') }
                );
                $(".hd-control").hover(
                    function() { $(this).css('color', progresscolor) },
                    function() { $(this).css('color', '#acacac') }
                );
            }, 100);
        }
        if (this.settings.controlcolor.length > 0) {
            const rgbc = this.hexToRgb(this.settings.controlcolor);
            const rgbacontrol = "rgba(" + rgbc.r + "," + rgbc.g + "," + rgbc.b + ", 0.64)";
            this.elem.controls.css("background", rgbacontrol);
        }
    }

    setVolume(vol) {
        super.setVolume(vol);
        this.elem.volume.find('a').removeClass("active").css("background-color", "#acacac");
        for (var i = 0; i < vol; i++) {
            const pin = $("#volume a:eq(" + i + ")");
            pin.addClass("active");
            pin.css("background-color", '#fff');
            /* if (settings.progresscolor.length > 0) {
                $("#volume a:eq(" + i + ")").css("background-color", settings.progresscolor);
            } */
        }
    }

    changeVolume(e) {
        var v = Math.floor((e.layerX * 100) / $(e.target).width());
        var vol = $(e.target).data("line");
        if (vol == 1 && v < 50) {
            vol = 0;
        }
        this.setVolume(vol);
        return false;
    }
}