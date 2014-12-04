/*global window: false, chrome:false */

"use strict";
var TB_APP_KEY = 'a17fd12937c7b07ed2ab56a5531bc395';
var TrelloButton = {

    $sites: new RegExp(
        [
            'service-now\\.com'
        ].join('|')
    ),

    $boards: [],
    $lists: [],


    checkUrl: function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            if (TrelloButton.$sites.test(tab.url)) {
                TrelloButton.setPageAction(tabId);
            }
        }
    },


    showSettings: function () {
        chrome.tabs.create({url: chrome.extension.getURL('options.html')});
    },


    setPageAction: function (tabId) {
        var imagePath = 'images/trello_favico_19.png';
        chrome.pageAction.setIcon({
            tabId: tabId,
            path: imagePath
        });
        chrome.pageAction.show(tabId);
    },


    /* call trello api to create new card*/
    create_trello_card: function (trelloCard) {

        var xhr = new XMLHttpRequest();
        var key = TB_APP_KEY;
        var token = localStorage.trello_token;
        var api_endpoint = 'https://api.trello.com/1/cards/?key=' + key + '&token=' + token;
        var api_endpoint_runscope = 'https://api-trello-com-fejr5sb8ead6.runscope.net/1/cards/?key=' + key + '&token=' + token;

        xhr.open("POST", api_endpoint_runscope, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        // handle successful response
        xhr.addEventListener('load', function (e) {
            if (this.status === 200) {
                console.log('Job Done! Trello Card Created Successfully');
            }
        });


        // handle error response
        xhr.addEventListener('error', function (e) {
            console.log('error calling Trello API');
        });

        xhr.send("idList=" + trelloCard.idList + "&name=" + trelloCard.title  + "-" + trelloCard.short_description + "&desc=" + trelloCard.description +
            "&urlSource=" + encodeURIComponent(trelloCard.url));
    },


    /* GET Trello boards based on api_key and api_token user */
    getBoards: function (key, token) {
        var xhr = new XMLHttpRequest();
        xhr.onload = TrelloButton.boardsResponseHandler;
        var api_endpoint = 'https://api.trello.com/1/members/me/boards?key=' + key + '&token=' + token + '&filter=open&fields=name';
        xhr.open("GET", api_endpoint, true);
        xhr.send();
    },


    boardsResponseHandler: function () {
        var responseData, boardStorage = { 'name': "boardStorage", 'boards': []};
        responseData = JSON.parse(this.responseText);

        if (this.status === 200 && responseData) {

            for (var i = 0; i < responseData.length; i++) {
                boardStorage.boards.push(responseData[i]);
            }
            saveData(boardStorage);

            TrelloButton.$boards = [];
            TrelloButton.$boards = boardStorage.boards;

            if (TrelloButton.$boards.length > 0) {
                TrelloButton.getLists(localStorage.tb_app_key, localStorage.trello_token, TrelloButton.$boards);
            }

        } else {
            console.error('Unable to retrieve Trello Boards from API');
        }
    },


    getBoardsResponse: function() {
        var boardStorage, boards = [];
        boardStorage = retrieveData('boardStorage');

        // try to use $boards first, if empty try boardStorage (localStorage)
        // if no boards found send an error object

        if (TrelloButton.$boards.length > 0) {
            boards = TrelloButton.$boards;
        } else if (boardStorage && boardStorage.boards.length > 0) {
            boards = boardStorage.boards;
        } else {
            boards = [
                {
                    id: '0',
                    name: 'No Board Found'
                }
            ]
        }
        return boards;
    },

    /* GET Trello lists based on passed in board identifier */
    getListsByBoard: function (boardId, key, token) {
        var xhr = new XMLHttpRequest();
        xhr.onload = TrelloButton.listResponseHandler;
        var api_endpoint = 'https://api.trello.com/1/boards/' + boardId + '/lists?fields=name%2CidBoard&key=' + key + '&token=' + token;
        xhr.open("GET", api_endpoint, true);
        xhr.send();
    },


    /* listen for changes to list select */
    listResponseHandler: function () {
        var listStorage;
        listStorage = { 'name': "listStorage", lists: []};
        var responseData;
        responseData = JSON.parse(this.responseText);

        if (this.status === 200 && responseData) {

            for (var i = 0; i < responseData.length; i++) {
                TrelloButton.$lists.push(responseData[i]);
            }

            listStorage.lists = TrelloButton.$lists;
            saveData(listStorage);
        }
    },

    getLists: function (key, token, boards) {

        for (var i = 0; i < boards.length; i++) {
            TrelloButton.getListsByBoard(boards[i].id, key, token);
        }
    },


    getListsResponse: function (idBoard) {
        var lists = [], listStorage;
        listStorage = retrieveData('listStorage');

        // try to use $lists first, if empty try listStorage (localStorage)
        // if no boards found send an error object

        if (TrelloButton.$lists.length > 0) {
            lists = TrelloButton.$lists;
        } else if (listStorage && listStorage.lists.length > 0) {
            lists = listStorage.lists;
        }

        if (lists.length > 0 && idBoard) {
            // filter list based on board id
            lists = _.where(lists, {idBoard: idBoard});
        } else {
            lists = [
                {
                    id: '0',
                    name: 'No List Found'
                }
            ];
        }
        return lists;
    },

    logger: function(lg) {
        if (lg.level == 'info') {
           console.info(lg.message);
           return;
        }

        if (lg.level == 'error') {
            console.error(lg.message);
            return;
        }

        console.log(lg.message);
    },

    /**
     * message handlers for extension to communicate to content scripts
     * @param request
     * @param sender
     * @param sendResponse
     */
    newMessage: function (request, sender, sendResponse) {
        console.log('message-type:' + request.type);

        /* check if we have a token and if not, get one */
        if (!localStorage.trello_token) {
            //TrelloButton.showSettings(); //turned off due to loop cause
            console.log('failure not authorized for Trello API, see options page');
        }

        switch(request.type) {
            case "init_options":
                if (localStorage.trello_token) {
                    TrelloButton.getBoards(TB_APP_KEY, localStorage.trello_token);
                } else {
                    console.error('Not Authorized for Trello API. Cannot populate Trello Boards or Lists without authorized user token');
                }
                localStorage["background_newMessage_init"] = "success";
                sendResponse({success: 'success'});
            break;

            case "click_TrelloButton":
                if (!localStorage.trello_token) {
                    TrelloButton.showSettings(); //turned off due to loop cause
                    console.log('failure not authorized for Trello API, see options page');
                    sendResponse({failure: 'failure not authorized'});
                } else {
                    sendResponse({success: 'success'});
                }
            break;

            case "create_card":
                TrelloButton.create_trello_card(request.trelloCard);
                sendResponse({success: 'success'});
            break;

            case "render_trello_button":
                sendResponse({success: 'success'});
            break;

            case "background_log":
                TrelloButton.logger(request.logObj);
                sendResponse({log: 'success'});
                break;

            case "get_boards":
                sendResponse({
                    result: 'success',
                    boards: TrelloButton.getBoardsResponse()
                });
            break;

            case "get_lists":
                sendResponse({
                    result: 'success',
                    lists: TrelloButton.getListsResponse(request.idBoard)
                });
            break;
            default:
            break;
        }
    }
};

/* main */
chrome.pageAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({url: 'https://trello.com/login#'});
});
chrome.tabs.onUpdated.addListener(TrelloButton.checkUrl);
chrome.extension.onMessage.addListener(TrelloButton.newMessage);

if (localStorage.trello_token) {
    TrelloButton.getBoards(localStorage.tb_app_key, localStorage.trello_token);
} else {
    console.error('Not Authorized for Trello API. Cannot populate Trello Boards or Lists without authorized user token');
}
