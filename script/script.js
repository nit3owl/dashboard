"use strict";

var elementCounts = {
	docks: 		0,
	notes: 		0,
	weather: 	0
}

var TIMEOUT = 300000;

window.onload = function() {
	if(typeof(Storage) !== 'undefined') {
		//load saved elements
		console.log(localStorage);
		for(var i = 0; i < localStorage.length; i++){
			var key = localStorage.key(i);
			var temp = JSON.parse(localStorage.getItem(key));
			var obj = restoreObject(temp);
			if(obj instanceof Weather){
				//check to see if forecast should be refreshed
				if(obj.current.updated + TIMEOUT <= Date.now())
					obj.getCurrentWeather(obj.zipCode, obj.countryCode);
			}
			renderElement(obj);
		}

	} else {
	    console.log('localStorage not supported');
	    alert('Your broswer does not support localStorage; saving will fail.');
	}

	var docks = document.getElementsByClassName('draggable-div-dock');
	for(var i = 0; i < docks.length; i++){
		docks[i].ondragover = allowDrop;
		docks[i].ondrop = drop;		
		docks[i].id = 'dock-' + (i + 1);
	}
	elementCounts.docks = docks.length;

	var trash = document.getElementById('trashcan');
	trash.ondragover = allowDrop;
	trash.ondrop = drop;
	trash.onclick = deleteAllDraggables;

	document.getElementById('note').addEventListener('click', addNote , false);
	document.getElementById('weather').addEventListener('click', addWeather , false);
	//document.getElementById('timer').addEventListener('click', addNote , false);
	//document.getElementById('change').addEventListener('click', addNote , false);

}

