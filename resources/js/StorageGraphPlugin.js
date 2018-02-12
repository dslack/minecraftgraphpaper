YUI.add("storageGraphPlugin", function(Y) {

    /* Any frequently used shortcuts, strings and constants */
    var Lang = Y.Lang;

    function StorageGraphPlugin(config) {
        StorageGraphPlugin.superclass.constructor.apply(this, arguments);
    }

    /* 
     * Required NAME static field, to identify the class and 
     * used as an event prefix, to generate class names etc. (set to the 
     * class name in camel case). 
     */
    StorageGraphPlugin.NAME = "storageGraphPlugin";

    /* 
     * Required NS static field, to identify the property on the host which will, 
     * be used to refer to the plugin instance ( e.g. host.feature.doSomething() )
     */
    StorageGraphPlugin.NS = "storage";     

	StorageGraphPlugin.BUTTON_CONT = "<div class='blocks' id=\"utilityBlock\"><label>Utilities</label><ul></ul></div>";
	
	StorageGraphPlugin.BUTTON = "<li><a href='#' title='{title}' id='graphpaper-{value}'><img src='{imgSrc}'/></a></li>";
	
	StorageGraphPlugin.initGraphPaperStorage = function() {
		var graphPaperArr = localStorage.getItem("graphPaper");
		if (graphPaperArr === null) {
			graphPaperArr = [];
			for (var x = 0; x < 64; x++) {
				graphPaperArr[x] = "{}";
			}
			localStorage.setItem("graphPaper",Y.JSON.stringify(graphPaperArr));
		}
		else {
			graphPaperArr = Y.JSON.parse(graphPaperArr)
		}
		return graphPaperArr;
	};
	
    /*
     * The attribute configuration for the plugin. This defines the core user facing state of the plugin
     */
    StorageGraphPlugin.ATTRS = {
		clearImage: {
			value: "resources/images/trash_can.png"
		},
		exportTaskImage: {
			value: "resources/images/export-icon.png"
		},
		importTaskImage: {
			value:"resources/images/import-icon.png"
		},
		value: {
			value: ["clear", "exportTask", "importTask"]
		},
		strings: {
			value: { clear: "Clear Storage", exportTask: "Export", importTask: "Import"}
		},
		level: {
			value: 1
		},
		graphPaper: {
			value:[]
		}
    };
	
    Y.extend(StorageGraphPlugin, Y.Plugin.Base, {

        initializer: function() {
			if (this._checkStorage) {
				this.onHostEvent("render", this._showButtons);
			}
        },
		_checkStorage : function(){
			if (localStorage) {
				return true;
			} else {
				return false;
			}
		},
        destructor : function() {

		},
		_showButtons: function() {
			var html = [];
			var host = this.get("host");
			var box = host.get("boundingBox");			
			Y.Array.each(this.get("value"), function(e) {
				html.push(this._genButton(this.get(e+"Image"), e));
			}, this);
			var utilityBox = box.one("#utilityBlock");
			if (Y.Lang.isNull(utilityBox)) {
				utilityBox = Y.Node.create(StorageGraphPlugin.BUTTON_CONT);
			}
			utilityBox.one("ul").append(html.join(""));

			box.one(".graph-button-container").append(utilityBox);
			this._bindUI();		
		},
		_genButton: function(image, resKey) {
			return Y.substitute(StorageGraphPlugin.BUTTON, {title: this.get("strings."+resKey), value: resKey, imgSrc: image});
		},
		_bindUI : function() {
			Y.on('click', function(e) {
				this.erase();
			}, '#graphpaper-clear', this);
			Y.on('click', function(e) {
				var win = window.open();
				win.document.write(localStorage.getItem("graphPaper"));
			}, '#graphpaper-export');
			
			this.get("host").on("drawEvent", this.saveStorage, this);
			this.get("host").on("eraseEvent", this.saveStorage,this);
        },
		erase: function() {
			localStorage.removeItem('graphPaper');
			this.initGraphPaperArray();
			this.fire("clearStorageEvent");
		},
		saveStorage:function() {
			var level = this.get("level");
			var graphPaperArr = this.get("graphPaper");
			graphPaperArr[level-1] = this.get("host").output();
			localStorage.removeItem("graphPaper");
			localStorage.setItem("graphPaper", Y.JSON.stringify(graphPaperArr));
		},
		initGraphPaperArray: function(){
			this.set("graphPaper", StorageGraphPlugin.initGraphPaperStorage());
		}		
    });

    Y.namespace("slack").StorageGraphPlugin = StorageGraphPlugin;

  }, "1.0.0", {requires:["plugin", "substitute", "json"]});