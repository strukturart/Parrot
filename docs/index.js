"use strict";

let debug = false;

document.getElementById("intro").style.display = "none";

let files = [];

const search_file_callback = () => {
  console.log(e);
  files.push({ name: e });
  alert(files);
};

helper.search_file("german.dic", search_file_callback);

document.addEventListener("DOMContentLoaded", function () {
  var root = document.body;

  m.mount(root, {
    view: function () {
      return m("h1", "Try me out");
    },
  });

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
        if (status.windowOpen == "finder") {
          addMapLayers("delete-marker");
          return false;
        }

        if (status.windowOpen == "map") {
          maps.weather_map();
          return false;
        }
        break;

      case "Backspace":
        status.closedByUser = true;
        status.appOpendByUser = false;
        status.tracking_running = false;
        window.close();
        break;

      case "6":
        module.hotline(module.parseGPX(gpx_string));
        break;

      case "1":
        if (status.windowOpen == "map") {
          if (status.tracking_running) {
            return false;
          } else {
            if (status.geolocation == false) {
              helper.side_toaster(
                "can't start tracking, the position of your device could not be determined.",
                4000
              );
              return false;
            }
            helper.side_toaster(
              "tracking started,\n stop tracking with key 1",
              4000
            );
            status.live_track = true;
            module.measure_distance("tracking");
            status.tracking_running = true;

            var d = new Date();
            d.setMinutes(d.getMinutes() + 1);
            keepalive.add_alarm(d, "keep alive");
          }
        }
        break;
    }
  }

  ///////////////
  ////SHORTPRESS
  //////////////

  function shortpress_action(param) {
    if (status.keylock) {
      switch (param.key) {
        case "Backspace":
          preventDefault();
          break;
        case "EndCall":
          preventDefault();
          break;
        case "Enter":
          document.querySelector("body").classList.toggle("screenOff");
          document.querySelector("html").classList.toggle("screenOff");

          break;
      }
      return false;
    }
    switch (param.key) {
      case "Backspace":
        if (status.windowOpen == "scan") {
          qr.stop_scan();
          open_finder();
          windowOpen = "finder";
        }

        if (
          document.activeElement.tagName == "TEXTAREA" ||
          document.activeElement.tagName == "INPUT"
        )
          break;

        if (status.windowOpen == "files-option") {
          document.getElementById("files-option").style.display = "none";
          open_finder();
          windowOpen = "finder";
          general.active_item.focus();
          break;
        }

        if (status.windowOpen != "map") {
          document.querySelector("div#finder").style.display = "none";
          document.querySelector("div#markers-option").style.display = "none";
          document.getElementById("tracking-view").style.display = "none";

          status.windowOpen = "map";
          status.marker_selection = false;
          document.activeElement.blur();

          settings.load_settings();

          helper.top_bar("", "", "");
          helper.bottom_bar("", "", "");
          break;
        }

        if (status.windowOpen === "map") {
          status.closedByUser = true;
          localStorage.setItem("status", JSON.stringify(status));
          break;
        }

        break;

      case "EndCall":
        status.closedByUser = true;
        localStorage.setItem("status", JSON.stringify(status));
        window.close();
        break;

      case "SoftLeft":
      case "Control":
        if (status.windowOpen == "user-input" && save_mode == "rename-file") {
          module.user_input("close");
          status.windowOpen = "finder";
          save_mode = "";
          break;
        }
        if (status.windowOpen == "user-input") {
          module.user_input("close");
          save_mode = "";
          if (status.tracking_paused) {
            status.tracking_running = true;
            status.tracking_paused = false;
          }
          break;
        }
        if (status.windowOpen == "search") {
          search.hideSearch();
          break;
        }

        if (status.path_selection && status.windowOpen != "user-input") {
          helper.bottom_bar("", "", "");
          status.path_selection = false;
          module.measure_distance("destroy");
          break;
        }

        if (status.windowOpen == "marker") {
          helper.bottom_bar("", "", "");
          status.marker_selection = false;
          status.windowOpen = "map";
          document.getElementById("markers-option").style.display = "none";
        }

        if (status.windowOpen == "map") {
          ZoomMap("out");
          break;
        }

        if (status.windowOpen == "finder" && qrscan == true) {
          status.windowOpen = "scan";
          let t = document.activeElement;
          qr.start_scan(function (scan_callback) {
            let slug = scan_callback;
            document.activeElement.value = slug;
            status.windowOpen = "finder";
            t.focus();
          });

          break;
        }

        break;

      case "SoftRight":
      case "Alt":
        if (status.windowOpen == "search") {
          start_search();
          break;
        }
        if (status.path_selection && status.windowOpen == "map") {
          save_mode = "geojson-path";
          module.user_input("open", "", "save this marker as geojson file");
          helper.bottom_bar("cancel", "", "save");

          break;
        }

        if (
          status.windowOpen == "user-input" &&
          save_mode == "geojson-single"
        ) {
          let w;
          if (module.user_input("return") == "") {
            w = dayjs().format("YYYY-MM-DD-HH-mm");
          } else {
            w = module.user_input("return");
          }

          geojson.save_geojson(
            setting.export_path + w + ".geojson",
            "single-direct"
          );
          save_mode = "";
          break;
        }

        if (
          status.windowOpen == "user-input" &&
          save_mode == "geojson-single"
        ) {
          let w;
          if (module.user_input("return") == "") {
            w = dayjs().format("YYYY-MM-DD-HH-mm");
          } else {
            w = module.user_input("return");
          }

          geojson.save_geojson(setting.export_path + w + ".geojson", "single");
          save_mode = "";
          break;
        }

        if (status.windowOpen == "user-input" && save_mode == "geojson-path") {
          let w;
          if (module.user_input("return") == "") {
            w = dayjs().format("YYYY-MM-DD-HH-mm");
          } else {
            w = module.user_input("return");
          }

          geojson.save_geojson(setting.export_path + w + ".geojson", "path");
          save_mode = "";
          break;
        }

        if (
          status.windowOpen == "user-input" &&
          save_mode == "geojson-collection"
        ) {
          let w;
          if (module.user_input("return") == "") {
            w = dayjs().format("YYYY-MM-DD-HH-mm");
          } else {
            w = module.user_input("return");
          }

          geojson.save_geojson(
            setting.export_path + w + ".geojson",
            "collection"
          );

          save_mode = "";
          break;
        }

        if (status.windowOpen == "user-input" && save_mode == "routing") {
          let w;
          if (module.user_input("return") == "") {
            w = dayjs().format("YYYY-MM-DD-HH-mm");
          } else {
            w = module.user_input("return");
          }

          geojson.save_geojson(setting.export_path + w + ".geojson", "routing");
          save_mode = "";
          break;
        }

        if (
          status.windowOpen == "user-input" &&
          save_mode == "geojson-tracking"
        ) {
          let w;
          if (module.user_input("return") == "") {
            w = dayjs().format("YYYY-MM-DD-HH-mm");
          } else {
            w = module.user_input("return");
          }

          geojson.save_gpx(
            setting.export_path + w + ".gpx",
            "tracking",
            gpx_callback
          );
          save_mode = "";
          status.live_track = false;
          status.live_track_id = [];

          if (status.tracking_paused) {
            status.tracking_running = false;
            status.tracking_paused = false;
          }
          break;
        }

        if (status.windowOpen == "map") {
          ZoomMap("in");
          break;
        }

        if (status.windowOpen == "user-input" && save_mode != "geojson") {
          let filename = module.user_input("return");
          break;
        }

        if (status.windowOpen == "finder") {
          if (
            document.activeElement.getAttribute("data-map") == "gpx" ||
            document.activeElement.getAttribute("data-map") == "geojson" ||
            document.activeElement.getAttribute("data-map") == "gpx-osm"
          ) {
            show_files_option();
          }
          break;
        }

        break;

      case "Enter":
        if (status.intro) return false;
        if (
          status.windowOpen == "user-input" &&
          save_mode == "geojson-tracking"
        ) {
          module.user_input("close");
          module.measure_distance("destroy_tracking");
          status.live_track = false;
          status.live_track_id = [];
          save_mode = "";
          break;
        }

        if (status.windowOpen == "user-input" && save_mode == "routing") {
          break;
        }

        if (status.windowOpen == "user-input" && save_mode == "rename-file") {
          helper.renameFile(
            general.active_item.getAttribute("data-filepath"),
            module.user_input("return")
          );
          status.windowOpen = "finder";
          save_mode = "";
          break;
        }

        if (status.windowOpen == "map") {
          open_finder();
          status.windowOpen = "finder";
          break;
        }
        if (
          document.activeElement.tagName == "BUTTON" &&
          document.activeElement.classList.contains("link")
        ) {
          window.open(document.activeElement.getAttribute("data-href"));
          break;
        }

        if (document.activeElement.classList.contains("input-parent")) {
          document.activeElement.children[1].focus();
          if (document.activeElement.type == "checkbox") {
            settings.save_chk(
              document.activeElement.id,
              document.activeElement.value
            );
          }
        }

        if (status.windowOpen == "search") {
          search.search_return_data();

          map.setView([olc_lat_lng[0], olc_lat_lng[1]]);
          search.hideSearch();
          mainmarker.current_lat = Number(olc_lat_lng[0]);
          mainmarker.current_lng = Number(olc_lat_lng[1]);
          helper.side_toaster("press 5 to save the marker", 2000);
          break;
        }

        if (document.activeElement == document.getElementById("clear-cache")) {
          maps.delete_cache();
          helper
            .calculateDatabaseSizeInMB(tilesLayer._db)
            .then(function (sizeInMB) {
              document.querySelector("#clear-cache em").innerText =
                sizeInMB.toFixed(2);
            });
          break;
        }

        if (
          document.activeElement == document.getElementById("save-settings")
        ) {
          settings.save_settings();
          break;
        }

        if (document.activeElement == document.getElementById("oauth")) {
          osm.OAuth_osm(osm_oauth_callback);

          break;
        }

        if (
          document.activeElement == document.getElementById("export-settings")
        ) {
          settings.export_settings();
          break;
        }

        if (
          document.activeElement ==
          document.getElementById("load_settings_from_file")
        ) {
          settings.load_settings_from_file();

          break;
        }

        if (
          document.activeElement == document.getElementById("load_map_data")
        ) {
          maps.import_db();

          break;
        }

        if (document.activeElement == document.getElementById("owm-key")) {
          helper.bottom_bar("qr.scan", "", "");
          break;
        }

        if (status.windowOpen == "marker") {
          document.querySelector("div#markers-option").style.display = "block";
          document.querySelector("div#markers-option").children[0].focus();
          finder_tabindex();
          status.windowOpen = "markers_option";

          document.querySelector("input#popup").value = "";

          let pu = mainmarker.selected_marker.getPopup();

          if (pu != undefined) {
            document.querySelector("input#popup").value = pu._content;
          }
          helper.bottom_bar("", "select", "");
          tabIndex = 0;
          break;
        }

        if (
          status.windowOpen == "markers_option" &&
          mainmarker.selected_marker != ""
        ) {
          markers_action();
          break;
        }

        if (status.windowOpen == "files-option") {
          markers_action();
          break;
        }

        if (
          status.windowOpen == "finder" &&
          document.activeElement.classList.contains("item")
        ) {
          addMapLayers();
          break;
        }

        break;

      case "1":
        if (status.windowOpen == "map") {
          if (status.tracking_running) {
            helper.side_toaster("tracking paused", 5000);
            save_mode = "geojson-tracking";
            module.user_input("open", "", "Save as GPX file");
            helper.bottom_bar("cancel", "don't save", "save");

            keepalive.remove_alarm();
            status.tracking_running = false;
            status.tracking_paused = true;
            //live tracking
            //upload track, before save local
            let t = new Date().getTime() / 1000;
            t = t + 320;
            status.tracking_backupup_at = t;
            keepalive.remove_alarm();

            return true;
          } else {
            if (status.geolocation == false) {
              helper.side_toaster(
                "can't start tracking, the position of your device could not be determined.",
                4000
              );
              return false;
            }
            helper.side_toaster(
              "tracking started,\n stop tracking with key 1",
              4000
            );
            module.measure_distance("tracking");
            status.tracking_running = true;

            var d = new Date();
            d.setMinutes(d.getMinutes() + 1);
            keepalive.add_alarm(d, "keep alive");
          }
        }
        break;

      case "2":
        if (status.windowOpen == "map") {
          search.showSearch();
        }

        break;

      case "4":
        if (status.windowOpen == "map") {
          auto_update_view();
        }
        break;

      case "5":
        // maps.export_db();
        //maps.import_db();
        if (status.tracking_running) {
          document.getElementById("tracking-view").style.display = "flex";
          status.windowOpen = "trackingView";
        }

        break;

      case "6":
        module.select_gpx();

        break;

      case "7":
        if (status.windowOpen == "map") {
          module.measure_distance("addMarker");
          helper.bottom_bar("close", "", "save");
        }
        break;

      case "8":
        if (status.windowOpen == "map") {
          save_mode = "geojson-collection";
          module.user_input("open", "", "save all markers as geojson file");
          helper.bottom_bar("cancel", "", "save");
        }

        break;

      case "9":
        if (status.windowOpen == "map") {
          L.marker([mainmarker.current_lat, mainmarker.current_lng]).addTo(
            markers_group
          );
          module.set_f_upd_markers();
        }
        break;

      case "0":
        if (status.windowOpen == "map") {
          mozactivity.share_position();
        }
        break;

      case "*":
        if (status.intro) return false;
        mainmarker.selected_marker = module.select_marker();
        break;

      case "#":
        if (status.windowOpen == "map") maps.caching_tiles();
        break;

      case "ArrowRight":
        MovemMap("right");

        if (
          status.windowOpen == "finder" &&
          document.activeElement.tagName != "INPUT"
        ) {
          finder_navigation("+1");
        }
        break;

      case "ArrowLeft":
        MovemMap("left");
        if (
          status.windowOpen == "finder" &&
          document.activeElement.tagName != "INPUT"
        ) {
          finder_navigation("-1");
        }
        break;

      case "ArrowUp":
        if (status.windowOpen == "map" || status.windowOpen == "coordinations")
          MovemMap("up");

        if (status.windowOpen == "search") search.search_nav(-1);
        nav("-1");
        break;

      case "ArrowDown":
        if (status.windowOpen == "map" || status.windowOpen == "coordinations")
          MovemMap("down");

        if (status.windowOpen == "search") search.search_nav(+1);

        nav("+1");
        break;
    }
  }

  /////////////////////////////////
  ////shortpress / longpress logic
  ////////////////////////////////

  function handleKeyDown(evt) {
    if (status.visible === "hidden") return false;
    if (evt.key === "Backspace" && status.windowOpen !== "map") {
      evt.preventDefault();
    }

    if (evt.key === "EndCall") {
      evt.preventDefault();
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
    if (status.visible === "hidden") return false;
    evt.preventDefault();

    if (evt.key == "Backspace") evt.preventDefault();
    //delete text
    if (
      evt.key == "Backspace" &&
      status.windowOpen != "map" &&
      status.windowOpen == "finder" &&
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
