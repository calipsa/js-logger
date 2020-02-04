import Logger, { Options as LoggerOptions } from './Logger'

type Options = Omit<LoggerOptions, 'console' | 'extraProps'>

export = (options: Options) =>
  new Logger(options)