function getParentDraggableDiv(div){
	while(!~div.className.indexOf('draggable-div')){
		div = div.parentNode;
	}
	return div;
}
function allowDrop(event) {
	event.preventDefault();
}
function drag(event) {
	event.dataTransfer.setData('text', event.target.id);
}
function drop(event) {
	event.preventDefault();
	var source = document.getElementById(event.dataTransfer.getData('text'));
	var target = event.target;
	if(target.id !== 'trashcan'){
		swapElements(source, target);
	}else{
		deleteElement(source);
	}	
}
function deleteElement(object){
	localStorage.removeItem(object.id);
	var left = hasClass(object, 'left');
	if(left){
		object.parentNode.replaceChild(new DraggableDock('left').render(), object);
	}else{
		object.parentNode.replaceChild(new DraggableDock('right').render(), object);
	}
}
function deleteAllDraggables(){
	var confirmed = confirm('Are you sure you want to delete all widgets?');
	if(confirmed){
		var draggables = document.getElementsByClassName('draggable-div');
		var count = draggables.length;
		for(var i = 0; i < count; i++){
			deleteElement(draggables[0]);
			localStorage.clear();
		}
	}
}
function addElement(type){
	var docks = document.getElementsByClassName('draggable-div-dock');
	if(docks.length > 0){
		var dock = docks[0];
		var left = hasClass(dock, 'left');
		var obj;
		switch(type){
			case 'note':
				if(left){
					obj = new Note('left');
				}else{
					obj = new Note('right');
				}
			break;
			case 'weather':
				if(left){
					obj = new Weather('left');
				}else{
					obj = new Weather('right');
				}
			break;
		}
		localStorage.setItem(obj.id, JSON.stringify(obj));
		console.log(localStorage);
		renderElement(obj);
	}
}
function renderElement(object){
	var docks = document.getElementsByClassName('draggable-div-dock');
	if(docks.length > 0){
		var dock = docks[0];
		dock.parentNode.replaceChild(object.render(), dock);
	}
}
function replaceElement(target, element){
	deleteElement(target);
	renderElement(element);
}
function addNote(){
	addElement('note');
}
function addWeather(){
	addElement('weather');
}
//https://stackoverflow.com/questions/10716986/swap-2-html-elements-and-preserve-event-listeners-on-them
function swapElements(obj1, obj2) {
	//if necessary, swap left/right classes
	swapLeftRight(obj1, obj2);
    // create marker element and insert it where obj1 is
    var temp = document.createElement('div');
    obj1.parentNode.insertBefore(temp, obj1);
    // move obj1 to right before obj2
    obj2.parentNode.insertBefore(obj1, obj2);
    // move obj2 to right before where obj1 used to be
    temp.parentNode.insertBefore(obj2, temp);
    // remove temporary marker node
    temp.parentNode.removeChild(temp);
    //swap elements in localStorage to maintain order on reload
    var tobj1 = JSON.parse(localStorage.getItem(obj1.id));
    var tobj2 = JSON.parse(localStorage.getItem(obj2.id));

    if(tobj1.position !== tobj2.position){
    	var pos = tobj1.position;
    	tobj1.position = tobj2.position;
    	tobj2.position = pos;
    	tobj1.classes = obj1.className;
    	tobj2.classes = obj2.className;
    }

    localStorage.setItem(obj1.id, JSON.stringify(tobj2));
    localStorage.setItem(obj2.id, JSON.stringify(tobj1));
}
function swapLeftRight(obj1, obj2){
	if(hasClass(obj1, 'left') && !hasClass(obj2, 'left')){
		obj1.className = obj1.className.replace( /(?:^|\s)left(?!\S)/g , '' );
		obj1.className += ' right';

		obj2.className = obj2.className.replace( /(?:^|\s)right(?!\S)/g , '' );
		obj2.className += ' left';
	}else if(hasClass(obj1, 'right') && !hasClass(obj2, 'right')){
		obj1.className = obj1.className.replace( /(?:^|\s)right(?!\S)/g , '' );
		obj1.className += ' left';

		obj2.className = obj2.className.replace( /(?:^|\s)left(?!\S)/g , '' );
		obj2.className += ' right';
	}
}
function hasClass(object, clazz) {
	var classes = object.className.split(' ');
	for(var i = 0; i < classes.length; i++){
		if(classes[i] === clazz)
			return true;
	}	
	return false;
}
var restoreObject = function(object){
	var restoredObj;
	switch(object.id.split('-')[0]){
		case 'note':
			restoredObj = new Note();
		break;

		case 'weather':
			restoredObj = new Weather();
		break;
	}
	for(var prop in object){
		restoredObj[prop] = object[prop];
	}
	return restoredObj;
}
var DraggableDiv = function(position) {
	this.classes = 'draggable-div box-shadow-2dp';

    if(position === 'left'){
        this.position = 'left';
        this.classes += ' left';
    }else if(position === 'right'){
        this.position = 'right';
        this.classes += ' right';
    }
    this.draggable = true;
    this.ondragstart = drag;	
	this.ondragover = allowDrop;
	this.ondrop = drop;	
}
DraggableDiv.prototype.render = function(){
	var div = document.createElement('div');
	
	div.className = this.classes;
    div.id = this.id;
    if(this.draggable)
        div.setAttribute('draggable', true);

	div.ondragstart = drag;	
	div.ondragover = allowDrop;
	div.ondrop = drop;

	return div;
}

var Note = function(position){
	DraggableDiv.call(this, position);
	this.contents = '';
	elementCounts.notes++;
	this.id = 'note-' + elementCounts.notes;
}
Note.prototype = Object.create(DraggableDiv.prototype);
Note.prototype.constructor = DraggableDiv;
Note.prototype.render = function(){
	var div = DraggableDiv.prototype.render.call(this);
	var note = document.createElement('textarea');
	var save = document.createElement('div');
	var saveBtn = document.createElement('i');

	note.className = 'note';	
	note.id = this.noteId;
	note.value = this.contents;
	
	save.className = 'small-icon box-shadow-6dp';
	
	saveBtn.className = 'fa fa-floppy-o fa-2x';
	saveBtn.addEventListener('click', saveNote , false);
	save.appendChild(saveBtn);
	div.appendChild(save);
	div.appendChild(note);

	return div;
}
function saveNote(object){
	var parentDiv = getParentDraggableDiv(object.srcElement);
	var contents = object.srcElement.parentNode.parentNode.getElementsByTagName('textarea')[0];
	var note = JSON.parse(localStorage.getItem(parentDiv.id));
	if(note !== null){
		note.contents = contents.value;
	}
	localStorage.setItem(note.id, JSON.stringify(note));
}

