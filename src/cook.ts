import { Parser, ParseResult } from "@cooklang/cooklang-ts";

export default function loadRecipes() {
  loadRecipe("gin_sour");
  loadRecipe("martini");
}

async function loadRecipe(recipeName: string) {
  fetch(`/sample_recipes/${recipeName}.cook`)
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

function parseRecipe(parseResult: ParseResult) {
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
    let cardFooter = recipeClone?.querySelector(".card-footer");
    for (let tag of tagArray) {
      let tagBadge = document.createElement("span");
      tagBadge.className = "badge rounded-pill bg-primary";
      tagBadge.innerHTML = `${tag}`;
      tagBadge.addEventListener("click", (event: any) => {
        if (event.target) {
          console.log(event.target.innerText);
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
          ingredientArray.push(ingredient);
          break;
        case "cookware":
          stepOfType += `<abbr title="${subStep.quantity}">${subStep.name}</abbr>`
          let equipment = document.createElement("li");
          equipment.innerText = `${subStep.quantity} ${subStep.name}`
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
      listItem.innerHTML = stepOfType;
      stepArray.push(listItem);
    }
  }
  stepList?.append(...stepArray);
  ingredientList?.append(...ingredientArray);
  equipmentList?.append(...equipmentArray);
  recipeHolder?.appendChild(recipeClone);
}