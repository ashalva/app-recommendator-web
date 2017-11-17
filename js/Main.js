function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); 
    xmlHttp.send(null);
}

function loadCategories() {
	httpGetAsync("http://localhost:8081/categories", drawCategories)
}

var lastRadioChecked;

function drawCategories(responseText) {
	var container = document.getElementById("radio-container");

	function addOnClick(element) {
		element.onclick =  function () {
			var inputs = container.getElementsByTagName('input');
    		for (var i = 0; i < inputs.length; i++) {
    			inputs[i].checked = false;
    		}     
    		element.checked = true;
		};
	};

    var jsonObject = JSON.parse(responseText);
    for (var k in jsonObject) {
		
		var input = document.createElement("input");
	    input.type = "radio";
	    input.id = jsonObject[k];
		addOnClick(input);

	    var label = document.createElement('label');
	    label.setAttribute("for", jsonObject);
	    label.innerHTML = k.replace(/_/g, ' ');
	
		var div = document.createElement('div');
		div.setAttribute('class','radio');

		div.appendChild(input);
		div.appendChild(label);
		container.appendChild(div); 
    }    
}

