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
	if (string === undefined) { return; }
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function httpPostPromise(theUrl, body, identifier) {
	return new Promise(function(resolve, reject) {
	    var req = new XMLHttpRequest();
	    req.open('POST', theUrl, true);
	    req.setRequestHeader("Content-type", "application/json");

	    req.onload = function() {
	      if (req.status == 200) {
	      	var jsonToReturn = JSON.parse(req.response);
			jsonToReturn.identifier = identifier;
	        resolve(jsonToReturn);
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
}

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

function createBoldLabel(text, textColor, fontSize) {
	var div = document.createElement('div');
    var label = document.createElement('label');
    label.innerHTML = text;
    label.style.fontWeight = 'bold';

    if (textColor !== undefined) {
    	label.style.color = textColor;
    }
    
    if (fontSize !== undefined) {
    	label.style.fontSize = fontSize;
    }
    
    div.appendChild(label);

    return div;
}

function createLabel(text, divId, textColor) {
	var div = document.createElement('div');
	if (divId !== undefined) {
		div.setAttribute('id', divId);	
	} 
	
    var label = document.createElement('label');
    label.innerHTML = text;
    if (textColor !== undefined) {
    	label.style.color = textColor;
    }
    
    div.appendChild(label);

    return div;
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
		if (filter != undefined && features[k].cluster_name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
			continue;
		}

		var div = document.createElement('div');
		div.setAttribute('class','radio');
		div.setAttribute('id', 'checkbox-div');

		var input = document.createElement("input");
		input.style.display = "inline";
	    input.type = "checkbox";
	    input.id = features[k].cluster_name;

		var dropDownDiv = document.createElement('div');
		dropDownDiv.style.display = "inline";
		dropDownDiv.setAttribute('class','dropdown');

		var dropDownButton = document.createElement('button');
		dropDownButton.setAttribute('class', 'btn btn-default dropdown-toggle');
		dropDownButton.setAttribute('type', 'button');
		dropDownButton.setAttribute('data-toggle', 'dropdown')
		dropDownButton.innerHTML = capitalizeFirstLetter(features[k].cluster_name) + '<span class="caret"></span>';
		dropDownButton.style.margin = '5px';

		var ul = document.createElement('ul');
		ul.setAttribute('class','dropdown-menu');
		var clusterFeatures = features[k].cluster_features;
		
		var topFeaturesCount = 7;
		if (clusterFeatures.length < topFeaturesCount) {
			topFeaturesCount = clusterFeatures.length;
		}

		for (var i = 0; i < topFeaturesCount; i++) {

			var li = document.createElement('li');
			li.innerHTML = capitalizeFirstLetter(clusterFeatures[i].feature)

			ul.appendChild(li);
		}

		dropDownDiv.appendChild(dropDownButton);
		dropDownDiv.appendChild(ul);
	    
		div.appendChild(input);
		div.appendChild(dropDownDiv);

		container.appendChild(div); 
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
      	self.checkedFeatures.push(searchFeatureCluserWithClusterName(e.childNodes[0].id));
      }	
  	}

  	localStorage["checkedFeatures"] = JSON.stringify(self.checkedFeatures);
  	localStorage["featureObject"] = JSON.stringify(self.featureObject);
  	
  	window.location = 'sentiments.html';
}

function searchFeatureCluserWithClusterName(name) {
	for (var i = 0; i < self.featureObject.data.features.length; i++) {
		if (self.featureObject.data.features[i].cluster_name === name) {
			return self.featureObject.data.features[i];
		}
	}
}
/* Sentiment functions */
function loadSentiments() {
	buttonLoading();

	self.checkedFeatures = JSON.parse(localStorage["checkedFeatures"]);
	self.featureObject = JSON.parse(localStorage["featureObject"]);
	self.sentimentSentences = [];

	for (var i = 0; i < checkedFeatures.length; i++) {
		var clusterObj = { 'cluster_name' : checkedFeatures[i].cluster_name,
							'features': []
						 };
		for (var j = 0; j < checkedFeatures[i].cluster_features.length; j++) {
			for (var sent in featureObject.data.sentences) {
				var sentence = featureObject.data.sentences[sent];
				for (var k in sentence) {
					var extractedFeatures = sentence[k].extracted_features;
					for (var f in extractedFeatures) {
						if (checkedFeatures[i].cluster_features[j].feature === extractedFeatures[f] && f != 0) {
							clusterObj.features.push( { 
								'feature' : checkedFeatures[i].cluster_features[j].feature,
								'sentence' : sentence[k].sentence_text 
							});

							if(self.sentimentSentences.indexOf(clusterObj) == -1) {
								self.sentimentSentences.push(clusterObj);	
							} 
							break;
						}	
					}
				}
			}
		}
	}

	console.log(sentimentSentences);

	var url = "http://localhost:9000/?properties=%7B%22annotators%22:%20%22sentiment%22%7D&pipelineLanguage=en&timeout=30000";
	var promises = [];

	for (var i = 0; i < sentimentSentences.length; i++) {
		var innerPromises = [];
		for (var j = 0; j < sentimentSentences[i].features.length; j++) {
			innerPromises.push(httpPostPromise(url, sentimentSentences[i].features[j].sentence, i));
		}

		promises.push(innerPromises);
	}

	var promiseCount = 0;
	for (var i = 0; i < promises.length; i++) {
		Promise.all(promises[i]).then(values => { 
			
			var index = 0;
			var sentimentSum = 0;
			for (var j = 0; j < values.length; j++) { 
				index = values[j].identifier;
				var sentValue = parseInt(values[j].sentences[0].sentimentValue);
				self.sentimentSentences[index].features[j].sentimentValue = sentValue;
				
				sentimentSum += sentValue;
			}

			var averageSentiment = (sentimentSum / values.length);

			self.sentimentSentences[index].sentimentValue = averageSentiment;
			
			if (averageSentiment > 2.0) {
				self.sentimentSentences[index].sentiment = "Positive";	
			} else if (averageSentiment <= 2.0 && averageSentiment >= 1.5) {
				self.sentimentSentences[index].sentiment = "Normal";	
			} else {
				self.sentimentSentences[index].sentiment = "Negative";	
			}

			promiseCount += 1;

			if (promiseCount == promises.length) {
				drawSentiments(sentimentSentences);
			}
		});
	}
}

function drawSentiments(sentiments, filter) {
	var searchContainer = document.getElementById("search-container");
	var container = document.getElementById("inner-container");
	var sliderContainer = document.getElementById("slider-container");
	
	var searchInput = document.getElementById('srch-term');
	searchInput.onkeyup = sentimentSearchChange;
	
	$("#next-button").button('reset');

	clearElements(container, 'negativesDiv');
	clearElements(container, 'positivesDiv');
	clearElements(container, 'normalsDiv');

	var negativesDiv = document.createElement('div');
	var positivesDiv = document.createElement('div');
	var normalsDiv = document.createElement('div');

	negativesDiv.setAttribute('id','negativesDiv');
	positivesDiv.setAttribute('id','positivesDiv');
	normalsDiv.setAttribute('id','normalsDiv');

	var negativesTitle = createBoldLabel('Negatives', 'Black', 20);
	var positivesTitle = createBoldLabel('Positives', 'Black', 20);
	var normalsTitle = createBoldLabel('Normals', 'Black', 20);
	
	negativesDiv.appendChild(negativesTitle);
	positivesDiv.appendChild(positivesTitle);
	normalsDiv.appendChild(normalsTitle);

	for (var i = 0; i < sentiments.length; i++) { 

		if (filter != undefined && sentiments[i].cluster_name.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
			continue;
		}

		var sent = sentiments[i].sentiment;

	    var dropDownDiv = document.createElement('div');
		dropDownDiv.style.display = "inline";
		dropDownDiv.setAttribute('class','dropdown');

		var dropDownButton = document.createElement('button');
		dropDownButton.setAttribute('type', 'button');
		dropDownButton.setAttribute('data-toggle', 'dropdown')
		dropDownButton.innerHTML = capitalizeFirstLetter(sentiments[i].cluster_name) + '<span class="caret"></span>';
		dropDownButton.style.margin = '5px';

		var ul = document.createElement('ul');
		ul.setAttribute('class','dropdown-menu');
		
		var topFeaturesCount = 15;
		if (sentiments[i].features.length < topFeaturesCount) {
			topFeaturesCount = sentiments[i].features.length;
		}

		for (var j = 0; j < topFeaturesCount; j++) {
			var li = document.createElement('a');
			li.setAttribute('class','dropdown-item')
			
			if (sentiments[i].features[j].sentimentValue == 3) {
	    		li.style.color = 'Green';
		    } else if (sentiments[i].features[j].sentimentValue == 1) {
		    	li.style.color = 'Red';
		    } else {
		    	li.style.color = 'Orange';
		    }

			li.innerHTML = capitalizeFirstLetter(sentiments[i].features[j].sentence);
			ul.appendChild(li);

			ul.appendChild(document.createElement('hr'));
		}

		dropDownDiv.appendChild(dropDownButton);
		dropDownDiv.appendChild(ul);
	    
		var labelText = capitalizeFirstLetter(sentiments[i].cluster_name) + " - " + sent + "</br>";

	    if (sent == "Positive") {
	    	dropDownButton.setAttribute('class', 'btn btn-success dropdown-toggle');
	    	positivesDiv.appendChild(dropDownDiv); 
	    } else if (sent == "Negative") {
	    	dropDownButton.setAttribute('class', 'btn btn-danger dropdown-toggle');
	    	negativesDiv.appendChild(dropDownDiv); 
	    } else {
	    	dropDownButton.setAttribute('class', 'btn btn-warning dropdown-toggle');
	    	normalsDiv.appendChild(dropDownDiv); 
	    }
	}

	//comparing to 1,since the divs already consist of titles(e.g Negatives)
	if (negativesDiv.childNodes.length > 1) { container.appendChild(negativesDiv); }
	if (positivesDiv.childNodes.length > 1) { container.appendChild(positivesDiv); } 
	if (normalsDiv.childNodes.length > 1) { container.appendChild(normalsDiv); }
}

function sentimentSearchChange() {
	drawSentiments(self.sentimentSentences, document.getElementById('srch-term').value);
}
