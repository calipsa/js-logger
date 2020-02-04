export default {
  trace: {
    n: 10,
    severity: 'TRACE',
  },
  debug: {
    n: 20,
    severity: 'DEBUG',
  },
  info: {
    n: 30,
    severity: 'INFO',
  },
  warn: {
    n: 40,
    severity: 'WARNING',
  },
  error: {
    n: 50,
    severity: 'ERROR',
  },
  fatal: {
    n: 60,
    severity: 'FATAL',
  },
} as const
