import loadRecipes from "./cook";
//import 'bootstrap';
import { initDB } from './search';

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const swStatus = await navigator.serviceWorker.ready;
      if (swStatus.active?.state === "activated") {
        return
      }
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        {scope: "/"}
      );
      if ("sync" in registration) {
        console.log("sync is supported");
      }
      if (registration.installing) {
        console.log("installing service worker...");
      } else if (registration.waiting) {
        console.log("waiting on service worker...");
      } else if (registration.active) {
        console.log("service worker active!");
      }
    } catch (error) {
      console.log(`Error registering Service Worker: ${error}`);
    }
  }
}

registerServiceWorker();
initDB();
loadRecipes();
