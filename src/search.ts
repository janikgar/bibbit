import { ParseResult } from "@cooklang/cooklang-ts";

const searchBox = document.getElementById("searchBox");
if (searchBox) {
  // searchBox.onblur = (() => {
  //   let ac = document.getElementById("autocomplete");
  //   if (ac) {
  //     ac.innerHTML = "";
  //   }
  // });
  searchBox.onfocus, searchBox.oninput = (event => {
    let targetElement = event.target as HTMLInputElement;
    let value = targetElement.value;
    if (value.length > 2) {
      searchByName(targetElement.value);
    }
    if (value.length == 0) {
      let ac = document.getElementById("autocomplete");
      if (ac) {
        ac.innerHTML = "";
      }
    }
  })
}

export function initDB() {
  let request = window.indexedDB.open("bibbit", 1);
  var db;
  request.onerror = (event: any) => {
    console.log(`indexeddb error: ${event.target}`);
  }
  request.onupgradeneeded = (event: any) => {
    db = event.target.result as IDBDatabase;
    let objectStore = db.createObjectStore("recipes", {keyPath: "name"});

    objectStore.createIndex("name", "name", {unique: true});
    objectStore.createIndex("ingredients", "ingredients", {multiEntry: true, unique: false});
    objectStore.createIndex("tags", "tags", {multiEntry: true, unique: false});
  }
}

export function searchByName(name: string) {
  let lowerName = name.toLowerCase();

  let request = window.indexedDB.open("bibbit", 1);
  var db;
  request.onerror = (event: any) => {
    console.log(`indexeddb error: ${event.target}`);
  }

  request.onsuccess = (event: any) => {
    db = event.target.result as IDBDatabase;
    let objectStore = db.transaction("recipes", "readonly").objectStore("recipes");
    
    let successes = new Set<string>();
    objectStore.openCursor().onsuccess = ((event: any) => {
      let cursor = event.target.result as IDBCursorWithValue;
      if (cursor) {
        let curName = cursor.value.name as string;
        let lowerCurName = curName.toLowerCase();

        if (lowerCurName.includes(lowerName)) {
          successes.add(cursor.key.toString());
        } else {
          let tags = cursor.value.tags as Array<string>;
          tags.forEach(tag => {
            if (tag.includes(lowerName)) {
              successes.add(cursor.key.toString());
            }
          });
          let ingredients = cursor.value.ingredients as Array<string>;
          ingredients.forEach(ingredient => {
            if (ingredient.includes(lowerName)) { 
              successes.add(cursor.key.toString());
            }
          })
        }
        cursor.continue();
      }
      let successArray = new Array();
      successes.forEach((val) => {
        successArray.push(val)
      });

      genAutocomplete(successArray);
    })
  }
}

function genAutocomplete(results: Array<string>) {
  let acDiv = document.getElementById("autocomplete");
  let acList = document.createElement("div");
  acList.className = "list-group";
  for (let result of results) {
    let shortTitle = result.replace(" ", "-").toLowerCase();
    let acListItem = document.createElement("a");
    acListItem.className = "list-group-item list-group-item-action";
    acListItem.href = `#${shortTitle}`
    acListItem.innerText = result;
    acListItem.addEventListener("click", (event) => {
      let srcTarget = event.target as HTMLAnchorElement;
      let destTarget = srcTarget.href.split("#")[1];
      let destElement = document.getElementById(destTarget);
      if (destElement) {
        destElement.dispatchEvent(new Event("click"));
      }
    })
    acList.append(acListItem);
  }
  if (acDiv) {
    acDiv.innerHTML = "";
    acDiv.append(acList);
  }
}

export function addToDB(entry: ParseResult) {
  let request = window.indexedDB.open("bibbit", 1);
  var db;
  request.onerror = (event: any) => {
    console.log(`indexeddb error: ${event.target}`);
  }
  request.onsuccess = (event: any) => {
    db = event.target.result as IDBDatabase;
    let transaction = db.transaction("recipes", "readwrite");

    transaction.oncomplete = () => {
      // console.log("IDB transaction OK");
    };
    transaction.onerror = (event: any) => {
      let target = event.target as IDBRequest;
      console.log(target);
      console.log(`IDB transaction error: ${target.error}`);
    }

    var ingredients = new Array<string>();
    entry.steps.forEach(step => {
      step.forEach(subStep => {
        if (subStep.type === "ingredient") {
          ingredients.push(subStep.name);
        }
      })
    })

    let objectStore = transaction.objectStore("recipes");
    objectStore.put({
      "name": entry.metadata["title"],
      "tags": entry.metadata["tags"].split(","),
      "ingredients": ingredients,
    })
  }
}