"use strict";

var lodash, defaultConfig, stateParser,
classnameCompiler, checkPath, config;

lodash = require("lodash");

defaultConfig = {
  "paths": {
    "src": "i/oa3/src/*.png",
    "dest": "i/oa3/dist/sprite.png",
    "css": "css/less/openair3/sprite.less",
    "preview": "i/oa3/dist/"
  },
  "output": {
      "img": {
        "format": "png",
        "quality": 90,
        "padding": 2  
      },
      "css": {
        "classname": "sprite",
        "format": "css",
        "destination": ""
      }
  },
  "state": {
    "splitter": "__",
    "states": [{
        "state": "normal",
        "sufix": ""
    }, {
        "state": "hover",
        "sufix": ":hover"
    }, {
        "state": "active",
        "sufix": ":active"
    }]
  }
};

config = defaultConfig;

stateParser = function(sprite) {
  var i, state;

  for (i = 0; i < config.state.states.length; i += 1) {
    state = sprite.name.match(new RegExp("(.*)" + config.splitter + config.state.states[i].state + "$"));
    if (state) {
      sprite.name = state[1] + config.state.states[i].sufix;
    }
  }
};

classnameCompiler = function(item) {
  return "." + config.output.css.classname + "." + item.name;
};

checkPath = function(path) {
  return path.match(/\/$/) ? true : false;
};

module.exports = function(grunt) {
  var defaultSpriteConfig,
      distSpriteConfig, previewSpriteConfig,
      userConfig;

  userConfig = grunt.file.readJSON("gruntsprite.json");

  config = lodash.defaults(userConfig, defaultConfig);

  defaultSpriteConfig = {
    src: config.paths.src,
    destImg: config.paths.dest,
    padding: config.output.img.padding,
    algorithm: "binary-tree",
    engineOpts: {
      imagemagick: true
    },
    cssVarMap : stateParser,
    imgOpts: {
      format: config.output.img.format,
      quality: config.output.img.quality
    },
    cssOpts: {
      functions: false,
      cssClass: classnameCompiler
    }
  };

  distSpriteConfig = lodash.defaults({
    "destCSS": config.paths.css,
    "cssFormat": config.output.css.format
  }, defaultSpriteConfig);

  previewSpriteConfig = lodash.defaults({
     "destCSS": config.paths.preview + "sprite.json",
     "cssFormat": "json"
  }, defaultSpriteConfig);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    watch: {
      files: config.paths.src,
      tasks: "sprites"
    },
    concat: {
      jsonp: {
        src: ["tools/jsonp_prefix.js", config.paths.preview + "sprite.json", "tools/jsonp_postfix.js"],
        dest: config.paths.preview + "sprite_jsonp.js",
      },
    },
    sprite: {
      preview: previewSpriteConfig,
      dist: distSpriteConfig
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-spritesmith");

  grunt.registerTask("sprites", ["sprite:preview", "sprite:dist", "concat:jsonp"]);

  grunt.registerTask("default", "sprites");

};
