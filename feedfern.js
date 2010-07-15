var ox = 0, oy = 0, PRECISION_RANGE = 100;
var container = $("#container");

// get Buzz feed
var showdata = null;
var buzzdata = null; // TODO: cache in HTML5
var hngrdata = null; // TODO: cache in HTML5
var origin = null; // TODO: other corners

var switchFeed = false;

$("#feedfern").click(function() {
	if (buzzdata != null && hngrdata != null) // check that it's all loaded
	if ($("#container > div").length > 0) {
		$("#container > div").each(function() { returnToZero(this) });
	} else {
		switchFeed = !switchFeed;
		if (switchFeed) createBuzz(); else createFeed();
	}
});

function getBuzzData(d) { buzzdata = d.data; }

/*
	Bloggers Against Hunger feed
*/
function getFeedData(data) {
	hngrdata = {items:[]};
	$.each(data.data, function(i, rssitem) {
		// reformat from timestamp
		var d = new Date();
		d.setTime(rssitem.published * 1000);
		// push to array
		hngrdata.items.push({
			links: { href: rssitem.url },
			published: d,
			title: '<h5>' + rssitem.name + '</h5>' + rssitem.text.substring(0,100)
		});
	});
}

function returnToZero(obj) {
	$(obj).animate({ "width":"0px", "height":"0px",
			 "font-size":"0px", "opacity":"0",
			 "top": "0px", "left": "0px" }, 
			"fast", "linear", function() { $(this).remove(); });
}

function setPosSize(age, theta) {
	var width = 20 + (age) * 3, height = 10 + (age) * 1.4,
		fontsize = 4 + age / 2,
		distance = age * (container.width() - width) / PRECISION_RANGE;
	var x = Math.round(Math.cos(theta) * distance),
		y = Math.round(Math.sin(theta) * distance)/2;
	//console.log("d:" + distance + " t:" + theta + " x:" + x + " y:" + y);
	return { "width": width + "px", "height": height + "px",
			 "font": fontsize + "px", "top": y + "px", "left": x + "px" };
}

function addBox(content, age, myurl) {
/*
	var x = Math.round(Math.cos(theta) * distance + Math.sin(theta) * distance),
        y = Math.round(-Math.sin(theta) * distance + Math.cos(theta) * distance);
*/
	var theta = Math.random() * Math.PI / 2;

	container
		.append('<div class="bezibox hidden">' + content + '</div>')
		.find('.bezibox:last')
	// Set metadata
		.attr("href", myurl)
	// Set position and animate
		.css(setPosSize(1, theta))
		.attr("age", age).attr("theta", theta)
		.removeClass('hidden')
		.dblclick(function() { window.open($(this).attr("href")); })
	// Hover
		.mouseover(function() {
  			$(this).css({"opacity":"1.0","overflow-y":"auto","z-index":"100"});
		})
		.mouseout(function() {
			$(this).css({"opacity":"0.4","overflow-y":"hidden","z-index":""});
		})
	;
}

function calcBuzzDates() {
	
	// get date ranges
	var dateNewest, dateOldest;
	$.each(showdata.items, function() {
		var itemDate = getBuzzDate((typeof this.updated == "undefined")?this.published:this.updated); 
		if (itemDate / 60000 > 1) { // ignore 1970 dates
			if (itemDate > dateNewest || !dateNewest) dateNewest = itemDate;
			if (itemDate < dateOldest || !dateOldest) dateOldest = itemDate;
		}
	});
	var dateRange = dateNewest - dateOldest;
	
	// set age difference on each element;
	$.each(showdata.items, function(i) {
		var dd = getBuzzDate((typeof this.updated == "undefined")?this.published:this.updated);
			dd -= dateOldest;
			dd = (dd < 1) ? 0 : dd / dateRange;
			dd = Math.round(dd * PRECISION_RANGE);
		// minimum age
		if (dd < 20) dd = 20;
		// update age if element exists
		if (this.dateDiff)
			container.find("[@age='" + this.dateDiff + "']").attr("age", dd);
		this.dateDiff = dd;
	});
}

function getBuzzDate(d) {
	if (typeof d == "string" && d.indexOf("T")>0 && d.indexOf("Z")>0) {
		// convert from Buzz format for updated
		d = d.replace("T", "-").replace(":", "-").replace(":", "-").replace(".", "-").split("-");
		// Date(year, month, day, hours, minutes, seconds, milliseconds)
		return new Date(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]), parseInt(d[3]), parseInt(d[4]), parseInt(d[5]));
	} else {
		return new Date(d);
	}
}

function createBuzz() {
	showdata = buzzdata;
	// calculate the dates
	calcBuzzDates();
	// create each element
	$.each(showdata.items, function(i) {		
		// get link url
		var url = 
			(this.links.alternate.length > 0) ?
				this.links.alternate[0].href : "#";
		// create the box
		addBox(this.title, this.dateDiff, url);
	});
	// set styles
	$('#container > div').css({
		"background-image":"url(res/bg_fern.png)"
	});
	// animate to position
	updateBuzz();
}

function createFeed() {
	showdata = hngrdata;
	// calculate the dates
	calcBuzzDates();
	// create each element
	$.each(showdata.items, function(i) {		
		// create the box
		addBox(this.title, this.dateDiff, this.links.href);
	});
	// set styles
	$('#container > div').css({
		"background-image":"url(res/bg_fern_dried.png)"
	});
	// animate to position
	updateBuzz();
}


function updateBuzz() {
	if (!window.isbeingdragged) {
		// calculate the dates
		calcBuzzDates();
		// update each buzz
		$('#container > div').each(function() {
			var age = parseInt($(this).attr("age"));
			$(this).animate(setPosSize(age, $(this).attr("theta")), "fast", "linear", function() {
				if (age > PRECISION_RANGE) $(this).fadeOut("slow", function() { $(this).remove(); });
			});
		});
	}
}

