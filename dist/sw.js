const cacheFirstDefaults = [
  "/index.html",
  // "/main.js",
];

const populateCache = async (resources) => {
  const cache = await caches.open("v1");
  cache.addAll(resources)
    .catch((err) => {
      console.log(`error populating cache: ${err}`);
    });
}

const initCache = async () => {
  populateCache(cacheFirstDefaults);
}

self.addEventListener("install", (event) => {
  event.waitUntil(populateCache())
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

const cacheLast = async (request) => {
  const networkResponse = await fetch(request);
  if (networkResponse.status > 299) {
    return await caches.match(request)
  }
  console.log(`successfully retrieved: ${request.url}`)
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
  initCache()
}

self.addEventListener("message", (event) => {
  console.log(`got message: ${event.data}`)
  if (event.data === "refresh") {
    cacheClear();
  }
})

self.addEventListener("fetch", (event) => {
  if (event.request.url in cacheFirstDefaults) {
    event.respondWith(
      cacheFirst(event.request)
    )
  } else {
    event.respondWith(
      cacheLast(event.request)
    )
  }
})
