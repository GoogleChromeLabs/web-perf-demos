const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 1;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

Handlebars.registerHelper(require("./helpers.js"));

// create a proxy to direct requests to /images to cdn.glitch.global
fastify.register(require("@fastify/http-proxy"), {
  upstream: "https://cdn.glitch.global/64728001-8411-4e75-95b3-99288bcd6141",
  prefix: "/images",
  disableCache: true,
});

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
/** end: configure fastly **/

// redirect URLs according to Accept header
fastify.register(require("@fastify/reply-from"));

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Learn Performance - Defer IFrames",
  };

  reply.view(`/src/pages/index.hbs`, params);

  return reply;
});


fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "loading=\"lazy\"",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "Hidden IFrames",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});
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
