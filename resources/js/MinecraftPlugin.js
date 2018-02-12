YUI.add("minecraftPlugin", function(Y) {
    function MinecraftPlugin(config) {
        MinecraftPlugin.superclass.constructor.apply(this, arguments);
    }
    MinecraftPlugin.NAME = "minecraftPlugin";
    MinecraftPlugin.NS = "minecraft";     

	MinecraftPlugin.BUTTONS_CONTAINER = "<div class='blocks'><label>Blocks</label><ul>{items}</ul></div>";
	MinecraftPlugin.BUTTON = "<li><a href='#' title='{title}' id='{value}' class='{selected}'><img src='{imgSrc}'/></a></li>";
	
	var TwoStateType = function(type, step1, step2, iconWidth, iconHeight, inst) {
		TwoStateType.superclass.constructor.call(this, type, iconWidth, iconHeight, inst)
		var that = this;
		this.step1Img = new Image()
		this.step1Img.src = step1;
		this.step1Img.onload = function() {
			that.step1Loaded = true;
			inst.removeLoadingType();
		}		
		inst.addLoadingType();
		
		this.step2Img = new Image();
		this.step2Img.src = step2;
		this.step2Img.onload = function() {
			that.step2Loaded = true;
			inst.removeLoadingType();
		}
		inst.addLoadingType();
		this.defaultState = 'state1';
	};
	
	Y.extend(TwoStateType, Y.slack.Type);
	
	TwoStateType.prototype.draw = function(ctx, pos, prevState, currState, inst) {
		var drawFn = null;
		this.erase(ctx,pos);
		var toDraw;
		var iconW = this.iconWidth;
		var iconH = this.iconHeight;
		if (inst.get("init")) {
			//If currState exists, it will either be in state1, or state2.  The state
			//be passed in will always be state1, because of how _draw works.
			//Therefore, if the currState and newState do not match, it means that we want
			//to revert BACK to state1
			if (!Y.Lang.isUndefined(currState) && !Y.Lang.isUndefined(prevState)) {
				if (currState.state !== prevState.state) {
					inst._storeState(currState.pos, currState.type, "state1");
					toDraw = this.step1Img;
				}else {
					inst._storeState(currState.pos, currState.type, "state2");
					toDraw = this.step2Img;
				}
			}
			else {
				toDraw = this.step1Img;
			}

		}
		else {
			//since initialization isn't finished, we want to just draw the currState (if any)
			if (!Y.Lang.isUndefined(prevState)) {
				if (prevState.state === "state1") {
					toDraw = this.step1Img;
				} else {
					toDraw = this.step2Img;
				}
			}
		}
		drawFn = function() {
			ctx.drawImage(toDraw, pos.x,pos.y, iconW,iconH);
		}
		
		//Lets change the image state...
		if (!this.step1Loaded || !this.step2Loaded) {
			inst.addDeferredDraw(drawFn);
		} else {
			drawFn.call(this);
		}
	}
	
	/**
	TYPES needs to be moved to be instance variables...
	*/
	
	var stone = "stone", vertTrack = "vertTrack", 
		horizTrack = "horizTrack", wood = "wood", 
		erase = "erase", dirt = "dirt", step = "step", sandstone="sandstone";
	
	var ITEMS = [
		{title: 'Cobblestone', value:stone,selected: 'selected',imgSrc:'resources/images/cobblestone.png'},
		{title: 'Dirt', value:dirt,selected: '',imgSrc:'resources/images/grass.png'},
		{title: 'Vertical Track', value:vertTrack, selected:'', imgSrc:'resources/images/track.png'},
		{title: 'Horizontal Track', value:horizTrack, selected:'', imgSrc:'resources/images/track_horiz.png'},
		{title: 'Wood', value:wood, selected:'', imgSrc:'resources/images/lumber.png'},
		{title: 'Step', value:step, selected:'', imgSrc:'resources/images/step.png'},
		{title: 'Sandstone', value:sandstone, selected:'', imgSrc:'resources/images/sandstone.png'},
		{title: 'Erase - Double Click to clear', value:erase, selected:'', imgSrc:'resources/images/none.png'}
	];
	
    /*
     * The attribute configuration for the plugin. This defines the core user facing state of the plugin
     */
    MinecraftPlugin.ATTRS = {
		
    };	


    Y.extend(MinecraftPlugin, Y.Plugin.Base, {

        initializer: function() {
			this._initTypes();
            this.onHostEvent("render", this._showMinecraftButtons);
			 
			//this.beforeHostMethod("initializer", this._rewriteBoxes);
			 
        },
		_rewriteBoxes: function() {
			var boxes = this.get("host").get("boxes");
				//Lets transform each box object, with the correct function type...
			Y.Object.each(boxes, function(val, key, obj) {
				val.type = gp.minecraft.getType(val.type);
			}, this);
			this.get("host").set("boxes", boxes);
		},
		_initTypes: function() {	
			var iconHeight = this.get("host").get("iconHeight");
			var iconWidth = this.get("host").get("iconWidth");
			var TYPES = {
				stone: new Y.slack.DrawType(stone,"resources/images/cobblestone.png", iconWidth, iconHeight, this.get("host")),
				vertTrack: new Y.slack.DrawType(vertTrack,"resources/images/track.png", iconWidth, iconHeight, this.get("host")),
				horizTrack:new Y.slack.DrawType(horizTrack,"resources/images/track_horiz.png", iconWidth, iconHeight, this.get("host")),
				erase:new Y.slack.Type(''), 
				wood:new Y.slack.DrawType(wood,"resources/images/lumber.png", iconWidth, iconHeight, this.get("host")),
				dirt:new Y.slack.DrawType(dirt, "resources/images/grass.png", iconWidth, iconHeight, this.get("host")),
				sandstone:new Y.slack.DrawType(dirt, "resources/images/sandstone.png", iconWidth, iconHeight, this.get("host")),
				//step is a block that has two states - single and double
				//When we click on it, we should check to see if its already there - if so,
				//"double" up (need to find different representation when its "double")
				step:new TwoStateType(step, "resources/images/step.png", "resources/images/doublestep.png", iconWidth, iconHeight, this.get("host"))
			};	
			
			var GHOST_TYPE = new Y.slack.Type('', iconWidth, iconHeight);
			GHOST_TYPE.draw = function(ctx,pos, prevState, currState, inst) {
				ctx.fillStyle = "rgb(200,200,200)";
				ctx.fillRect(pos.x, pos.y, this.iconWidth,this.iconHeight);
			};
			this.set("ghostType", GHOST_TYPE);
			
			TYPES[erase].draw = function(ctx,pos, prevState, currState, inst) {
				inst._erase(currState.pos, this);
			};
			this.set("TYPES", TYPES);
		},
		getType : function(type) {
			var TYPES = this.get("TYPES");
			if (TYPES[type]) {
				return TYPES[type];
			}
			return Y.slack.GraphPaper.DEFAULT_DRAW;
		},

        destructor : function() {

        },
        _showMinecraftButtons : function(e) {
            /* React after the host render event */
			var widget = this.get("host");
			var box = widget.get("boundingBox");
			var html = this._getButtonsContent();
			box.one(".graph-button-container").append(html);
			
			this._bindButtons();
			this._syncHost();
			
        },
		_getButtonsContent: function() {
			var buttons = [];
			Y.Array.each(ITEMS, function(e) {
				buttons.push(Y.substitute(MinecraftPlugin.BUTTON, e));
			});
			var content = buttons.join("");
			var html = Y.substitute(MinecraftPlugin.BUTTONS_CONTAINER, {items: content});
			return html;
		},
		_bindButtons: function() {
			Y.on('click', function(e) {
				var type = e.currentTarget.get('id');
				
				this.get("host").get("boundingBox").one("ul li a.selected").removeClass('selected');
				e.currentTarget.addClass('selected');
				
				this.get("host").set("type", this.getType(type));
				
			}, "ul li a",this);	
			
			Y.on('dblclick', function(e) {
				this._eraseAll();
			}, "#erase",this);
		},
		_eraseAll: function() {
			this._clear();
			this.get("host").fire('eraseAllEvent');
		},
		_clear: function() {
			var gp = this.get("host");
			gp.get("canvas")._node.width = gp.get("canvas")._node.width;
			gp._drawBorder();
			//need to remove all from boxes state...
			gp.set("boxes",{});
		},
		populate: function(box) {
			var gp = this.get("host");
			gp.set("boxes",box);
			gp.toggleInit();
			gp._initBoxes();
			gp.toggleInit();
		},
		addGhostData: function(box) {
			var host = this.get("host");
			Y.Object.each(box, function(val, key, obj) {
				if (val.state !== 'off') {
					var position = val.pos;
					var type = this.get("ghostType");
					var offsetPos = {x : host._offsetPos(position.x), y: host._offsetPos(position.y)};
					type.draw(host._getContext(), offsetPos);
				}
			}, this);
		},
		_syncHost : function() {
			var host = this.get("host");
			var type = host.get("boundingBox").one("ul li a.selected").get("id")
			var type = this.getType(type);
			host.set("type",type);
		}
		
        
    });

    Y.namespace("slack").MinecraftPlugin = MinecraftPlugin;

 }, "1.0.0", {requires:["plugin", "substitute"]});