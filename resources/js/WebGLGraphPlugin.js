YUI.add("webGLGraphPlugin", function(Y) {

    /* Any frequently used shortcuts, strings and constants */
    var Lang = Y.Lang;

    function WebGLGraphPlugin(config) {
        WebGLGraphPlugin.superclass.constructor.apply(this, arguments);
    }

    /* 
     * Required NAME static field, to identify the class and 
     * used as an event prefix, to generate class names etc. (set to the 
     * class name in camel case). 
     */
    WebGLGraphPlugin.NAME = "webGLGraphPlugin";

    /* 
     * Required NS static field, to identify the property on the host which will, 
     * be used to refer to the plugin instance ( e.g. host.feature.doSomething() )
     */
    WebGLGraphPlugin.NS = "webgl";     

	WebGLGraphPlugin.BUTTON_CONT = "<div class='blocks' id=\"utilityBlock\"><label>Utilities</label><ul></ul></div>";
	
	WebGLGraphPlugin.BUTTON = "<li><a href='#' title='{title}' id='graphpaper-{value}'><img src='{imgSrc}'/></a></li>";
	

	
    /*
     * The attribute configuration for the plugin. This defines the core user facing state of the plugin
     */
    WebGLGraphPlugin.ATTRS = {
		renderImage: {
			value: "resources/images/render.png"
		},
		value: {
			value: ["render"]
		},
		strings: {
			value: { render: "Render"}
		}
    };
	
    Y.extend(WebGLGraphPlugin, Y.Plugin.Base, {

        initializer: function() {
			this.onHostEvent("render", this._showButtons);
			this._checkWebGL();

        },
		_checkWebGL: function() {
			var canvas = document.createElement("canvas");
			try {
				var ctx = canvas.getContext("experimental-webgl");
				if (!ctx) {
					this.set("webgl", false);
				} else {
					this.set("webgl", true);
				}
				canvas = null;
			} catch(e) {
				this.set("webgl", false);
			}
		},
        destructor : function() {

		},
		_showButtons: function() {
			var host = this.get("host");
			var box = host.get("boundingBox");		
			var el = Y.Node.create(this._genButton(this.get("renderImage"), this.get("value")[0]));

			if (!this.get("webgl")) {
				var anchor = el.one('a');
				anchor.addClass("disabled");
				anchor.set("title", anchor.get("title") +" - Disabled due to browser not supporting WebGL");
			}
			var utilityBox = box.one("#utilityBlock");
			if (Y.Lang.isNull(utilityBox)) {
				utilityBox = Y.Node.create(WebGLGraphPlugin.BUTTON_CONT);
			}
			utilityBox.one("ul").append(el);

			box.one(".graph-button-container").append(utilityBox);
			this._bindUI();		
		},
		_genButton: function(image, resKey) {
			return Y.substitute(WebGLGraphPlugin.BUTTON, {title: this.get("strings."+resKey), value: resKey, imgSrc: image});
		},
		_bindUI : function() {
			Y.on('click', function(e) {
				if (this.get("webgl")) {
					window.open('scene.html');
				}else {
					alert("WebGL is not supported by your browser.  Check http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation for implementations.");
				}
			}, '#graphpaper-render', this);
        }
    });

    Y.namespace("slack").WebGLGraphPlugin = WebGLGraphPlugin;

  }, "1.0.0", {requires:["plugin", "substitute"]});