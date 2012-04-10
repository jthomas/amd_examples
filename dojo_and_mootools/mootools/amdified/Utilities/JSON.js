define(["require", "exports", "module", "../Core/Core","../Types/Array","../Types/String","../Types/Number","../Types/Function","../Core/Core"], function(require, exports, module) {
/*
---

name: JSON

description: JSON encoder and decoder.

license: MIT-style license.

SeeAlso: <http://www.json.org/>

requires: [Array, String, Number, Function]

provides: JSON

...
*/

var Core = require('../Core/Core'),
	typeOf = Core.typeOf,
	global = Core.global,
	Array = require('../Types/Array'),
	String = require('../Types/String'),
	Number = require('../Types/Number'),
	Function = require('../Types/Function');

//<1.2compat>
var Hash = require('../Core/Core').Hash;
//</1.2compat>

var JSON = global.JSON || {};

exports = module.exports = {
	stringify: JSON.stringify,
	parse: JSON.parse
};

//<1.2compat>
exports = module.exports = new Hash(exports);
//</1.2compat>

var special = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

var escape = function(chr){
	return special[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
};

exports.validate = function(string){
	string = string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, '');

	return (/^[\],:{}\s]*$/).test(string);
};

exports.encode = JSON.stringify ? function(obj){
	return JSON.stringify(obj);
} : function(obj){
	if (obj && obj.toJSON) obj = obj.toJSON();

	switch (typeOf(obj)){
		case 'string':
			return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';
		case 'array':
			return '[' + obj.map(exports.encode).clean() + ']';
		case 'object': case 'hash':
			var string = [];
			Object.each(obj, function(value, key){
				var json = exports.encode(value);
				if (json) string.push(exports.encode(key) + ':' + json);
			});
			return '{' + string + '}';
		case 'number': case 'boolean': return '' + obj;
		case 'null': return 'null';
	}

	return null;
};

exports.decode = function(string, secure){
	if (!string || typeOf(string) != 'string') return null;

	if (secure || exports.secure){
		if (JSON.parse) return JSON.parse(string);
		if (!exports.validate(string)) throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
	}

	return eval('(' + string + ')');
};

//<!amd>
if (!has('amd')) Object.append(global.JSON || (global.JSON = {}), exports);
//</!amd>

});
