var categories;
var applications;
var allFeatures;
var firstSentimentSentences;

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

var checkedApplicationsCheckboxes = [];
function addOnClick(element, uncheck = true) {
	element.onclick =  function () {
		var inputs = container.getElementsByTagName('input');
		// if uncheck works for categories
		// else is executed for features, where we allow user to select only two applications to compare
		if (uncheck) {
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].checked = false;
			}	
		} else {
			if (checkedApplicationsCheckboxes.length == 2) {
				//removing first element
				checkedApplicationsCheckboxes.splice(0,1);
			}
			checkedApplicationsCheckboxes.push(element.name);
			for (var i = 0; i < inputs.length; i++) {
				if (checkedApplicationsCheckboxes.indexOf(inputs[i].name) == -1) {
					inputs[i].checked = false;
				}
			}
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
    label.innerHTML = capitalizeFirstLetter(text);
    label.style.fontWeight = 'bold';

    if (textColor !== undefined) { label.style.color = textColor; }
    if (fontSize !== undefined) { label.style.fontSize = fontSize; }
    
    div.appendChild(label);
    return div;
}

function createLabel(text, divId, textColor) {
	var div = document.createElement('div');
	if (divId !== undefined) { div.setAttribute('id', divId); } 
	
    var label = document.createElement('label');
    label.innerHTML = text;

    if (textColor !== undefined) { label.style.color = textColor; }
    
    div.appendChild(label);
    return div;
}

function buttonLoading() {
    $("#next-button").button('loading');
}

function buttonReset() {
	$("#next-button").button('reset');
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
	    label.innerHTML = capitalizeFirstLetter(k.replace(/_/g, ' ').toLowerCase());
	
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
	var container = document.getElementById("check-container");
	var nextButton = document.getElementById("next-button");
	var searchContainer = document.getElementById("search-container");

	$("#next-button").click(function() { applicationsNextClick(); });
	buttonReset();

	clearElements(container, 'radio-div');

    for (var k in applications) {
		if (filter !== undefined && applications[k].title.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
			continue;
		}

		var input = document.createElement("input");
	    input.type = "checkbox";
	    input.id = applications[k].id;
	    input.name = applications[k].title;
	    addOnClick(input, uncheck = false);
	    if (checkedApplicationsCheckboxes.indexOf(input.name) != -1) {
	    	input.checked = true;
	    }

	    var label = document.createElement('label');
	    label.setAttribute("for", input);
	    label.innerHTML = applications[k].title;
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');
		div.setAttribute('id','radio-div');

		div.appendChild(input);
		div.appendChild(label);
		container.appendChild(div);	
    } 

    container.appendChild(nextButton);
}

function applicationsNextClick() {
	var container = document.getElementById("check-container");
	var inputs = container.getElementsByTagName('input');
	var checkedApps = [];
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].checked == true) {
			checkedApps.push(inputs[i].id);
		}
	}

	if (checkedApps.length === 0) {
		alert("Please choose at least one and maximum two applications");
	} else { 
		window.location = 'features.html?ids=' + checkedApps;
	}
}

//* Features methods*//
function featuresSearchChange() {
	drawFeatures(this.allFeatures, document.getElementById('srch-term').value);
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

	httpGetAsync("http://localhost:8081/features?ids=" + getUrlVars().ids + "&desc_threshold=" + self.descriptionThreshold + "&feature_threshold=" + self.featureThreshold , extractFeatures);	
}

function extractFeatures(responseText) {
	self.allFeatures = JSON.parse(responseText);
	if (self.allFeatures.success === false) {
		alert("Something went wrong, please try again");

	} else {
		drawFeatures(self.allFeatures);	
	}
}

