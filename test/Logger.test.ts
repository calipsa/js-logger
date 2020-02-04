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
      extraProps: {
        extra: 'xtra',
      },
    })
    const debug = logger.debug('DEBUG')
    expect(debug).toBeUndefined()

    const info = logger.info('Some message')
    expect(transform(info)).toMatchSnapshot()

    const infoWithReplacement = logger.info('Number %d', 42)
    expect(transform(infoWithReplacement)).toMatchSnapshot()

    const warning = logger.warn('Achtung!')
    expect(transform(warning)).toMatchSnapshot()

    const error = logger.error(new Error('ERROR!'))
    const errorObj = transform(error)
    expect(typeof errorObj.err).toBe('string')
    expect(typeof errorObj.msg).toBe('string')
    expect(withoutErr(errorObj)).toMatchSnapshot()
  })
})
