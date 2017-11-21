function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); 
    xmlHttp.send(null);
}

function addOnClick(element) {
		element.onclick =  function () {
			var inputs = container.getElementsByTagName('input');
    		for (var i = 0; i < inputs.length; i++) {
    			inputs[i].checked = false;
    		}
    		var nextButton = document.getElementById("next-button");
			nextButton.disabled = false;
    		
    		element.checked = true;
		};
	};

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function buttonLoading() {
    $("#next-button").button('loading');
}

//* Categories methods *//
function loadCategories() {
	httpGetAsync("http://localhost:8081/categories", drawCategories);
};

function drawCategories(responseText) {
	var container = document.getElementById("radio-container");
	var nextButton = document.getElementById("next-button");

	$("#next-button").click(function() {
	    var $btn = $(this);
	    $btn.button('loading');

	    categoryNextClick();
	});

    var jsonObject = JSON.parse(responseText);
    container.removeChild(nextButton);

   	var jsonObject = JSON.parse(responseText);
	
    for (var k in jsonObject) {
		var input = document.createElement("input");
	    input.type = "radio";
	    input.id = jsonObject[k];
		addOnClick(input);

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = k.replace(/_/g, ' ');
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');

		div.appendChild(input);
		div.appendChild(label);
		container.appendChild(div); 
    } 

    container.appendChild(nextButton);
}


function categoryNextClick() {
	var container = document.getElementById("radio-container");
	var inputs = container.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].checked == true) {
			location.href = 'applications.html?categoryId=' + inputs[i].id;
		}
	}
}

//* Applications methods *//
function loadApplications() {
	buttonLoading();
	console.log(getUrlVars().categoryId);
	httpGetAsync("http://localhost:8081/apps?category=" + getUrlVars().categoryId, function(r) { drawApplications(r); });
}

function drawApplications(responseText) {
	var container = document.getElementById("radio-container");
	var nextButton = document.getElementById("next-button");

	$("#next-button").click(function() { applicationsNextClick(); });
	$("#next-button").button('reset');

	var jsonObject = JSON.parse(responseText);
	
    for (var k in jsonObject) {
		var input = document.createElement("input");
	    input.type = "radio";
	    input.id = jsonObject[k].id;
		addOnClick(input);

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = jsonObject[k].title;
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');

		div.appendChild(input);
		div.appendChild(label);
		container.appendChild(div); 
    } 
}

function applicationsNextClick() {
	var container = document.getElementById("radio-container");
	var inputs = container.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].checked == true) {
			window.location = 'features.html?id=' + inputs[i].id;
		}
	}
}

function loadFeatures() {
	buttonLoading();
	httpGetAsync("http://localhost:8081/features?id=" + getUrlVars().id + "&mode=1", drawFeatures)	
}

var features;

function drawFeatures(responseText) {
	var container = document.getElementById("radio-container");
	container.innerHTML = "";

	$("#next-button").button('reset');
	
	var jsonObject = JSON.parse(responseText);
	features = jsonObject.features;
    for (var k in features) {
    	//
		var input = document.createElement("input");
	    input.type = "checkbox";
	    input.id = features[k].cluster_name;

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = features[k].cluster_name;
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');

		div.appendChild(input);
		div.appendChild(label);
		container.appendChild(div); 
    }
}

function featuresOnClick() {

}


