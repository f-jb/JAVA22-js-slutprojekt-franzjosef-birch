"use strict";

class Model {
  #page = 1;
  #baseURL;
  #key;
  #url;

  constructor() {
    this.#baseURL = "https://api.flickr.com/services/rest/";
    this.#key = "90dd63c6012cc6ab2e71337f54b9f7fe";
  }
  increasePage() {
    this.#page++;
  }
  decreasePage() {
    this.#page--;
  }
  resetPage() {
    this.#page = 1;
  }
  getCurrentPage() {
    return this.#page;
  }
  getResults(searchQuery) {
    this.#url = `${this.#baseURL}?method=flickr.photos.search&api_key=${
      this.#key
    }&text=${searchQuery.term}&per_page=${
      searchQuery.perPage
    }&page=${this.getCurrentPage()}&sort=${
      searchQuery.sort
    }&format=json&nojsoncallback=1`;
    fetch(this.#url, {
      mode: "cors",
    })
      .then((response) => response.json())
      .then((searchResults) => app.displayResults(searchResults.photos))
      .catch((error) => app.view.setStatus(error.message));
  }
}

class View {
  #resultView;
  #statusView;
  #nav;
  #searchTerms;
  #perPage;
  #sort;
  #nextButton;
  #previousButton;
  #searchButton;

  constructor() {
    this.#searchButton = document.getElementById("search");
    this.#previousButton = document.getElementById("previous");
    this.#nextButton = document.getElementById("next");
    this.#resultView = document.getElementById("resultView");
    this.#statusView = document.getElementById("statusView");
    this.#nav = document.getElementById("nav");
    this.#searchTerms = document.getElementById("searchQuery");
    this.#perPage = document.getElementById("perPage");
    this.#sort = document.getElementById("sort");
  }
  getSearchButton() {
    return this.#searchButton;
  }
  getNextButtion() {
    return this.#nextButton;
  }
  getPreviousButton() {
    return this.#previousButton;
  }
  enableNextButton() {
    this.#nextButton.disabled = false;
  }
  disableNextButton() {
    this.#nextButton.disabled = true;
  }
  enablePreviousButton() {
    this.#previousButton.disabled = false;
  }
  disablePreviousButton() {
    this.#previousButton.disabled = true;
  }
  enableNav() {
    this.#nav.style.display = "block";
  }
  disableNav() {
    this.#nav.style.display = "none";
  }
  getSearchQuery() {
    const searchQuery = {
      term: this.#searchTerms.value,
      perPage: this.#perPage.value,
      sort: this.#sort.value,
    };
    return searchQuery;
  }

  setStatus(message) {
    this.messageText = document.createElement("p");
    this.messageText.innerText = message;
    this.#statusView.replaceChildren(this.messageText);
  }
  cleanResultsView() {
    while (this.#resultView.firstChild) {
      this.#resultView.removeChild(this.#resultView.firstChild);
    }
  }
  getResultView() {
    return this.#resultView;
  }
  displayResults(photos) {
    this.cleanResultsView();

    for (let i = 0; i < photos.photo.length; i++) {
      const img = document.createElement("img");
      const photo = photos.photo[i];
      const photoSize = document.getElementById("size").value;
      img.src = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}${photoSize}.jpg`;

      this.#resultView.appendChild(img);
    }
  }
}

class Controller {
  model;
  view;

  constructor(model, view) {
    this.model = model;
    this.view = view;
    view.getSearchButton().addEventListener("click", this.search);
    view.getNextButtion().addEventListener("click", this.nextPage);
    view.getPreviousButton().addEventListener("click", this.previousPage);
    view.getResultView().addEventListener("click", (e) => {
      if (e.target.nodeName === "IMG") {
        open(e.target.src);
      }
    });
  }

  displayResults(searchResults) {
    if (searchResults.total === 0) {
      app.view.cleanResultsView();
      app.view.setStatus("No results found");
    } else {
      app.view.displayResults(searchResults);
      app.view.setStatus(
        `Page ${app.model.getCurrentPage()} of ${searchResults.pages}`
      );
      if (searchResults.total > searchResults.perpage) {
        app.view.enableNav();
        if (searchResults.page === 1) {
          app.view.disablePreviousButton();
        } else {
          app.view.enablePreviousButton();
        }
        if (searchResults.page === searchResults.pages) {
          app.view.disableNextButton();
        } else {
          app.view.enableNextButton();
        }
      } else {
        app.view.disableNav();
      }
    }
  }

  search(e) {
    if (e.target.id === "search") {
      app.model.resetPage();
    }
    e.preventDefault();
    const searchQuery = app.view.getSearchQuery();
    if (searchQuery.term === "") {
      app.view.setStatus("please enter a search term");
    } else {
      app.model.getResults(searchQuery);
    }
  }
  nextPage(e) {
    e.preventDefault();
    app.model.increasePage();
    app.search(e);
  }
  previousPage(e) {
    e.preventDefault();
    app.model.decreasePage();
    app.search(e);
  }
}

const app = new Controller(new Model(), new View());
