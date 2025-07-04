const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay, generateRandomString } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 2;

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

/** start: routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "Conditional import()",
    scripts: `<script type="module">
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mediaQuery.matches) { 
    await import("./canvas-confetti.js?delay=1000");
    document.getElementById("clickMe").addEventListener("click", () => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    });
  }
</script>`,
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "import() on user interaction",
    scripts: `<script>
  document.querySelectorAll("form input").forEach((input) => {
    input.addEventListener(
      "focus",
      async () => {
        const form = input.closest("form");
        const { validate } = await import("./form-validation.js?delay=1000");

        form.querySelector("[type=submit]").removeAttribute("disabled");              
        form.addEventListener("submit", validate(form));        
      },
      { once: true }
    );
  });
</script>`,
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
