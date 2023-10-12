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
  // User clicked "OK" in the confirmation dialog
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

      // Create objects without including "|"
      file_content = splitArray.map(function (item, index) {
        // Remove leading and trailing whitespace from each item
        item = item.trim();

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
      console.log("finished");
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
            var file = cursor.result;
            let n = file.name.split(".");
            let file_type = n[n.length - 1];
            let m = file.name.split("/");
            let file_name = m[n.length];

            let filetype = "dic";
            if (file_type == filetype) {
              files.push({ path: file.name, name: file_name });
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
    console.log(e);
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
            oninit: () => {},
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
    oninit: function () {
      // Execute load_file and wait for it to complete before proceeding
    },
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
              ""
            );
          },
          oninput: (e) => {
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
            if (e.keyCode === 13) {
              store_content();
            }

            if (e.key === "SoftLeft") {
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
                      let idToRemove =
                        document.activeElement.getAttribute("data-index");

                      filtered_content = filtered_content.filter(
                        (item) => item.id !== Number(idToRemove)
                      );
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
      case "*":
        break;
      case "0":
        if (status.windowOpen == "map") {
          return false;
        }
        break;

      case "Backspace":
        break;

      case "6":
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
