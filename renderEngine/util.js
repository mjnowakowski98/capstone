class Utilities { // Small functions for common actions
    static getDistance(coord1, coord2) {
        var x2 = Math.pow(coord2.x - coord1.x, 2);
        var y2 = Math.pow(coord2.y - coord1.y, 2);
        return Math.sqrt(x2 + y2);
    }

    static quickSave() {
        Cookies.set("animTempSave", renderer.anim.getSaveString(), { expires: 1 });
        console.log(Cookies.get("animTempSave"));
    }

    static quickLoad() {
        DOM.loadAnimationFile()
    }
}