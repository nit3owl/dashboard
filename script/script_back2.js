"use strict";

window.onload = function() {
	if(typeof(Storage) !== "undefined") {
		//load notes
		for(var i = 0; i < localStorage.length; i++){
			var key = localStorage.key(i);
			var position = 'right';
			if(i % 2 === 0)
				position = 'left';
			var note = new Note(position);
			note.contents = localStorage.getItem(key);
			addElement(note);
		}

	} else {
	    console.log("localStorage not supported");
	}

	var docks = document.getElementsByClassName('draggable-div-dock');
	for(var i = 0; i < docks.length; i++){
		docks[i].ondragover = allowDrop;
		docks[i].ondrop = drop;		
		docks[i].id = 'dock-' + i;
	}

	var trash = document.getElementById('trashcan');
	trash.ondragover = allowDrop;
	trash.ondrop = drop;
	trash.onclick = deleteAllDraggables;

	document.getElementById('note').addEventListener('click', addNote , false);
	//document.getElementById('weather').addEventListener('click', addNote , false);
	//document.getElementById('timer').addEventListener('click', addNote , false);
	//document.getElementById('change'.addEventListener('click', addNote , false);
}

function saveNote(object){
	var note = object.srcElement.parentNode.parentNode.getElementsByTagName('textarea')[0];
	localStorage.setItem(note.id, note.value);
}

function allowDrop(event) {
	event.preventDefault();
}

function drag(event) {
	console.log(event.target);
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
	var left = hasClass(object, 'left');
	if(left){
		object.parentNode.replaceChild(new DraggableDock('left').render(), object);
	}else{
		object.parentNode.replaceChild(new DraggableDock('right').render(), object);
	}
	if(object.getElementsByTagName('textarea').length > -1){
		localStorage.removeItem(object.id);
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
function addElement(object){
	var docks = document.getElementsByClassName('draggable-div-dock');
	if(docks.length > 0){
		var dock = docks[0];
		dock.parentNode.replaceChild(object.render(), dock);
	}
}
function addNote(){
	var docks = document.getElementsByClassName('draggable-div-dock');
	if(docks.length > 0){
		var dock = docks[0];
		var left = hasClass(dock, 'left');
		if(left){
			dock.parentNode.replaceChild(new Note('left').render(), dock);
		}else{
			dock.parentNode.replaceChild(new Note('right').render(), dock);
		}
	}
}
//credit: https://stackoverflow.com/questions/10716986/swap-2-html-elements-and-preserve-event-listeners-on-them
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
var DraggableDiv = function(position) {
	this.classes = 'draggable-div box-shadow-2dp';

    if(position === 'left'){
        this.position = 'left';
        this.classes += ' left';
    }else if(position === 'right'){
        this.position = 'right';
        this.classes += ' right';
    }
    this.id = 'dock-' + 0;
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
}
Note.prototype = Object.create(DraggableDiv.prototype);
Note.prototype.constructor = DraggableDiv;

Note.prototype.render = function(){
	var div = DraggableDiv.prototype.render.call(this);
	var note = document.createElement('textarea');
	var save = document.createElement('div');
	var saveBtn = document.createElement('i');

	note.className = 'note';
	note.id = 'note-' + (document.getElementsByClassName('note').length);
	note.value = this.contents;
	
	save.className = 'small-icon box-shadow-6dp';
	
	saveBtn.className = 'fa fa-floppy-o fa-2x';
	saveBtn.addEventListener('click', saveNote , false);
	save.appendChild(saveBtn);
	div.appendChild(save);
	div.appendChild(note);

	return div;
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
    this.id = 'dock-' + 0;
    this.draggable = true;
    this.ondragstart = drag;	
	this.ondragover = allowDrop;
	this.ondrop = drop;	
}
DraggableDock.prototype = Object.create(DraggableDiv.prototype);
DraggableDock.prototype.constructor = DraggableDiv;