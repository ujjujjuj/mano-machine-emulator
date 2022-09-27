class Keyboard {
    constructor() {
        this.key = "";
        this.state = new Set();
        this.waiting = false;
        document.addEventListener("keydown", this.keydown.bind(this));
        document.addEventListener("keyup", this.keyup.bind(this));
    }

    onInput(fn) {
        console.log(fn);
        this.input = fn;
    }

    keydown(e) {
        const key = e.keyCode;
        if (this.state.has(key)) return;
        this.state.add(key);
        // console.log(">>> "+e.key);
        this.input(key);
    }

    keyup(e) {
        const key = e.keyCode;
        this.state.delete(key);
    }
}

const keyboard = new Keyboard();

export default keyboard;
