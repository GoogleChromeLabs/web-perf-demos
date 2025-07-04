const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 8;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

Handlebars.registerHelper(require("./helpers.js"));

// create a proxy to direct requests to /images to cdn.glitch.global
fastify.register(require("@fastify/http-proxy"), {
  upstream: "https://cdn.glitch.global/5c7a461a-f9fa-4174-b79d-36b794063351",
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

fastify.get("/images-accept/*", function (request, reply) {
  const { url } = request;
  const filename = path.parse(url).name;

  if (request.headers.accept) {
    if (request.headers.accept.includes("image/avif")) {
      return reply.from(
        `https://cdn.glitch.global/5c7a461a-f9fa-4174-b79d-36b794063351/${filename}.avif`
      );
    } else if (request.headers.accept.includes("image/webp")) {
      return reply.from(
        `https://cdn.glitch.global/5c7a461a-f9fa-4174-b79d-36b794063351/${filename}.webp`
      );
    }
  }

  return reply.from(
    `https://cdn.glitch.global/5c7a461a-f9fa-4174-b79d-36b794063351/${filename}.jpg`
  );
});

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Learn Performance - Images",
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "The <img> element",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "srcset",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/2.hbs", params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "sizes",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/3.hbs", params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "Lossy compression",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/4.hbs", params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "Lossless compression",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/5.hbs", params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "The picture element",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/6.hbs", params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "The picture element and srcset",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/7.hbs", params);

  return reply;
});

fastify.get("/8", function (request, reply) {
  let params = {
    step: 8,
    title: "Accept header",
    head: `<script src="/script.js" defer></script>`
  };

  reply.view("/src/pages/8.hbs", params);

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
