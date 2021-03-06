import Logger, { Options as LoggerOptions } from './Logger'

type Options = Omit<LoggerOptions, 'console'>

export = (options: Options) =>
  new Logger(options)
