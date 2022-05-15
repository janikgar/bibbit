import { Parser, ParseResult } from "@cooklang/cooklang-ts";

const baseUrl = "https://raw.githubusercontent.com/janikgar/drink-recipes/main";

export default function loadRecipes() {
  let recipeHolder = document.getElementById("recipeHolder");

  if (recipeHolder) {
    recipeHolder.querySelectorAll("div").forEach((div) => {
      div.remove();
    })
  }

  fetch(`${baseUrl}/manifest.json`)
    .then((response) => {
      if (response.status <= 299) {
        response.json()
          .then((responseText) => {
            let fileNames = responseText['files']
            for (let fileName of fileNames) {
              loadRecipe(fileName);
            }
          })
      }
    })
}

async function loadRecipe(recipeName: string) {
  fetch(`${baseUrl}/${recipeName}`)
    .then((response: Response) => {
      return response.text()
    })
    .then((responseText: string) => {
      let recipeToRead = new Parser;
      return recipeToRead.parse(responseText)
    })
    .then((parseResult: ParseResult) => {
      parseRecipe(parseResult);
    })
    .catch((reason: any) => {
      console.log(`Could not open file: ${reason}`)
    })
}

function parseQueryString() {
  const urlParams = new URLSearchParams(location.search);
  let paramMap: {[key: string]: Array<string>} = {};
  urlParams.forEach((value, key) => {
    paramMap[key] = value.split(",");
  })
  return paramMap
}

function innerJoin(arr1: Array<string>, arr2: Array<string>) {
  var newMap = new Map<string, Array<string>>();
  arr1.forEach((x) => {
    newMap.set(x, [""]);
  })
  arr2.forEach((y) => {
    let existing = newMap.get(y);
    if (existing !== undefined ) {
      newMap.set(y, [y]);
    }
  })
  newMap.forEach((value, key) => {
    if (value[0] === "") {
      newMap.delete(key)
    }
  })
  return newMap
}

function isInArray(array: Array<string>, testString: string) {
  if (array === undefined || testString === undefined) {
    return false
  }
  for (let arrayString of array) {
    if (testString === arrayString) {
      return true
    }
  }
  return false
}

function parseRecipe(parseResult: ParseResult) {
  let queryTags = parseQueryString()["tags"];
  
  let recipeHolder = document.getElementById("recipeHolder");
  let recipeTemplate = recipeHolder?.getElementsByTagName("template")[0].content;
  let recipeClone = recipeTemplate?.cloneNode(true) as HTMLElement;
  let cardTitle = recipeClone?.querySelector(".card-title");

  if (cardTitle) {
    if (parseResult.metadata["title"]) {
      cardTitle.innerHTML = parseResult.metadata["title"]
    }
  }

  if (parseResult.metadata["tags"]) {
    let tags = parseResult.metadata["tags"]
    let tagArray = tags.split(",")

    if (queryTags) {
      if (innerJoin(queryTags, tagArray).size === 0) {
        return
      }
    }
    
    let cardFooter = recipeClone?.querySelector(".card-footer");
    for (let tag of tagArray) {
      let tagBadge = document.createElement("span");
      tagBadge.className = "badge rounded-pill ";
      if (isInArray(queryTags, tag)) {
        tagBadge.className += "bg-primary"
      } else {
        tagBadge.className += "bg-secondary"
      }
      tagBadge.innerHTML = `<span class="tagBadge">${tag}</span>`;
      tagBadge.addEventListener("click", (event: Event) => {
        if (event.target) {
          if (isInArray(queryTags, tag) === false) {
            let target = event.target as HTMLElement;
            window.history.pushState(null, "", `/?tags=${target.innerText}`);
          } else {
            window.history.pushState(null, "", "/");
          }
          loadRecipes();
        }
      })
      cardFooter?.append(tagBadge);
    }
  }

  let stepList = recipeClone?.querySelector(".stepList");
  let stepArray = new Array<Node>();

  let ingredientList = recipeClone?.querySelector(".ingredientList");
  let ingredientArray = new Array<Node>();

  let equipmentList = recipeClone?.querySelector(".equipmentList");
  let equipmentArray = new Array<Node>();

  for (let step of parseResult.steps) {
    let stepOfType = "";
    for (let subStep of step) {
      switch (subStep.type) {
        case "ingredient":
          stepOfType += `<abbr title="${subStep.quantity} ${subStep.units}">${subStep.name}</abbr>`;
          let ingredient = document.createElement("li");
          ingredient.innerText = `${subStep.quantity} ${subStep.units} ${subStep.name}`
          // ingredient.className = "list-group-item";
          ingredientArray.push(ingredient);
          break;
        case "cookware":
          stepOfType += `<abbr title="${subStep.quantity}">${subStep.name}</abbr>`
          let equipment = document.createElement("li");
          let equipmentCountIfNotOne = "";
          if (subStep.quantity != 1) {
            equipmentCountIfNotOne = `${subStep.quantity} `
          }
          equipment.innerText = `${equipmentCountIfNotOne}${subStep.name}`
          // equipment.className = "list-group-item";
          equipmentArray.push(equipment);
          break;
        case "text":
          if (subStep.value != "") {
            stepOfType += subStep.value
          }
          break;
        case "timer":
          stepOfType += `<abbr title="${subStep.quantity} ${subStep.units}">${subStep.name}</abbr>`
          break;
        default:
          break;
      }
    }

    // not sure why this is needed, but metadata appears to add zero-length steps
    if (stepOfType.length > 1) {
      let listItem = document.createElement("li");
      // listItem.className = "list-group-item";
      listItem.innerHTML = stepOfType;
      stepArray.push(listItem);
    }
  }
  stepList?.append(...stepArray);
  ingredientList?.append(...ingredientArray);
  equipmentList?.append(...equipmentArray);
  recipeHolder?.appendChild(recipeClone);
}

function swRefreshMessage() {
  if ("serviceWorker" in navigator && "controller" in navigator.serviceWorker) {
    let refreshButton = document.getElementById("refreshButton");
    if (refreshButton) {
      refreshButton.addEventListener("click", () =>{
        navigator.serviceWorker.controller?.postMessage("refresh");
        loadRecipes();
      })
    }
  }
}

swRefreshMessage();