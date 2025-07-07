const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay, generateRandomString } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 4;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

// replaced @fastify/static with a custom get handler which delays the response by N milliseconds
fastify.get("/:file(.+).:ext(css|js|png)", async function (request, reply) {
  await delay(parseInt(request.query["delay"], 10) || 0);
  const content = request.params["ext"] === "png"
    ? fs.readFileSync(
    `./public/${request.params["file"]}.${request.params["ext"]}`)
    : fs.readFileSync(
    `./public/${request.params["file"]}.${request.params["ext"]}`,"utf-8");

  switch (request.params["ext"]) {
    case "css":
      reply.type("text/css; charset=utf-8");
      reply.headers({"cache-control": "max-age=300"});
      break;
    case "js":
      reply.type("text/javascript; charset=utf-8");
      reply.headers({"cache-control": "max-age=300"});
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
    maxStep: MAX_STEP,
  },
});
/** end: configure fastly **/

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Welcome",
    head: ``,
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "Prefetch resources",
    head: `<link rel="prefetch" as="script" href="./jquery.js" />
<link rel="prefetch" as="script" href="./jquery-ui.js" />
<link rel="prefetch" as="style" href="./jquery-ui.css" />`,
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "Prefetch documents",
    head: `<link rel="prefetch" as="document" href="./2-prefetch?noslash">`,
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2-prefetch", function (request, reply) {
  let params = {
    step: 2,
    title: "Prefetch documents",
    head: `<script src="./2-prefetch.js"></script>`,
  };

  reply.view(`/src/pages/${params.step}-prefetch.hbs`, params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "Speculation Rules",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/3-prefetch", function (request, reply) {
  let params = {
    step: 3,
    title: "Speculation rules",
    head: `<script src="./3-prefetch.js"></script>`,
  };

  reply.view(`/src/pages/${params.step}-prefetch.hbs`, params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "Prerender",
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/4-prerender", function (request, reply) {
  let params = {
    step: 4,
    title: "Prerender",
    head: `<script src="./4-prerender.js"></script>`,
  };

  reply.view(`/src/pages/${params.step}-prerender.hbs`, params);

  return reply;
});

/** end: routes **/

/**
 * This is the entry point for your Google Cloud Function.
 * It uses Fastify to handle the routing internally.
 */
exports.learn_performance_prefetch_and_prerender = async (request, response) => {
  // Ensure Fastify's routes and plugins are ready before handling the request
  await fastify.ready();
  // Pass the incoming request and response objects to Fastify's internal server handler
  fastify.server.emit('request', request, response);
};

