var body = document.getElementById('body-wrap');

function init()
{

	window.menu.hideSoftkeys();
	getDisplayOrientation();
	setInterval("getDisplayOrientation()",500);
	
	// Obtain the SystemInfo object
    try {
        sysInfo = document.embeds[0];
    } catch (ex) {
        //alert("SystemInfo object cannot be found.");
        return;
    }

}

function vbr(duration,intensity) {
	durationvalue = Number(duration);
	intensityvalue = Number(intensity);
	try {
  	sysInfo.startvibra(durationvalue, intensityvalue);
  }catch(ex){
		
	}
	
}
function vbrbasic() {
	vbr(18,10);
}


function gotourl(url) {	
	url = url.href;
	widget.openURL(url);
}

 
// Display Information
function getDisplayOrientation()
{
    //if (widget.isrotationsupported)

	// Change the screen orientation
	//widget.setDisplayLanscape();
	
	var h = window.screen.height;
	var w = window.screen.width;
 
	if (h > w)
	{
		body.className = "portrait";
	}
  	else {
		body.className = "horizontal";
	}	


}

function infotoggle() {
	info = document.getElementById('info').style;
	if(info.display != 'block') {
		info.display = 'block';
	}
	else {
		info.display = 'none';
	}
}


