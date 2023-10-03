"use strict";

let debug = false;
let filter_query;
let file_content = [];
let current_file;
let files = [];

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
  var reversedString = file_content
    .map(function (item) {
      return item.word;
    })
    .join("|");

  console.log(reversedString);
  helper.renameFile(current_file, reversedString);
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
      file_content = splitArray.map(function (item) {
        // Remove leading and trailing whitespace from each item
        item = item.trim();

        // Create objects without including "|"
        return { word: item };
      });
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

try {
  var d = navigator.getDeviceStorage("sdcard");

  var cursor = d.enumerate();

  cursor.onsuccess = function () {
    if (!this.result) {
      console.log("finished");
      m.route.set("/start");
      document.getElementById("intro").style.display = "none";
    }
    if (cursor.result.name !== null) {
      var file = cursor.result;
      let n = file.name.split(".");
      let file_type = n[n.length - 1];
      let m = file.name.split("/");
      let file_name = m[n.length];

      let filetype = "dic";
      if (file_type == filetype) {
        console.log(file_name);
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

document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("main");

  var start = {
    view: function () {
      return m("div", [
        m(
          "ul",
          {
            id: "files_list",
            oncreate: () => {
              helper.bottom_bar("", "select", "");
              document.getElementById("intro").style.display = "none";
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
                      filter_query =
                        document.activeElement.getAttribute("data-path");
                      load_file(filter_query);

                      m.route.set("/list_words", {});
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

  var list = {
    oninit: function () {
      // Execute load_file and wait for it to complete before proceeding
    },
    view: function () {
      return m("div", [
        m(
          "ul",
          {
            class: "",
            oncreate: () => {
              helper.bottom_bar("add", "edit", "delete");
            },
          },
          [
            file_content.map((e) => {
              return m("li", { class: "item" }, e.word);
            }),
          ]
        ),
      ]);
    },
  };

  var word = {
    view: function () {
      return m("a", { href: "#!/hello" }, "Enter!");
    },
  };

  m.route(root, "/start", {
    "/list_words": list,
    "/add_word": word,
    "/start": start,
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
        if (m.route.get().includes("/start")) {
          window.close();
        }

      case "EndCall":
        evt.preventDefault();

        if (m.route.get().includes("/list_words")) {
          evt.preventDefault();

          m.route.set("/start");
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
        break;

      case "ArrowLeft":
        break;

      case "ArrowUp":
        nav(-1);

        break;

      case "ArrowDown":
        nav(+1);
        break;

      case "5":
        store_content();
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
