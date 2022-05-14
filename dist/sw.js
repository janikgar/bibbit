const initCache = async (resources) => {
  const cache = await caches.open("v1");
  cache.addAll(resources);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    initCache([
      "/",
      "/index.html",
      "/main.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.css",
    ])
  )
});

const cacheAppend = async function (request, response) {
  const cache = await caches.open("v1");
  cache.put(request, response)
    .catch(function (err) {
      console.log("error adding to cache: " + err)
    });
}

const cacheFirst = async (request) => {
  const cacheResponse = await caches.match(request);
  if (cacheResponse) {
    console.log(`cache hit: ${request.url}`);
    return cacheResponse
  }
  console.log(`cache miss: ${request.url}`);
  const networkResponse = await fetch(request);
  cacheAppend(request, networkResponse.clone());
  return networkResponse
}

const cacheClear = () => {
  caches.delete("v1")
    .then(() => {
      console.log("caches cleared")
    })
    .catch((err) => {
      console.log(`could not clear cache: ${err}`)
    })
}

self.addEventListener("message", (event) => {
  console.log(`got message: ${event.data}`)
  if (event.data === "refresh") {
    cacheClear();
  }
  // event.respondWith(
  //   cacheFirst(event.request)
  // )
})
