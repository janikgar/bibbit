import { Parser, ParseResult } from "@cooklang/cooklang-ts";
import { addToDB } from "./search";

const baseUrl = "https://raw.githubusercontent.com/janikgar/drink-recipes/main";

export default function loadRecipes() {
  let modalToggler = document.getElementById("modal-toggler");
  modalToggler?.click();

  let recipeHolder = document.getElementById("recipeHolder");

  if (recipeHolder) {
    recipeHolder.querySelectorAll("div").forEach((div) => {
      div.remove();
    })
  }

  let dropdownList = document.getElementById("recipeDropdownList");
  if (dropdownList) {
    dropdownList.querySelectorAll("li").forEach((li) => {
      li.remove();
    })
  }

  fetch(`${baseUrl}/manifest.json`)
    .then((response) => {
      if (response.status <= 299) {
        response.json()
          .then((responseText) => {
            incrementProgress(10);
            let fileNames = responseText['files'] as Array<string>
            let sortedFileNames = fileNames.sort((a: string, b: string) => {
              if (a < b) {
                return -1
              }
              return 1
            })

            let progressBarUnits = 90;
            if (fileNames.length > 0) {
              progressBarUnits = 90 / fileNames.length
            }

            for (let fileName of sortedFileNames) {
              loadRecipe(fileName, progressBarUnits);
            }
          }).catch((reason) => {
            console.log(`could not open JSON: ${reason}`)
          })
        }
      }).catch((reason) => {
        console.log(`could not load recipes: ${reason}`);
      }).finally(() => {
        setTimeout(() => {
          let modalCloser = document.getElementById("modal-closer");
          modalCloser?.click();
        }, 500);
    });
}

function incrementProgress(percent: number) {
  let progress = document.getElementById('load-progress');
  let progressBar = document.getElementById('load-progress-bar');

  let currentProgress = Number(progress?.hasAttribute("aria-valuenow")? progress.getAttribute("aria-valuenow") : "0")
  let newProgress = currentProgress + percent

  progress?.setAttribute("aria-valuenow", String(newProgress))
  progressBar?.setAttribute("style", `width: ${String(newProgress)}%;`)
}

function loadRecipe(recipeName: string, incrementAmount: number) {
  fetch(`${baseUrl}/${recipeName}`).then((response) => {
    response.text().then((text) => {
      let recipeToRead = new Parser;
      let parsedText = recipeToRead.parse(text);
      addToDB(parsedText)
      parseRecipe(parsedText);
      incrementProgress(incrementAmount);
    }).catch((reason) => {
      console.log(`could not load recipe text ${recipeName}: ${reason}`)
    });
  }).catch((reason) => {
    console.log(`could not load recipe ${recipeName}: ${reason}`)
  });
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

function estimateFraction(quantity: number | string) {
  if (typeof quantity === "number") {
    let remainder = quantity % 1;
    let base = String(quantity - remainder);
    let fraction = "";
    if (base === "0") {
      base = "";
    }
    if ((remainder * 2) % 2 === 1) {
      fraction = "½";
    }
    if ((remainder * 3) % 3 !== 0) {
      let numerator = (remainder * 3) % 3;
      switch (numerator) {
        case 1:
          fraction = "⅓";
          break;
        case 2:
          fraction = "⅔";
          break;
        default:
          break;
      }
    }
    if ((remainder * 4) % 4 !== 0) {
      let numerator = (remainder * 4) % 4;
      switch (numerator) {
        case 1:
          fraction = "¼";
          break;
        case 3:
          fraction = "¾";
          break;
        default:
          break;
      }
    }
    if ((remainder * 6) % 6 !== 0) {
      let numerator = (remainder * 6) % 6;
      switch (numerator) {
        case 1:
          fraction = "⅙";
          break;
        case 5:
          fraction = "⅚";
          break;
        default:
          break;
      }
    }
    if ((remainder * 8) % 8 !== 0) {
      let numerator = (remainder * 8) % 8;
      switch (numerator) {
        case 1:
          fraction = "⅛";
          break;
        case 3:
          fraction = "⅜";
          break;
        case 5:
          fraction = "⅝";
          break;
        case 7:
          fraction = "⅞";
          break;
        default:
          break;
      }
    }
    return `${base}${fraction}`
  }
  return quantity
}

function parseRecipe(parseResult: ParseResult) {
  let queryTags = parseQueryString()["tags"];
  
  let recipeHolder = document.getElementById("recipeHolder");
  let recipeTemplate = recipeHolder?.getElementsByTagName("template")[0].content;
  let recipeClone = recipeTemplate?.cloneNode(true) as HTMLElement;
  let cardTitle = recipeClone?.querySelector(".card-title");
  let cardBody = recipeClone?.querySelector(".card-body");

  let dropdownList = document.getElementById("recipeDropdownList");

  let fullTitle = "";
  let shortTitle = "";

  if (cardTitle) {
    if (parseResult.metadata["title"]) {
      fullTitle = parseResult.metadata["title"];
      shortTitle = fullTitle.replace(/\W+/g, "-").toLowerCase();
      cardTitle.innerHTML = `<a id="${shortTitle}">${fullTitle}</a>`;
      cardTitle.setAttribute("href", `#${shortTitle}-body`);
      cardTitle.setAttribute("aria-controls", `${shortTitle}-body`);
      let cardParent = cardTitle.parentElement;
      if (cardParent) {
        cardParent.addEventListener("click", (event: Event) => {
          let target = event.target as HTMLAnchorElement;
          let targetChild = target.querySelector("a");
          if (targetChild) {
            let dest = targetChild.id;
            history.pushState(null, "", `index.html#${dest}`);
          }
        })
      }
      
      let dropdownListEntry = document.createElement("li");
      let dropdownListEntryLink = document.createElement("a");
      dropdownListEntryLink.href = `#${shortTitle}`;
      dropdownListEntryLink.className = "dropdown-item";
      dropdownListEntryLink.innerText = fullTitle;

      dropdownListEntryLink.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById("closeButton")?.click();
        let srcTarget = event.target as HTMLAnchorElement;
        let destTarget = srcTarget.href.split("#")[1];
        let destElement = document.getElementById(destTarget);
        if (destElement) {
          destElement.dispatchEvent(new Event("click"));
        }
      })

      dropdownListEntryLink.setAttribute("aria-controls", `${shortTitle}-body`);
      dropdownListEntryLink.setAttribute("aria-expanded", "false");
      dropdownListEntryLink.setAttribute("data-bs-toggle", "collapse");
      dropdownListEntryLink.setAttribute("role", "button");

      dropdownListEntry.append(dropdownListEntryLink);
      dropdownList?.append(dropdownListEntry);
    }
  }

  if (cardBody) {
    cardBody.id = `${shortTitle}-body`
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
            window.history.pushState(null, "", `/index.html?tags=${target.innerText}`);
          } else {
            window.history.pushState(null, "", "/index.html");
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
          let quantity = estimateFraction(subStep.quantity);
          ingredient.innerText = `${quantity} ${subStep.units} ${subStep.name}`
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
    let refreshButton = document.getElementById("refreshBtn");
    refreshButton?.addEventListener("click", () =>{
      navigator.serviceWorker.controller?.postMessage("refresh");
      loadRecipes();
    });
  }
}

swRefreshMessage();