URLS = {
	turn:    ["http://moubail-checkers.appspot.com/api/turn/", "/api/turn/"],
    refresh: ["http://moubail-checkers.appspot.com/api/refresh/", "/api/refresh/"],
    action:  ["http://moubail-checkers.appspot.com/api/action/", "/api/action/"]
};

function get_url(page){
  var url = "";
  try{
    device;
    url = URLS[page][0];    
  }catch(e){
    url = URLS[page][1];    
  }
  return url;
}
