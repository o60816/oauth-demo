"use strict";
const pino = require("pino")(
  {
    level: process.env.LEVEL || "info",
  },
  process.stdout
);
const DEBUGFUNCS = ["debug", "info", "warn", "error"];

/**
 *
 * @param {*} debugFunc Function used to print the debug messge
 * @param {*} msg Debug message
 * @param {*} level Default 2 for parent func, change to 3 for grandparent func
 * @returns
 */
function debugLog(debugFunc, msg, level = 2) {
  let e = new Error();
  let frame = e.stack.split("\n")[level];
  let lineNumber = frame?.split(":").reverse()[1];
  let functionName = frame?.split(" ")[5];
  debugFunc(`[${functionName}:${lineNumber}] ${msg}`);
}

let logger = {
  setLevel(level) {
    pino.level = level;
  },
};

for (let func of DEBUGFUNCS) {
  logger[func] = debugLog.bind(null, pino[func].bind(pino));
}

module.exports = {
  logger,
};
