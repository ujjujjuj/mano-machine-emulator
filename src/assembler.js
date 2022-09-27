const instructions = {
    pseudo: ["ORG", "DEC", "HEX", "END"],
    mr: ["AND", "ADD", "LDA", "STA", "BUN", "BSA", "ISZ"],
    nmr: [
        "CLA",
        "CLE",
        "CMA",
        "CME",
        "CIR",
        "CIL",
        "INC",
        "SPA",
        "SNA",
        "SZA",
        "SZE",
        "HLT",
        "INP",
        "OUT",
        "SKI",
        "SKO",
        "ION",
        "IOF",
    ],
};
const nmrcodes = [
    0b0111100000000000, 0b0111010000000000, 0b0111001000000000, 0b0111000100000000, 0b0111000010000000,
    0b0111000001000000, 0b0111000000100000, 0b0111000000010000, 0b0111000000001000, 0b0111000000000100,
    0b0111000000000010, 0b0111000000000001, 0b1111100000000000, 0b1111010000000000, 0b1111001000000000,
    0b1111000100000000, 0b1111000010000000, 0b1111000001000000,
];

class Assembler {
    constructor() {}

    tokenize(code) {
        code = code.trim();
        let tokens = [];
        for (let line of code.split("\n")) {
            line = line
                .split("/")[0]
                .trim()
                .replaceAll(",", ", ")
                .replaceAll(/ +/g, " ")
                .split(" ")
                .filter((a) => a.length > 0);
            if (line.length === 0) continue;
            tokens.push(line);
        }
        return tokens;
    }

    assemble(code) {
        const symbols = {};
        const tokens = this.tokenize(code);

        // first pass
        let lc = 0;
        for (const token of tokens) {
            let first = token[0];
            if (first === "ORG") {
                lc = Number("0x" + token[1]);
            } else if (first === "END") {
                break;
            } else {
                if (first.includes(",")) {
                    symbols[first.replace(",", "")] = lc;
                }
                lc++;
            }
        }
        console.log("Finished first pass, symbol table is", symbols);

        // second pass
        const data = new ArrayBuffer(4096 * 2);
        const view = new DataView(data);
        lc = 0;
        for (let token of tokens) {
            if (token[0].includes(",")) {
                token = token.slice(1);
            }
            if (instructions.pseudo.includes(token[0])) {
                if (token[0] === "ORG") {
                    lc = parseInt("0x" + token[1]);
                    continue;
                } else if (token[0] === "END") {
                    break;
                } else {
                    let val;
                    if (Object.keys(symbols).includes(token[1])) {
                        // is a symbol
                        val = symbols[token[1]];
                    } else {
                        if (token[0] === "HEX") {
                            if (Object.keys(symbols).includes(token[1])){
                                token[1] = symbols[token[1]].toString(16)
                            }
                            token[1] = "0x" + token[1];
                        }
                        val = Number(token[1]);
                    }
                    val = val % 65536;
                    view.setUint16(lc * 2, val, false);
                }
            } else if (instructions.mr.includes(token[0])) {
                let inst = instructions.mr.indexOf(token[0]) << 12;
                if (token[token.length - 1] === "I") {
                    inst |= 0x8000;
                }
                inst |= symbols[token[1]];
                view.setUint16(lc * 2, inst, false);
            } else if (instructions.nmr.includes(token[0])) {
                let inst = nmrcodes[instructions.nmr.indexOf(token[0])];
                view.setUint16(lc * 2, inst, false);
            } else {
                alert(`Invalid instruction: ${token}`);
                throw `Invalid instruction: ${token}`;
            }

            lc++;
        }
        console.log("Finished second pass, RAM:");

        // for (let i = 0; i < 4096 * 2; i += 2) {
        //     const val = view.getUint16(i, false);
        //     if (val != 0) {
        //         console.log(`0x${(i / 2).toString(16).padStart(4, "0")}: ${val}`);
        //     }
        // }

        return data;
    }
}

const assembler = new Assembler();

export default assembler;
