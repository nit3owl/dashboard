"use strict";

const TIMEOUT = 300000;
const MAX_DOCKS = 4;

let elementCounts = {
    docks: 0,
    notes: 0,
    weather: 0,
    dice: 0
}

window.onload = function () {
    if (typeof (Storage) !== 'undefined') {
        //load saved elements
        if (localStorage.getItem('positions') === null) {
            let positions = {};
            localStorage.setItem('positions', JSON.stringify(positions));
        } else {
            let positions = JSON.parse(localStorage.getItem('positions'));
            for (let key in positions) {
                let temp = JSON.parse(localStorage.getItem(key));
                let obj = restoreObject(temp);
                if (obj instanceof Weather) {
                    //check to see if forecast should be refreshed
                    if (obj.current.updated + TIMEOUT <= Date.now())
                        obj.getCurrentWeather(obj.zipCode, obj.countryCode);
                }
                renderElement(obj, positions[key]);
            }
        }
    } else {
        console.log('localStorage not supported');
        alert('Your broswer does not support localStorage; saving will fail.');
    }

    let docks = document.getElementsByClassName('draggable-div-dock');
    for (let i = 0; i < docks.length; i++) {
        docks[i].ondragover = allowDrop;
        docks[i].ondrop = drop;
        docks[i].id = 'dock-' + (i + 1);
    }
    elementCounts.docks = docks.length;

    let trash = document.getElementById('trashcan');
    trash.ondragover = allowDrop;
    trash.ondrop = drop;
    trash.onclick = deleteAllDraggables;

    document.getElementById('note').addEventListener('click', addNote, false);
    document.getElementById('weather').addEventListener('click', addWeather, false);
    document.getElementById('dice').addEventListener('click', addDice, false);

    window.addEventListener('resize', resizeCanvases, false);

    resizeCanvases();

}

function resizeCanvases() {
    let canvases = document.getElementsByTagName('canvas');
    for (let i = 0; i < canvases.length; i++) {
        let canvas = canvases[i];
        resizeCanvas(canvas);
    }
}

function resizeCanvas(canvas) {
    let parent = getParentDiv(canvas);
    if (parent != null) {
        canvas.height = parent.clientHeight - 1;
        canvas.width = parent.clientWidth - 1;
    }
}

