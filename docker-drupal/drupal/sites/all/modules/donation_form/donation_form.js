
// 1. Wait for the page to load
jQuery(function() {
    var $ = jQuery;

    var form = $('form#donation-form'),
        submitButton = form.find(":submit"),
        errorContainer = form.find('.errors'),
        errorList = errorContainer.find('ul'),
        errorHeading = errorContainer.find('h3'),
        publishableKey = form.find('[name=publishable_key]').val();

    // 2. Create an API object with your publishable api key, and
    // specifying 'test' or 'live'.
    //
    // Be sure to use your live publishable key with the live api, and
    // your test publishable key with the test api.
    var pinApi = new Pin.Api(publishableKey, 'test');

    // 3. Add a submit handler to the form which calls Pin.js to
    // retrieve a card token, and then add that token to the form and
    // submit the form to your server.
    form.submit(function(e) {
        e.preventDefault();

        // Clear previous errors
        errorList.empty();
        errorHeading.empty();
        errorContainer.hide();

        // Disable the submit button to prevent multiple clicks
        submitButton.attr({disabled: true});

        // Fetch details required for the createToken call to Pin Payments
        var card = {
            number: $('#edit-cc-number').val(),
            name: $('#edit-cc-name').val(),
            expiry_month: $('#edit-cc-month').val(),
            expiry_year: $('#edit-cc-year').val(),
            cvc: $('#edit-cc-ccv').val(),
            address_line1: $('#edit-address-line-1').val(),
            address_line2: $('#edit-address-line-2').val(),
            address_city: $('#edit-city').val(),
            address_state: $('#edit-state option:selected').text(),
            address_postcode: $('#edit-post-code').val(),
            address_country: $('#edit-country option:selected').text()
        };

        // var card = {
        //     number: '4200000000000000',
        //     name: 'Alex Gilleran',
        //     expiry_month: '02',
        //     expiry_year: '19',
        //     cvc: '123',
        //     address_line1: '123 Main St',
        //     address_line2: '',
        //     address_city: 'Sydney',
        //     address_state: 'NSW',
        //     address_postcode: '2000',
        //     address_country: 'Australia'
        // };

        // Request a token for the card from Pin Payments
        pinApi.createCardToken(card).then(handleSuccess, handleError).done();
    });

    function handleSuccess(card) {
        // Add the card token to the form
        //
        // Once you have the card token on your server you can use your
        // private key and Charges API to charge the credit card.
        $('<input>')
            .attr({type: 'hidden', name: 'card_token'})
            .val(card.token)
            .appendTo(form);

        // Resubmit the form to the server
        //
        // Only the card_token will be submitted to your server. The
        // browser ignores the original form inputs because they don't
        // have their 'name' attribute set.
        form.get(0).submit();
    }

    function handleError(response) {
        console.error(response);
        errorHeading.text(response.error_description);

        if (response.messages) {
            $.each(response.messages, function(index, paramError) {
                $('<li>')
                    .text(paramError.param + ": " + paramError.message)
                    .appendTo(errorList);
            });
        }

        errorContainer.show();

        // Re-enable the submit button
        submitButton.removeAttr('disabled');
    };
});