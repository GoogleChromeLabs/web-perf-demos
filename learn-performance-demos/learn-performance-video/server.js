const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 7;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
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

/** start: routes **/

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


// redirect URLs according to Accept header
fastify.register(require("@fastify/reply-from"));

fastify.get("/images-accept/*", function (request, reply) {
  const { url } = request;
  const filename = path.parse(url).name;

  if (request.headers.accept) {
    if (request.headers.accept.includes("image/avif")) {
      return reply.from(
        `./${filename}.avif`
      );
    } else if (request.headers.accept.includes("image/webp")) {
      return reply.from(
        `./${filename}.webp`
      );
    }
  }

  return reply.from(
    `./${filename}.jpg`
  );
});

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Learn Performance - Video",
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "The video element",
  };

  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "preload"
  };

  reply.view("/src/pages/2.hbs", params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "autoplay"
  };

  reply.view("/src/pages/3.hbs", params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "GIF replacement"
  };

  reply.view("/src/pages/4.hbs", params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "YouTube embed"
  };

  reply.view("/src/pages/5.hbs", params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "lite-youtube-embed",
    head: `<link rel="stylesheet" href="/lite-yt-embed.css">
<script src="./lite-yt-embed.js"></script>`
  };

  reply.view("/src/pages/6.hbs", params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "fetchpriority on poster image",
    head: `<script src="./script.js?delay=300"></script>`
  };

  reply.view("/src/pages/7.hbs", params);

  return reply;
});

/** end: routes **/

/**
 * This is the entry point for your Google Cloud Function.
 * It uses Fastify to handle the routing internally.
 */
exports.learn_performance_video = async (request, response) => {
  // Ensure Fastify's routes and plugins are ready before handling the request
  await fastify.ready();
  // Pass the incoming request and response objects to Fastify's internal server handler
  fastify.server.emit('request', request, response);
};

