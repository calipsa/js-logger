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

type LevelNum = (typeof levels)[Level]

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
  time: Date,
  // [key: string]: any,
}

interface Serializers {
  [prop: string]: (o: {}) => {},
}

export interface Options {
  name: string,
  minLevel?: Level,
  extraProps?: {},
  serializers?: Serializers,
  transform?: (o: Log) => any,
}

type BaseLogger = Pick<Console, Level>

export default class Logger implements BaseLogger {
  private readonly options: Options
  private readonly name: string
  private readonly minLevel: LevelNum
  private readonly extraProps: {}
  private readonly serializers: Serializers
  private readonly transform: (o: any) => any

  constructor(options: Options) {
    this.options = options
    this.name = options.name
    this.minLevel = levels[options.minLevel ?? 'info']
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
    if (levels[lvl] < this.minLevel) {
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
      level: levels[lvl],
      time: new Date(),
    }

    // eslint-disable-next-line no-console
    console[lvl](this.transform(log))
  }

  trace(...data: any[]) {
    this.write('trace', ...data)
  }

  debug(...data: any[]) {
    this.write('debug', ...data)
  }

  info(...data: any[]) {
    this.write('info', ...data)
  }

  warn(...data: any[]) {
    this.write('warn', ...data)
  }

  error(...data: any[]) {
    this.write('error', ...data)
  }

  child(props: {}) {
    return new Logger({
      ...this.options,
      extraProps: props,
    })
  }
}
