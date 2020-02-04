import os from 'os'
import { pid } from 'process'
import { format } from 'util'

import { isPlainObject } from 'lodash'

import levels from './levels'

const hostname = os.hostname()

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

type Level = keyof typeof levels

type LevelObj = (typeof levels)[Level]
type LevelNum = LevelObj['n']
type Severity = LevelObj['severity']

interface WithMsg {
  msg: any,
}

interface WithErr {
  err?: any,
}

export interface Log extends WithMsg, WithErr {
  name: string,
  hostname: string,
  pid: number,
  level: LevelNum,
  severity: Severity,
  time: Date,
  // [key: string]: any,
}

interface Serializers {
  [prop: string]: (o: {}) => {},
}

type AbstractConsole = Pick<Console, Level>

export interface Options {
  name: string,
  console?: AbstractConsole,
  minLevel?: Level,
  extraProps?: {},
  serializers?: Serializers,
  transform?: (o: Log) => any,
}

export default class Logger implements AbstractConsole {
  private readonly options: Options
  private readonly name: string
  private readonly console: AbstractConsole
  private readonly minLevel: LevelNum
  private readonly extraProps: {}
  private readonly serializers: Serializers
  private readonly transform: (o: any) => any

  constructor(options: Options) {
    this.options = options
    this.console = options.console ?? console
    this.name = options.name
    this.minLevel = levels[options.minLevel ?? 'info'].n
    this.extraProps = options.extraProps ?? {}
    this.serializers = options.serializers ?? {}
    this.transform = options.transform ?? JSON.stringify
  }

  private serialize(o: {}) {
    return Object.entries(this.serializers).reduce(
      (prev, [prop, transform]) => prop in o
        ? ({
          ...prev,
          // @ts-ignore
          [prop]: transform(o[prop]),
        })
        : prev,
      {
        ...o,
      },
    )
  }

  private write(lvl: Level, ...data: any[]) {
    const level = levels[lvl]
    if (level.n < this.minLevel) {
      return
    }

    const errs = extractErrors(data)
    const errProp: WithErr = {}
    if (errs.length) {
      errProp.err = errs[0].stack
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

    const log: Log = {
      ...this.extraProps,
      ...errProp,
      ...msgProp,
      name: this.name,
      hostname,
      pid,
      level: level.n,
      severity: level.severity,
      time: new Date(),
    }

    return this.console[lvl](this.transform(log))
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

  child(props: {}) {
    return new Logger({
      ...this.options,
      extraProps: props,
    })
  }
}
