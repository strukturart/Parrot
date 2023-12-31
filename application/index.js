"use strict";

let debug = false;
let filter_query;
let file_content = [];
let current_file;
let files = [];
let action = null;
let action_element = null;

let filtered_content = file_content; // Initialize filtered_content with the original data

let filter_words = (term) => {
  // Use the filter() method to filter the array
  filtered_content = file_content.filter((item) => {
    // Check if the 'word' property of each object contains the 'term' value
    return item.word.includes(term);
  });
  // You can also return the filtered result if needed
  return filtered_content;
};

let set_tabindex = () => {
  document
    .querySelectorAll('.item:not([style*="display: none"]')
    .forEach((e, i) => {
      if (e.style.display != "none") {
        e.setAttribute("tabindex", i);
      } else {
        e.setAttribute("tabindex", -1);
      }
    });
};

let store_content = () => {
  var reversedString = filtered_content
    .map(function (item) {
      return item.word;
    })
    .join("|");

  helper.renameFile(current_file, reversedString);
  m.route.set("/start");
};

let load_file = function (filename) {
  let sdcard = "";

  try {
    sdcard = navigator.getDeviceStorage("sdcard");
  } catch (e) {}

  if ("b2g" in navigator) {
    try {
      sdcard = navigator.b2g.getDeviceStorage("sdcard");
    } catch (e) {}
  }

  let request = sdcard.get(filename);
  current_file = filename;

  request.onsuccess = function () {
    console.log(this.result);
    let reader = new FileReader();

    reader.onerror = function (event) {
      reader.abort();
    };

    reader.onloadend = function () {
      let f = reader.result;

      // Split the string by "|"
      var splitArray = f.split("|");

      // Create objects without including "|" and ignore if there's a whitespace after "|"
      file_content = splitArray
        .filter(function (item) {
          // Remove leading and trailing whitespace from each item
          item = item.trim();

          // Include in the result only if the item is not an empty string
          return item !== "";
        })
        .map(function (item, index) {
          // Create objects without including "|"
          return { word: item, id: index };
        });

      // Assuming file_content is your array of objects
      file_content.sort(function (a, b) {
        // Compare the 'word' property of the objects
        // return a.word.localeCompare(b.word);
      });

      filtered_content = file_content;
    };

    reader.readAsText(this.result);
  };

  request.onerror = function () {};
};

const get_contact = (callback) => {
  if (typeof navigator.mozApps !== "undefined") {
    var activity = new MozActivity({
      name: "pick",
      data: {
        type: ["webcontacts/contact"],
      },
    });

    activity.onsuccess = function () {
      var contact = this.result;
      if (contact && contact.contact) {
        var contactName = contact.contact.name[0];
        console.log("Contact Name: " + contactName);
        callback(contactName); // Pass the contactName to the callback
      }
    };

    activity.onerror = function () {
      console.error("Error opening contact picker: " + this.error.name);
    };
  }
};

//NAVIGATION

let nav = function (move) {
  set_tabindex();

  const currentIndex = document.activeElement.tabIndex;
  let next = currentIndex + move;
  let items = 0;

  items = document.querySelectorAll(".item");

  let targetElement = 0;

  if (next <= items.length) {
    targetElement = items[next];
    targetElement.focus();
  }

  if (next == items.length) {
    targetElement = items[0];
    targetElement.focus();
  }

  const rect = document.activeElement.getBoundingClientRect();
  const elY =
    rect.top - document.body.getBoundingClientRect().top + rect.height / 2;

  document.activeElement.parentElement.parentElement.scrollBy({
    left: 0,
    top: elY - window.innerHeight / 2,
    behavior: "smooth",
  });
};

//list dic

try {
  var d = navigator.getDeviceStorage("sdcard");

  var cursor = d.enumerate();

  cursor.onsuccess = function () {
    if (!this.result) {
      m.route.set("/start");
    }
    if (cursor.result.name !== null) {
      var file = cursor.result;
      let n = file.name.split(".");
      let file_type = n[n.length - 1];
      let m = file.name.split("/");
      let file_name = m[n.length];

      let filetype = "dic";
      if (file_type == filetype) {
        files.push({ "path": file.name, "name": file_name });
      }
      this.continue();
    }
  };

  cursor.onerror = function () {
    console.warn("No file found: " + this.error);
  };
} catch (e) {}

if ("b2g" in navigator) {
  try {
    var sdcard = navigator.b2g.getDeviceStorage("sdcard");
    var iterable = sdcard.enumerate();
    var iterFiles = iterable.values();

    function next(_files) {
      _files
        .next()
        .then((file) => {
          if (!file.done) {
            let fileExtension = file.value.name.slice(-3);

            if (fileExtension == "dic") {
              files.push({ path: file.value.name, name: file.value.name });
              m.route.set("/start");
            }

            next(_files);
          }
        })
        .catch(() => {
          next(_files);
        });
    }

    next(iterFiles);
  } catch (e) {
    alert(e);
  }
}

