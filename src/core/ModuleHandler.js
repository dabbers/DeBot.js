function ModuleFailureException(module, exception) {
	this.module = module;
	this.exception = exception;

	this.message = "Failed to load module " + module + " due to " + exception;
}


function ModuleHandler (obj) {
	obj.modules = {};

	obj.loadModule = function(modname) {

		if (obj.modules[modname]) obj.unloadModule(modname);
		
		//try {
			var modpath = Core.relativeToAbsolute('modules/'+ modname);
			if (require.cache[modpath + ".js"]) delete require.cache[modpath + ".js"];

			var module1 = require(modpath);
			obj.modules[modname] = module1;
			module1.toString = function() { return "[" + modname + " (Module)]" };
			module1.init(this);
		//}
		//catch(ex) {
		//	throw "Failed to laod module " + modpath + ". " + ex;
		//}

		if (obj.settings.Modules.indexOf(modname) == -1) {
			obj.settings.Modules.push(modname);
			Core.config.save();
		}

		return obj;
	}

	obj.unloadModule = function(modname) {
		if (obj.modules[modname]) {
			obj.modules[modname].uninit();
			delete obj.modules[modname];
		}
		return obj;
	}
}


ModuleHandler.prototype

module.exports = ModuleHandler;