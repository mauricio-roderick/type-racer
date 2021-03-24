import * as Sentry from '@sentry/browser';

const errorLog = () => {
  return new Promise(resolve => {
    if (process.env.SENTRY_DSN && process.env.ENV === 'prod') {
      Sentry.init({ dsn: process.env.SENTRY_DSN });
      Sentry.configureScope(scope => {
        scope.setExtra('Environment', process.env.ENV);
        scope.setExtra('App Version', process.env.APP_VERSION);
      });
    }

    resolve();
  });
};

export default errorLog;