var Weather = function(position){
	DraggableDiv.call(this, position);
	elementCounts.weather++;
	this.id = 'weather-' + elementCounts.weather;
	this.zipCode = undefined;
	this.countryCode = undefined;
	this.city = undefined;
	this.current = {
		cod: undefined,
		condition : undefined,
		conditionId : undefined,
		description : undefined,
		temp : undefined,
		min : undefined,
		max : undefined,
		updated : undefined
	}
}
Weather.prototype = Object.create(DraggableDiv.prototype);
Weather.prototype.constructor = DraggableDiv;
Weather.prototype.apiCall = 'http://api.openweathermap.org/data/2.5/weather?zip={zipCode},{countryCode}&units=imperial&appid={key}';
Weather.prototype.apiKey = 'b25900a396db73aaf71e7f373b4ca5d6';
Weather.prototype.render = function(){
	var div = DraggableDiv.prototype.render.call(this);
	console.log(this.current.cod);
	
	var background = document.createElement('div');
	background.className = 'weather-background';
	if((this.city !== undefined) && (this.current.cod === 200)){
		var weatherMain = document.createElement('div');
		weatherMain.className = 'weather-main';
		var row1 = document.createElement('span');
		row1.className = 'row1';
		row1.innerHTML = this.city;
		var temp = document.createElement('span');
		temp.className = 'temp';
		temp.innerHTML = this.current.temp + '&deg;';
		var br = document.createElement('br');
		var row2 = document.createElement('span');
		row2.className = 'row2';
		row2.innerHTML = this.current.condition;
		var icon = document.createElement('i');
		var iconClass = 'wi-owm-' + this.current.conditionId;
		icon.className = 'wi ' + iconClass + ' weather-icon';

		var updatedAt = document.createElement('span');
		try{
			var date = new Date().toLocaleString(this.current.updated)
			updatedAt.innerHTML = 'As of ' + date;
			updatedAt.className = 'weather-bot';
		}catch(e){
			console.log(e);
		}		

		weatherMain.appendChild(row1);
		weatherMain.appendChild(temp);
		weatherMain.appendChild(br);
		weatherMain.appendChild(row2);
		weatherMain.appendChild(icon);
		weatherMain.appendChild(updatedAt);

		background.appendChild(weatherMain);
	}else if(this.current.cod !== undefined){
		var errorMessage = document.createElement('div');
		errorMessage.className = 'error';
		var message = document.createElement('span');
		if(this.current.cod === '404'){
			message.innerHTML = 'CITY NOT FOUND';
		}else{
			message.innerHTML = 'ERROR RETRIEVING FORECAST';
		}
		errorMessage.appendChild(message);
		console.log(errorMessage);
		background.appendChild(errorMessage);
	}
	div.appendChild(background);

	var inputBlock = document.createElement('div');
	inputBlock.className = 'inputBlock';
	var zipInput = document.createElement('input');
	zipInput.type = 'text';
	zipInput.setAttribute = 'required';
	if(this.zipCode !== undefined)
		zipInput.value = this.zipCode;
	else
		zipInput.placeholder = 'Zip Code'
	zipInput.className = 'item';
	var countryDropdown = getCountryDropdown();
	countryDropdown.className = 'item';
	var button = document.createElement('div');
	button.className = 'item button box-shadow-6dp';
	var icon = document.createElement('i');
	icon.className = 'fa fa-search';
	button.appendChild(icon);
	button.addEventListener('click', this.weatherSearch, false); 

	inputBlock.appendChild(zipInput);
	inputBlock.appendChild(countryDropdown);
	inputBlock.appendChild(button);

	div.appendChild(inputBlock);

	return div;
}

Weather.prototype.weatherSearch = function() {
	var parent = getParentDraggableDiv(this);
	var zip = parent.getElementsByTagName('input')[0].value;
	var country = parent.getElementsByTagName('select')[0].value;
	if(zip.length > 0 && country.length > 0){
		var weather = restoreObject(JSON.parse(localStorage.getItem(parent.id)));
		weather.getCurrentWeather(zip, country);
	}else{
		//validation message
	}
}

