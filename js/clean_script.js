"use strict";
const baseURL = "https://api.flickr.com/services/rest/";
const key = "90dd63c6012cc6ab2e71337f54b9f7fe";
const searchButton = document.getElementById("search");
const resultView = document.getElementById("resultView");
const statusView = document.getElementById("statusView");
const nav = document.getElementById("nav");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
let page = 0;

searchButton.addEventListener("click", fetchResults);
previousButton.addEventListener("click", fetchResults);
nextButton.addEventListener("click", fetchResults);
resultView.addEventListener("click", (e) => {
  if (e.target.nodeName === "IMG") {
    open(e.target.src);
  }
});

function fetchResults(e) {
  e.preventDefault();
  if (e.target === searchButton) {
    page = 1;
  }
  if (e.target === nextButton) {
    page++;
  }
  if (e.target === previousButton) {
    page--;
  }

  const searchQuery = document.getElementById("searchQuery").value;
  const perPage = document.getElementById("perPage").value;
  const sort = document.getElementById("sort").value;
  if (searchQuery != "") {
    const url = `${baseURL}?method=flickr.photos.search&api_key=${key}&text=${searchQuery}&per_page=${perPage}&page=${page}&sort=${sort}&format=json&nojsoncallback=1`;

    fetch(url, {
      mode: "cors",
    })
      .then((response) => response.json())
      .then((json) => displayResults(json))
      .catch((error) => setStatus(error.message));
  } else {
    while (resultView.firstChild) {
      resultView.removeChild(resultView.firstChild);
    }
    setStatus("Please enter a search term.");
  }
}
function setStatus(error) {
  const errorText = document.createElement("p");
  errorText.innerText = error;
  statusView.replaceChildren(errorText);
}

function displayResults(json) {
  while (resultView.firstChild) {
    resultView.removeChild(resultView.firstChild);
  }
  if (json.photos.total === 0) {
    while (resultView.firstChild) {
      resultView.removeChild(resultView.firstChild);
    }
    setStatus("No images found.");
  } else {
    statusView.innerText = `Page ${page} of ${Math.ceil(
      json.photos.total / json.photos.perpage
    )}`;

    for (
      let i = 0;
      i <
      (json.photos.perpage > json.photos.total
        ? json.photos.total
        : json.photos.perpage);
      i++
    ) {
      const img = document.createElement("img");
      const photo = json.photos.photo[i];
      const photoSize = document.getElementById("size").value;
      img.src = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}${photoSize}.jpg`;

      resultView.appendChild(img);
    }

    if (json.photos.total > json.photos.perpage) {
      nav.style.display = "block";
      if (json.photos.page === 1) {
        previousButton.disabled = true;
      } else {
        previousButton.disabled = false;
      }
      if (json.photos.perpage * json.photos.page >= json.photos.total) {
        nextButton.disabled = true;
      } else {
        nextButton.disabled = false;
      }
    } else {
      nav.style.display = "none";
    }
  }
}
