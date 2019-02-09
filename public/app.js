
/* 
*
*   Frontemd Logic for the application
*
*/


// Containe for the frontend application
const app = {};


// Config
app.config = {
    'sessionToken': false,
    'username': '',
};

// AJAX client (for the restful api)
app.client = {};

// Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {

    // Set default 
    headers = typeof (headers) == 'object' && headers !== null ? headers : {};
    path = typeof (path) == 'string' ? path : '/';
    method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof (payload) == 'object' && payload !== null ? payload : {};
    callback = typeof (callback) == 'function' ? callback : false;

    // For each query string parameter sent, add it to the path
    let requestUrl = path + '?';
    let counter = 0;
    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++
            // If at list queryString parameter has already been add, prepend new ones with an ampersand
            if (counter > 1) {
                requestUrl += '&';
            }
            // Add the key and value
            requestUrl += queryKey + '=' + queryStringObject[queryKey];

        }

    };
    // Form the http request as a json type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // For each header sent, add it to the requestc

    for (let headerKey in headers) {
        xhr.setRequestHeader(headerKey, headers[headerKey]);
    };




    // If  there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.getSessionToken());
    }

    // When the request comes back. handle the response
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;
            // Callback if requested
            if (callback) {
                try {
                    const parseResponse = JSON.parse(responseReturned);
                    callback(statusCode, parseResponse);
                } catch (e) {
                    callback(statusCode, false);
                }
            }
        }
    };

    // Send the payload string
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);


};


// Bind the form
// Form create user
app.bindFormsCreateUser = function () {

    if (document.getElementById("accountCreate")) {

        document.getElementById("accountCreate").addEventListener("submit", function (e) {
            // Stop it from submitting
            e.preventDefault();
            const formId = this.id;
            const path = this.action;
            const method = this.method.toUpperCase();

            // Hide the error message (if it's currently shown due to a previous error)
            document.querySelector("#" + formId + " .formError").style.display = 'hidden';

            // Turn the inputs into a payload

            const payload = {};
            const elements = this.elements;
            var count = 0;
            var limit = elements.length
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].type !== 'submit') {
                    const valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
                    payload[elements[i].name] = valueOfElement;

                };

            }
            // Call the API
            app.client.request(undefined, path, method, undefined, payload, function (statusCode, responsePayload) {
                // Display an error on the form if needed
                if (statusCode !== 200) {
                    // Try to get the error from the api, or set a default error message
                    var error = typeof (responsePayload.error) == 'string' ? responsePayload.error : 'An error has occured, please try again';

                    // Set the formError field with the error text
                    document.querySelector("#" + formId + " .formError").innerHTML = error;

                    // Show (unhide) the form error field on the form
                    document.querySelector("#" + formId + " .formError").style.display = 'block';

                } else {
                    // If successful, send to form response processor
                    app.formResponseProcessor(formId, payload, responsePayload);
                }
            });

        });

    }


};

// Create session 
app.createSession = function () {

    if (document.getElementById('login_create')) {
        document.getElementById('login_create').addEventListener("submit", function (e) {
            // Stop it from submitting
            e.preventDefault();
            const formId = this.id;
            const path = this.action;
            const method = this.method.toUpperCase();

            // Hide the error message (if it's currently shown due to a previous error)
            document.querySelector("#" + formId + " .formError").style.display = 'hidden';

            // Turn the inputs into a payload

            const payload = {};
            const elements = this.elements;
            var count = 0;
            var limit = elements.length

            for (var i = 0; i < elements.length; i++) {
                if (elements[i].type !== 'submit') {

                    payload[elements[i].name] = elements[i].value;

                };

            }

            // Call the API
            app.client.request(undefined, path, method, undefined, payload, function (statusCode, responsePayload) {
                // Display an error on the form if needed
                if (statusCode !== 200) {
                    // Try to get the error from the api, or set a default error message
                    var error = typeof (responsePayload.error) == 'string' ? responsePayload.error : 'An error has occured, please try again';

                    // Set the formError field with the error text
                    document.querySelector("#" + formId + " .formError").innerHTML = error;

                    // Show (unhide) the form error field on the form
                    document.querySelector("#" + formId + " .formError").style.display = 'block';

                } else {
                    // If successful, send to form response processor
                    app.formResponseProcessor(formId, payload, responsePayload);
                }
            });

        });

    }





};

