# Mano Machine Emulator
An Emulator and Assembler for the Mano Machine, written in JavaScript

## About
Mano Machine is a computer described by M. Morris Mano in his book *Computer System Architecture (Third Edition)*.
It consists of the f the following hardware components:
1. A memory unit with 4096 words of 16 bits each
2. Nine registers: AR, PC, DR, AC, IR, TR, OUTR, INPR, and SC
3. Seven flip-flops: I, S, E, R, IEN, FGI, and FGO
4. Two decoders: a 3 x 8 operation decoder and a 4 x 16 timing decoder
5. A 16-bit common bus
6. Control logic gates
7. Adder and logic circuit connected to the input of AC

## Usage
Build with the following command
```bash
yarn build
```