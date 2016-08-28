(function() {
  var debug = true;
  var gui   = require('nw.gui');
  var fs    = require('fs');
  var win   = gui.Window.get();

  if (debug) win.showDevTools();

  // =========================================================================
  // Variable setup

  var json     = {};
  var current  = [];
  var loaded   = false;
  var filePath = '';
  var currentHovering = null;
  var contextMenuAt = null;
  var aniIndex = 0;
  var pattern = 0;

  // =========================================================================
  // PIXI Setup

  var canvas   = document.getElementById('pixiCanvas');
  var renderer = PIXI.autoDetectRenderer(1000, 550, {
    view: canvas,
    backgroundColor: 0x2B2B2B,
    transparent: false
  });
  var stage = new PIXI.Container();

  // Spritesheet

  var spriteContainer = new PIXI.Container();
  spriteContainer.x = 100;
  stage.addChild(spriteContainer);

  var spriteSheet = new PIXI.Sprite();
  // PIXI.Text doesn't return correct width / height for the spriteIndexes
  // Which makes spriteContainers dimensions incorrect, so I
  // made spriteSheet interactive instead
  spriteSheet.interactive = true;
  spriteSheet.buttonMode  = true;
  spriteSheet.mousedown = function() {
    this.alpha = 0.9;
    this.dragging = true;
  };
  spriteSheet.mouseup = spriteSheet.mouseupoutside = function() {
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
  };
  spriteSheet.mousemove = function(event) {
    if(this.dragging) {
      var mouse = event.data.originalEvent;
      if (mouse.target.id === "pixiCanvas") {
        spriteContainer.x += mouse.movementX;
        spriteContainer.y += mouse.movementY;
      }
    }
  };
  spriteContainer.addChild(spriteSheet);

  var spriteSlices = new PIXI.Graphics();
  spriteContainer.addChild(spriteSlices);

  var spriteIndexes = new PIXI.Container();
  spriteContainer.addChild(spriteIndexes);

  var spriteAnchor = new PIXI.Graphics();
  spriteAnchor.beginFill(0xFF0000, 0.5);
  spriteAnchor.drawRect(-1, 0, 3, 1);
  spriteAnchor.drawRect(0, -1, 1, 3);
  //spriteAnchor.beginFill(0xFF0000);
  //spriteAnchor.drawRect(0, 0, 1, 1);
  spriteAnchor.alpha = 0;
  spriteAnchor.endFill();
  spriteContainer.addChild(spriteAnchor);

  // Preview Sprites

  var previewText = new PIXI.Text("Preview", {
    font: 'bold 12px Arial',
    fill: "#F6F6F6",
    stroke: "#000000",
    strokeThickness: "0.5",
    align: 'center',
  });
  previewText.y -= 20;

  var aniSprite = new PIXI.Sprite();
  aniSprite.y = 20;
  aniSprite.x = 10;
  aniSprite.alpha = 0;
  aniSprite.addChild(previewText);
  stage.addChild(aniSprite);

  // Zoom Buttons

  var zoomButtons = new PIXI.Container();
  zoomButtons.alpha = 0;
  stage.addChild(zoomButtons);

  var zoomIn = new PIXI.Sprite.fromImage("imgs/appbar.magnify.add.png");
  zoomIn.interactive = true;
  zoomIn.buttonMode = true;
  zoomIn.mousedown = function() {
    spriteContainer.scale.x = Math.min(spriteContainer.scale.x + 0.10, 10);
    spriteContainer.scale.y = Math.min(spriteContainer.scale.y + 0.10, 10);
  };

  var zoomOut = new PIXI.Sprite.fromImage("imgs/appbar.magnify.minus.png");
  zoomOut.interactive = true;
  zoomOut.buttonMode = true;
  zoomOut.mousedown = function() {
    spriteContainer.scale.x = Math.max(spriteContainer.scale.x - 0.10, 0.1);
    spriteContainer.scale.y = Math.max(spriteContainer.scale.y - 0.10, 0.1);
  };
  zoomOut.x = 50;

  zoomButtons.addChild(zoomIn);
  zoomButtons.addChild(zoomOut);

  canvas.addEventListener('wheel', function(event) {
    if (zoomButtons.alpha !== 0) {
      var mouseX = event.layerX;
      var mouseY = event.layerY;
      var localPos = spriteContainer.toLocal(new PIXI.Point(mouseX, mouseY));
      if (localPos.x > 0 && localPos.y > 0 && localPos.x <= spriteContainer.width && localPos.y <= spriteContainer.height ) {
        if (event.wheelDelta > 0) {
          spriteContainer.scale.x = Math.min(spriteContainer.scale.x + 0.10, 10);
          spriteContainer.scale.y = Math.min(spriteContainer.scale.y + 0.10, 10);
        } else {
          spriteContainer.scale.x = Math.max(spriteContainer.scale.x - 0.10, 0.1);
          spriteContainer.scale.y = Math.max(spriteContainer.scale.y - 0.10, 0.1);
        }
        spriteContainer.x = -(localPos.x * spriteContainer.scale.x) + mouseX;
        spriteContainer.y = -(localPos.y * spriteContainer.scale.y) + mouseY;
      }
    }
  });

  // Not Loaded

  var notLoaded = new PIXI.Text("Begin by openning a file.", {
    align: 'center',
    fill: '#F6F6F6'
  });
  notLoaded.x = 500;
  notLoaded.y = 275;
  notLoaded.anchor.x = 0.5;
  notLoaded.anchor.y = 0.5;
  notLoaded.alpha = 0.9;
  stage.addChild(notLoaded);

  // =========================================================================
  // JQuery handlers

  $(window).resize(function() {
    resizeCanvas();
    resizeToolbar();
  });

  $('body').ready(function() {
    resizeCanvas();
    resizeToolbar();
  });

  $(document).click(function() {
    $('#contextMenu').hide();
  });

  $('#contextMenu > span').click(function(event) {
    event.stopPropagation();
    var cmd = this.innerHTML;
    if (cmd === "Duplicate") {
      contextDuplicate();
    } else if (cmd === "Delete") {
      contextDelete();
    }
    $('#contextMenu').hide();
  });

  function contextDuplicate() {
    var id = contextMenuAt;
    var hasId = true;
    var newId = 0;
    if (current.length === 0) {
      var data = json;
    } else {
      var data = json[current[0]].poses;
    }
    while(hasId) {
      newId++;
      hasId = data.hasOwnProperty(id + "_" + newId);
    }
    data[id + "_" + newId] = JSON.parse(JSON.stringify(data[id]));
    if (current.length === 0) {
      setupConfigList();
    } else {
      setupPoseList();
    }
  };

  function contextDelete() {
    var id = contextMenuAt;
    if (current.length === 0) {
      var data = json;
    } else {
      var data = json[current[0]].poses;
    }
    delete data[id];
    if (current.length === 0) {
      setupConfigList();
    } else {
      aniSprite.alpha = 0;
      setupPoseList();
    }
  };

  $('#fileWindow').change(function() {
    var path = this.value;
    if (path === "") return;
    filePath = path.replace(/\\([^\\]*)$/, "");
    var loadedJson = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!checkIfValid(loadedJson)) return;
    json = loadedJson;
    for (var prop in json) {
      // sampleFile is no longer used, it stored large data
      // so needs to be deleted
      if (json[prop]["sampleFile"]) {
        delete json[prop]["sampleFile"];
      }
      // Add new properties and default them
      // JSON files from 0.9 is missing these properties
      if (!json[prop]["anchorX"]) {
        json[prop]["anchorX"] = 0.5;
      }
      if (!json[prop]["anchorY"]) {
        json[prop]["anchorY"] = 1;
      }
    }
    setupCanvas();
  });

  $('#saveWindow').change(function() {
    var newFile = JSON.stringify(json, null, 2);
    var path = this.value;
    if (path === "") return;
    fs.writeFileSync(path, newFile);
    filePath = path.replace(/\\([^\\]*)$/, "");
    this.value = "";
  });

  $('#newFile').mouseover(function() {
    $('#menuHover').html('New').show().offset({ left: 0 });
    $('#menuHover').css({ 'background-color': '#2B2B2B' });
  }).mouseout(function() {
    $('#menuHover').hide();
  }).click(function() {
    json = {};
    setupCanvas();
  });

  $('#loadFile').mouseover(function() {
    $('#menuHover').html('Load').show().offset({ left:  55 });
    $('#menuHover').css({ 'background-color': '#2B2B2B' });
  }).mouseout(function() {
    $('#menuHover').hide();
  }).click(function() {
    $('#fileWindow').click();
  });

  $('#saveFile').mouseover(function() {
    $('#menuHover').html('Save').show().offset({ left:  110 });
    if (!loaded) {
      $('#menuHover').css({ 'background-color': '#FF0000' });
    }
  }).mouseout(function() {
    $('#menuHover').hide();
  }).click(function() {
    if (loaded) {
      var div = document.getElementById("saveWindow");
      if (filePath !== "") {
        div.nwsaveas = filePath + "\\SpriteAnim.json";
      }
      div.click();
    }
  });

  $('#imgWindow').change(function() {
    loadImg();
  });

  $('#backFromPose').click(function() {
    current.splice(0, 1);
    aniSprite.alpha = 0;
    $('#settings').hide();
    $('#configurations').show();
    spriteSheet.texture = PIXI.Texture.EMPTY;
    spriteSlices.clear();
    for (var i = spriteIndexes.children.length - 1; i >= 0; i--) {
      spriteIndexes.removeChild(spriteIndexes.children[i]);
    };
    spriteAnchor.alpha = 0;
    var div = document.getElementById("imgWindow");
    div.files.clear();
    resizeToolbar();
  });

  $('#backFromSettings').click(function() {
    current.splice(1, 1);
    aniSprite.alpha = 0;
    $('#poseSetting').hide();
    $('#settings').show();
    resizeToolbar();
  });

  $('#addConfig').click(function() {
    var i = 0;
    var id;
    while (true) {
      id = "Config" + i;
      if (json.hasOwnProperty(id)) {
        i++;
      } else {
        break;
      }
    }
    json[id] = {
      cols: 1,
      rows: 1,
      anchorX: 0.5,
      anchorY: 1,
      poses: {}
    };
    setupConfigList();
  });

  $('#addPose').click(function() {
    var i = 0;
    var id;
    while (true) {
      id = "Pose" + i;
      if (json[current[0]].poses.hasOwnProperty(id)) {
        i++;
      } else {
        break;
      }
    }
    json[current[0]].poses[id] = {
      speed: 15,
      adjust: false,
      pattern: ""
    };
    setupPoseList();
  });

  $('#configName').change(function() {
    var name = this.value;
    if (name === '') {
      this.value = current[0];
    } else {
      var data = json[current[0]];
      if (!json.hasOwnProperty(name)) {
        json[name] = data;
        delete json[current[0]];
        current[0] = name;
      } else if (current[0] !== name) {
        alert("Error: A configuration with the name " + name + " already exists.");
      }
      setupConfigList();
    }
  });

  $('#columns').change(function() {
    if (this.value === '') {
      this.value = json[current[0]].cols;
    } else {
      json[current[0]].cols = Number(this.valuee);
      sliceImg();
    }
  }).keypress(function(event) {
    if (event.keyCode === 13) {
      $(this).changee();
    }
    return event.keyCode >= 48 && event.keyCode <= 57;
  });

  $('#rows').change(function() {
    if (this.value === '') {
      this.value = json[current[0]].rows;
    } else {
      json[current[0]].rows = Number(this.valuee);
      sliceImg();
    }
  }).keypress(function(event) {
    if (event.keyCode === 13) {
      $(this).change();
    }
    return event.keyCode >= 48 && event.keyCode <= 57;
  });

  $('#anchorX').change(function() {
    if (this.value === '') {
      this.value = json[current[0]].anchorX;
    } else {
      json[current[0]].anchorX = Number(this.value);
    }
    sliceImg();
  }).keypress(function(event) {
    if (event.keyCode === 13) {
      $(this).change();
    }
    if (event.keyCode >= 48 && event.keyCode <= 57) {
      return true;
    }
    var key = String.fromCharCode(event.keyCode);
    return key === '.';
  });

  $('#anchorY').change(function() {
    if (this.value === '') {
      this.value = json[current[0]].anchorY;
      sliceImg();
    } else {
      json[current[0]].anchorY = Number(this.value);
    }
    sliceImg();
  }).keypress(function(event) {
    if (event.keyCode === 13) {
      $(this).change();
    }
    if (event.keyCode >= 48 && event.keyCode <= 57) {
      return true;
    }
    var key = String.fromCharCode(event.keyCode);
    return key === '.';
  });

  $('#poseName').change(function() {
    var name = this.value;
    if (name === '') {
      this.value = current[1];
    } else {
      var data = json[current[0]].poses[current[1]];
      if (!json[current[0]].poses.hasOwnProperty(name)) {
        json[current[0]].poses[name] = data;
        delete json[current[0]].poses[current[1]];
        current[1] = name;
        setupPoseList();
      } else if(current[1] !== name) {
        alert("Error: A pose with the name " + name + " already exists.");
      }
    }
  });

  $('#poseSpeed').change(function() {
    var pose = json[current[0]].poses[current[1]];
    if (this.value === '') {
      this.value = pose.speed;
    } else {
      pose.speed = Number(this.value);
    }
  }).keypress(function(event) {
    if (event.keyCode === 13) {
      $(this).change();
    }
    return event.keyCode >= 48 && event.keyCode <= 57;
  });

  $('#poseAdjust').change(function() {
    var pose = json[current[0]].poses[current[1]];
    pose.adjust = this.checked;
  });

  $('#posePattern').change(function() {
    var pose = json[current[0]].poses[current[1]];
    var pattern = this.value;
    var dash = /(\d+)-(\d+)/.exec(pattern);
    if (dash) {
      var ary = [];
      var start = Number(dash[1]);
      var end = Number(dash[2]);
      if (start < end) {
        for (; start <= end; start++) {
          ary.push(start);
        }
      }
    } else {
      var ary = pattern.split(",");
      for (var i = 0; i < ary.length; i++) {
        ary[i] = Number(ary[i]);
      }
    }
    pose.pattern = ary;
  }).keypress(function(event) {
    if (event.keyCode === 13) {
      $(this).change();
    }
    if (event.keyCode >= 48 && event.keyCode <= 57) {
      return true;
    }
    var key = String.fromCharCode(event.keyCode);
    if (key === ',' || key === '-') {
      return true;
    }
    return false;
  });

  // =========================================================================
  // Functions

  function update() {
    if (current[0]) {
      zoomButtons.y = renderer.height - 65;
      zoomButtons.x = renderer.width - 115;
      zoomButtons.alpha = 1;
    }

    if (aniSprite.alpha === 1) {
      if (aniIndex >= json[current[0]].poses[current[1]].speed) {
        changeFrame();
      }
      aniIndex++;
    }

    renderer.render(stage);
    requestAnimationFrame(update);
  };

  function resizeCanvas() {
    var menuHeight = $('#menuBar').outerHeight(true);
    var w = window.innerWidth;
    var h = window.innerHeight - menuHeight;
    if ($('#toolsWrapper').is(":visible")) {
      w -= $('#toolsWrapper').outerWidth(true);
    }
    renderer.resize(w, h);
    if (stage.children.indexOf(notLoaded) >= 0) {
      notLoaded.x = w / 2;
      notLoaded.y = h / 2;
    }
  };

  function resizeToolbar() {
    var menuHeight = $('#menuBar').outerHeight(true);
    var addConfigHeight = $('#addConfig').outerHeight(true);
    var addPoseHeight = $('#addPose').outerHeight(true);
    var wrapperOffset = $('#toolsWrapper').outerHeight(true) - $('#toolsWrapper').height();
    var configListOffset = $('#configList').outerHeight(true) - $('#configList').height();
    var poseListOffset = $('#poseList').outerHeight(true) - $('#poseList').height();
    var poseSettingOffset = $('#poseSetting').outerHeight(true) - $('#poseSetting').height();
    var h1 = window.innerHeight - menuHeight - wrapperOffset;
    $('#configList').css({
      minHeight: h1 - configListOffset - addConfigHeight,
      maxHeight: h1 - configListOffset - addConfigHeight
    });
    var h2 = h1 - $('#settingsSettings').outerHeight(true);
    $('#poseList').css({
      minHeight: h2 - poseListOffset - addPoseHeight,
      maxHeight: h2 - poseListOffset - addPoseHeight
    });
    $('#poseSetting').css({
      minHeight: h1,
      maxHeight: h1
    });
  };

  function setupCanvas() {
    $('#toolsWrapper').show();
    $('#configurations').show();
    $('#settings').hide();
    $('#poseSetting').hide();
    var w = $('#toolsWrapper').outerWidth();
    canvas.style.left = w + "px";
    loaded = true;
    if (stage.children.indexOf(notLoaded) >= 0) {
      stage.removeChild(notLoaded);
    }
    resizeCanvas();
    resizeToolbar();
    setupConfigList();
  };

  function setupConfigList() {
    $('#configList').html('');
    for (id in json) {
      var elem = $('<div class="configListItem">' + id + '</div>');
      elem.click(function() {
        loadConfig(this.innerHTML);
      }).contextmenu(function(event) {
        var x = event.pageX;
        var y = event.pageY;
        var w = $('#contextMenu').outerWidth();
        var h = $('#contextMenu').outerHeight();
        var maxX = window.innerWidth;
        var maxY = window.innerHeight;
        if (x + w >= maxX) {
          x = maxX - w;
        }
        if (y + h >= maxY) {
          y = maxY - h;
        }
        contextMenuAt = this.innerHTML;
        $('#contextMenu').show().css({ left: x, top: y });
      });
      $('#configList').append(elem);
    };
  };

  function setupPoseList() {
    $('#poseList').html('');
    for (id in json[current[0]].poses) {
      var elem = $('<div class="poseListItem">' + id + '</div>');
      elem.click(function() {
        loadPose(this.innerHTML);
      }).contextmenu(function(event) {
        var x = event.pageX;
        var y = event.pageY;
        var w = $('#contextMenu').outerWidth();
        var h = $('#contextMenu').outerHeight();
        var maxX = window.innerWidth;
        var maxY = window.innerHeight;
        if (x + w >= maxX) {
          x = maxX - w;
        }
        if (y + h >= maxY) {
          y = maxY - h;
        }
        contextMenuAt = this.innerHTML;
        $('#contextMenu').show().css({ left: x, top: y });
      }).mouseover(function() {
        current[1] = this.innerHTML;
        aniSprite.alpha = 1;
        changeFrame();
      }).mouseout(function() {
        if ($(this).is(":visible")) {
          current.splice(1, 1);
          aniSprite.alpha = 0;
        }
      });
      $('#poseList').append(elem);
    };
  };

  function loadConfig(id) {
    current[0] = id;
    $('#configurations').hide();
    $('#settings').show();
    $('#configName').val(id || '');
    $('#columns').val(json[id].cols || 1);
    $('#rows').val(json[id].rows || 1);
    $('#anchorX').val(json[id].anchorX || 0.5);
    $('#anchorY').val(json[id].anchorY || 0.5);
    if (json[id].sampleImgPath) {
      loadImg(json[id].sampleImgPath);
    }
    setupPoseList();
    sliceImg();
    resizeToolbar();
  };

  function loadPose(id) {
    current[1] = id;
    var pose = json[current[0]].poses[id];
    $('#settings').hide();
    $('#poseSetting').show();
    $('#poseName').val(id || '');
    $('#poseSpeed').val(pose.speed || 15);
    $('#poseAdjust').val(pose.adjust || false);
    $('#posePattern').val(pose.pattern || '');
    aniSprite.alpha = 1;
    pattern = 0;
    resizeToolbar()
    changeFrame();
  };

  function loadImg(path) {
    if (!path) {
      var div = document.getElementById("imgWindow");
      path = div.files[0].path;
      if (!path) return;
    }
    path = path.replace('#', '%23');
    var img = new Image();
    img.src = path;
    img.onload = function() {
      var canvas  = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var context = canvas.getContext("2d");
      context.drawImage(img, 0, 0);
      spriteSheet.texture = new PIXI.Texture.fromImage(canvas.toDataURL());
      // aniSprite uses the same texture, but can't have the same
      // reference, so I make a texture from the baseTexture of spriteSheet
      spriteSheet.texture.baseTexture.on('loaded', function() {
        aniSprite.texture = new PIXI.Texture(spriteSheet.texture.baseTexture);
        sliceImg();
      });
      sliceImg();
    }
    json[current[0]].sampleImgPath = path;
  };

  function sliceImg() {
    var cols = json[current[0]].cols;
    var rows = json[current[0]].rows;
    var oldScale = spriteSheet.scale.x;
    spriteSheet.scale.x = spriteSheet.scale.y = 1;
    spriteSlices.clear();
    spriteSlices.beginFill(0x000000, 1);
    for (var i = 1; i < cols; i++) {
      var x = i * (spriteSheet.width / cols);
      spriteSlices.drawRect(x, 0, 1, spriteSheet.height);
    }
    for (var i = 1; i < rows; i++) {
      var y = i * (spriteSheet.height / rows);
      spriteSlices.drawRect(0, y, spriteSheet.width, 1);
    }
    spriteSlices.endFill();
    drawIndexes(cols, rows);
    var anchorX = json[current[0]].anchorX;
    var anchorY = json[current[0]].anchorY;
    var aX = spriteSheet.width / cols * anchorX;
    var aY = spriteSheet.height / rows * anchorY;
    spriteAnchor.x = aX;
    spriteAnchor.y = aY;
    spriteAnchor.alpha = 1;
    spriteSheet.scale.x = spriteSheet.scale.y = oldScale;
  };

  function drawIndexes(cols, rows) {
    for (var i = spriteIndexes.children.length - 1; i >= 0; i--) {
      spriteIndexes.removeChild(spriteIndexes.children[i]);
    };
    var style = {
      font: 'bold 12px Arial',
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: "1"
    };
    for (var x = 0; x < cols; x++) {
      for (var y = 0; y < rows; y++) {
        var i = x + y * cols;
        var text = new PIXI.Text(i, style);
        text.position.x = x * spriteSheet.width / cols + 2;
        text.position.y = y * spriteSheet.height / rows + 2;
        spriteIndexes.addChild(text);
      }
    }
  };

  function changeFrame() {
    aniIndex = 0;
    var w = Math.floor(spriteSheet.width / (json[current[0]].cols * spriteSheet.scale.x));
    var h = Math.floor(spriteSheet.height / (json[current[0]].rows * spriteSheet.scale.y));
    var i = json[current[0]].poses[current[1]].pattern[pattern] || 0;
    var x = i % json[current[0]].cols;
    var y = (i - x) / json[current[0]].cols;
    aniSprite.texture.frame = new PIXI.Rectangle(x * w, y * h, w, h);
    pattern++;
    if (pattern >= json[current[0]].poses[current[1]].pattern.length) {
      pattern = 0;
    }
  };

  function checkIfValid(json) {
    var valid = true;
    for (var prop in json) {
      if (!json.hasOwnProperty(prop)) continue;
      var elem = json[prop];
      if (!elem || !elem.cols || !elem.rows || !elem.poses) {
        alert("Error: Invalid JSON file.");
        valid = false;
        break;
      }
    }
    return valid;
  };

  requestAnimationFrame(update);
})();
