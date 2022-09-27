import keyboard from "./keyboard.js";
import screen from "./screen.js";
import assembler from "./assembler.js";
import emulator from "./emulator.js";
import { downloadArrayBuffer } from "./utils.js";

emulator.onOutput(screen.addText.bind(screen));
keyboard.onInput(emulator.getInput.bind(emulator));

document.getElementById("assemble").addEventListener("click", (e) => {
    e.target.disabled = true;
    document.getElementById("execute").style = "";
    document.getElementById("download").style = "";
    document.getElementById("reload").style = "";
    document.querySelector("select").disabled = true;

    e.preventDefault();
    const code = document.querySelector("textarea").value;
    const buf = assembler.assemble(code);
    emulator.setRam(buf);
});

document.getElementById("download").addEventListener("click", (e) => {
    downloadArrayBuffer(emulator.ram);
});

document.getElementById("reload").addEventListener("click", (e) => {
    window.location.reload();
});

document.getElementById("execute").addEventListener("click", (e) => {
    e.target.disabled = true;
    emulator.run();
});

document.querySelector("select").addEventListener("change", (e) => {
    if (e.target.value === "custom") {
        document.querySelector("textarea").value = "";
        document.querySelector("textarea").readOnly = false;
    } else {
        fetch(e.target.value)
            .then((res) => res.text())
            .then((code) => {
                document.querySelector("textarea").value = code;
                document.querySelector("textarea").readOnly = true;
            });
    }
});
