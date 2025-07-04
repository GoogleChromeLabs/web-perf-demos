const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay, getTime, generateRandomString } = require("./utils");

const md5 = (input) => createHash("md5").update(input).digest("hex");

// total number of steps in this demo
const MAX_STEP = 4;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

// replaced @fastify/static with a custom get handler which delays the response by N milliseconds
fastify.get("/:file(.+).:ext(css|js)", async function (request, reply) {
  await delay(request.query["delay"] || 0);
  const content = fs.readFileSync(
    `./public/${request.params["file"]}.${request.params["ext"]}`,
    "utf-8"
  );

  switch (request.params["ext"]) {
    case "css":
      reply.type("text/css");
      break;
    case "js":
      reply.type("text/javascript");
      break;
    default:
      reply.type("text/plain");
  }

  return content;
});

Handlebars.registerHelper(require("./helpers.js"));

fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: Handlebars,
  },
  layout: "/src/partials/layout.hbs",
  options: {
    partials: {
      nav: "/src/partials/nav.hbs",
      footer: "/src/partials/footer.hbs",
      heading: "/src/partials/heading.hbs",
    },        
  },
  defaultContext: {
    maxStep: MAX_STEP
  }
});
/** end: configure fastly **/

const scripts = ``;

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Welcome",
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "no-store",
    data: generateRandomString(100, 200),    
    time: getTime(new Date()),
    scripts
  };

  reply.headers({
    "cache-control": "no-store",
  });
  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    time: getTime(new Date()),
    title: "etag",
    data: generateRandomString(100, 200),
    scripts,
  };

  const etag = md5(getTime(new Date()));

  if (etag === request.headers["if-none-match"]) {
    reply.statusCode = 304;
    reply.send();
  } else {
    reply.headers({
      "cache-control": "no-cache",
      etag,
    });
    reply.view("/src/pages/2.hbs", params);
  }

  return reply;
});

fastify.get("/3", function (request, reply) {
  const time = getTime(new Date());

  let params = {
    step: 3,
    time,
    title: "last-modified",
    data: generateRandomString(100, 200),
    scripts,
  };

  if (time <= request.headers["if-modified-since"]) {
    reply.statusCode = 304;
    reply.send();
  } else {
    reply.headers({
      "cache-control": "no-cache",
      "last-modified": time,
    });
    reply.view("/src/pages/3.hbs", params);
  }

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    time: getTime(new Date()),
    title: "max-age=N",
    data: generateRandomString(100, 200),
    scripts,
  };

  const etag = md5(getTime(new Date()));

  if (etag === request.headers["if-none-match"]) {
    reply.statusCode = 304;
    reply.send();
  } else {
    reply.headers({
      "cache-control": "max-age=30",
      etag,
    });
    reply.view("/src/pages/4.hbs", params);
  }

  return reply;
});
/** end: demo routes **/

/** end: routes **/

// start the fastify server
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);
