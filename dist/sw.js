const cacheVersion = "v1";

const cacheFirstDefaults = [
  "/",
  "/index.html",
];

const populateCache = async (resources) => {
  const cache = await caches.open(cacheVersion);
  console.log(resources);
  cache.addAll(resources)
    .catch((err) => {
      console.log(`error populating cache: ${err}`);
    });
}

const initCache = async () => {
  populateCache(cacheFirstDefaults);
}

self.addEventListener("install", (event) => {
  event.waitUntil(initCache())
});

const cacheAppend = async function (request, response) {
  const cache = await caches.open(cacheVersion);
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
  return fetch(request)
    .then(response => {
      console.log(`successfully retrieved: ${request.url}`);
      cacheAppend(request, response.clone());
      return response
    })
    .catch(err => {
      console.log(`cache miss: ${err}`)
      return caches.match(request);
    });
}

const cacheClear = () => {
  caches.delete(cacheVersion)
    .then(() => {
      console.log("caches cleared")
    })
    .catch((err) => {
      console.log(`could not clear cache: ${err}`)
    })
  initCache()
}

const fetchManifest = async () => {
  let manifestUrl = "https://raw.githubusercontent.com/janikgar/drink-recipes/main/manifest.json";
  let cachedManifest = await caches.match(manifestUrl)
    .then(response => {
      return response.json()
    })
    .then(jsonResponse => {
      return jsonResponse
    })
    .catch(err => {
      console.log(`no match: ${err}`)
    })
  let remoteManifest = await fetch(manifestUrl)
    .then(response => {
      return response.json()
    })
    .then(jsonResponse => {
      return jsonResponse
    })
    .catch(err => {
      console.log(`recipe manifest failed: ${err}`)
    })
  // if (cachedManifest && remoteManifest && cachedManifest !== remoteManifest) {
  if (cachedManifest && remoteManifest) {
    return "this is probably new"
    // console.log("this is probably new!");
    // window.postMessage("this is probaby new!");
  }
}

self.addEventListener("message", (event) => {
  console.log(`got message: ${event.data}`)
  if (event.data === "refresh") {
    cacheClear();
  }
  if (event.data === "sync") {
    console.log("this should do something!");
    fetchManifest().then(result => {
      event.ports[0].postMessage(result);
    }).catch(err => {
      console.log(err);
      event.ports[0].postMessage(err);
    })
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
