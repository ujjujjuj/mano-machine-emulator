class Screen {
    constructor(w, h) {
        this.width = w;
        this.height = Math.round(h / 2.28);
        this.element = document.querySelector(".screen");
        this.element.style = `width:${w}rem;height:${h}rem`;
        this.text = "";
        this.blinkInterval = setInterval(this.blink.bind(this), 500);
        this.isBlink = false;
    }
    updateText() {
        this.element.innerText = this.text + (this.isBlink ? "|" : "");
    }
    blink() {
        this.updateText();
        this.isBlink = !this.isBlink;
    }
    addText(code) {
        if (code === "clear") {
            this.text = "";
            this.updateText();
            return;
        }
        this.text += String.fromCharCode(code);
        if (code === 13) {
            const nLines = this.text.match(/\r/g)?.length ?? 0;
            if (nLines == this.height - 1) {
                this.text = this.text.split("\r").slice(1).join("\r");
            }
        }

        this.updateText();
    }
}

const screen = new Screen(80, 50);

export default screen;

// setTimeout(() => {
//     screen.addText("\nProgram halted...");
// }, 2500);
