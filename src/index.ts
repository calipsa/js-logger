import Logger, { Options as LoggerOptions } from './Logger'

type Options = Omit<LoggerOptions, 'extraProps'>

export = (options: Options) =>
  new Logger(options)
