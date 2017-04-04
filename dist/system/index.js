'use strict';

System.register(['aurelia-pal', './aurelia-virtual-scroll'], function (_export, _context) {
  "use strict";

  var PLATFORM;
  function configure(config) {
    config.globalResources(PLATFORM.moduleName('./aurelia-virtual-scroll'));
  }

  _export('configure', configure);

  return {
    setters: [function (_aureliaPal) {
      PLATFORM = _aureliaPal.PLATFORM;
    }, function (_aureliaVirtualScroll) {
      var _exportObj = {};
      _exportObj.AureliaVirtualScroll = _aureliaVirtualScroll.AureliaVirtualScroll;

      _export(_exportObj);
    }],
    execute: function () {}
  };
});