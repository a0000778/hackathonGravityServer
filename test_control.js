function control(code){
	var socket=new WebSocket('ws://127.0.0.1:5555/'+code,'control');
	socket.addEventListener('open',function(){
		console.log('connected');
	});
	socket.addEventListener('close',function(ev){
		console.log('close code: %d',ev.code);
	});
	socket.addEventListener('message',function(data){
		console.log(data);
	});
	socket.addEventListener('error',function(error){
		console.log(error);
	});
	return socket;
}