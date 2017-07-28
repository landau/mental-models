'use strict';

exports.attach = function(server, logger) {

  function logEvent(request, error) {
    const {response, id, url, method, headers, info} = request;
    const {statusCode} = response.isBoom ? response.output : response;
    const {env} = request.server.app.config;

    const logLine = {
      id,
      statusCode,
      method,
      env,
      url: url.href,
      userAgent: headers['user-agent'],
      requestIp: info.remoteAddress,
      referrer: info.referrer,
      handlerExecutionTime: info.responded - info.received,
      bufferLength: response.source ? response.source.length : null
    };

    if (error) {
      logger.error(error, logLine);
    } else {
      if (!request.route.settings.tags.includes('assets')) {
        logger.info(logLine);
      }
    }
  }

  server.on('response', logEvent);
  server.on('request-error', logEvent);
};
