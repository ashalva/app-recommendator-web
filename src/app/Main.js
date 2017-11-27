var categories;
var applications;
var featureObject;

var descriptionThreshold = 75;
var featureThreshold = 75;

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

function clearElements(container, elementName) {
	var elementsToRemove = [];
   	for (var i = 0; i < container.children.length; i++) {
      var e = container.children[i];
      if (e.id == elementName) { 
      	elementsToRemove.push(e);
      }
  	}

  	for (e in elementsToRemove) {
  		container.removeChild(elementsToRemove[e]);
  	}
}

function buttonLoading() {
    $("#next-button").button('loading');
}

//* Categories methods *//
function loadCategories() {
	httpGetAsync("http://localhost:8081/categories", extractCategories);
};

function categorySearchChange() {
	drawCategories(categories, document.getElementById('srch-term').value);
}

function drawCategories(categories, filter) {
	var container = document.getElementById("radio-container");
	var nextButton = document.getElementById("next-button");
	var searchContainer = document.getElementById("search-container");

	$("#next-button").click(function() {
	    var $btn = $(this);
	    $btn.button('loading');

	    categoryNextClick();
	});

	//clearing old radiobuttons
	clearElements(container, 'radio-div');

    for (var k in categories) {
		var input = document.createElement("input");
	    input.type = "radio";
	    input.id = categories[k];
		addOnClick(input);

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = k.replace(/_/g, ' ');
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');
		div.setAttribute('id','radio-div');

		div.appendChild(input);
		div.appendChild(label);
		if (filter == undefined || k.replace(/_/g, ' ').toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
			container.appendChild(div);	
		}
    } 

    container.appendChild(nextButton);
}

function extractCategories(responseText) {
    this.categories = JSON.parse(responseText);
	drawCategories(this.categories);   
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
	httpGetAsync("http://localhost:8081/apps?category=" + getUrlVars().categoryId, extractApplications );
}

function applicationsSearchChange() {
	drawApplications(applications, document.getElementById('srch-term').value);
}

function extractApplications(responseText) {
	this.applications = JSON.parse(responseText);
	drawApplications(this.applications);
}

function drawApplications(applications, filter) {
	var container = document.getElementById("radio-container");
	var nextButton = document.getElementById("next-button");
	var searchContainer = document.getElementById("search-container");

	$("#next-button").click(function() { applicationsNextClick(); });
	$("#next-button").button('reset');

	clearElements(container, 'radio-div');

    for (var k in applications) {
		var input = document.createElement("input");
	    input.type = "radio";
	    input.id = applications[k].id;
		addOnClick(input);

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = applications[k].title;
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');
		div.setAttribute('id','radio-div');

		div.appendChild(input);
		div.appendChild(label);
		if (filter == undefined || applications[k].title.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
			container.appendChild(div);	
		}
    } 

    container.appendChild(nextButton);
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

//* Features methods*//
function featuresSearchChange() {
	drawFeatures(this.featureObject.features, document.getElementById('srch-term').value);
}

function loadFeatures() {
	buttonLoading();
	var descriptionSlider = document.getElementById('description_slider');
	var featureSlider = document.getElementById('feature_slider');

	descriptionSlider.value = self.descriptionThreshold;
	featureSlider.value = self.featureThreshold;

	descriptionSlider.disabled = true;
	featureSlider.disabled = true;

	document.getElementById("feature_threshold").innerHTML = self.featureThreshold + '%';
	document.getElementById("description_threshold").innerHTML = self.descriptionThreshold + '%';

	httpGetAsync("http://localhost:8081/features?id=" + getUrlVars().id + "&desc_threshold=" + self.descriptionThreshold + "&feature_threshold=" + self.featureThreshold , extractFeatures);
}

function extractFeatures(responseText) {
	this.featureObject = JSON.parse(responseText);
	drawFeatures(this.featureObject.data.features);
}

function drawFeatures(features, filter) {
	var searchContainer = document.getElementById("search-container");
	var container = document.getElementById("radio-container");
	var sliderContainer = document.getElementById("slider-container");
	
	document.getElementById('description_slider').disabled = false;
	document.getElementById('feature_slider').disabled = false;

	clearElements(container, 'checkbox-div');

	$("#next-button").button('reset');
	
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
		div.setAttribute('id', 'checkbox-div');

		div.appendChild(input);
		div.appendChild(label);
		if (filter == undefined || features[k].cluster_name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
			container.appendChild(div); 
		}
    }
}

function featureThresholdChange(value) {
	self.featureThreshold = value;
	loadFeatures();
}

function descriptionThresholdChange(value) {
	self.descriptionThreshold = value;
	loadFeatures();
}

function featuresOnClick() {

}