// Delete Session
app.deleteSession = function () {
    if (document.getElementById('delete-session')) {

        document.getElementById('delete-session').addEventListener('click', function (e) {
            e.preventDefault();
            const idMenu = this.id;
            const tokenSession = app.getSessionToken();

            if (typeof (tokenSession) == 'string' && tokenSession.length > 0) {

                const tokenObject = {
                    'id': tokenSession
                };
                // Call the API
                app.client.request(undefined, '/api/tokens', 'delete', tokenObject, undefined, function (statusCode, responsePayload) {
                    // Display an error on the form if needed
                    if (statusCode !== 200) {
                        // If token doesnt exist, set false
                        app.config.sessionToken = false;
                        localStorage.setItem('token', false);

                        // Try to get the error from the api, or set a default error message
                        var error = typeof (responsePayload.error) == 'string' ? responsePayload.error : 'An error has occured, please try again';


                    } else {
                        // If successful, send to form response processor
                        app.formResponseProcessor(idMenu, undefined, responsePayload);

                    }
                });

            } else {
                // If token doesnt exist, set false
                app.config.sessionToken = false;

                window.location.href = '/';
            }

        });


    }
}


// Bind cart information
// Set user cart
app.setCartData = function (payload) {
    // Call the api
    app.client.request(undefined, '/api/cart', 'post', undefined, payload, function (statusCode, responsePayload) {
        if (statusCode !== 200) {

        } else {

        }
    });

}

//  Get user cart data
app.getCartData = function () {

    // Call the API
    app.client.request(undefined, '/api/cart', 'get', undefined, undefined, function (statusCode, responsePayload) {
        // Display an error on the form if needed
        if (statusCode !== 200) {
            console.log('Doesnt exist any cart');

        } else {
            // If successful, send to form response processor
            return responsePayload;
        }
    });
    //
}

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {

    const tokenString = localStorage.getItem('token');

    if (typeof (tokenString) == 'string' && tokenString !== 'false') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (tokenString) == 'string') {
                app.setLoggedInClass(true);
                return token;

            } else {
                app.setLoggedInClass(false);

                return false;
            }

        } catch (e) {

            app.config.sessionToken = false;
            app.setLoggedInClass(false);

        }
    } else {

        app.setLoggedInClass(false);
    }

};

// Set or remove the loggedin class from the body
app.setLoggedInClass = function (add) {
    var targetCart = document.getElementById('cart-menu');
    var targetLogout = document.getElementById('delete-session');
    var targetSignup = document.getElementById('signup');
    var targetLogin = document.getElementById('login');
    var targetAdminMenu = document.getElementById('admin-menu');
    var targetWelcome_Msg = document.getElementById('welcome');


    if (add) {
        targetAdminMenu.style.display = 'none';
        targetCart.style.display = 'block';
        targetCart.style.display = 'block';
        targetLogin.style.display = 'none';
        targetSignup.style.display = 'none';
        targetWelcome_Msg.innerHTML = '<h4>Olá User</h3>';
        targetLogout.style.display = 'block';

    } else {
        targetAdminMenu.style.display = 'none';
        targetLogin.style.display = 'block';
        targetLogout.style.display = 'none';
        targetSignup.style.display = 'block';


    }





};

// Set the session token in the app.config object as well  as localstorage
app.setSessionToken = function (token) {

    if (token) {

        app.config.sessionToken = token;
        const tokenString = JSON.stringify(token);


        localStorage.setItem('token', tokenString);
        app.setLoggedInClass(true);
        app.resetToken();


    } else {
        app.config.sessionToken = false;
    }


};

