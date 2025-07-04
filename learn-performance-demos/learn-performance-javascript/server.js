const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay, generateRandomString } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 9;

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
    title: "blocking - head",
    head: `<script src="/script.js?delay=1000"></script>
<link rel="stylesheet" href="/style.css" />`,
  };

  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "blocking - inline",
    head: `<script>
// block main thread for N milliseconds
  function sleep(n) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + n) {
      // do nothing
    }
  }

  // simulate CPU intensive JavaScript execution
  sleep(1000);
  console.log("Hello world!")

  setTimeout(() => {
    console.log("setTimeout");
  }, 1000);
</script>
<link rel="stylesheet" href="/style.css" />`,
  };

  reply.view("/src/pages/2.hbs", params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "blocking - inverted",
    head: `<link rel="stylesheet" href="/style.css" />
<script>
  // block main thread for N milliseconds
  function sleep(n) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + n) {
      // do nothing
    }
  }

  // simulate CPU-intensive JavaScript execution
  sleep(1000);
  console.log("Hello world!")

  setTimeout(() => {
    console.log("setTimeout");
  }, 1000);
</script>`,
  };

  reply.view("/src/pages/3.hbs", params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "blocking - body",
    head: `<link rel="stylesheet" href="/style.css" />`,
    data: generateRandomString(500, 500),
    scripts: `<script src="/script.js?delay=1000"></script>`
  };

  reply.view("/src/pages/4.hbs", params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "async",
    head: `<link rel="stylesheet" href="/style.css" />
<script src="/script.js?delay=500" async></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.view("/src/pages/5.hbs", params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "defer",
    head: `<link rel="stylesheet" href="/style.css" />
<script src="/script.js?delay=1000" async></script>`,
    data: generateRandomString(500, 500),
  };

  reply.view("/src/pages/6.hbs", params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "module",
    head: `<link rel="stylesheet" href="/style.css" />
<script src="/module.js?delay=1000" type="module"></script>`,
    data: generateRandomString(500, 500),
  };

  reply.view("/src/pages/7.hbs", params);

  return reply;
});

fastify.get("/8", function (request, reply) {
  let params = {
    step: 8,
    title: "module - import",
    head: `<link rel="stylesheet" href="/style.css" />
<script src="/module-import.js?delay=1000" type="module"></script>`,
    data: generateRandomString(500, 500),
  };

  reply.view("/src/pages/8.hbs", params);

  return reply;
});

fastify.get("/9", function (request, reply) {
  let params = {
    step: 9,
    title: "module - async",
    head: `<link rel="stylesheet" href="/style.css" />
<script src="/module.js?delay=10" type="module" async></script>`,
    data: generateRandomString(2000, 2000),
  };

  reply.view("/src/pages/9.hbs", params);

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
