import loadRecipes from "./cook";
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

const menuToggle = () => {
  let menu = document.querySelector('.small-offscreen') as HTMLElement | null;
  if (menu) {
    console.log(menu.ariaHidden);
    switch (menu.ariaHidden) {
      case "true":
        menu.style.left = "0";
        menu.ariaHidden = "false";
        break;
      case "false":
        menu.style.left = "100vw";
        menu.ariaHidden = "true";
    }
  }
}

const bindToggleMenu = () => {
  let toggler = document.getElementById("menu-toggle-btn");
  if (toggler) {
    toggler.onclick = menuToggle;
  } else {
    alert("could not find toggler");
  }
}

registerServiceWorker();
bindToggleMenu();
initDB();
loadRecipes();
