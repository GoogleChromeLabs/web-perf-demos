const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 9;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

Handlebars.registerHelper(require("./helpers.js"));

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

// create a proxy to direct requests to /images to cdn.glitch.global
fastify.register(require("@fastify/http-proxy"), {
  upstream: "https://cdn.glitch.global/b6592dee-457d-4490-b17e-3afa965ee9ee/",
  prefix: "/fonts",
  disableCache: true,
  
  // add a 500 millisecond delay
  preHandler: async function (_req, _res, next) {
    await delay(1000);
    next();
  }
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
      heading: "/src/partials/heading.hbs",
      nav: "/src/partials/nav.hbs",
      footer: "/src/partials/footer.hbs",
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
    title: "Learn Performance - Fonts",
    head: `<link rel="stylesheet" href="/style.css">`
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "Web Font",
    head: `<link rel='stylesheet' href='/dancing-script.css'>
<link rel="stylesheet" href="/style.css?delay=300">`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "preload",
    head: `<link rel="preload" as="font" href="/fonts/DancingScript-Regular.woff2?v=1676325285146" crossorigin>
<link rel='stylesheet' href='/dancing-script.css'>
<link rel="stylesheet" href="/style.css?delay=300">`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "Unused preload",
    head: `<link rel="preload" as="font" href="/fonts/DancingScript-Regular.woff2?v=1676325285146">
<link rel='stylesheet' href='/dancing-script.css'>
<link rel="stylesheet" href="/style.css?delay=300">`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "Inline @font-face",
    head: `<style>
@font-face {
  font-family: "Dancing Script";
  src: url("/fonts/DancingScript-Regular.woff2?v=1676325285146");
}

html {
  box-sizing: border-box;
  font-size: 16px;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

body {
  margin: 0;
  font-family: sans-serif;
  line-height: 1.5;
  background-color: #f8f9fa;
  color: #3c4043;
}

img,
video {
  height: auto;
  max-width: 100%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

p > code {
  border: 1px solid #cccccc;
  color: #000000;
  padding: 0.125rem 0.25rem;
  font-size: 0.875rem;
}

pre {
  background-color: #333333;
  border-radius: 4px;
  color: #f8f8f2;
  font-size: 0.875em;
  line-height: 1.5;
  overflow: auto;
  padding: 0.625em;
  text-align: left;
  white-space: break-spaces;
  word-break: break-all;
}

summary {
  font-weight: 700;
}

hr {
  margin: 8rem 0 1rem;
}

[hidden] {
  display: none;
}

.content {
  display: grid;
  grid-template: 3rem 1fr 3rem/16rem 1fr;
  grid-template-areas: "title title" "main main" "footer footer";
  height: 100dvh;
}

.title {
  display: flex;
  height: 3rem;
  padding: 0 1rem;
  z-index: 1;
  align-items: center;
  justify-content: space-between;
  grid-area: title;
  background-color: hsla(0, 0%, 100%, 0.2);
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
  font-size: 0.75rem;
}

.title > * {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.drawer {
  display: none;
  width: 16rem;
  grid-area: drawer;
  position: relative;
  z-index: 100;
  flex-direction: column;
  overflow: auto;
}

nav ol {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  counter-reset: li-count -1;
}

nav ol li {
  display: block;
  counter-increment: li-count 1;
}

nav ol li a {
  display: flex;
  text-decoration: none;
  align-items: center;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  line-height: 1;
  border-radius: 5px;
  margin: 0.5rem 0;
  background-color: hsla(0, 0%, 100%, 0.2);
  border: 1px solid #dadce0;
  color: #3c4043;
}

nav ol li[selected] a {
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
}

nav ol li[completed] a,
nav ol li[selected] a {
  font-weight: 600;
}

nav ol li a .step {
  display: flex;
  align-items: center;
}

nav ol li a .step::before {
  content: counter(li-count);
  display: inline-block;
  font-style: normal;
  width: 26px;
  min-width: 26px;
  color: #ffffff;
  background: #80868b;
  border-radius: 50%;
  text-align: center;
  height: 26px;
  vertical-align: middle;
  line-height: 26px;
  margin-right: 0.5rem;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

nav ol li[completed] a .step::before,
nav ol li[selected] a .step::before {
  background-color: #1a73e8;
}

main {
  grid-area: main;
  padding: 1rem 0.5rem;
  height: calc(100dvh - 6rem);
  overflow: auto;
  position: relative;
}

.wrapper {
  max-width: 60rem;
  margin-left: auto;
  margin-right: auto;
  padding: 0 0.5rem;
}

footer {
  background-color: hsla(0, 0%, 100%, 0.2);
  height: 3rem;
  grid-column-start: 1;
  grid-column-end: 3;
  padding: 0.5rem 1rem;
  display: grid;
  grid-template-columns: [prev] auto [next] auto;
  align-items: center;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
}

footer .nav-button {
  border-radius: 4px;
  font-weight: 600;
  line-height: 1.5;
  padding: 0.5rem 1.25rem;
  pointer-events: auto;
  text-transform: none;
  background-color: hsla(0, 0%, 100%, 0.2);
  color: #1a73e8;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%),
    0 3px 1px -2px rgb(0 0 0 / 20%);
  text-decoration: none;
}

footer [disappear] {
  display: none;
}

footer .prev {
  grid-area: prev;
}

footer .next {
  grid-area: next;
  text-align: right;
}

footer #next-step {
  background-color: #1a73e8;
  color: #ffffff;
}

@media (min-width: 540px) {
  .drawer {
    display: flex;
  }

  .content {
    display: grid;
    grid-template: 3rem 1fr 3rem/16rem 1fr;
    grid-template-areas: "title title" "drawer main" "footer footer";
  }
}

.gallery {
  border: 1px solid #cccccc;
  width: 640px;
  max-width: 100%;
  margin: 0 auto;
}

.large img {
  width: 100%;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0.5em;
  background-color: #333333;
}

.thumbnails img {
  opacity: 0.8;
  cursor: pointer;
}

table {
  font-size: 0.875rem;
}

table tbody tr:nth-child(2n + 1) {
  background-color: hsla(0, 0%, 100%, 0.2);
}

table tbody td {
  padding: 0.125rem 0.5rem;
}

table tbody td:nth-child(2n) {
  font-weight: 600;
}

@media screen and (prefers-color-scheme: dark) {
  body {
    background-color: #1f1f1f;
    color: #fafafa;
  }
  
  a {
    color: #ffffff;
  }

  nav ol li a {
    color: #fafafa;
  }

  p > code {
    background-color: #333333;
    color: #ffffff;
  }

  footer #previous-step {
    color: #fafafa;
  }
}

.fancy {
  font-family: "Dancing Script", sans-serif;
}
</style>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "Inline @font-face and external stylesheets",
    head: `<style>
@font-face {
  font-family: "Dancing Script";
  src: url("/fonts/DancingScript-Regular.woff2?v=1676325285146");
}

.fancy {
  font-family: "Dancing Script", sans-serif;
}
</style>
<link rel="stylesheet" href="/style.css?delay=300">
<script src="/script.js?delay=600"></script>`    
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "Inline @font-face and preload",
    head: `<link rel="preload" as="font" href="/fonts/DancingScript-Regular.woff2?v=1676325285146" crossorigin>
<style>
  @font-face {
    font-family: "Dancing Script";
    src: url("/fonts/DancingScript-Regular.woff2?v=1676325285146");
  }

  .fancy {
    font-family: "Dancing Script", sans-serif;
  }
</style>
<link rel="stylesheet" href="/style.css?delay=300">
<script src="/script.js?delay=600"></script>`    
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "Google Fonts",
    head: `<link rel="stylesheet" href="/style.css?delay=300">
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script" rel="stylesheet">
<style>
.fancy {
  font-family: "Dancing Script", sans-serif;
}
</style>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/8", function (request, reply) {
  let params = {
    step: 8,
    title: "Google Fonts with preconnect",
    head: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/style.css?delay=300">
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script" rel="stylesheet">
<style>
.fancy {
  font-family: "Dancing Script", sans-serif;
}
</style>`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/9", function (request, reply) {
  let params = {
    step: 9,
    title: "font-display: swap",
    head: `<link rel='stylesheet' href='/dancing-script-swap.css'>
<link rel="stylesheet" href="/style.css?delay=300">`
  };

  reply.view(`/src/pages/${params.step}.hbs`, params);

  return reply;
});

fastify.get("/10", function (request, reply) {
  let params = {
    step: 10,
    title: "font-display: optional",
    head: `<link rel='stylesheet' href='/dancing-script-optional.css'>
<link rel="stylesheet" href="/style.css?delay=300">`
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
