var categories;
var applications;
var seachedApplications;
var allFeatures;
var firstSentimentSentences;

var descriptionThreshold = 75;
var featureThreshold = 75;

var API_URL = "http://localhost:8081/";

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

var checkedApplicationsCheckboxes = {};
function addOnClick(element, uncheck = true, addAboveCategories = function(){}) {
	element.onclick =  function () {
		//unchecking the checked checkbox
		if (element.checked != true) {
    		delete checkedApplicationsCheckboxes[element.id];
			element.checked = false; 
			addAboveCategories();
			return;
		}


		var inputs = container.getElementsByTagName('input');
		// if uncheck works for categories
		// else is executed for features, where we allow user to select only two applications to compare
		if (uncheck) {
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].checked = false;
			}	
			//remove Chosen Applications section
			checkedApplicationsCheckboxes = {};
			document.getElementById("chosen-apps-div").innerHTML = "";
		} else {
			if (Object.keys(checkedApplicationsCheckboxes).length == 2) {
				//removing last element
				var index = 0;
				for (var fi in checkedApplicationsCheckboxes) { 
					if (checkedApplicationsCheckboxes[fi].last === true) {
						index = Object.keys(checkedApplicationsCheckboxes).indexOf(fi);
						break;
					}
				}
				delete checkedApplicationsCheckboxes[Object.keys(checkedApplicationsCheckboxes)[(index + 1) % 2]];
			}

			//resetting all items last to false
			for (var fi in checkedApplicationsCheckboxes) {
				checkedApplicationsCheckboxes[fi].last = false;
			}

			checkedApplicationsCheckboxes[element.id] = {};
			checkedApplicationsCheckboxes[element.id].title = element.name;
			checkedApplicationsCheckboxes[element.id].last = true;


			for (var i = 0; i < inputs.length; i++) {
				if (Object.keys(checkedApplicationsCheckboxes).indexOf(inputs[i].id) == -1) {
					inputs[i].checked = false;
				}
			}
		}
		
		addAboveCategories()
	
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