Weather.prototype.getCurrentWeather = function (zipCode, countryCode) {
	var request;
	var url = Weather.prototype.apiCall;
	url = url.replace('{zipCode}', zipCode);
	url = url.replace('{countryCode}', countryCode);
	url = url.replace('{key}', Weather.prototype.apiKey);

	if(window.XMLHttpRequest){
		request = new XMLHttpRequest();
	}else{
		request = new ActiveXObject('Microsoft.XMLHTTP');
	}
	var bindWeatherData = function() {
		if(request.readyState === 4 && request.status === 200){
			var result =  JSON.parse(request.responseText);
			console.log(result);
			this.current.cod = result['cod'];
			if(result['cod'] === 200){				
				this.city = result['name'];
				this.current.description = result['weather'][0].description;
				this.current.condition = result['weather'][0].main;
				this.current.conditionId = result['weather'][0].id;
				this.current.temp = result['main'].temp;
				this.current.min = result['main'].temp_min;
				this.current.max = result['main'].temp_max;
				this.current.updated = Date.now();
			}else{
				this.city = undefined;
				this.current.description = undefined;
				this.current.condition = undefined;
				this.current.conditionId = undefined;
				this.current.temp = undefined;
				this.current.min = undefined;
				this.current.max = undefined;
				this.current.updated = undefined;
			}
			this.zipCode = zipCode;
			this.countryCode = countryCode;
			if(document.getElementById(this.id) !== null)
				replaceElement(document.getElementById(this.id), this);
			localStorage.setItem(this.id, JSON.stringify(this));
		}
	}

	request.open('GET', url);
	request.onreadystatechange = bindWeatherData.bind(this);
	request.send();
}

var DraggableDock = function(position) {
	this.classes = 'draggable-div-dock';

    if(position === 'left'){
        this.position = 'left';
        this.classes += ' left';
    }else if(position === 'right'){
        this.position = 'right';
        this.classes += ' right';
    }
    elementCounts.docks++;
    this.id = 'dock-' + elementCounts.docks;
    this.draggable = true;
    this.ondragstart = drag;	
	this.ondragover = allowDrop;
	this.ondrop = drop;	
}
DraggableDock.prototype = Object.create(DraggableDiv.prototype);
DraggableDock.prototype.constructor = DraggableDiv;