let startup = true;
let t = 5000;

document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("main");

  var start = {
    view: function () {
      return m("div", [
        m(
          "div",
          {
            id: "intro",
            oncreate: () => {
              startup
                ? (t = 5000)
                : (document.querySelector("#intro").style.display = "none");
              setTimeout(() => {
                document.querySelector("#intro").style.display = "none";
                startup = false;
              }, t);
            },
          },
          [m("img", { src: "assets/icons/icon.png" })]
        ),
        m(
          "ul",
          {
            id: "files-list",
            oncreate: () => {
              helper.bottom_bar(
                "",
                "<img src='assets/images/select.svg'>",
                "<img src='assets/images/option.svg'>"
              );
            },
          },
          [
            files.map((e, i) => {
              return m(
                "li",
                {
                  class: "item",
                  tabindex: i,
                  "data-path": e.path,
                  oncreate: ({ dom }) => {
                    if (i == 0) {
                      dom.focus();
                    }
                  },
                  onkeydown: (e) => {
                    if (e.keyCode === 13) {
                      load_file(
                        document.activeElement.getAttribute("data-path")
                      );
                      setTimeout(() => {
                        m.route.set("/list_words", {});
                      }, 1000);
                    }

                    if (e.key === "SoftRight") {
                      m.route.set("/options");
                    }
                  },
                },
                e.name
              );
            }),
          ]
        ),
      ]);
    },
  };

  var options = {
    view: function () {
      return m(
        "div",
        {
          id: "options-page",
          oninit: () => {
            helper.load_ads();
          },
          oncreate: () => {
            helper.bottom_bar("", "", "");
          },
        },
        [
          m("div", {
            id: "text",
            oncreate: ({ dom }) => {
              m.render(
                dom,
                m.trust(
                  "<kbd class='item'>Parrot</kbd> <br>With this app you can expand and maintain the vocabulary of your predictive text. <br><br> Credits: Mithril.js <br>License: MIT<br><br>"
                )
              );
            },
          }),
          m("kbd", "KaiOs Ads"),

          m("div", { id: "KaiOsAds-Wrapper", class: "item" }),
        ]
      );
    },
  };

  var list = {
    view: function () {
      return m("div", [
        m("input", {
          type: "search",
          class: "item",
          id: "input-search",
          oncreate: ({ dom }) => {
            dom.focus();
          },
          onfocus: () => {
            helper.bottom_bar(
              "<img src='assets/images/add.svg'>",
              "<img src='assets/images/save.svg'>",
              "<img src='assets/images/person.svg'>"
            );
          },
          oninput: (e) => {
            if (e.target.value != "") {
              helper.bottom_bar("<img src='assets/images/add.svg'>", "", "");
            } else {
              helper.bottom_bar(
                "<img src='assets/images/add.svg'>",
                "<img src='assets/images/save.svg'>",
                "<img src='assets/images/person.svg'>"
              );
            }
            if (action == "edit") {
              file_content.forEach((m) => {
                if (m.id == action_element) m.word = e.target.value;
              });
            } else {
              filter_words(e.target.value);
            }
          },
          onblur: (e) => {
            action = null;

            e.target.value = "";
          },
          onkeydown: (e) => {
            if (e.keyCode === 13 && e.target.value == "") {
              store_content();
            }
            if (e.key == "SoftRight") {
              get_contact(function (contactName) {
                document.querySelector("#input-search").value = contactName;
              });
            }

            if (e.key === "SoftLeft") {
              const regex = /^[^\d\s]+[A-Za-zÀ-ÖØ-öø-ÿ]+$/;

              if (regex.test(e.target.value)) {
                console.log("Input is valid.");
              } else {
                helper.side_toaster("input is not valid", 4000);
                return false;
              }

              //add word
              let valueToCheck = e.target.value;
              if (valueToCheck == "") {
                helper.side_toaster("input is empty", 4000);
                return false;
              }
              // Check if the value exists in the array of objects
              let valueExists = filtered_content.some(
                (obj) => obj.word === valueToCheck
              );

              if (valueExists) {
                helper.side_toaster("words still in the list", 4000);
              } else {
                file_content.push({
                  word: document.getElementById("input-search").value,
                  id: file_content.length,
                });
                e.target.value = "";
                filter_words("");
                let index = file_content.length - 1;

                setTimeout(() => {
                  document
                    .querySelector("[data-index='" + index + "']")
                    .classList.add("shake");

                  helper.bottom_bar(
                    "<img src='assets/images/add.svg'>",
                    "<img src='assets/images/save.svg'>",
                    "<img src='assets/images/person.svg'>"
                  );
                  //focus added element
                  document.getElementById("input-search").blur();
                  let ite = document.querySelectorAll(".item");
                  nav(index);
                  ite[index + 1].focus();
                }, 500);
              }
            }
          },
        }),
        m(
          "ul",
          {
            class: "flex",
            id: "words-list",
          },
          [
            filtered_content.map((e) => {
              return m(
                "li",
                {
                  class: "item",
                  "data-index": e.id,
                  onfocus: () => {
                    helper.bottom_bar(
                      "<img src='assets/images/pencil.svg'>",
                      "<img src='assets/images/save.svg'>",
                      "<img src='assets/images/delete.svg'>"
                    );
                  },
                  onkeydown: (e) => {
                    if (e.keyCode === 13) {
                      store_content();
                    }
                    if (e.key === "SoftRight") {
                      //remove word

                      document.activeElement.classList.add("delete");
                      let idToRemove =
                        document.activeElement.getAttribute("data-index");
                      setTimeout(() => {
                        nav(-1);

                        filtered_content = filtered_content.filter(
                          (item) => item.id !== Number(idToRemove)
                        );
                      }, 700);
                    }

                    if (e.key === "SoftLeft") {
                      action = "edit";
                      action_element = Number(
                        document.activeElement.getAttribute("data-index")
                      );

                      //edit word
                      document.activeElement.getAttribute("data-index");
                      document.getElementById("input-search").value =
                        document.activeElement.textContent;

                      document.getElementById("input-search").focus();
                    }
                  },
                },
                e.word
              );
            }),
          ]
        ),
      ]);
    },
  };

  m.route(root, "/start", {
    "/list_words": list,
    "/start": start,
    "/options": options,
  });

  m.route.prefix = "#";

  //////////////////////////////
  ////KEYPAD HANDLER////////////
  //////////////////////////////

  let longpress = false;
  const longpress_timespan = 1000;
  let timeout;

  function repeat_action(param) {
    switch (param.key) {
      case "ArrowUp":
        break;

      case "ArrowDown":
        break;

      case "ArrowLeft":
        break;

      case "ArrowRight":
        break;
    }
  }

  //////////////
  ////LONGPRESS
  /////////////

  function longpress_action(param) {
    switch (param.key) {
      case "Backspace":
        break;

      case "SoftRight":
        break;

      case "1":
        break;
    }
  }

  ///////////////
  ////SHORTPRESS
  //////////////

  function shortpress_action(evt) {
    switch (evt.key) {
      case "Backspace":
        evt.preventDefault();

        if (m.route.get().includes("/list_words")) {
          evt.preventDefault();
          m.route.set("/start");
        }

        if (m.route.get().includes("/options")) {
          evt.preventDefault();
          m.route.set("/start");
        }
        if (m.route.get().includes("/start")) {
          window.close();
        }

      case "EndCall":
        evt.preventDefault();

        if (m.route.get().includes("/list_words")) {
          evt.preventDefault();
        }

        if (m.route.get().includes("/start")) {
          window.close();
        }
        break;

      case "SoftLeft":
      case "Control":
        break;

      case "SoftRight":
      case "Alt":
        if (m.route.get().includes("/list_words")) {
        }
        break;

      case "Enter":
        document.querySelectorAll(".item")[0].focus();

        break;

      case "ArrowRight":
        nav(+1);

        break;

      case "ArrowLeft":
        nav(-1);
        break;

      case "ArrowUp":
        nav(-1);
        break;

      case "ArrowDown":
        nav(+1);
        break;
    }
  }

  /////////////////////////////////
  ////shortpress / longpress logic
  ////////////////////////////////

  function handleKeyDown(evt) {
    if (evt.key === "EndCall") {
      evt.preventDefault();
      if (m.route.get().includes("/start")) {
        window.close();
      }
    }

    if (evt.key === "Backspace") {
      evt.preventDefault();
      if (m.route.get().includes("/start")) {
        window.close();
      }
    }

    if (!evt.repeat) {
      longpress = false;
      timeout = setTimeout(() => {
        longpress = true;
        longpress_action(evt);
      }, longpress_timespan);
    }

    if (evt.repeat) {
      if (evt.key == "Backspace") evt.preventDefault();

      longpress = false;
      repeat_action(evt);
    }
  }

  function handleKeyUp(evt) {
    evt.preventDefault();

    if (evt.key == "Backspace") evt.preventDefault();
    //delete text
    if (
      status.windowOpen != "map" &&
      document.activeElement.tagName == "INPUT"
    ) {
      evt.preventDefault();
    }

    clearTimeout(timeout);
    if (!longpress) {
      shortpress_action(evt);
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
});

if (debug) {
  window.onerror = function (msg, url, linenumber) {
    alert(
      "Error message: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber
    );
    return true;
  };
}
