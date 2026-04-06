const serverless = require('serverless-http');
const { requestHandler } = require('../../web-api-server');

const toApiPath = (value) => {
  const raw = String(value || '/');
  const stripped = raw.replace(/^\/\.netlify\/functions\/api/, '');
  return stripped || '/';
};

const wrapped = serverless((req, res) => {
  req.url = toApiPath(req.url);
  return requestHandler(req, res);
});

exports.handler = async (event, context) => {
  const nextEvent = {
    ...event,
    path: toApiPath(event.path || event.rawPath || '/'),
  };

  if (event.rawPath) {
    nextEvent.rawPath = toApiPath(event.rawPath);
  }

  if (event.requestContext && event.requestContext.http) {
    nextEvent.requestContext = {
      ...event.requestContext,
      http: {
        ...event.requestContext.http,
        path: toApiPath(event.requestContext.http.path || nextEvent.path),
      },
    };
  }

  return wrapped(nextEvent, context);
};
