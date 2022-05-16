import loadRecipes from "./cook";
import './main.scss';
import 'bootstrap';
import './search';

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/sw.js",
        {scope: "/"}
      );
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
console.log("call load recipe");
loadRecipes();