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

fastify.get("/:file(.+).:ext(jpg)", function (request, reply) {
  let returnExtension = "jpg";

  if (!request.params["file"].includes('uncompressed') && request.headers.accept) {
    if (request.headers.accept.includes("image/avif")) {
      returnExtension = "avif";
      reply.type("image/avif");
    } else if (request.headers.accept.includes("image/webp")) {
      returnExtension = "webp";
      reply.type("image/webp");
    } else {
      reply.type("image/jpeg");
    }
  } else {
    reply.type("image/jpeg");
  }

  reply.headers({"cache-control": "max-age=1800"});

  // Construct the absolute path to the file in the Cloud Function environment
  const contentPath = path.join(__dirname, `public/${request.params["file"]}.${returnExtension}`);
  let content;
  try {
      content = fs.readFileSync(contentPath);
  } catch (error) {
    console.error(`Error reading file ${contentPath}:`, error);
    reply.statusCode = 404;
    return "File not found";
  }

  return content;
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
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "srcset",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/2.hbs", params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "sizes",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/3.hbs", params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "Lossy compression",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/4.hbs", params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "Lossless compression",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/5.hbs", params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "The picture element",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/6.hbs", params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "The picture element and srcset",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/7.hbs", params);

  return reply;
});

fastify.get("/8", function (request, reply) {
  let params = {
    step: 8,
    title: "Accept header",
    head: `<script src="./script.js" defer></script>`
  };

  reply.view("/src/pages/8.hbs", params);

  return reply;
});
/** end: routes **/

/**
 * This is the entry point for your Google Cloud Function.
 * It uses Fastify to handle the routing internally.
 */
exports.learn_performance_images = async (request, response) => {
  // Ensure Fastify's routes and plugins are ready before handling the request
  await fastify.ready();
  // Pass the incoming request and response objects to Fastify's internal server handler
  fastify.server.emit('request', request, response);
};