function getParentDiv(elem) {
    while (elem !== undefined) {
        if (elem.parentNode.nodeName === 'DIV')
            return elem.parentNode;
        else
            elem = elem.parentNode;
    }
    return null;
}
function getParentDraggableDiv(elem) {
    while (!~elem.className.indexOf('draggable-div')) {
        elem = elem.parentNode;
    }
    return elem;
}
function allowDrop(event) {
    event.preventDefault();
}
function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}
function drop(event) {
    event.preventDefault();
    let source = document.getElementById(event.dataTransfer.getData('text'));
    let target = event.target;
    if (target.id !== 'trashcan') {
        swapElements(source, target);
    } else {
        deleteElement(source);
    }
}
function deleteElement(object) {
    localStorage.removeItem(object.id);
    let positions = JSON.parse(localStorage.getItem('positions'));
    delete positions[object.id];
    localStorage.setItem('positions', JSON.stringify(positions));
    let left = hasClass(object, 'left');
    if (left) {
        object.parentNode.replaceChild(new DraggableDock('left').render(), object);
    } else {
        object.parentNode.replaceChild(new DraggableDock('right').render(), object);
    }
}
function deleteAllDraggables() {
    let confirmed = confirm('Are you sure you want to delete all widgets?');
    if (confirmed) {
        let draggables = document.getElementsByClassName('draggable-div');
        let count = draggables.length;
        for (let i = 0; i < count; i++) {
            deleteElement(draggables[0]);
        }
        localStorage.clear();
        let positions = {};
        localStorage.setItem('positions', JSON.stringify(positions));
    }
}
function addElement(type) {
    let docks = document.getElementsByClassName('draggable-div-dock');
    if (docks.length > 0) {
        let dock = docks[0];
        let position = hasClass(dock, 'left') ? 'left' : 'right';
        let obj;
        switch (type) {
            case 'note':
                obj = new Note(position);
                break;
            case 'weather':
                obj = new Weather(position);
                break;
            case 'dice':
                obj = new Dice(position);
                break;
        }
        renderElement(obj);

        localStorage.setItem(obj.id, JSON.stringify(obj));
        updatePosition(obj, (MAX_DOCKS - elementCounts.docks - 1));
    }
}
function renderElement(object, position) {
    if (position === undefined) {
        let docks = document.getElementsByClassName('draggable-div-dock');
        if (docks.length > 0) {
            let dock = docks[0];
            dock.parentNode.replaceChild(object.render(), dock);
        }
    } else {
        let draggables = document.querySelectorAll('div.draggable-div, div.draggable-div-dock');
        let draggable = draggables[position];
        draggable.parentNode.replaceChild(object.render(), draggable);
        updatePosition(object, position);
    }
    elementCounts.docks--;
}
function updatePosition(object, position) {
    let positions = JSON.parse(localStorage.getItem('positions'))
    positions[object.id] = position;
    localStorage.setItem('positions', JSON.stringify(positions));
}
function replaceElement(target, element) {
    let position = JSON.parse(localStorage.getItem('positions'))[target.id];
    deleteElement(target);
    renderElement(element, position);
}
function addNote() {
    addElement('note');
}
function addWeather() {
    addElement('weather');
}
function addDice() {
    addElement('dice');
}
//https://stackoverflow.com/questions/10716986/swap-2-html-elements-and-preserve-event-listeners-on-them
function swapElements(obj1, obj2) {
    //swap keys in positions array to maintain order on reload
    let positions = JSON.parse(localStorage.getItem('positions'));
    if (obj2.id.split('-')[0] === 'dock') {
        let draggables = document.querySelectorAll('div.draggable-div, div.draggable-div-dock');
        for (let i = 0; i < draggables.length; i++) {
            if (draggables[i].id === obj2.id) {
                positions[obj1.id] = i;
                break;
            }
        }
    } else {
        let temp = positions[obj1.id];
        positions[obj1.id] = positions[obj2.id];
        positions[obj2.id] = temp;
    }
    localStorage.setItem('positions', JSON.stringify(positions));

    //now actually swap the items
    //if necessary, swap left/right classes
    swapLeftRight(obj1, obj2);
    // create marker element and insert it where obj1 is
    let temp = document.createElement('div');
    obj1.parentNode.insertBefore(temp, obj1);
    // move obj1 to right before obj2
    obj2.parentNode.insertBefore(obj1, obj2);
    // move obj2 to right before where obj1 used to be
    temp.parentNode.insertBefore(obj2, temp);
    // remove temporary marker node
    temp.parentNode.removeChild(temp);

    //swap classes as necssary
}
function swapLeftRight(obj1, obj2) {
    if (hasClass(obj1, 'left') && !hasClass(obj2, 'left')) {
        obj1.className = obj1.className.replace(/(?:^|\s)left(?!\S)/g, '');
        obj1.className += ' right';
        let object = JSON.parse(localStorage.getItem(obj1.id));
        if (object !== null) {
            object.classes[object.classes.indexOf('left')] = 'right';
            localStorage.setItem(object.id, JSON.stringify(object));
        }

        obj2.className = obj2.className.replace(/(?:^|\s)right(?!\S)/g, '');
        obj2.className += ' left';
        object = JSON.parse(localStorage.getItem(obj2.id));
        if (object !== null) {
            object.classes[object.classes.indexOf('right')] = 'left';
            localStorage.setItem(object.id, JSON.stringify(object));
        }
    } else if (hasClass(obj1, 'right') && !hasClass(obj2, 'right')) {
        obj1.className = obj1.className.replace(/(?:^|\s)right(?!\S)/g, '');
        obj1.className += ' left';
        let object = JSON.parse(localStorage.getItem(obj1.id));
        if (object !== null) {
            object.classes[object.classes.indexOf('right')] = 'left';
            localStorage.setItem(object.id, JSON.stringify(object));
        }

        obj2.className = obj2.className.replace(/(?:^|\s)left(?!\S)/g, '');
        obj2.className += ' right';
        object = JSON.parse(localStorage.getItem(obj2.id));
        if (object !== null) {
            object.classes[object.classes.indexOf('left')] = 'right';
            localStorage.setItem(object.id, JSON.stringify(object));
        }
    }
}
function hasClass(object, clazz) {
    let classes = object.className.split(' ');
    for (let i = 0; i < classes.length; i++) {
        if (classes[i] === clazz)
            return true;
    }
    return false;
}

