URLS = {
	turn:    ["http://moubail-chekers.appspot.com/api/turn/", "/api/turn/"],
    refresh: ["http://moubail-chekers.appspot.com/api/refresh/", "/api/refresh/"],
    action:  ["http://moubail-chekers.appspot.com/api/action/", "/api/action/"]
};

function get_url(page){
  if ($.browser.safari || $.browser.opera || $.browser.msie || $.browser.mozilla) {
     return URLS[page][1];
  }
  return URLS[page][0];
}
