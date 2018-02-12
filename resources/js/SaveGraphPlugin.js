YUI.add("saveGraphPlugin", function(Y) {

    /* Any frequently used shortcuts, strings and constants */
    var Lang = Y.Lang;

    /* MyPlugin class constructor */
    function SaveGraphPlugin(config) {
        SaveGraphPlugin.superclass.constructor.apply(this, arguments);
    }

    /* 
     * Required NAME static field, to identify the class and 
     * used as an event prefix, to generate class names etc. (set to the 
     * class name in camel case). 
     */
    SaveGraphPlugin.NAME = "saveGraphPlugin";

    /* 
     * Required NS static field, to identify the property on the host which will, 
     * be used to refer to the plugin instance ( e.g. host.feature.doSomething() )
     */
    SaveGraphPlugin.NS = "save";     

	SaveGraphPlugin.BUTTON_CONT = "<div class='blocks' id=\"utilityBlock\"><label>Utilities</label><ul></ul></div>";
	
	SaveGraphPlugin.BUTTON = "<li><a href='#' title='{title}' id='graphpaper-{value}'><img src='{imgSrc}'/></a></li>";
	
	
    /*
     * The attribute configuration for the plugin. This defines the core user facing state of the plugin
     */
    SaveGraphPlugin.ATTRS = {
		saveImage: {
			value: "resources/images/save.png"
		},
		value: {
			value: ["save"]
		},
		strings: {
			value: { save: "Save"}
		}
    };
	
    Y.extend(SaveGraphPlugin, Y.Plugin.Base, {

        initializer: function() {
             this.onHostEvent("render", this._showSaveButton);
        },

        destructor : function() {

		},
		_showSaveButton: function(e) {
			var html = [];
			var host = this.get("host");
			var box = host.get("boundingBox");
			
			Y.Array.each(this.get("value"), function(e) {
				html.push(this._genButton(this.get(e+"Image"), e));
			}, this);
			
			var utilityBox = box.one("#utilityBlock");
			if (Y.Lang.isNull(utilityBox)) {
				utilityBox = Y.Node.create(SaveGraphPlugin.BUTTON_CONT);
			}
			utilityBox.one("ul").append(html.join(""));
			
			box.one(".graph-button-container").append(utilityBox);
			this._bindUI();
		},
		_genButton: function(image, resKey) {
			return Y.substitute(SaveGraphPlugin.BUTTON, {title: this.get("strings."+resKey), value: resKey, imgSrc: image});
		},
		_bindUI : function() {
			Y.on('click', function(e) {
				var img = this.get("host").get("canvas")._node.toDataURL("image/png");
				//img = img.replace("image/png", strDownloadMime)
				window.open(img);
			}, '#graphpaper-save', this);
        }
    });

    Y.namespace("slack").SaveGraphPlugin = SaveGraphPlugin;

 }, "1.0.0", {requires:["plugin", "substitute"]});