function line() {
	return document.createElement('hr');
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

var searchDelay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

//* Categories methods *//
function loadCategories() {
	httpGetAsync(API_URL + "categories", extractCategories);
};

function categorySearchChange() {
	searchDelay(function(){
      var searchString = document.getElementById('srch-term').value;
		if (searchString !== "") {
			httpGetAsync(API_URL + "searchApp?searchString=" + document.getElementById('srch-term').value, applicationSearchByName);
		}
    }, 250 );
}

function applicationSearchByName(responseText) {
	this.seachedApplications = JSON.parse(responseText);
	drawApplicationsAboveTheCategories(this.seachedApplications);
}

function addChosenAppsAboveCategories() {
	var chosenAppsDiv = document.getElementById("chosen-apps-div");
	chosenAppsDiv.innerHTML = "";

	if (Object.keys(checkedApplicationsCheckboxes).length > 0) {
		var title = createBoldLabel("Chosen applications", '#208c22', 15);
		title.style.marginTop = "15px";
		chosenAppsDiv.appendChild(title);

		for (var k in checkedApplicationsCheckboxes) {
		    var label = document.createElement('label');
		    label.innerHTML = checkedApplicationsCheckboxes[k].title;
		
			var div = document.createElement('div');
			div.setAttribute('class','radio');
			div.setAttribute('id','radio-div');

			div.appendChild(label);
			chosenAppsDiv.appendChild(div);	
	    } 
	    chosenAppsDiv.appendChild(line());
	}	
}

function drawApplicationsAboveTheCategories(applications) {
	var searchedAppDiv = document.getElementById("searched-apps-div");
	searchedAppDiv.innerHTML = "";
	if (applications.length > 0) {
		var title = createBoldLabel("Select desired application", '#9A3334', 15);
		title.style.marginTop = "15px";
		searchedAppDiv.appendChild(title);

		for (var k in applications) {
			var input = document.createElement("input");
		    input.type = "checkbox";
		    input.id = applications[k].id;
		    input.name = applications[k].title;
		    addOnClick(input, uncheck = false, addChosenAppsAboveCategories);
		    if (Object.keys(checkedApplicationsCheckboxes).indexOf(input.id) != -1) {
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
			searchedAppDiv.appendChild(div);	
	    } 
	    searchedAppDiv.appendChild(line());
	}	
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

	var chooseCategory = createBoldLabel("Chosee category", '#9A3334', 15);
	chooseCategory.style.marginTop = "15px";
	container.appendChild(chooseCategory);
		
	//clearing old radiobuttons
	clearElements(container, 'radio-div');

    for (var k in categories) {
    	if (k.toLowerCase().indexOf("mac") !== -1 || k.toLowerCase().indexOf("ipad") !== -1) { 
    		continue;
    	}
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
	if (Object.keys(checkedApplicationsCheckboxes).length > 0) {
		window.location = 'features.html?ids=' + Object.keys(checkedApplicationsCheckboxes);
		return;
	}

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
	httpGetAsync(API_URL + "apps?category=" + getUrlVars().categoryId, extractApplications );
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
	    if (Object.keys(checkedApplicationsCheckboxes).indexOf(input.id) != -1) {
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

	if (Object.keys(checkedApplicationsCheckboxes).length === 0) {
		alert("Please choose at least one and maximum two applications");
	} else { 
		window.location = 'features.html?ids=' + Object.keys(checkedApplicationsCheckboxes);
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

	httpGetAsync(API_URL + "features?ids=" + getUrlVars().ids + "&desc_threshold=" + self.descriptionThreshold + "&feature_threshold=" + self.featureThreshold , extractFeatures);	
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
	console.log(features);
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

	container.appendChild(line());
	var checkAllDiv = document.createElement('div');
	checkAllDiv.setAttribute('class','radio');
	checkAllDiv.setAttribute('id', 'checkbox-all-div');

	var checkAll = document.createElement("input");
    checkAll.type = "checkbox";
    checkAll.id = 'check-all';
    checkAll.onclick =  function () {
		var container = document.getElementById("checkbox-container");
		checkedFeatures = [];
		for (var i = 0; i < container.children.length; i++) {
	      var e = container.children[i];
	      if (e.id == "checkbox-div") { 
	      	//checking/unchecking the feature checkboxes
	      	e.childNodes[0].checked = checkAll.checked;
	      	//adding all features to the stored array
	      	if (checkAll.checked) { checkedFeatures.push(searchFeatureCluserWithClusterName(e.childNodes[0].id)); } 
	      }	
	  	}
	  	//remove all features from the stored array
	  	if (!checkAll.checked) { checkedFeatures = []; }
	};

    var newlabel = document.createElement("Label");
	newlabel.setAttribute("for", checkAll);
	newlabel.innerHTML = "Check All";

    checkAllDiv.appendChild(checkAll);
    checkAllDiv.appendChild(newlabel);

    container.appendChild(checkAllDiv);
    container.appendChild(line());
	
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
	httpGetAsync(API_URL + "sentiments?features=" + getUrlVars().features, extractSentiments);	
}

function extractSentiments(responseText) {
	sentiments = JSON.parse(responseText);
	drawSentiments(sentiments);
}

function round(num) {
  num = Math.round(num+'e'+2)
  return Number(num+'e-'+2)
}

function drawSentiments(sentiments) {
	var searchContainer = document.getElementById("search-container");
	var container = document.getElementById("inner-container");
	var sliderContainer = document.getElementById("slider-container");
	buttonReset();

	var firstAppWholeSentimentAverage = 0;
	var secondAppWholeSentimentAverage = 0;
	var firstAppName = "";
	var secondAppName = "";
	var firstAppFeatureSentimentAverages = [];
	var firstAppColors = [];
	var secondAppColors = [];
	var secondAppFeatureSentimentAverages = [];
	var comparison = false;
	var headlineText = "";

	for (var k in sentiments) { 
	    container.appendChild(createBoldLabel("FEATURE: " + capitalizeFirstLetter(k), '#9A3334', 20));
	    container.appendChild(createBoldLabel("More details...", '#9a9c9e', 12));

	    sentimentChart(container, capitalizeFirstLetter(k), sentiments[k]);

	    firstAppWholeSentimentAverage += sentiments[k].firstAppSentimentAverage;
	    secondAppWholeSentimentAverage += sentiments[k].secondAppSentimentAverage;
	   	
	   	firstAppFeatureSentimentAverages.push(sentiments[k].firstAppSentimentAverage);
		secondAppFeatureSentimentAverages.push(sentiments[k].secondAppSentimentAverage);

		firstAppColors.push(barColor(sentiments[k].firstAppSentimentAverage));
		secondAppColors.push(barColor(sentiments[k].secondAppSentimentAverage));

	    firstAppName = sentiments[k].firstAppName;
	    secondAppName = sentiments[k].secondAppName;
	    comparison = sentiments[k].comparison;

	}

	headlineText = "All features sentiment average: " + firstAppName;
	var ds = [{
				label: firstAppName,
				backgroundColor: firstAppColors,
				data: firstAppFeatureSentimentAverages,
			}];

 	firstAppWholeSentimentAverage /= Object.keys(sentiments).length;
 	firstAppWholeSentimentAverage = round(firstAppWholeSentimentAverage);
	secondAppWholeSentimentAverage /= Object.keys(sentiments).length
	secondAppWholeSentimentAverage = round(secondAppWholeSentimentAverage);

	var labels = [firstAppName]
	var values = [firstAppWholeSentimentAverage];
	if (comparison) {
		labels.push(secondAppName);
		values.push(secondAppWholeSentimentAverage);
		ds.push({
			label: secondAppName,
			backgroundColor: secondAppColors,
			data: secondAppFeatureSentimentAverages
		});

		headlineText += " VS " + secondAppName;
	}

	var wholeChart = chart('bar', 
								labels,
								'Sentiment Average', 
								values,
								[barColor(firstAppWholeSentimentAverage),
						         barColor(secondAppWholeSentimentAverage)],
						         true,
						         '600px');
	wholeChart.style.marginBottom = "30px";
	
	var headline = createBoldLabel(headlineText, '#612021', 25);
	headline.style.marginTop = "20px";

	container.insertBefore(headline, container.children[1]);
	container.insertBefore(wholeChart, container.children[2]);

	var featureLevelHeadline = createBoldLabel("Sentiment averages per feature", '#612021', 25);
	container.insertBefore(featureLevelHeadline, container.children[3]);
	
	var featuresGroupedChart = groupedChart({ labels: Object.keys(sentiments), datasets: ds });
	featuresGroupedChart.style.marginBottom = "30px";
	container.insertBefore(featuresGroupedChart, container.children[4])
	container.insertBefore(line(), container.children[5])

	document.getElementById("next-button").style.visibility = 'hidden';
}

function barColor(value) {
	var greenColor = 'rgba(75, 192, 192, 0.5)';
	var orangeColor = 'rgba(255, 159, 64, 0.5)';
	var redColor = 'rgba(255, 99, 132, 0.5)';

	if (value > 2.0) {
		return greenColor;
	} else if (value >= 1.5) {
		return orangeColor;
	} else {
		return redColor;
	}
}

function sentimentChart(container, featureName, sentiment)  {
	var sentimentDiv = document.createElement('div');
	sentimentDiv.setAttribute('class','sentiment-div');
	sentimentDiv.style.display = "none";

	sentimentDiv.appendChild(sentenceChartButton(sentiment.firstAppName, sentiment.firstAppSentiments, featureName));
	if (sentiment.comparison) {
		sentimentDiv.appendChild(sentenceChartButton(sentiment.secondAppName, sentiment.secondAppSentiments, featureName));
		sentimentDiv.appendChild(comparisonLinearChart(sentiment));
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
	
	sentimentDiv.appendChild(sentAverageChart)

	var toggleButton = document.createElement('button');
	toggleButton.setAttribute('class','btn btn-primary');
	toggleButton.innerHTML = featureName;
	toggleButton.style.marginBottom = '20px'
	toggleButton.onclick = (function() {
	    return function() { 
	    	if (sentimentDiv.style.display === "none") {
		        sentimentDiv.style.display = "block";
		    } else {
		        sentimentDiv.style.display = "none";
		    }
	    } 
	})();

	
	container.appendChild(toggleButton);
	container.appendChild(sentimentDiv);

	container.appendChild(line());
}

function comparisonLinearChart(sentiment) {
	var sentimentsComparisonButton = document.createElement('button');
	sentimentsComparisonButton.innerHTML = "Compare sentences";
	sentimentsComparisonButton.setAttribute('class','btn btn-info');
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
			            backgroundColor: 'rgba(255, 255, 0, 0.2)',
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

	return sentimentsComparisonButton;
}

function sentenceChartButton(appName, sentiments, featureName) {
	var sentimentsDetailButton = document.createElement('button');
	sentimentsDetailButton.innerHTML = appName + " with sentences";
	sentimentsDetailButton.setAttribute('class','btn btn-info');
	sentimentsDetailButton.style.marginTop = '0px'
	sentimentsDetailButton.style.marginRight = '20px'

	sentimentsDetailButton.onclick = (function() {
	    return function() {
	        var modal = document.getElementById('myModal');
		    modal.style.display = "block";

		    var titleLabel = document.getElementById('modal-title');
		    titleLabel.innerHTML = "'" + featureName + "'" + ' sentiments for '+ appName;

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
	var theHelp = Chart.helpers;
	var sentValues = {0: "1.0 - 1.5", 0.99: "1.5 - 2.0", 1.99: "2.0 - 3.0"};
	
	var chart = new Chart(ctx, {
	    type: type,
	    data: {
	        labels: labels,
	        datasets: [{
	            label: chartName,
	            data: data,
	            backgroundColor: backgroundColors,
	            borderColor:  'rgba(54, 162, 235, 1)',
	            borderWidth: 0.3
	        }]
    	},
    	options : {
    		legend: sentimentLabelLegend(),
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

function groupedChart(data, displayXLabels = true, width = '900px') {
	var chartDiv = document.createElement('div');
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');
	
	var chart = new Chart(ctx, {
	    type: 'bar',
	    data: data,
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
        	},
        	legend: sentimentLabelLegend()
  		}
	});

	chartDiv.appendChild(canvas);
	chart.canvas.parentNode.style.width = width;

	return chartDiv;
}

function sentimentLabelLegend() {
	var theHelp = Chart.helpers;
	var sentValues = {0: "1.0 - 1.5", 0.99: "1.5 - 2.0", 1.99: "2.0 - 3.0"};

	return {
			display: true,
			labels: {
				generateLabels: function(chart) {
			        var labelArray = [];
			        for (var objIndex in sentValues) {
			        	labelArray.push({
							text: sentValues[objIndex],
							fillStyle: barColor(parseFloat(objIndex) + 1),
							index: objIndex
						});
					}
			        
			        return labelArray;
		      	}	
		    }
		};
}