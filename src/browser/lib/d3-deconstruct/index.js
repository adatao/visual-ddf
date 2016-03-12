var Deconstruct = require("./Deconstruct");
var Deconstruction = require("./Deconstruction");
var Mapping = require("./Mapping");
var MarkGroup = require("./MarkGroup");

// Due to chrome 48 update, we need to polifill a few functions to make this work
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) {
  return elem.getScreenCTM().inverse().multiply(this.getScreenCTM());
};
require('./pathseg.js');

module.exports = {
    Deconstruct: Deconstruct,
    Deconstruction: Deconstruction,
    Mapping: Mapping,
    MarkGroup: MarkGroup
};
