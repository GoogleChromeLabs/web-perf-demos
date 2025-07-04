const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const fastify = require("fastify")({
  logger: false,
});

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 1;

Handlebars.registerHelper(require("./helpers.js"));

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
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

// redirect URLs according to Accept header
fastify.register(require("@fastify/reply-from"));

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Learn Performance - Defer IFrames",
  };

  reply.view(`/src/pages/index.hbs`, params);
});


fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "loading=\"lazy\"",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "Hidden IFrames",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);
});
/** end: routes **/

/**
 * This is the entry point for your Google Cloud Function.
 * It uses Fastify to handle the routing internally.
 */
exports.learn_performance_defer_iframes = async (request, response) => {
  // Ensure Fastify's routes and plugins are ready before handling the request
  await fastify.ready();
  // Pass the incoming request and response objects to Fastify's internal server handler
  fastify.server.emit('request', request, response);
};
