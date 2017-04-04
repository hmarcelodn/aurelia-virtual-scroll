import { PLATFORM } from 'aurelia-pal';
export { AureliaVirtualScroll } from './aurelia-virtual-scroll';

export function configure(config) {
  config.globalResources(PLATFORM.moduleName('./aurelia-virtual-scroll'));
}