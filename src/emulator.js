class Emulator {
    constructor() {
        this.reset();
        this.ram = null;
        this.view = null;
    }
    reset() {
        if (this.isRunning && !this.isHalted) return;
        console.log("Resetting emulator...");
        this.registers = {
            AR: 0,
            PC: 0,
            DR: 0,
            AC: 0,
            IR: 0,
            TP: 0,
            OUTR: 0,
            INPR: 0,
            SC: 0,
        };
        this.ff = {
            I: 0,
            S: 0,
            E: 0,
            R: 0,
            IEN: 0,
            FGI: 0,
            FGO: 1,
        };
        if (this.rom) {
            this.ram = this.rom.slice(0);
            this.view = new DataView(this.ram);
        }
        this.halted = false;
        this.isRunning = false;
        this.keyboardBuffer = [];
        this.keyboardPromiseResolver = null;
        if (this.output) {
            this.output("clear");
        }
    }
    setRam(buf) {
        this.rom = buf;
        this.ram = buf.slice(0);
        this.view = new DataView(this.ram);
    }
    getInput(letter) {
        if (this.keyboardPromiseResolver) this.keyboardPromiseResolver();
        this.ff.FGI = 0;
        this.keyboardBuffer.push(letter);
    }
    onOutput(fn) {
        this.output = fn;
    }
    read(off) {
        return this.view.getUint16(off * 2, false);
    }
    write(off, data) {
        this.view.setUint16(off * 2, data, false);
    }
    async run() {
        if (this.isRunning) return;
        this.reset();
        this.isRunning = true;
        while (true) {
            if (this.halted) break;
            await this._stepInstruction();
            // await new Promise((resolve) => setInterval(resolve, 0));
        }
        for (let char of "\n\nFinished execution...") {
            this.output(char.charCodeAt(0));
        }
        // console.log(new Uint8Array(this.ram));
        this.isRunning = false;
    }
    async _stepInstruction() {
        // console.log(this.registers.PC.toString(16));
        const inst = this.read(this.registers.PC);
        this.registers.PC++;

        this.ff.I = inst >> 15;
        let opcode = (inst & 0b0111000000000000) >> 12;

        if (opcode == 0b111) {
            switch (inst) {
                case 0x7800: {
                    this.registers.AC = 0;
                    break;
                }
                case 0x7400: {
                    this.ff.E = 0;
                    break;
                }
                case 0x7200: {
                    this.registers.AC = ~this.registers.AC & 0b1111111111111111;
                    break;
                }
                case 0x7100: {
                    this.ff.E = ~this.ff.E & 1;
                    break;
                }
                case 0x7080: {
                    this.ff.E = this.registers.AC & 1;
                    this.registers.AC >>= 1;
                    this.registers.AC |= this.ff.E << 15;
                    break;
                }
                case 0x7040: {
                    this.ff.E = (this.registers.AC & 0b1000000000000000) >> 15;
                    this.registers.AC = (this.registers.AC << 1) & 0xffff;
                    this.registers.AC |= this.ff.E;
                    break;
                }
                case 0x7020: {
                    this.registers.AC++;
                    break;
                }
                case 0x7010: {
                    if (this.registers.AC >= 0) {
                        this.registers.PC++;
                    }
                    break;
                }
                case 0x7008: {
                    if ((this.registers.AC & 0x8000) > 0) {
                        this.registers.PC++;
                    }
                    break;
                }
                case 0x7004: {
                    if (this.registers.AC === 0) {
                        this.registers.PC++;
                    }
                    break;
                }
                case 0x7002: {
                    if (!this.ff.E) {
                        this.registers.PC++;
                    }
                    break;
                }
                case 0x7001: {
                    this.halted = true;
                    break;
                }
                case 0xf800: {
                    if (this.keyboardBuffer.length === 0) {
                        await new Promise((resolve) => {
                            this.keyboardPromiseResolver = resolve;
                        });
                    }
                    this.registers.AC = this.keyboardBuffer.shift();
                    if (this.keyboardBuffer.length === 0) {
                        this.ff.FGI = 1;
                    }
                    break;
                }
                case 0xf400: {
                    this.output(this.registers.AC);
                    break;
                }
                case 0xf100: {
                    if (this.ff.FGI === 1) {
                        this.registers.PC++;
                    }
                    break;
                }
                case 0xf200: {
                    if (this.ff.FGO === 1) {
                        this.registers.PC++;
                    }
                    break;
                }
                case 0xf080: {
                    this.ff.IEN = 1;
                    break;
                }
                case 0xf040: {
                    this.ff.IEN = 0;
                    break;
                }
                default: {
                    throw `Invalid opcode ${inst}`;
                    break;
                }
            }
        } else {
            this.registers.AR = inst & 0b111111111111;
            if (this.ff.I === 1) {
                this.registers.AR = this.read(this.registers.AR);
            }
            switch (opcode) {
                case 0: {
                    this.registers.AC &= this.read(this.registers.AR);
                    break;
                }
                case 1: {
                    this.registers.AC = (this.registers.AC + this.read(this.registers.AR)) % 0x10000;
                    break;
                }
                case 2: {
                    this.registers.AC = this.read(this.registers.AR);
                    break;
                }
                case 3: {
                    this.write(this.registers.AR, this.registers.AC);
                    break;
                }
                case 4: {
                    this.registers.PC = this.registers.AR;
                    break;
                }
                case 5: {
                    this.write(this.registers.AR++, this.registers.PC);
                    this.registers.PC = this.registers.AR;
                    break;
                }
                case 6: {
                    this.registers.DR = this.read(this.registers.AR);
                    this.registers.DR = (this.registers.DR + 1) % 65536;
                    this.write(this.registers.AR, this.registers.DR);
                    if (this.registers.DR === 0) {
                        this.registers.PC++;
                    }
                    break;
                }
            }
        }
    }
}

const emulator = new Emulator();

export default emulator;
