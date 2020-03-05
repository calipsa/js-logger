import { identity } from 'lodash'
import { omit } from 'lodash/fp'

import Logger from '../src/Logger'

const fakeConsole = {
  debug: identity,
  trace: identity,
  info: identity,
  warn: identity,
  error: identity,
}

const withoutDirtyProps = omit([
  'hostname',
  'pid',
  'time',
  'v',
])

const withoutErr = omit([
  'err',
])

const transform = (s: any) =>
  withoutDirtyProps(JSON.parse(s))

describe('Logger', () => {
  it('should output correct log', () => {
    const logger = new Logger({
      name: 'test-log',
      console: fakeConsole,
      minLevel: 'info',
    })
    const debug = logger.debug('DEBUG')
    expect(debug).toBeUndefined()

    const info = logger.info('Some message')
    expect(transform(info)).toMatchSnapshot()

    const infoWithReplacement = logger.info('Number %d', 42)
    expect(transform(infoWithReplacement)).toMatchSnapshot()

    const warning = logger.warn('Achtung!')
    expect(transform(warning)).toMatchSnapshot()

    const warningErr = logger.warn(new Error('WARNING!'))
    const warningErrObj = transform(warningErr)
    expect(typeof warningErrObj.err).toBe('object')
    expect(typeof warningErrObj.err.message).toBe('string')
    expect(typeof warningErrObj.err.stack).toBe('string')
    expect(typeof warningErrObj.msg).toBe('string')
    expect(withoutErr(warningErrObj)).toMatchSnapshot()

    const error = logger.error(new Error('ERROR!'))
    const errorObj = transform(error)
    expect(typeof errorObj.err).toBe('object')
    expect(typeof errorObj.err.message).toBe('string')
    expect(typeof errorObj.err.stack).toBe('string')
    expect(typeof errorObj.msg).toBe('string')
    expect(withoutErr(errorObj)).toMatchSnapshot()

    const fatalErr = logger.fatal(new Error('FATAL!!!'))
    const fatalErrObj = transform(fatalErr)
    expect(typeof fatalErrObj.err).toBe('object')
    expect(typeof fatalErrObj.err.message).toBe('string')
    expect(typeof fatalErrObj.err.stack).toBe('string')
    expect(typeof fatalErrObj.msg).toBe('string')
    expect(withoutErr(fatalErrObj)).toMatchSnapshot()
  })

  it('should output correct log for a child', () => {
    const logger = new Logger({
      name: 'test-log',
      console: fakeConsole,
      minLevel: 'info',
    })
    const extraProps = {
      extra: 'xtra',
    }
    const child = logger.child(extraProps)
    const withoutExtraProps = omit(Object.keys(extraProps))

    const args = [
      {
        foo: 'bar',
      },
      'Some message for child',
    ]
    const result = logger.info(...args)
    const childResult = child.info(...args)

    expect(withoutExtraProps(transform(childResult))).toEqual(transform(result))
    expect(transform(result)).toMatchSnapshot()
    expect(transform(childResult)).toMatchSnapshot()
  })
})