// Reset token 
app.resetToken = function () {

    setInterval(() => {
         localStorage.removeItem('token');
         app.renewToken(function(token){
             
         });
        localStorage.removeItem('token');


    }, 55 * 660000);

}

// Renew the token 
app.renewToken = function (callback) {
    const currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
    if (currentToken) {
        // Update the token with a new expiration
        const payload = {
            'id': currentToken.id,
            'extend': true
        }
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function (statusCode, responsePayload) {
            // Display an error on the form if needed
            if (statusCode == 200) {
                // Get the new token details
                var queryStringObject = { 'id': currentToken.id };
                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                    // Display an error on the form if needed
                    if (statusCode == 200) {
                        app.setSessionToken(responsePayload);
                        callback(false);
                    } else {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true);
    }


};

// Loop to renew token often
app.tokenRenewalLoop = function () {
    setInterval(function () {
        app.renewToken(function (err) {
            if (!err) {
                console.log("Token renewed successfully @ " + Date.now());
            }
        });
    }, 1000 * 60);
};

// Form response processor
app.formResponseProcessor = function (formId, payload, responsePayload) {
    var functionToCall = false;

    if (formId == 'accountCreate') {
        // the account has been created successfully
        //Alert sucessfully create user
        alert('Your account was create with sucess.');
        // Redirec to home url
        window.location.href = '/session/create';


    }
    if (formId == 'login_create') {
        // Set token in local storage
        app.setSessionToken(responsePayload.tokenId);

        // Redirect to menu
        // window.location.href = '/';
         // Redirec to home url
         window.location.href = '/';

    }
    if (formId == 'delete-session') {
        // Delete token in local storage 
        localStorage.setItem('token', false);
        // Set token false to app.config.sessionToken
        app.config.sessionToken = false;


        // Redirec to home url
        window.location.href = '/';


    }
};
// Create effect houver in imag product
app.btnCart = function () {
    if (document.getElementsByClassName('btn-small')) {
        const target = document.getElementsByClassName('btn-small');
        const length = target.length;
        for (let i = 0; i < length; i++) {

            target[i].addEventListener('click', function (e) {
                // Verify if user is logged
                if (app.getSessionToken() !== undefined) {
                    // Open modal
                    document.getElementById('modal1').style.display = 'block';


                } else {
                    // Redirect from login
                    window.location.href = '/login';
                }

            })


        }



    };

};

// Close modal 
app.closeModal = function () {
    if (document.getElementById('close')) {
        document.getElementById('close').addEventListener('click', function () {
            document.getElementById('modal1').style.display = 'none';
        });
    }
};


// Get all products
app.getProduct = function () {

    // Call the api
    app.client.request(undefined, '/api/menus', 'get', undefined, undefined, function (statusCode, responsePayload) {
        if (statusCode !== 200) {

        } else {

            // Verify quantity of the menus
            const menuLength = responsePayload.length / 2;

            for (let menu of responsePayload) {

                try {
                    // Print products in the index
                    let tewmp = document.querySelector('#products').innerHTML += `
            
                <div class="col s6">
                <a href=""> <img class="responsive-img" src="public/img/pizza.jpeg">
                    <div class="fig-prod" id=${menu.id}>
                        <figcaption class="fig-prod-text">${menu.product} <span>${menu.price} €</span></figcaption>
                        <a id="product-name" data-target="modal1" class="waves-effect waves-light btn-small modal-trigger">Order Now</a>
                   </div>
      
                </a>
               
               </div>`

                } catch (error) {

                }


            }

        }
    });

};

// Verify if user is logged
app.verifyLoginStatus = function () {
    let session = app.getSessionToken();

}
// Init (bootstrapping)
app.init = function () {
    // Bind all create user form submissions
    app.bindFormsCreateUser();
    app.createSession();
    app.deleteSession();
    app.getSessionToken();
    app.btnCart();
    app.closeModal();
    app.getProduct();
    app.resetToken();
    // app.verifyLoginStatus();





};

// Call the init processes after the window loads
window.onload = function () {
    app.init();
};