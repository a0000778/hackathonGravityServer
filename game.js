var config=require('./config.js');
var gameGroups=new Map();

function parseJSON(data){
	if(data.type!=='utf8') return null;
	try{
		data=JSON.parse(data.utf8Data);
	}catch(e){
		return null;
	}
	return data;
}

function Game(code,viewSocket){
	var _=this;
	this.code=code;
	this.viewSocket=viewSocket;
	this.controls=new Map();
	this.sendViewer({
		'action': 'code',
		'code': code
	});
	viewSocket
		.on('message',function(data){
			data=parseJSON(data);
			if(data===null) viewSocket.close(4002,'format error');
			var player=data.player;
			if(player){
				data.player=undefined;
				_.sendOneControl(player,data)
			}else
				_.sendControl(data);
		})
		.on('close',function(){
			_.end(4100,'lose viewer socket');
		})
	;
}
Game.prototype.join=function(socket){
	var _=this;
	var code=Math.floor(Math.random()*config.randRange).toString(36);
	this.controls.set(code,socket);
	this.sendViewer({
		'action': 'join',
		'player': code
	});
	socket
		.on('message',function(data){
			data=parseJSON(data);
			if(data===null) socket.close(4002,'format error');
			data.player=code;
			_.sendViewer(data);
		})
		.on('close',function(){
			_.sendViewer({
				'action': 'close',
				'player': code
			});
		})
	;
}
Game.prototype.sendOneControl=function(player,data){
	var control=this.controls.get(player);
	if(control) control.sendUTF(JSON.stringify(data));
}
Game.prototype.sendControl=function(data){
	data=JSON.stringify(data);
	this.controls.forEach(function(control){
		control.sendUTF(data);
	});
}
Game.prototype.sendViewer=function(data){
	this.viewSocket.sendUTF(JSON.stringify(data));
}
Game.prototype.end=function(code){
	this.viewSocket.close(code);
	this.controls.forEach(function(control){
		control.close(code);
	});
	gameGroups.delete(this.code);
}

module.exports={
	'create': function(code,viewSocket){
		var group=new Game(code,viewSocket);
		gameGroups.set(code,group);
		return group;
	},
	'get': function(code){
		return gameGroups.get(code);
	},
	'exists': function(code){
		return gameGroups.has(code);
	}
}