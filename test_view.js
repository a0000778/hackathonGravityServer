var view=new WebSocket('ws://127.0.0.1:5555','view');
view.addEventListener('open',function(){
	console.log('connected');
});
view.addEventListener('close',function(ev){
	console.log('close code: %d',ev.code);
});
view.addEventListener('message',function(data){
	console.log(data);
});
view.addEventListener('error',function(error){
	console.log(error);
});