function restoreObject(object) {
    let restoredObj;
    switch (object.id.split('-')[0]) {
        case 'note':
            restoredObj = new Note();
            break;

        case 'weather':
            restoredObj = new Weather();
            break;

        case 'dice':
            restoredObj = new Dice();
            break;
    }
    for (let prop in object) {
        restoredObj[prop] = object[prop];
    }
    return restoredObj;
}

class DraggableDiv {
    constructor(position) {
        this.position = position;
        this.classes = ['draggable-div', 'box-shadow-2dp'];

        if (position === 'left') {
            this.position = 'left';
            this.classes.push('left');
        } else if (position === 'right') {
            this.position = 'right';
            this.classes.push(' right');
        }
        this.draggable = true;
        this.ondragstart = drag;
        this.ondragover = allowDrop;
        this.ondrop = drop;
    }

    render() {
        let div = document.createElement('div');

        for (let i = 0; i < this.classes.length - 1; i++) {
            div.className += this.classes[i] + ' ';
        }
        div.className += this.classes[this.classes.length - 1];

        div.id = this.id;
        if (this.draggable)
            div.setAttribute('draggable', true);

        div.ondragstart = drag;
        div.ondragover = allowDrop;
        div.ondrop = drop;

        return div;
    }
}

class Note extends DraggableDiv {
    constructor(position) {
        super(position);
        this.contents = '';
        elementCounts.notes++;
        this.id = 'note-' + elementCounts.notes;
    }

    render() {
        let div = super.render(this);
        let note = document.createElement('textarea');
        let save = document.createElement('div');
        let saveBtn = document.createElement('i');

        note.className = 'note';
        note.id = this.noteId;
        note.value = this.contents;

        save.className = 'small-icon box-shadow-6dp';

        saveBtn.className = 'fa fa-floppy-o fa-2x';
        saveBtn.addEventListener('click', this.saveNote, false);
        save.appendChild(saveBtn);
        div.appendChild(save);
        div.appendChild(note);

        return div;
    }

    saveNote(e) {
        let parentDiv = getParentDraggableDiv(this);
        let contents = parentDiv.getElementsByTagName('textarea')[0];
        //let contents = object.srcElement.parentNode.parentNode.getElementsByTagName('textarea')[0];
        let note = JSON.parse(localStorage.getItem(parentDiv.id));
        if (note !== null) {
            note.contents = contents.value;
        }
        localStorage.setItem(note.id, JSON.stringify(note));
    }
}
function saveNote(object) {

}

class Weather extends DraggableDiv {
    constructor(position) {
        super(position);
        elementCounts.weather++;
        this.id = 'weather-' + elementCounts.weather;
        this.zipCode = undefined;
        this.countryCode = undefined;
        this.city = undefined;
        this.current = {
            cod: undefined,
            condition: undefined,
            conditionId: undefined,
            description: undefined,
            temp: undefined,
            min: undefined,
            max: undefined,
            updated: undefined
        }
    }

