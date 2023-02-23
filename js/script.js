"use strict";

// This file follows the MVC design pattern.
// Model - Strictly application logic, manages the data.
// View - Responsible for the view that the user sees.
// Controller - A controller that interfaces between the model and the controller
//
// This is tied together with:
// const app = new Controller(new Model(), new View());
//
// By using this design pattern a couple of the design principles behind
// Object Oriented Programming is achieved. Mainly the Single responsibility 
// principle (SRP) that dictates that a class should only have one area of
// responsibilty.
//
// Since the model and view is decoupled it is easier to create another form of
// view i.e. a desktop application.
//

class Model {
  #page = 1;
  #baseURL;
  #key;
  #url;

  constructor() {
    this.#baseURL = "https://api.flickr.com/services/rest/";
    this.#key = "90dd63c6012cc6ab2e71337f54b9f7fe";

  }
  // internal tracking of which page the user is currently browsing, used as a parameter in the request to flickr
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

  // builds the requestURL then gets a response from flickr and validates it
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not OK");
        }
        return response;
      })
      .then((response) => response.json())
      .then((searchResults) => app.displayResults(searchResults))
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

  // Enables disabling and enabling of the navigation buttons
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


  // Gets the terms written in the searchbar
  getSearchQuery() {
    const searchQuery = {
      term: this.#searchTerms.value,
      perPage: this.#perPage.value,
      sort: this.#sort.value,
    };
    return searchQuery;
  }

  // Shows a message in the statusView.

  setStatus(message) {
    this.messageText = document.createElement("p");
    this.messageText.innerText = message;
    this.#statusView.replaceChildren(this.messageText);
  }


  // cleans upp the resultview, used to reset the results e.g. between page navigation or new searches.
  cleanResultsView() {
    while (this.#resultView.firstChild) {
      this.#resultView.removeChild(this.#resultView.firstChild);
    }
  }
  getResultView() {
    return this.#resultView;
  }



  displayResults(searchResults) {

    // resets the resultView
    this.cleanResultsView();

    // validates the results 
    if (searchResults.stat === "fail") {
      this.setStatus(searchResults.message);

    } else if (searchResults.photos.total === 0) {
      app.view.cleanResultsView();
      app.view.setStatus("No results found");

      // if the results are valid, gets the photo URL and adds it as an element to the resultView
    } else {
      const photos = searchResults.photos;
      for (let i = 0; i < photos.photo.length; i++) {
        const img = document.createElement("img");
        const photo = photos.photo[i];
        const photoSize = document.getElementById("size").value;
        img.src = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}${photoSize}.jpg`;

        this.#resultView.appendChild(img);
      }

      // shows how many pages of results are available and enables nav-button depending
      // on if there are more than one, no previous pages or no next pages
      this.setStatus(`Page ${app.model.getCurrentPage()} of ${photos.pages}`);
      if (photos.total > photos.perpage) {
        this.enableNav();
        if (photos.page === 1) {
          this.disablePreviousButton();
        } else {
          this.enablePreviousButton();
        }
        if (photos.page === photos.pages) {
          this.disableNextButton();
        } else {
          this.enableNextButton();
        }
      } else {
        this.disableNav();
      }
    }
  }
}

class Controller {
  model;
  view;

  constructor(model, view) {
    this.model = model;
    this.view = view;
    // sets up the actionlisteners for the buttons and resultView, all are gotten from View.
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
    app.view.displayResults(searchResults);
  }

  search(e) {
    // checks if the search is initiated by the search button
    if (e.target.id === "search") {
      app.model.resetPage();
    }
    e.preventDefault();
    const searchQuery = app.view.getSearchQuery();
    if (searchQuery.term === "") {
      app.view.setStatus("Please enter a search term");
    } else {
      app.model.getResults(searchQuery);
    }
  }

  // increases or decreases the current page in model, which enables browsing the results
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
