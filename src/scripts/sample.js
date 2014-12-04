function init() {
    Trello.authorize({
        'name':	"Trello Button",
        'expiration': "never",
        'success': function() {
            // Close this window and open the popup
            ///$('#auth').hide();
            //$('#success').show();
            console.log('success')
        },
        'error': function () {
            //$('#auth').hide();
            //$('#error').show();
            console.log('error')
        }
    });
}

$( document ).ready(function() {
    init();
});
