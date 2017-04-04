define(['exports', './aurelia-virtual-scroll', 'aurelia-pal'], function (exports, _aureliaVirtualScroll, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AureliaVirtualScroll = undefined;
  Object.defineProperty(exports, 'AureliaVirtualScroll', {
    enumerable: true,
    get: function () {
      return _aureliaVirtualScroll.AureliaVirtualScroll;
    }
  });
  exports.configure = configure;
  function configure(config) {
    config.globalResources(_aureliaPal.PLATFORM.moduleName('./aurelia-virtual-scroll'));
  }
});