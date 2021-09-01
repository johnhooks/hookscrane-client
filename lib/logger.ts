interface Logger {
  error: typeof console.error;
  warn: typeof console.warn;
  info: typeof console.info;
  debug: typeof console.debug;
}

export enum LogLevel {
  Fatal,
  Error,
  Warn,
  Info,
  Debug,
  Trace,
}

// Would like to make this configurable, but this works for now.
const LOG_LEVEL = LogLevel.Debug;

export const logger: Logger = {
  error(...args: any[]): void {
    if (LOG_LEVEL >= LogLevel.Error) console.error(...args);
  },
  warn(...args: any[]): void {
    if (LOG_LEVEL >= LogLevel.Warn) console.warn(...args);
  },
  info(...args: any[]): void {
    if (LOG_LEVEL >= LogLevel.Info) console.info(...args);
  },
  debug(...args: any[]): void {
    if (LOG_LEVEL >= LogLevel.Debug) console.debug(...args);
  },
};
