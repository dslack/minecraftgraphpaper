YUI.add("graphPaper", function(Y) {

	var Type = function(type, iconWidth, iconHeight, inst){
		this.type = type;

		this.iconHeight = iconWidth;
		this.iconWidth = iconHeight;
		this.defaultState = "on";
	};
	
	Type.prototype.erase = function(ctx, pos) {
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.fillRect(pos.x, pos.y, this.iconWidth,this.iconHeight);
	};
	
	Type.prototype.draw = function(ctx, pos, prevState,  currState, inst) {};
	
	var DrawType = function(type, imageSrc, iconWidth, iconHeight, inst){
		DrawType.superclass.constructor.call(this, type, iconWidth, iconHeight, inst);
		this.image = new Image()
		this.image.src = imageSrc;
		this.loaded = false;
		var that = this;
		
		inst.addLoadingType();
		
		//We need to defer drawing until this drawtype has loaded...
		
		this.image.onload = function() {
			that.loaded = true;
			inst.removeLoadingType();
		}
	};
	
	Y.extend(DrawType, Type)
	
	DrawType.prototype.draw = function(ctx,pos, prevState, currState, inst) {
		var img = this.image;
		var iconW = this.iconWidth;
		var iconH = this.iconHeight;
		if (!this.loaded) {
			inst.addDeferredDraw(function() {
				ctx.drawImage(img, pos.x,pos.y, iconW, iconH);
			});
		}
		else {
			ctx.drawImage(img, pos.x,pos.y, iconW, iconH);
		}
	};		
	
	Y.namespace("slack").Type = Type;
	Y.namespace("slack").DrawType = DrawType;

    function GraphPaper(config) {
        GraphPaper.superclass.constructor.apply(this, arguments);
    }

    GraphPaper.NAME = "graphPaper";
	
	GraphPaper.DEFAULT_DRAW = new Y.slack.Type("default", 24,24);
	GraphPaper.DEFAULT_DRAW.draw =  function(ctx, pos) {
		this.erase(ctx,pos);
		ctx.fillStyle = "rgb(255,255,255)";
		ctx.fillRect(pos.x, pos.y, this.iconWidth,this.iconHeight);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(pos.x, pos.y, this.iconWidth,this.iconHeight);
	};
	
    GraphPaper.ATTRS = {

        canvas : {
        },
		genNum: {
			value: 0
		},
		type : {
			value: GraphPaper.DEFAULT_DRAW
		},
		border: {
			value : 20
		},
		canvasWidth: {
			value : 1000
		},
		canvasHeight: {
			value : 1000
		},
		offset : {
			value: 7
		},
		boxes : {
			value : {}
		},
		iconWidth: {
			value: 24
		},
		iconHeight: {
			value: 24
		},
		deferredDraw: {
			value: []
		},
		loadingType: {
			value: 0
		},
		init: {
			value: false,
			setter: function(val, name) {
				return val;
			}
		}
    };

    GraphPaper.HTML_PARSER = {
        canvas: function (srcNode) {
			return srcNode.one('canvas');
        }
    };
	
	GraphPaper.generateNumber = function() {
		return Math.floor(Math.random()*1000000000);
	};
	
    Y.extend(GraphPaper, Y.Widget, {
        initializer: function() {
			//create buttons container...
			var box = this.get("boundingBox");
			box.insert("<div class=\"graph-button-container\"></div>", box.get("canvas"));
		
			this.set("downEventOccurred", false);
			this.get("canvas")._node.width = this.get("canvasWidth");
			this.get("canvas")._node.height = this.get("canvasHeight");
        },
		_initBoxes: function() {
			//Lets load up the boxes data if any..
			var boxes = this.get("boxes");
			this._drawBoxes(boxes);
		},
		_drawBoxes: function(boxes) {
			Y.Object.each(boxes, function(val, key, obj) {
				if (val.state !== 'off') {
					var position = val.pos;
					var type = val.type;
					this._draw(position,type, val.state);
					//Reset the Type to the String version
					obj[key].type = type.type;
				}
			}, this);
		},

        destructor : function() {
        },

        renderUI : function() {

			this._initBoxes();
			this.set("init", true);
			this._drawBorder();
        },

        bindUI : function() {
			Y.on('mousedown', function(e) {
				e.halt();
				this.set("downEventOccurred", true);
				if (this._checkContextMouseButton(e.button)) {
					this._eraseBox.call(this, e.pageX, e.pageY);
				}
				else {
					//Generate #
					this.set("genNum",GraphPaper.generateNumber());
					this.boxClicked.call(this,e.pageX, e.pageY);
				}
			}, this.get("canvas"),this);
			
			Y.on("contextmenu", function(e) {
				e.halt();
			}, this.get("canvas"),this);
			
			Y.on('mouseup', function(e) {
				this.set("downEventOccurred", false);
			}, this.get('canvas'),this);
			
			/**/
			Y.on('mousemove', function(e) {
				if (this.get("downEventOccurred") && !this._checkContextMouseButton(e.button)) {
					this.boxClicked.call(this,e.pageX, e.pageY);
				}
				else if (this._checkContextMouseButton(e.button)) {
					this._eraseBox.call(this,e.pageX, e.pageY);
				}
			}, this.get('canvas'),this);
			
			//*/
        },

        syncUI : function() {
        },
		addLoadingType: function() {
			this.set("loadingType", this.get("loadingType")+1);
		},
		removeLoadingType: function() {
			this.set("loadingType", this.get("loadingType")-1);
			if (this.get("loadingType") === 0) {
				this.runDeferredDraw();
			}
		},
		addDeferredDraw: function(fn) {
			this.get("deferredDraw").push(fn);
		},
		runDeferredDraw: function() {
			Y.Array.each(this.get("deferredDraw"), function(e) {
				e.call(this);
			}, this);
		},
		output: function() {
			//output to json...
			return Y.JSON.stringify(this.get("boxes"));
		},
		_drawBorder:function() {
			var border = this.get("border"), width = this.get("canvasWidth"), height = this.get("canvasHeight");
			var trueLength = width-(2*border);
			var trueHeight = height-(2*border);
			for (var i=border; i<=width-border; i+=30) {
				this._line(i,border,0,trueLength);
			}
			for (var y=border; y<=height-border; y+=30) {
				this._line(border,y,trueHeight,0);
			}
		},
		_line : function(x,y,width, height) {
			var _ctx = this._getContext();
			_ctx.beginPath();
			_ctx.fillStyle = 'black';
			_ctx.moveTo(x,y);
			_ctx.lineTo(x+width, y+height);
			_ctx.stroke();
		},
		_getContext : function() {
			return this.get("canvas")._node.getContext("2d");
		},		
		_outputImage: function() {
			var img = this.get("canvas")._node.toDataURL("image/png");
			window.open(img);
		},
		_checkContextMouseButton: function(button) {
			return (button === 3 || button === 2);
		},
		boxClicked : function(pageX, pageY) {
			
			//Should come from outside setting actually..
			var type = this._getType();
			
			var pos = this._determinePosition(pageX, pageY);		
			
			var border = this.get("border");
			
			//If position is outside of bounds of border...
			var upperBoundWidth = this.get('canvasWidth')-border;
			var upperBoundHeight = this.get('canvasHeight')-border;
			
			if (pos.x < border || pos.x > upperBoundWidth || pos.y < border || pos.y > upperBoundHeight) {
				return;
			}
			
			//Determine state of box...
			var stateCell = this._getState(pos.x,pos.y);
			
			if (stateCell && stateCell.genNum === this.get("genNum")) {
				//Do nothing...
			}
			else {
				this._draw(pos,type, null);
				this.fire("drawEvent");
			}
		},
		_eraseBox: function(pageX, pageY) {
			var type = this._getType();
			var pos = this._determinePosition(pageX, pageY);
			this._erase(pos,type);
			this.fire("eraseEvent");
		},
		_draw: function(pos, type, defState) {
			defState = (Y.Lang.isNull(defState)) ? type.defaultState : defState;
			var prevState = this._getState(pos.x, pos.y);
			this._storeState(pos, type.type, defState);
			var currState = this._getState(pos.x, pos.y);
			var offsetPos = {x : this._offsetPos(pos.x), y: this._offsetPos(pos.y)};
			type.draw(this._getContext(), offsetPos, prevState, currState, this);
		},
		_erase: function(pos, type) {
			this._removeState(pos);
			var offsetPos = {x : this._offsetPos(pos.x), y: this._offsetPos(pos.y)};
			type.erase(this._getContext(), offsetPos);
		},
		_determinePosition : function(x, y) {
			//each block is 30 px high and wide.. so, if we divide, we'll get a whole number...
			var trueX = Math.floor((x-this.get("canvas").getX())/30);
			var trueY = Math.floor((y- this.get("canvas").getY())/30);
			var pos = [];
			pos["x"] = trueX*30;
			pos["y"] = trueY*30;
			return pos
		},
		_getType : function () {
			return this.get("type");
		},
		_storeState : function(pos, type, state) {
			var boxes = this.get("boxes")
			boxes[pos.x+"/"+pos.y] = {pos: {x: pos.x, y: pos.y}, type: type, state: state, genNum: this.get("genNum")};
		},
		_removeState: function(pos) {
			var boxes = this.get("boxes");
			var idx = pos.x+"/"+pos.y;
			if (boxes[idx]) {
				delete boxes[idx];
				this.set("boxes", boxes);
			}
		},
		_getState : function(x,y) {
			return this.get("boxes")[x+"/"+y];
		},
		_offsetPos : function(pos) {
			return pos-this.get("offset");
		},
		toggleInit: function() {
			this.set("init", !this.get("init"));
		}
    });

    Y.namespace("slack").GraphPaper = GraphPaper;
}, "1.0.0", {requires:["widget", "json"]});
