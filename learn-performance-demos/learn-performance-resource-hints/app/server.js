const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay, generateRandomString } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 5;

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
    maxStep: MAX_STEP,
  },
});
/** end: configure fastly **/

const scripts = ``;

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Welcome",
    head: `<link rel="stylesheet" href="/style.css" />`,
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "preconnect",
    head: `<link rel="stylesheet" href="/style.css?delay=1000" />
<script src="/gallery.js?delay=1000" defer></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "HTTP headers",
    head: `<link rel="stylesheet" href="/style.css?delay=1000" />
<script src="/gallery.js?delay=1000" defer></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.header("Link", "<https://cdn.glitch.global>; rel=preconnect;");
  reply.view("/src/pages/2.hbs", params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "preload",
    head: `<link rel="stylesheet" href="/style.css?delay=1000" />
<link rel="stylesheet" href="/background-image.css?delay=1000" />
<link rel="preload" href="https://cdn.glitch.global/db01a8e4-9230-4c5c-977d-85d0e0c3e74c/image-1.jpg?v=1669198400523" as="image" />
<script src="/gallery.js?delay=1000" defer></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.view("/src/pages/3.hbs", params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "preload - img",
    head: `<link rel="stylesheet" href="/style.css?delay=1000" />
<link rel="preload" href="https://cdn.glitch.global/db01a8e4-9230-4c5c-977d-85d0e0c3e74c/image-1.jpg?v=1669198400523" as="image" />
<script src="/gallery.js?delay=1000" defer></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.view("/src/pages/4.hbs", params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "fetchpriority",
    head: `<link rel="stylesheet" href="/style.css?delay=1000" />
<link rel="preload" href="https://cdn.glitch.global/db01a8e4-9230-4c5c-977d-85d0e0c3e74c/image-1.jpg?v=1669198400523" as="image" fetchpriority="high" />
<script src="/gallery.js?delay=1000" defer></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.view("/src/pages/5.hbs", params);

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
