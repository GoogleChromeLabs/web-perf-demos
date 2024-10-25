# Example `cache-control: no-store` app used to demo upcoming bfcache changes

**Important:** Make sure to use relative urls for all routes and assets,
as the demo will be served on a deep url.

## Run locally

`local-server.js` is optional and not needed to run the Cloud function.
It allows you to easily test your Express app locally before you deploy it
as a function.

```
node local-server.js
```

## Deploy

Make sure you're logged in to Cloud and that you use the right cloud project:

```
gcloud auth login
gcloud config list
gcloud config set project web-devrel-apps  // Switch to the right project if needed
```

Deploy your function:

```
gcloud functions deploy bfcache_no_store  --runtime nodejs20 --trigger-http --no-gen2
```

# Try it

See your deployed app at:
[https://us-central1-web-devrel-apps.cloudfunctions.net/bfcache_no_store/](https://us-central1-web-devrel-apps.cloudfunctions.net/bfcache_no_store/)
or on chrome.dev at:
[https://chrome.dev/f/bfcache_no_store/](https://chrome.dev/f/bfcache_no_store/).


