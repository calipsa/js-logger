import { format } from 'util'

import {
  isPlainObject,
  mapValues,
} from 'lodash'

import callOrReturn from './utils/callOrReturn'
import errorToObject from './utils/errorToObject'

import levels from './levels'

/**
 * mutates `data`
 */
function extractErrors(data: any[]) {
  const len = data.length
  const errs: Error[] = []
  for (let i = 0; i < len; ++i) {
    const d = data[i]
    if (d instanceof Error) {
      errs.push(d)
      // eslint-disable-next-line no-param-reassign
      data[i] = d.message
    }
  }
  return errs
}

type Levels = typeof levels
type Level = keyof Levels
type Method = Exclude<Level, 'fatal'>
type LevelObj = Levels[Level]
type LevelNum = LevelObj['n']
type Severity = LevelObj['severity']

type ErrorObject = ReturnType<typeof errorToObject>

interface WithMsg {
  msg: any,
}

interface WithErr {
  err?: ErrorObject,
}

export interface Log extends WithMsg, WithErr {
  name: string,
  level: LevelNum,
  severity: Severity,
  time: Date,
  // [key: string]: any,
}

interface ExtraProps {
  [prop: string]: unknown | (() => unknown),
}

interface Serializers {
  // TODO: replace unknown with something looking like {}
  [prop: string]: (o: unknown) => unknown,
}

type AbstractConsole = Pick<Console, Method>

export interface Options {
  name: string,
  console?: AbstractConsole,
  minLevel?: Level,
  extraProps?: ExtraProps,
  serializers?: Serializers,
  transform?: (o: Log) => any,
}

export default class Logger implements AbstractConsole {
  readonly #options: Options
  readonly #name: string
  readonly #console: AbstractConsole
  readonly #minLevel: LevelNum
  readonly #extraProps: ExtraProps
  readonly #serializers: Serializers
  readonly #transform: (o: any) => any

  constructor(options: Options) {
    this.#options = options
    this.#console = options.console ?? console
    this.#name = options.name
    this.#minLevel = levels[options.minLevel ?? 'info'].n
    this.#extraProps = options.extraProps ?? {}
    this.#serializers = options.serializers ?? {}
    this.#transform = options.transform ?? JSON.stringify
  }

  private serialize(o: Record<string, unknown>) {
    return Object.entries(this.#serializers).reduce(
      (prev, [prop, transform]) => prop in o
        ? {
          ...prev,
          [prop]: transform(o[prop]),
        }
        : prev,
      {
        ...o,
      },
    )
  }

  private write(lvl: Level, ...data: any[]) {
    const level = levels[lvl]
    if (level.n < this.#minLevel) {
      return
    }

    const errs = extractErrors(data)
    const errProp: WithErr = {}
    if (errs.length) {
      errProp.err = errorToObject(errs[0])
    }

    const [first, ...rest] = data
    const msgProp: WithMsg = isPlainObject(first)
      ? {
        ...this.serialize(first),
        // @ts-ignore
        msg: format(...rest),
      }
      : {
        msg: format(first, ...rest),
      }

    const extraProps = mapValues(this.#extraProps, callOrReturn)

    const log: Log = {
      ...extraProps,
      ...errProp,
      ...msgProp,
      name: this.#name,
      level: level.n,
      severity: level.severity,
      time: new Date(),
    }

    const method = lvl === 'fatal' ? 'error' : lvl
    return this.#console[method](this.#transform(log))
  }

  trace(...data: any[]) {
    return this.write('trace', ...data)
  }

  debug(...data: any[]) {
    return this.write('debug', ...data)
  }

  info(...data: any[]) {
    return this.write('info', ...data)
  }

  warn(...data: any[]) {
    return this.write('warn', ...data)
  }

  error(...data: any[]) {
    return this.write('error', ...data)
  }

  fatal(...data: any[]) {
    return this.write('fatal', ...data)
  }

  child(props: Record<string, unknown>) {
    return new Logger({
      ...this.#options,
      extraProps: {
        ...this.#extraProps,
        ...props,
      },
    })
  }
}