function getCountryDropdown(){
	var countries = {
		US: "United States",
		AFG: "Afghanistan",
		ALB: "Albania",
		ALG: "Algeria",
		AND: "Andorra",
		ANG: "Angola",
		ANT: "Antigua and Barbuda",
		ARG: "Argentina",
		ARM: "Armenia",
		ARU: "Aruba",
		ASA: "American Samoa",
		AUS: "Australia",
		AUT: "Austria",
		AZE: "Azerbaijan",
		BAH: "Bahamas",
		BAN: "Bangladesh",
		BAR: "Barbados",
		BDI: "Burundi",
		BEL: "Belgium",
		BEN: "Benin",
		BER: "Bermuda",
		BHU: "Bhutan",
		BIH: "Bosnia and Herzegovina",
		BIZ: "Belize",
		BLR: "Belarus",
		BOL: "Bolivia",
		BOT: "Botswana",
		BRA: "Brazil",
		BRN: "Bahrain",
		BRU: "Brunei",
		BUL: "Bulgaria",
		BUR: "Burkina Faso",
		CAF: "Central African Republic",
		CAM: "Cambodia",
		CAN: "Canada",
		CAY: "Cayman Islands",
		CGO: "Congo",
		CHA: "Chad",
		CHI: "Chile",
		CHN: "China",
		CIV: "Cote d'Ivoire",
		CMR: "Cameroon",
		COD: "DR Congo",
		COK: "Cook Islands",
		COL: "Colombia",
		COM: "Comoros",
		CPV: "Cape Verde",
		CRC: "Costa Rica",
		CRO: "Croatia",
		CUB: "Cuba",
		CYP: "Cyprus",
		CZE: "Czech Republic",
		DEN: "Denmark",
		DJI: "Djibouti",
		DMA: "Dominica",
		DOM: "Dominican Republic",
		ECU: "Ecuador",
		EGY: "Egypt",
		ERI: "Eritrea",
		ESA: "El Salvador",
		ESP: "Spain",
		EST: "Estonia",
		ETH: "Ethiopia",
		FIJ: "Fiji",
		FIN: "Finland",
		FRA: "France",
		FSM: "Micronesia",
		GAB: "Gabon",
		GAM: "Gambia",
		GBR: "Great Britain",
		GBS: "Guinea-Bissau",
		GEO: "Georgia",
		GEQ: "Equatorial Guinea",
		GER: "Germany",
		GHA: "Ghana",
		GRE: "Greece",
		GRN: "Grenada",
		GUA: "Guatemala",
		GUI: "Guinea",
		GUM: "Guam",
		GUY: "Guyana",
		HAI: "Haiti",
		HKG: "Hong Kong",
		HON: "Honduras",
		HUN: "Hungary",
		INA: "Indonesia",
		IND: "India",
		IRI: "Iran",
		IRL: "Ireland",
		IRQ: "Iraq",
		ISL: "Iceland",
		ISR: "Israel",
		ISV: "Virgin Islands",
		ITA: "Italy",
		IVB: "British Virgin Islands",
		JAM: "Jamaica",
		JOR: "Jordan",
		JPN: "Japan",
		KAZ: "Kazakhstan",
		KEN: "Kenya",
		KGZ: "Kyrgyzstan",
		KIR: "Kiribati",
		KOR: "South Korea",
		KSA: "Saudi Arabia",
		KUW: "Kuwait",
		LAO: "Laos",
		LAT: "Latvia",
		LBA: "Libya",
		LBR: "Liberia",
		LCA: "Saint Lucia",
		LES: "Lesotho",
		LIB: "Lebanon",
		LIE: "Liechtenstein",
		LTU: "Lithuania",
		LUX: "Luxembourg",
		MAD: "Madagascar",
		MAR: "Morocco",
		MAS: "Malaysia",
		MAW: "Malawi",
		MDA: "Moldova",
		MDV: "Maldives",
		MEX: "Mexico",
		MGL: "Mongolia",
		MHL: "Marshall Islands",
		MKD: "Macedonia",
		MLI: "Mali",
		MLT: "Malta",
		MNE: "Montenegro",
		MON: "Monaco",
		MOZ: "Mozambique",
		MRI: "Mauritius",
		MTN: "Mauritania",
		MYA: "Myanmar",
		NAM: "Namibia",
		NCA: "Nicaragua",
		NED: "Netherlands",
		NEP: "Nepal",
		NGR: "Nigeria",
		NIG: "Niger",
		NOR: "Norway",
		NRU: "Nauru",
		NZL: "New Zealand",
		OMA: "Oman",
		PAK: "Pakistan",
		PAN: "Panama",
		PAR: "Paraguay",
		PER: "Peru",
		PHI: "Philippines",
		PLE: "Palestine",
		PLW: "Palau",
		PNG: "Papua New Guinea",
		POL: "Poland",
		POR: "Portugal",
		PRK: "North Korea",
		PUR: "Puerto Rico",
		QAT: "Qatar",
		ROU: "Romania",
		RSA: "South Africa",
		RUS: "Russia",
		RWA: "Rwanda",
		SAM: "Samoa",
		SEN: "Senegal",
		SEY: "Seychelles",
		SIN: "Singapore",
		SKN: "Saint Kitts and Nevis",
		SLE: "Sierra Leone",
		SLO: "Slovenia",
		SMR: "San Marino",
		SOL: "Solomon Islands",
		SOM: "Somalia",
		SRB: "Serbia",
		SRI: "Sri Lanka",
		STP: "Sao Tome and Principe",
		SUD: "Sudan",
		SUI: "Switzerland",
		SUR: "Suriname",
		SVK: "Slovakia",
		SWE: "Sweden",
		SWZ: "Swaziland",
		SYR: "Syria",
		TAN: "Tanzania",
		TGA: "Tonga",
		THA: "Thailand",
		TJA: "Tajikistan",
		TKM: "Turkmenistan",
		TLS: "Timor-Leste",
		TOG: "Togo",
		TPE: "Chinese Taipei",
		TRI: "Trinidad and Tobago",
		TUN: "Tunisia",
		TUR: "Turkey",
		TUV: "Tuvalu",
		UAE: "United Arab Emirates",
		UGA: "Uganda",
		UKR: "Ukraine",
		URU: "Uruguay",
		UZB: "Uzbekistan",
		VAN: "Vanuatu",
		VEN: "Venezuela",
		VIE: "Vietnam",
		VIN: "Saint Vincent and the Grenadines",
		YEM: "Yemen",
		ZAM: "Zambia",
		ZIM: "Zimbabwe"	
	}
	var select = document.createElement('select');
	for(var key in countries) {
	    var option = document.createElement('option');
	    option.value = key
	    option.text = countries[key];
	    select.appendChild(option);
	}
	return select;
}