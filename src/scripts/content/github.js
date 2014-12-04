/*global window: false, chrome:false */
'use strict';


/* create trello button */
var create_trello_link_gh_issue = function () {

    /* identify what element in dom we are appending to */
    var selectedElement = document.querySelector('.flex-table-item-primary');

    var trelloButtonImage = document.createElement('img');
    trelloButtonImage.src = chrome.extension.getURL("/images/trello_favico_19.png");
    trelloButtonImage.height = "19";
    trelloButtonImage.width = "19";
    trelloButtonImage.alt = "Trello Button";
    trelloButtonImage.title = "Create Trello Card";
    trelloButtonImage.style = "float:right;";
    trelloButtonImage.id = "myTrelloButton";


    var closeButton = document.createElement("input");
    closeButton.type = "button";
    closeButton.value = "Close";
    closeButton.id = "dialogCloseBtn";

    var submitButton = document.createElement("input");
    submitButton.type = "button";
    submitButton.value = "Submit";
    submitButton.id = "dialogSubmitBtn";
    submitButton.autofocus = true;


    var par = document.createElement('p');
    par.innerHTML = '';

    var par1 = document.createElement('p');
    par1.innerHTML = '';

    var par2 = document.createElement('p');
    par2.innerHTML = '';


    var labelBoard = document.createElement('label');
    labelBoard.innerHTML = 'Board:';
    labelBoard.id = 'labelBoard';


    var selectBoard = document.createElement('select');
    selectBoard.id = 'dialogBoardSelect';
    selectBoard.addEventListener('change', function (e) {
            console.log('Board select changed');
            load_lists(e.target.value);
        },
        false
    );


    var labelList = document.createElement('label');
    labelList.innerHTML = 'List:';
    labelList.id = 'labelList';


    var selectList = document.createElement('select');
    selectList.id = 'dialogListSelect';
    selectList.addEventListener('change', function (e) {
            console.log('List select changed');
        },
        false
    );


    var trelloDialog = document.createElement('dialog');
    trelloDialog.id = "trelloDialog";
    trelloDialog.appendChild(labelBoard);
    trelloDialog.appendChild(selectBoard);
    trelloDialog.appendChild(par);
    trelloDialog.appendChild(labelList);
    trelloDialog.appendChild(selectList);
    trelloDialog.appendChild(par1);
    trelloDialog.appendChild(closeButton);
    trelloDialog.appendChild(submitButton);


    var trelloButtonLink = document.createElement('a');
    trelloButtonLink.href = "#";
    trelloButtonLink.appendChild(trelloButtonImage);
    trelloButtonLink.addEventListener('click', function (e) {

        console.log('trello button link clicked');
        chrome.extension.sendMessage({type: 'click_TrelloButton'}, function (response) {
        });

        var ghi = {};
        ghi.number = document.querySelector('.gh-header-number').value;
        ghi.short_description = document.querySelector('.js-issue-title').value;
        ghi.description = document.querySelector('.js-issue-title').value;
        ghi.url = document.URL;

        var dialog = document.querySelector('dialog');

        if (!dialog.showModal) {
            dialogPolyfill.registerDialog(dialog); //uncomment for older browser chrome < 37
        }

        document.querySelector('#dialogCloseBtn').onclick = function () {
            dialog.close();
        };

        document.querySelector('#dialogSubmitBtn').onclick = function () {
            var trelloCard = {
                title            : ghi.number,
                short_description: ghi.short_description,
                description      : ghi.description,
                url              : ghi.url,
                idBoard          : document.getElementById("dialogBoardSelect").value,
                idList           : document.getElementById("dialogListSelect").value
            };


            dialog.close();
            chrome.extension.sendMessage({type: 'create_card', trelloCard: trelloCard}, function (response) {
            });
            chrome.extension.sendMessage({type: 'background_log', logObj: {level: 'info', message: 'test log message creating Trello Card'}}, function (response) {
            });
        };

        dialog.showModal();
    });

    selectedElement.appendChild(trelloButtonLink);
    selectedElement.appendChild(trelloDialog);
};

/* load boards */
var load_boards = function () {
    var selectBoard = document.querySelector('#dialogBoardSelect');

    /* clear select */
    while (selectBoard.options.length > 0) {
        selectBoard.remove(0);
    }

    /* get boards from background */
    chrome.extension.sendMessage({type: 'get_boards'}, function (response) {
        console.log('get_boards message response');
        console.dir(response);

        for(var i=0;i < response.boards.length;i++) {
            var opt = document.createElement('option');
            opt.value = response.boards[i].id;
            opt.innerHTML = response.boards[i].name;
            selectBoard.appendChild(opt);
        }

        selectBoard.value = selectBoard.options[0].value; //set default selected
        load_lists(selectBoard.value);
    });
};


/* load lists */
var load_lists = function (idBoard) {
    var selectList = document.querySelector('#dialogListSelect');

    /* clear select */
    while (selectList.options.length > 0) {
        selectList.remove(0);
    }

    chrome.extension.sendMessage({type: 'get_lists', idBoard: idBoard}, function (response) {
        console.log('get_lists message response');
        console.dir(response);

        for (var i = 0; i < response.lists.length; i++) {
            var opt = document.createElement("option");
            opt.value = response.lists[i].id;
            opt.innerHTML = response.lists[i].name;
            selectList.appendChild(opt);
        }

        selectList.value = selectList.options[0].value; //set selected
    });
};

/* initialize */
var init = function () {
    chrome.extension.sendMessage({type: 'render_trello_button'}, function (response) {
    });
    create_trello_link_gh_issue();
    load_boards();
};

init();
