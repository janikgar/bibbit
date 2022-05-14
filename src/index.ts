import loadRecipes from "./cook";

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/sw.js",
        {scope: "/"}
      );
      if (registration.installing) {
        console.log("Installing service worker...");
      } else if (registration.waiting) {
        console.log("Waiting on service worker...");
      } else if (registration.active) {
        console.log("Service worker active!");
      }
    } catch (error) {
      console.log(`Error registering Service Worker: ${error}`);
    }
  }
}

registerServiceWorker();
console.log("call load recipe");
loadRecipes();