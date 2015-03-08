var http=require('http');
var websocket=require('websocket');
var config=require('./config.js');
var game=require('./game.js');

var getGameCode=/^\/([a-z0-9]+)$/;
var httpServer=http.createServer();
var socketServer=new websocket.server({
	'httpServer': httpServer
});
var router=new websocket.router({
	'server': socketServer
});

router.mount(getGameCode,'control',function(request){
	var code=request.resourceURL.pathname.match(getGameCode)[1];
	if(game.exists(code))
		game.get(code).join(request.accept(request.origin));
	else
		request.reject(4000,'not exists');//遊戲不存在，返回狀態碼4000
});
router.mount('/','view',function(request){
	var code;
	var tryCount=3;
	do{
		code=Math.floor(Math.random()*config.randRange).toString(36);
	}while(game.exists(code) && --tryCount)
	if(tryCount)
		game.create(code,request.accept(request.origin));
	else
		request.reject(4001,'create fail');//遊戲建立失敗，返回狀態碼4001
});

httpServer.listen(config.port,function(error){
	if(error){
		console.error('伺服器啟動失敗：%s',error.code)
		process.exit(1);
	}
	console.log('伺服器已啟動至 port %d',config.port);
});