    render() {
        let div = DraggableDiv.prototype.render.call(this);
        let background = document.createElement('div');
        background.className = 'light-background';
        if ((this.city !== undefined) && (this.current.cod === 200)) {
            let weatherMain = document.createElement('div');
            weatherMain.className = 'weather-main';
            let row1 = document.createElement('span');
            row1.className = 'row1';
            row1.innerHTML = this.city;
            let temp = document.createElement('span');
            temp.className = 'temp';
            temp.innerHTML = this.current.temp + '&deg;';
            let br = document.createElement('br');
            let row2 = document.createElement('span');
            row2.className = 'row2';
            row2.innerHTML = this.current.condition;
            let icon = document.createElement('i');
            let iconClass = 'wi-owm-' + this.current.conditionId;
            icon.className = 'wi ' + iconClass + ' weather-icon';

            let updatedAt = document.createElement('span');
            try {
                let date = new Date().toLocaleString(this.current.updated)
                updatedAt.innerHTML = 'As of ' + date;
                updatedAt.className = 'weather-bot';
            } catch (e) {
                console.log(e);
            }

            weatherMain.appendChild(row1);
            weatherMain.appendChild(temp);
            weatherMain.appendChild(br);
            weatherMain.appendChild(row2);
            weatherMain.appendChild(icon);
            weatherMain.appendChild(updatedAt);

            background.appendChild(weatherMain);
        } else if (this.current.cod !== undefined) {
            let errorMessage = document.createElement('div');
            errorMessage.className = 'error';
            let message = document.createElement('span');
            if (this.current.cod === '404') {
                message.innerHTML = 'CITY NOT FOUND';
            } else {
                message.innerHTML = 'ERROR RETRIEVING FORECAST';
            }
            errorMessage.appendChild(message);
            console.log(errorMessage);
            background.appendChild(errorMessage);
        }
        div.appendChild(background);

        let inputBlock = document.createElement('div');
        inputBlock.className = 'inputBlock';
        let form = document.createElement('form');
        form.addEventListener('submit', this.weatherSearch, false);
        let zipInput = document.createElement('input');
        zipInput.type = 'text';
        zipInput.setAttribute = 'required';
        if (this.zipCode !== undefined)
            zipInput.value = this.zipCode;
        else
            zipInput.placeholder = 'Zip Code'
        zipInput.className = 'item';
        form.appendChild(zipInput);
        let countryDropdown = getCountryDropdown();
        countryDropdown.className = 'item';
        let button = document.createElement('div');
        button.className = 'item button box-shadow-6dp';
        let icon = document.createElement('i');
        icon.className = 'fa fa-search';
        button.appendChild(icon);
        button.addEventListener('click', this.weatherSearch, false);

        inputBlock.appendChild(form);
        inputBlock.appendChild(countryDropdown);
        inputBlock.appendChild(button);

        div.appendChild(inputBlock);

        return div;
    }

    weatherSearch(e) {
        let parent = getParentDraggableDiv(this);
        let zip = parent.getElementsByTagName('input')[0].value;
        let country = parent.getElementsByTagName('select')[0].value;
        if (zip.length > 0 && country.length > 0) {
            let weather = restoreObject(JSON.parse(localStorage.getItem(parent.id)));
            weather.getCurrentWeather(zip, country);
        } else {
            //validation message
        }
        e.stopPropagation();
        e.preventDefault();
    }

    getCurrentWeather(zipCode, countryCode) {
        let request;
        let url = Weather.prototype.apiCall;
        url = url.replace('{zipCode}', zipCode);
        url = url.replace('{countryCode}', countryCode);
        url = url.replace('{key}', Weather.prototype.apiKey);

        if (window.XMLHttpRequest) {
            request = new XMLHttpRequest();
        } else {
            request = new ActiveXObject('Microsoft.XMLHTTP');
        }
        let bindWeatherData = function () {
            if (request.readyState === 4 && request.status === 200) {
                let result = JSON.parse(request.responseText);
                this.current.cod = result['cod'];
                if (result['cod'] === 200) {
                    this.city = result['name'];
                    this.current.description = result['weather'][0].description;
                    this.current.condition = result['weather'][0].main;
                    this.current.conditionId = result['weather'][0].id;
                    this.current.temp = result['main'].temp;
                    this.current.min = result['main'].temp_min;
                    this.current.max = result['main'].temp_max;
                    this.current.updated = Date.now();
                } else {
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
                if (document.getElementById(this.id) !== null)
                    replaceElement(document.getElementById(this.id), this);
                localStorage.setItem(this.id, JSON.stringify(this));
            }
        }

        request.open('GET', url);
        request.onreadystatechange = bindWeatherData.bind(this);
        request.send();
    }
}
Weather.prototype.apiCall = 'http://api.openweathermap.org/data/2.5/weather?zip={zipCode},{countryCode}&units=imperial&appid={key}';
Weather.prototype.apiKey = 'b25900a396db73aaf71e7f373b4ca5d6';

class Dice extends DraggableDiv {
    constructor(position) {
        super(position);
        elementCounts.dice++;
        this.id = 'dice-' + elementCounts.dice;
    }

