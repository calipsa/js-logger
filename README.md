# @calipsa/logger

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

## Installation
```bash
# using npm:
npm install --save @calipsa/logger

# or if you like yarn:
yarn add @calipsa/logger
```

## Usage
Works pretty much like `bunyan`.
```javascript
import createLogger from '@calipsa/logger'

const logger = createLogger({
  name: 'foobar',
  minLevel: 'info',
  // serializers: { },
  // transform: (o) => o,
})

logger.info('foo')
logger.warn('warning')
logger.error(new Error('some error'))

const child = logger.child({
  extraProp: '234',
})

child.info('with extra prop')

// ...
```

[npm-url]: https://npmjs.org/package/@calipsa/logger
[downloads-image]: http://img.shields.io/npm/dm/@calipsa/logger.svg
[npm-image]: http://img.shields.io/npm/v/@calipsa/logger.svg
[david-dm-url]:https://david-dm.org/inker/@calipsa/logger
[david-dm-image]:https://david-dm.org/inker/@calipsa/logger.svg
[david-dm-dev-url]:https://david-dm.org/inker/@calipsa/logger#info=devDependencies
[david-dm-dev-image]:https://david-dm.org/inker/@calipsa/logger/dev-status.svg
