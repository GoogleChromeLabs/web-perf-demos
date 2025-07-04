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

// create a proxy to direct requests from /images to cdn.glitch.global
fastify.register(require("@fastify/http-proxy"), {
  upstream: "https://cdn.glitch.global/850a76f6-ed10-4120-9f3c-4628563dd9d2",
  prefix: "/images",
  disableCache: false,
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
    head: `<link rel="prefetch" as="script" href="/jquery.js" />
<link rel="prefetch" as="script" href="/jquery-ui.js" />
<link rel="prefetch" as="style" href="/jquery-ui.css" />`,
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "Prefetch documents",
    head: `<link rel="prefetch" as="document" href="/2-prefetch">`,
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2-prefetch", function (request, reply) {
  let params = {
    step: 2,
    title: "Prefetch documents",
    head: `<script src="/2-prefetch.js"></script>`,
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
    head: `<script src="/3-prefetch.js"></script>`,
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
    head: `<script src="/4-prerender.js"></script>`,
  };

  reply.view(`/src/pages/${params.step}-prerender.hbs`, params);

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