    render() {
        let div = DraggableDiv.prototype.render.call(this);
        let background = document.createElement('div');
        background.className = 'light-background';
        let canvas = document.createElement('canvas');
        canvas.className = 'canvas';
        canvas.id = 'canvas-' + elementCounts.dice;
        background.appendChild(canvas);

        let inputBlock = document.createElement('div');
        inputBlock.className = 'inputBlock';

        let select = document.createElement('select');
        select.className = 'item';
        let option = document.createElement('option');
        option.value = 2;
        option.text = 'Two Dice';
        select.appendChild(option);

        option = document.createElement('option');
        option.value = 1;
        option.text = '1 Die';
        select.appendChild(option);

        let button = document.createElement('div');
        button.className = 'item button-medium box-shadow-6dp';
        button.textContent = 'Roll Dice';
        button.addEventListener('click', this.roll, false);

        inputBlock.appendChild(select);
        inputBlock.appendChild(button);

        div.appendChild(background);
        div.appendChild(inputBlock);
        return div;
    }

    roll() {
        let parentDraggable = getParentDraggableDiv(this);
        let canvas = parentDraggable.getElementsByTagName('div')[0].getElementsByTagName('canvas')[0];
        let fallback = getParentDiv(canvas);
        let size;
        let yOffset;
        let xOffset;
        let renderContext;

        //if canvas has default dimensions, resize to fit div
        if (canvas.width === 300 && canvas.height === 150)
            resizeCanvas(canvas);

        size = canvas.height - (Math.floor(canvas.height * 0.5));
        yOffset = (canvas.height - size) / 2;

        if (parseInt(parentDraggable.getElementsByTagName('select')[0].value) === 1) {
            //technically, this isn't exactly centered, but it looks odd cented due to gradient
            xOffset = (canvas.width / 2) - ((size * 1.5) / 2);
            renderContext = new RenderContext(canvas, xOffset, yOffset, size, fallback, true);
            drawDie(renderContext);
        } else {
            xOffset = Math.floor((canvas.width - (size * 2.5)) / 3);
            //draw die 1
            renderContext = new RenderContext(canvas, xOffset, yOffset, size, fallback, true);
            drawDie(renderContext);
            //draw die 2
            renderContext = new RenderContext(canvas, (size + xOffset * 2), yOffset, size, fallback, false);
            drawDie(renderContext);
        }
    }
}

class DraggableDock extends DraggableDiv {
    constructor(position) {
        super(position);
        this.classes = ['draggable-div-dock'];

        if (position === 'left') {
            this.position = 'left';
            this.classes.push('left');
        } else if (position === 'right') {
            this.position = 'right';
            this.classes.push('right');
        }
        elementCounts.docks++;
        this.id = 'dock-' + elementCounts.docks;
        this.draggable = true;
        this.ondragstart = drag;
        this.ondragover = allowDrop;
        this.ondrop = drop;
    }
}

function getCountryDropdown() {
    let countries = {
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
    let select = document.createElement('select');
    for (let key in countries) {
        let option = document.createElement('option');
        option.value = key
        option.text = countries[key];
        select.appendChild(option);
    }
    return select;
}