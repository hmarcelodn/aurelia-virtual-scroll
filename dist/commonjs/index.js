'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AureliaVirtualScroll = undefined;

var _aureliaVirtualScroll = require('./aurelia-virtual-scroll');

Object.defineProperty(exports, 'AureliaVirtualScroll', {
  enumerable: true,
  get: function get() {
    return _aureliaVirtualScroll.AureliaVirtualScroll;
  }
});
exports.configure = configure;

var _aureliaPal = require('aurelia-pal');

function configure(config) {
  config.globalResources(_aureliaPal.PLATFORM.moduleName('./aurelia-virtual-scroll'));
}