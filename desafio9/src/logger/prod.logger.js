import winston from "winston";
import { customLevelOptions } from "../util/loggerCustom.js";

export const logger =winston.createLogger({
    levels:customLevelOptions.level,
    transports:[
        new winston.transports.Console({
            level:"info",
            format:winston.format.combine(
                winston.format.colorize({colors:customLevelOptions.colors}),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename:"./logs/errors.log",
            level:"error",
            format:winston.format.simple(),
        }),
    ],
})