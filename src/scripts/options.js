/*global window: false, chrome:false */
'use strict';
var TB_APP_KEY = 'a17fd12937c7b07ed2ab56a5531bc395';


/**
 * init
 */
var init = function () {

    /* set app key if not defined */
    if (!localStorage.tb_app_key) {
        localStorage['tb_app_key'] = TB_APP_KEY;
    }

    /* if we are not authorized yet */
    if (!localStorage.trello_token) {
        Trello.authorize({
            'name': "Trello Button",
            'expiration': 'never',
            'success': function() {
                toastr.options = {
                    "closeButton": false,
                    "debug": false,
                    "positionClass": "toast-top-full-width",
                    "onclick": null,
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "5000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                };
                toastr.info('successfully authorized Trello Button with Trello API');
                console.log('success calling trello authorize');
                chrome.extension.sendMessage({type: 'init_options'}, function (response) {});
            },
            'error': function() {
                console.log('error calling trello authorize');
            },
            'scope': {
                'read': true,
                'write': true
            },
            'persist': true
        });
    }
};


/* main */
$onLoad(init);
