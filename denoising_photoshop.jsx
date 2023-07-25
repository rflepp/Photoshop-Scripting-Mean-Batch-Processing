(function () {

  // Script variables
  var abort;
  var title = "Adobe Script Tutorial 5";

  // Reusable UI variables
  var g; // group
  var p; // panel
  var w; // window

  // Permanent UI variables
  var btnCancel;
  var btnFolderInput;
  var btnFolderOutput;
  var btnOk;
  var txtFolderInput;
  var txtFolderOutput;

  // SETUP

  // CREATE USER INTERFACE

  w = new Window("dialog", title);
  w.alignChildren = "fill";
  p = w.add("panel", undefined, "Input");
  g = p.add("group");
  btnFolderInput = g.add("button", undefined, "Folder...");
  txtFolderInput = g.add("statictext", undefined, "", {
      truncate: "middle"
  });
  txtFolderInput.preferredSize = [200, -1];
  p = w.add("panel", undefined, "Output");
  g = p.add("group");
  btnFolderOutput = g.add("button", undefined, "Folder...");
  txtFolderOutput = g.add("statictext", undefined, "", {
      truncate: "middle"
  });
  txtFolderOutput.preferredSize = [200, -1];
  g = w.add("group");
  g.alignment = "center";
  btnOk = g.add("button", undefined, "OK");
  btnCancel = g.add("button", undefined, "Cancel");

  // UI EVENT HANDLERS

  btnFolderInput.onClick = function () {
      var f = Folder.selectDialog();
      if (f) {
          txtFolderInput.text = f.fullName;
      }
  };

  btnFolderOutput.onClick = function () {
      var f = Folder.selectDialog();
      if (f) {
          txtFolderOutput.text = f.fullName;
      }
  };

  btnOk.onClick = function () {
      if (!txtFolderInput.text) {
          alert("Select input folder", " ", false);
          return;
      }
      if (!txtFolderOutput.text) {
          alert("Select output folder", " ", false);
          return;
      }
      w.close(1);
  };

  btnCancel.onClick = function () {
      w.close(0);
  };

  // SHOW THE WINDOW

  if (w.show() == 1) {
      try {
          process();
          alert(abort || "Done", title, false);
      } catch (e) {
          alert("An error has occurred.\nLine " + e.line + ": " + e.message, title, true);
      }
  }

  function process() {
      var files;
      var i;
      // Ignore messages when opening documents.
      app.displayDialogs = DialogModes.NO;
      progress("Reading folder...");
      // Get files in folder.
      files = new Folder(txtFolderInput.text).getFiles(function (f) {
          if (f.hidden || f instanceof Folder) {
              return false;
          }
          return true;
      });
      if (!files.length) {
          abort = "No files found in selected folder";
          return;
      }
      progress.set(files.length);
      try {
          // Loop through files array.
          for (i = 0; i < files.length; i=i+20) {
            for ( var j = 0; j < 20; j++) {
              app.open(files[i+j])
            }
            var base = activeDocument = app.documents[0];
            base.flatten();
            base.layers[0].isBackgroundLayer = false;
            var docNum = app.documents.length;
            for (var j = 1; j < docNum; j++) {
                var nextDoc = activeDocument = app.documents[1];
                nextDoc.flatten();
                nextDoc.activeLayer.duplicate(base.layers[0], ElementPlacement.PLACEBEFORE);
                nextDoc.close(SaveOptions.DONOTSAVECHANGES);
            }
        
            base.layers[base.layers.length - 1].isBackgroundLayer = false;
            selectAllLayers();
            makeSO();
            makeMean();
            base.flatten();
            var fName = base.name.split('_')[0];
            var pngOptions = new PNGSaveOptions();
            pngOptions.interlaced = false; // Set to true for interlaced PNG
            base.saveAs(new File(txtFolderOutput.text + '/Median-' + fName + '.png'), pngOptions);
            base.close(SaveOptions.DONOTSAVECHANGES);
          }
      } finally {
          progress.close();
      }
  }

  function selectAllLayers() {
    var idselectAllLayers = stringIDToTypeID("selectAllLayers");
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref1 = new ActionReference();
    var idLyr = charIDToTypeID("Lyr ");
    var idOrdn = charIDToTypeID("Ordn");
    var idTrgt = charIDToTypeID("Trgt");
    ref1.putEnumerated(idLyr, idOrdn, idTrgt);
    desc3.putReference(idnull, ref1);
    executeAction(idselectAllLayers, desc3, DialogModes.NO);
  }

  function makeSO() {
      var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
      executeAction(idnewPlacedLayer, undefined, DialogModes.NO);
  }

  function makeMean() {
      var idapplyImageStackPluginRenderer = stringIDToTypeID("applyImageStackPluginRenderer");
      var desc252 = new ActionDescriptor();
      var idimageStackPlugin = stringIDToTypeID("imageStackPlugin");
      var idavrg = charIDToTypeID("avrg");
      desc252.putClass(idimageStackPlugin, idavrg);
      var idNm = charIDToTypeID("Nm  ");
      desc252.putString(idNm, "Mean");
      executeAction(idapplyImageStackPluginRenderer, desc252, DialogModes.NO);
  }

  function progress(message) {
      var b;
      var t;
      var w;
      w = new Window("palette", "Progress", undefined, {
          closeButton: false
      });
      t = w.add("statictext", undefined, message);
      t.preferredSize = [450, -1];
      b = w.add("progressbar");
      b.preferredSize = [450, -1];
      progress.close = function () {
          w.close();
      };
      progress.increment = function () {
          b.value++;
      };
      progress.message = function (message) {
          t.text = message;
          app.refresh();
      };
      progress.set = function (steps) {
          b.value = 0;
          b.minvalue = 0;
          b.maxvalue = steps;
      };
      w.show();
      app.refresh();
  }

})();