function drawFeatures(features, filter) {
	var searchContainer = document.getElementById("search-container");
	var container = document.getElementById("checkbox-container");
	var sliderContainer = document.getElementById("slider-container");
	
	document.getElementById('description_slider').disabled = false;
	document.getElementById('feature_slider').disabled = false;

	clearElements(container, 'checkbox-div');
	buttonReset();

	$("#next-button").click(function() {
	    var $btn = $(this);
	    $btn.button('loading');

	    featuresNextClick();
	});
	
    for (var k in features) {
    	if (filter !== undefined && features[k].cluster_name.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
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
		var clusterFeatures = features[k].features;
		
		var topFeaturesCount = 7;
		if (clusterFeatures.length < topFeaturesCount) {
			topFeaturesCount = clusterFeatures.length;
		}

		for (var i = 0; i < topFeaturesCount; i++) {
			var li = document.createElement('li');
			li.innerHTML = capitalizeFirstLetter(clusterFeatures[i])

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
	checkedFeatures = [];
	var container = document.getElementById("checkbox-container");
	for (var i = 0; i < container.children.length; i++) {
      var e = container.children[i];
      if (e.id == "checkbox-div" && e.childNodes[0].checked == true) { 
      	checkedFeatures.push(searchFeatureCluserWithClusterName(e.childNodes[0].id));
      }	
  	}

  	console.log(checkedFeatures);
  	localStorage["checkedFeatures"] = JSON.stringify(checkedFeatures);
  	window.location = 'sentiments.html?features=' + checkedFeatures.join(',');
}

function searchFeatureCluserWithClusterName(name) {
	for (var i = 0; i < self.allFeatures.length; i++) {
		if (self.allFeatures[i].cluster_name === name) {
			return self.allFeatures[i].cluster_name.replace(/ /g,'%20');
		}
	}
}
/* Sentiment functions */
function loadSentiments() {
	buttonLoading();

	self.checkedFeatures = JSON.parse(localStorage["checkedFeatures"]);
	httpGetAsync("http://localhost:8081/sentiments?features=" + getUrlVars().features, extractSentiments);	
}

function extractSentiments(responseText) {
	sentiments = JSON.parse(responseText);
	console.log(sentiments);
	drawSentiments(sentiments);
}

function drawSentiments(sentiments) {
	var searchContainer = document.getElementById("search-container");
	var container = document.getElementById("inner-container");
	var sliderContainer = document.getElementById("slider-container");
	buttonReset();

	for (var k in sentiments) { 
		var featureNameLabel = createBoldLabel("FEATURE: " + capitalizeFirstLetter(k), '#9A3334', 20);
	    container.appendChild(featureNameLabel);

	    container.appendChild(createBoldLabel("Sentence sentiment details", '#9a9c9e', 12));
	    sentimentChart(container, capitalizeFirstLetter(k), sentiments[k]);
	}

	document.getElementById("next-button").style.visibility = 'hidden';
}

function barColor(value) {
	var greenColor = 'rgba(75, 192, 192, 0.2)';
	var orangeColor = 'rgba(255, 159, 64, 0.2)';
	var redColor = 'rgba(255, 99, 132, 0.2)';

	if (value > 2.0) {
		return greenColor;
	} else if (value >= 1.5) {
		return orangeColor;
	} else {
		return redColor;
	}
}

function sentimentChart(container, featureName, sentiment)  {
	container.appendChild(sentenceChartButton(sentiment.firstAppName, sentiment.firstAppSentiments, featureName));
	if (sentiment.comparison) {
		container.appendChild(sentenceChartButton(sentiment.secondAppName, sentiment.secondAppSentiments, featureName));
		comparisonLinearChart(container, sentiment);
	}

	var labels = [sentiment.firstAppName]
	var values = [sentiment.firstAppSentimentAverage];
	if (sentiment.comparison) {
		labels.push(sentiment.secondAppName);
		values.push(sentiment.secondAppSentimentAverage);
	}

	var sentAverageChart = chart('bar', 
								labels,
								'Sentiment Average', 
								values,
								[barColor(sentiment.firstAppSentimentAverage),
						         barColor(sentiment.secondAppSentimentAverage)],
						         true,
						         '600px');
	

	container.appendChild(sentAverageChart);
}

function comparisonLinearChart(container, sentiment) {
	var sentimentsComparisonButton = document.createElement('button');
	sentimentsComparisonButton.innerHTML = "Compare sentences";
	sentimentsComparisonButton.setAttribute('class','btn btn-primary');
	sentimentsComparisonButton.style.marginTop = '0px'
	sentimentsComparisonButton.style.marginRight = '20px'

	sentimentsComparisonButton.onclick = (function() {
	    return function() { 
	    	var modal = document.getElementById('myModal');
		    modal.style.display = "block";

		    var body = document.getElementById('modal-body');
		    body.innerHTML = '';

		    var chartDiv = document.createElement('div');
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext('2d');
			
			var labels = [];
			if (sentiment.secondAppSentiments.length > sentiment.firstAppSentiments.length) {
				labels = sentiment.secondAppSentiments;
			} else {
				labels = sentiment.firstAppSentiments;
			}
			var chart = new Chart(ctx, {
			    type: 'line',
			    data: {
			        labels: labels,
			        datasets: [{
			            label: sentiment.firstAppName,
			            data: sentiment.firstAppSentiments.map(s => s.sentiment),
			            backgroundColor: 'rgba(255, 99, 132, 0.2)',
			            borderColor: [
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)'
			            ],
			            borderWidth: 1
			        },
			        {
			            label: sentiment.secondAppName,
			            data: sentiment.secondAppSentiments.map(s => s.sentiment),
			            backgroundColor: 'rgba(54, 162, 235, 0.2)',
			            borderColor: [
			                'rgba(54, 162, 235, 1)',
			                'rgba(54, 162, 235, 1)'
			            ],
			            borderWidth: 1
			        }]
		    	},
		    	options : {
		  			responsive: true,
		  			responsiveAnimationDuration: 1000,
		  			easing: 'easeInQuint',
		  			scales: {
			            yAxes: [{
			                ticks: {
			                    beginAtZero: true,
			                    suggestedMax: 3.5
			                }
			            }],
			             xAxes: [{
			                display: false
			            }]
		        	},
				    tooltips: {
				        enabled: false
				    }
		  		}
			});

			chartDiv.appendChild(canvas);
			chart.canvas.parentNode.style.width = '900px';

			body.appendChild(chartDiv);

		    var span = document.getElementsByClassName("close")[0];
		    span.onclick = function() {
			    modal.style.display = "none";
			}

			window.onclick = function(event) {
			    if (event.target == modal) {
			        modal.style.display = "none";
			    }
			}

    	}
	})();

	container.appendChild(sentimentsComparisonButton);
}

function sentenceChartButton(appName, sentiments, featureName) {
	var sentimentsDetailButton = document.createElement('button');
	sentimentsDetailButton.innerHTML = appName + " in details";
	sentimentsDetailButton.setAttribute('class','btn btn-info');
	sentimentsDetailButton.style.marginTop = '0px'
	sentimentsDetailButton.style.marginRight = '20px'

	sentimentsDetailButton.onclick = (function() {
	    return function() {
	        var modal = document.getElementById('myModal');
		    modal.style.display = "block";

		    var body = document.getElementById('modal-body');
		    body.innerHTML = '';
		    var sentenceSentimentsChart = chart('bar',
		    									sentiments.map(s => s.sentence),
		    									featureName,
		    									sentiments.map(s => s.sentiment),
												sentiments.map(s => barColor(s.sentiment)),
												false );
		    body.appendChild(sentenceSentimentsChart);

		    var span = document.getElementsByClassName("close")[0];
		    span.onclick = function() {
			    modal.style.display = "none";
			}

			window.onclick = function(event) {
			    if (event.target == modal) {
			        modal.style.display = "none";
			    }
			}
		}
	})();

	return sentimentsDetailButton;
}

function chart(type, labels, chartName, data, backgroundColors, displayXLabels = true, width = '900px') {
	var chartDiv = document.createElement('div');
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');
	
	var chart = new Chart(ctx, {
	    type: type,
	    data: {
	        labels: labels,
	        datasets: [{
	            label: chartName,
	            data: data,
	            backgroundColor: backgroundColors,
	            borderColor: [
	                'rgba(54, 162, 235, 1)',
	                'rgba(54, 162, 235, 1)'
	            ],
	            borderWidth: 1
	        }]
    	},
    	options : {
  			responsive: true,
  			responsiveAnimationDuration: 1000,
  			easing: 'easeInQuint',
  			scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero: true,
	                    suggestedMax: 3.5
	                }
	            }],
	             xAxes: [{
	                display: displayXLabels
	            }]
        	}
  		}
	});

	chartDiv.appendChild(canvas);
	chart.canvas.parentNode.style.width = width;

	return chartDiv;
}
