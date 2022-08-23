import loadRecipes from "./cook";
import './main.scss';
import 'bootstrap';
import { initDB } from './search';

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/sw.js",
        {scope: "/"}
      );
      if ("sync" in registration) {
        console.log("sync is supported");
      } else {
        console.log("sync is not supported");
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

console.log("call load recipe");
loadRecipes();