(function bridgeHost() {
  app.beginSuppressDialogs();

  function kvRead(path) {
    var f = new File(path);
    if (!f.exists) {
      throw new Error("MOTION_OS_OP_FILE missing or not found: " + path);
    }
    f.encoding = "UTF-8";
    f.open("r");
    var obj = {};
    while (!f.eof) {
      var line = f.readln();
      if (!line) {
        continue;
      }
      var eq = line.indexOf("=");
      if (eq < 0) {
        continue;
      }
      var k = line.substring(0, eq);
      var v = line.substring(eq + 1);
      obj[k] = v;
    }
    f.close();
    return obj;
  }

  function kvWrite(path, lines) {
    var f = new File(path);
    f.encoding = "UTF-8";
    f.open("w");
    for (var i = 0; i < lines.length; i++) {
      f.writeln(lines[i]);
    }
    f.close();
  }

  function findCompByName(name) {
    for (var i = 1; i <= app.project.numItems; i++) {
      var it = app.project.item(i);
      if (it instanceof CompItem && it.name === name) {
        return it;
      }
    }
    return null;
  }

  function findLayerByName(comp, name) {
    for (var j = 1; j <= comp.numLayers; j++) {
      var ly = comp.layer(j);
      if (ly.name === name) {
        return ly;
      }
    }
    return null;
  }

  function resolveProperty(layer, propName) {
    try {
      return layer.property(propName);
    } catch (e) {
      return null;
    }
  }

  var opPath = $.getenv("MOTION_OS_OP_FILE");
  if (!opPath) {
    throw new Error("MOTION_OS_OP_FILE env var not set");
  }

  var op = kvRead(opPath);
  var resultPath = op.resultPath || "";
  if (!resultPath) {
    throw new Error("resultPath missing in op file");
  }

  function fail(msg) {
    kvWrite(resultPath, ["ok=false", "error=" + msg]);
    app.endSuppressDialogs(false);
  }

  try {
    var projectPath = op.project || "";
    if (projectPath) {
      var pf = new File(projectPath);
      if (!pf.exists) {
        fail("Project file not found");
        return;
      }
      app.open(pf);
    }

    var compName = op.comp || "";
    var layerName = op.layer || "";
    var comp = findCompByName(compName);
    if (!comp) {
      fail("Comp not found: " + compName);
      return;
    }

    var layer = findLayerByName(comp, layerName);
    if (!layer) {
      fail("Layer not found: " + layerName);
      return;
    }

    var propName = op.property || "Position";
    var prop = resolveProperty(layer, propName);
    if (!prop) {
      fail("Property not found: " + propName);
      return;
    }

    var keyIndex = parseInt(op.keyIndex || "1", 10);
    if (isNaN(keyIndex) || keyIndex < 1) {
      fail("Invalid keyIndex");
      return;
    }

    var opKind = op.op || "";

    if (opKind === "get") {
      if (prop.numKeys < keyIndex) {
        fail("Not enough keys on property (have " + prop.numKeys + ")");
        return;
      }
      var inEase = prop.keyInTemporalEase(keyIndex);
      var outEase = prop.keyOutTemporalEase(keyIndex);
      var lines = [
        "ok=true",
        "op=get",
        "keyCount=" + prop.numKeys,
        "easeInSpeed=" + inEase[0].speed,
        "easeInInfluence=" + inEase[0].influence,
        "easeOutSpeed=" + outEase[0].speed,
        "easeOutInfluence=" + outEase[0].influence,
      ];
      kvWrite(resultPath, lines);
      app.endSuppressDialogs(false);
      return;
    }

    if (opKind === "set") {
      if (prop.numKeys < keyIndex) {
        fail("Not enough keys on property (have " + prop.numKeys + ")");
        return;
      }
      var ei = parseFloat(op.easeInInfluence || "0");
      var eo = parseFloat(op.easeOutInfluence || "0");
      var is = parseFloat(op.easeInSpeed || "0");
      var os = parseFloat(op.easeOutSpeed || "0");
      var pvt = prop.propertyValueType;
      var dims = 1;
      if (pvt === PropertyValueType.TwoD || pvt === PropertyValueType.TwoD_SPATIAL) {
        dims = 2;
      } else if (pvt === PropertyValueType.ThreeD || pvt === PropertyValueType.ThreeD_SPATIAL) {
        dims = 3;
      }
      var ins = [];
      var outs = [];
      for (var d = 0; d < dims; d++) {
        ins.push(new KeyframeEase(is, ei));
        outs.push(new KeyframeEase(os, eo));
      }
      prop.setTemporalEaseAtKey(keyIndex, ins, outs);
      kvWrite(resultPath, ["ok=true", "op=set"]);
      app.endSuppressDialogs(false);
      return;
    }

    if (opKind === "export") {
      var outputPath = op.outputPath || "";
      if (!outputPath) {
        fail("outputPath missing");
        return;
      }
      var outFile = new File(outputPath);
      var exportTime = parseFloat(op.exportTime || "0");
      if (isNaN(exportTime)) {
        exportTime = 0;
      }

      var rqItem = app.project.renderQueue.items.add(comp);
      rqItem.timeSpanStart = exportTime;
      rqItem.timeSpanDuration = comp.frameDuration;

      var om = rqItem.outputModule(1);
      try {
        om.applyTemplate("PNG Sequence");
      } catch (e1) {
        try {
          om.applyTemplate("Lossless");
        } catch (e2) {
          // continue with default template
        }
      }
      om.file = outFile;

      app.project.renderQueue.render();
      kvWrite(resultPath, ["ok=true", "op=export", "outputPath=" + outputPath]);
      app.endSuppressDialogs(false);
      return;
    }

    fail("Unknown op: " + opKind);
    return;
  } catch (err) {
    try {
      var rp2 = $.getenv("MOTION_OS_OP_FILE");
      if (rp2) {
        var o2 = kvRead(rp2);
        if (o2.resultPath) {
          kvWrite(o2.resultPath, ["ok=false", "error=" + String(err)]);
        }
      }
    } catch (e2) {
      // swallow secondary failures
    }
    app.endSuppressDialogs(false);
  }
})();
