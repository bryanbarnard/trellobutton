var clearData = function () {
	localStorage.removeItem('trello_token');
	localStorage.removeItem('trello_orgs');
};


var $show = function (element_id) {
	document.getElementById(element_id).style.display = '';
};


var $hide = function (element_id) {
	document.getElementById(element_id).style.display = 'none';
};


var $click =  function (element_id, func) {
	document.getElementById(element_id).addEventListener('click', func);
};


var $onLoad = function (func) {
	document.addEventListener('DOMContentLoaded', func, false);
};

var logArrayElements = function (element, index, array) {
    console.log("a[" + index + "] = " + element.name);
};


var saveData = function (obj) {
    localStorage.setItem(obj.name, JSON.stringify(obj));
};


var retrieveData = function (name) {
    if (!localStorage.getItem(name)) {return null;}
    return JSON.parse(localStorage.getItem(name));
};
