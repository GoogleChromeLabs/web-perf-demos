const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const fastify = require("fastify")({
  logger: false,
});

// Assuming utils.js and helpers.js are in the same directory as this file
const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 5;

// Register Handlebars helpers
Handlebars.registerHelper(require("./helpers.js"));

// Configure Fastify View with Handlebars
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: Handlebars,
  },
  // Paths are relative to the root of your deployed Cloud Function
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

// Custom handler for static files (CSS/JS)
fastify.get("/:file(.+).:ext(css|js|png)", async function (request, reply) {
  await delay(parseInt(request.query["delay"], 10) || 0);

  // Construct the absolute path to the file in the Cloud Function environment
  const contentPath = path.join(__dirname, `public/${request.params["file"]}.${request.params["ext"]}`);
  let content;
  try {
      content = request.params["ext"] === "png"
        ? fs.readFileSync(contentPath)
        : fs.readFileSync(contentPath, "utf-8");
  } catch (error) {
    console.error(`Error reading file ${contentPath}:`, error);
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
    case "png":
      reply.type("image/png");
      reply.headers({"cache-control": "max-age=1800"});
      break;
    default:
      reply.type("text/plain");
  }

  return content;
});

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Welcome",
    head: `<link rel="stylesheet" href="./style.css" />`,
  };

  reply.view("/src/pages/index.hbs", params);
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "FOUC",
    scripts: `<script src="./script.js?delay=500"></script>
<link rel="stylesheet" href="./style.css?delay=2000" />`,
  };

  reply.view("/src/pages/1.hbs", params);
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "Partial FOUC",
    head: `<link rel="stylesheet" href="./style.css?delay=1000" />`,
    scripts: `<script src="./script.js?delay=500"></script>
<link rel="stylesheet" href="./demo.css?delay=2000" />`,
  };

  reply.view("/src/pages/2.hbs", params);
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "@import",
    head: `<link rel="stylesheet" href="./import.css?delay=1000" />`,
    scripts: `<script src="./script.js?delay=500"></script>`,
  };

  reply.view("/src/pages/3.hbs", params);
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "@import - link",
    head: `<link rel="stylesheet" href="./vars.css?delay=1000" />
<link rel="stylesheet" href="./import-link.css?delay=1000" />`,
    scripts: `<script src="./script.js?delay=500"></script>`,
  };

  reply.view("/src/pages/4.hbs", params);
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "@import - preload",
    head: `<link rel="preload" href="./vars.css?delay=1000" as="style" />
<link rel="stylesheet" href="./import.css?delay=1000" />`,
    scripts: `<script src="./script.js?delay=500"></script>`,
  };

  reply.view("./src/pages/5.hbs", params);
});

/** end: routes **/

/**
 * This is the entry point for your Google Cloud Function.
 * It uses Fastify to handle the routing internally.
 */
exports.learn_performance_css = async (request, response) => {
  // Ensure Fastify's routes and plugins are ready before handling the request
  await fastify.ready();
  // Pass the incoming request and response objects to Fastify's internal server handler
  fastify.server.emit('request', request, response);
};

