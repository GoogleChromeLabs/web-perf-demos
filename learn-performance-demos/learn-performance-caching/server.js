const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const fastify = require("fastify")({
  logger: false,
});

const { delay, getTime, generateRandomString } = require("./utils");

const md5 = (input) => createHash("md5").update(input).digest("hex");

// total number of steps in this demo
const MAX_STEP = 4;

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
    maxStep: MAX_STEP
  }
});

// Custom handler for static files (CSS/JS/PNG)
fastify.get("/:file(.+).:ext(css|js|png)", async function (request, reply) {
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

const scripts = ``; // This seems to be an empty string in your original code.

/** start: routes **/

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Welcome",
  };
  // Path relative to the root of your deployed Cloud Function
  reply.view("/src/pages/index.hbs", params);
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "no-store",
    data: generateRandomString(100, 200),
    time: getTime(new Date()),
    scripts
  };

  reply.headers({
    "cache-control": "no-store",
  });
  reply.view("/src/pages/1.hbs", params);
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    time: getTime(new Date()),
    title: "etag",
    data: generateRandomString(100, 200),
    scripts,
  };

  const etag = md5(getTime(new Date()));

  if (etag === request.headers["if-none-match"]) {
    reply.statusCode = 304;
    reply.send();
  } else {
    reply.headers({
      "cache-control": "no-cache",
      etag,
    });
    reply.view("/src/pages/2.hbs", params);
  }
});

fastify.get("/3", function (request, reply) {
  const time = getTime(new Date());

  let params = {
    step: 3,
    time,
    title: "last-modified",
    data: generateRandomString(100, 200),
    scripts,
  };

  if (time <= request.headers["if-modified-since"]) {
    reply.statusCode = 304;
    reply.send();
  } else {
    reply.headers({
      "cache-control": "no-cache",
      "last-modified": time,
    });
    reply.view("/src/pages/3.hbs", params);
  }
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    time: getTime(new Date()),
    title: "max-age=N",
    data: generateRandomString(100, 200),
    scripts,
  };

  const etag = md5(getTime(new Date()));

  if (etag === request.headers["if-none-match"]) {
    reply.statusCode = 304;
    reply.send();
  } else {
    reply.headers({
      "cache-control": "max-age=30",
      etag,
    });
    reply.view("/src/pages/4.hbs", params);
  }
});
/** end: demo routes **/

exports.learn_performance_caching = async (request, response) => {
  await fastify.ready(); // Ensure Fastify plugins and routes are loaded
  fastify.server.emit('request', request, response);
};
