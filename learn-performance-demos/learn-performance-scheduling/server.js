const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 6;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

Handlebars.registerHelper(require("./helpers.js"));


// Custom handler for static files (CSS/JS/PNG)
fastify.get("/:file(.+).:ext(css|js|png|svg|json)", async function (request, reply) {
  await delay(parseInt(request.query["delay"], 10) || 0);

  const contentPath = path.join(__dirname, `public/${request.params["file"]}.${request.params["ext"]}`);
  let content;
  try {
    content = request.params["ext"] === "png"
      ? fs.readFileSync(contentPath)
      : fs.readFileSync(contentPath, "utf-8");
  } catch (error) {
    reply.statusCode = 404;
    return "File not found";
  }

  switch (request.params["ext"]) {
    case "css":
      reply.type("text/css; charset=utf-8");
      reply.headers({"cache-control": "max-age=300"});
      break;
    case "js":
      reply.type("text/javascript; charset=utf-8");
      reply.headers({"cache-control": "max-age=300"});
      break;
    case "json":
      reply.type("application/json; charset=utf-8");
      reply.headers({"cache-control": "max-age=300"});
      break;
    case "png":
      reply.type("image/svg+xml");
      reply.headers({"cache-control": "max-age=1800"});
      break;
    case "png":
      reply.type("image/png");
      reply.headers({"cache-control": "max-age=1800"});
      break;
    default:
      reply.type("text/plain; charset=utf-8");
      reply.headers({"cache-control": "max-age=300"});
  }

  return content;
});

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
    maxStep: MAX_STEP,
  },
});
/** end: configure fastly **/

// redirect URLs according to Accept header
fastify.register(require("@fastify/reply-from"));

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Learn Performance - Scheduling non-critical work",
  };

  reply.view(`/src/pages/index.hbs`, params);

  return reply;
});

fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "Long tasks",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "setTimeout",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "yieldToMain",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "Yielding Periodically",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "Presentation Delay",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "Debounce",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "Scheduler: PostTask",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/8", function (request, reply) {
  let params = {
    step: 8,
    title: "Compare setTimouet and requestAnimationFrame",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});
/** end: routes **/

/**
 * This is the entry point for your Google Cloud Function.
 * It uses Fastify to handle the routing internally.
 */
exports.learn_performance_scheduling = async (request, response) => {
  // Ensure Fastify's routes and plugins are ready before handling the request
  await fastify.ready();
  // Pass the incoming request and response objects to Fastify's internal server handler
  fastify.server.emit('request', request, response);
};

