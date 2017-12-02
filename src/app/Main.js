var categories;
var applications;
var featureObject;
var checkedFeatures;
var sentimentSentences;

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

function httpPostAsync(theUrl, body, callback) {
	var xhr = new XMLHttpRequest();
	var url = theUrl;
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () {
    	if (xhr.readyState === 4 && xhr.status === 200) {
        	var json = JSON.parse(xhr.responseText);
        	callback(json);
    	}
	};
	var data = JSON.stringify(body);
	xhr.send(data);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function httpPostPromise(theUrl, body) {
	return new Promise(function(resolve, reject) {
	    var req = new XMLHttpRequest();
	    req.open('POST', theUrl);
	    req.setRequestHeader("Content-type", "application/json");

	    req.onload = function() {
	      if (req.status == 200) {
	        resolve(JSON.parse(req.response));
	      }
	      else {
	        reject(Error(req.statusText));
	      }
	    };

	    req.onerror = function() {
	      reject(Error("Network Error"));
	    };

	    var data = JSON.stringify(body);
	    req.send(data);
  });
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
	var container = document.getElementById("checkbox-container");
	var sliderContainer = document.getElementById("slider-container");
	
	document.getElementById('description_slider').disabled = false;
	document.getElementById('feature_slider').disabled = false;

	clearElements(container, 'checkbox-div');

	$("#next-button").button('reset');
	$("#next-button").click(function() {
	    var $btn = $(this);
	    $btn.button('loading');

	    featuresNextClick();
	});
	
    for (var k in features) {
    	//
		var input = document.createElement("input");
	    input.type = "checkbox";
	    input.id = features[k].cluster_name;

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = capitalizeFirstLetter(features[k].cluster_name);
	
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

function featuresNextClick() {
	self.checkedFeatures = [];
	var container = document.getElementById("checkbox-container");
	for (var i = 0; i < container.children.length; i++) {
      var e = container.children[i];
      if (e.id == "checkbox-div" && e.childNodes[0].checked == true) { 
      	self.checkedFeatures.push(e.childNodes[0].id);
      }	
  	}

  	localStorage["checkedFeatures"] = JSON.stringify(self.checkedFeatures);
  	localStorage["featureObject"] = JSON.stringify(self.featureObject);
  	
  	window.location = 'sentiments.html';

}

function loadSentiments() {
	self.checkedFeatures = JSON.parse(localStorage["checkedFeatures"]);
	self.featureObject = JSON.parse(localStorage["featureObject"]);
	self.sentimentSentences = [];

	for (var i = 0; i < checkedFeatures.length; i++) {
		for (var sent in featureObject.data.sentences) {
			//sentence is key
			//featureObject.sentences[sentence] is value
			var sentence = featureObject.data.sentences[sent];
			for (var k in sentence) {
				var extractedFeatures = sentence[k].extracted_features;
				for (var f in extractedFeatures) {
					if (checkedFeatures[i] === extractedFeatures[f]) {
						self.sentimentSentences.push( { 
							'feature' : checkedFeatures[i],
							'sentence' : sentence[k].sentence_text 
						});
						break;
					}	
				}
			}
		}
	}

	var url = "http://localhost:9000/?properties=%7B%22annotators%22%3A%20%22sentiment%22%2C%20%22date%22%3A%20%222017-11-25T13%3A14%3A02%22%7D&pipelineLanguage=en";

	var promises = [];

	for (var i = 0; i< sentimentSentences.length; i++) {
		promises.push(httpPostPromise(url, sentimentSentences[i].sentence));
	}

	Promise.all(promises).then(values => { 
		for (var i = 0; i< sentimentSentences.length; i++) { 
			self.sentimentSentences[i].sentimentValue = values[i].sentences[0].sentimentValue;
			self.sentimentSentences[i].sentiment = values[i].sentences[0].sentiment;
		}
		
		drawSentiments(sentimentSentences);
	});
}

function drawSentiments(sentiments, filter) {
	var searchContainer = document.getElementById("search-container");
	var container = document.getElementById("inner-container");
	var sliderContainer = document.getElementById("slider-container");
	
	var searchInput = document.getElementById('srch-term');
	searchInput.onkeyup = sentimentSearchChange;

	clearElements(container, 'sentiment-div');
	
	$("#next-button").button('reset');

	for (var i = 0; i < sentiments.length; i++) { 
		var div = document.createElement('div');
		div.setAttribute('id', 'sentiment-div');

	    var label = document.createElement('label');
	    var sent = sentiments[i].sentiment;
	    if (sent == "Positive") {
	    	label.style.color = "Green";
	    } else if (sent == "Negative") {
	    	label.style.color = "Red";
	    } else {
	    	label.style.color = "Orange";
	    }
	    
	    label.innerHTML = capitalizeFirstLetter(sentiments[i].feature) + " - " + sentiments[i].sentence + "</br>"; 

		div.appendChild(label);
		if (filter == undefined || label.innerHTML.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
			container.appendChild(div);
		}
	}
}

function sentimentSearchChange() {
	drawSentiments(self.sentimentSentences, document.getElementById('srch-term').value);
}




