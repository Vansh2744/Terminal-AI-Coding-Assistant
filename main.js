import path from "path";
import fs from "fs/promises";
import inquirer from "inquirer";
import chalk from "chalk";
import { diffLines } from "diff";
import os from "os";

const arr = [
  /rm\s+-rf\s+\//,
  /:\(\)\{.*\};:/,
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\/sd/,
  /chmod\s+-R\s+777\s+\//,
];

const res = arr.some((a) => a.test("npm run dev"));

console.log(os.homedir());
