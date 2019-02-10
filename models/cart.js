/* 
*
*Request CartModel - Cart
* 
*
*/



// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const path = require('path');
const util = require('util');
const vToken = require('./token');
const debug = util.debuglog('user');


// Base directory of the data folder
const baseDir = path.join(__dirname, '/../.data');


// container menu models
const cartModel = {};


// Math function with request method

cartModel.carts = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        cartModel._carts[data.method](data, callback)

    } else {
        callback(405);
    };

}


cartModel._carts = {};


// Cart - Method Post
// Require data: menuId
// Optional data: none

cartModel._carts.post = function (data, callback) {
        console.log(data);
        
    // Check all required fields are filled out
    const menuId = typeof (data.payload.id) == 'string' ? data.payload.id : false;
    const qtd = typeof(data.payload.qtd) == 'number' ? data.payload.qtd : false;
    
    // Vefify required fileds
    if(menuId && qtd) {
        // Verify if user is logout -(verify if token exist and is valid)
        vToken._tokens.get(data, function (status, dataToken) {
                
            if (status == '200' && dataToken) {
                // Creating new cart
                // Catch menu data
                var count = 0;
                var limit = menuId.length;
                var menuComplete = [];
                var total = [];

                
                // Readding menu data
                    _data.read('menus', menuId, function (err, menuData) {
                   
                    if (!err) {
                    
                        // Creating cart object
                        const date = new Date();
                        const cartObject = {
                            'CartId': dataToken.phone+'_cart',
                            'userPhone': dataToken.phone,
                            'products': menuData,
                            'priceTotal': menuData.price * qtd,
                            'order delivered': false,
                            'timeUpdadeOrder': date.toLocaleTimeString(),
                            'updateOrder': date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                        };
                        // Save the cart object
                        _data.create('carts', dataToken.phone+'_cart', cartObject, function (err) {
                            if (!err) {
                                callback(200, cartObject);
                            } else {
                                console.log(err);
                                callback(500, { 'Error': 'could not save the cart, cart already exist. Use get or put methods' });
                            }
                        });

                    } else {
                        callback(400, { 'Error': 'please, Verify if product id is valid' });

                    }

                });
  
            } else {
                callback(400, dataToken);
            }
        });  
    } else {
        callback(500, { 'Error': 'Missing required id products fields' });
    }
};


// Cart - Method Get
// Require data: none
// Optional data: none

cartModel._carts.get = function (data, callback) {

    vToken._tokens.get(data, function (status, dataToken) {
        if (status == '200' && dataToken) {

            // find cart by id
            _data.read('carts', dataToken.phone + '_cart', function (err, dataCart) {
                if (!err) {
                    callback(200, dataCart);

                } else {
                    callback(400, { 'Error': 'could find any cart for this user' });

                }
            });

        } else {
            callback(400, dataToken);
        }

    });

};


// Cart - Method Delete All
// Require data: Cart id
// Optional data: none


cartModel._carts.delete = function (data, callback) {
    // Check all required fields are filled out
    const menuId = typeof (data.payload.menuId) == 'object' && data.payload.menuId instanceof Array ? data.payload.menuId : [];
    const productId = typeof (data.queryString.id) == 'string' && data.queryString.id.trim().length > 0 ? data.queryString.id : false;
    if (productId) {
        // Verify if user is logout -(verify if token exist and is valid)
        vToken._tokens.get(data, function (status, dataToken) {
            if (status == '200' && dataToken) {

                // Container delete script

                // Catch phone by token
                _data.read('tokens', data.headers.token, function (err, dataToken) {
                    if (!err) {
                        const phone = dataToken.phone;
                        // Listing all carts
                        _data.list('carts', function (err, cardsList) {
                            if (!err && cardsList.length > 0) {

                                cardsList.forEach(function (lCard) {
                                    if (phone == lCard.split('_')[0]) {
                                        // Deleting carts
                                        _data.delete('carts', lCard, function (err) {
                                            if (!err) {
                                                callback(200);
                                            } else {
                                                callback(err);
                                            }

                                        });
                                    }
                                });
                            } else {
                                callback(400, { 'Error': 'Could not listing carts, or any carts exist' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'Could not reading tokens' });
                    }
                });

            } else {
                callback(400, dataToken);
            }
        });
    } else {

        
        // Deleting products by menu id
        if(menuId && menuId.length > 0) {
            menuId.forEach(function(menu) {
                _data.delete('carts', menu, function(err) {
                    if(!err){
                       callback('Could not delete the cart or carts indicated');
                    } 

                });

            });
        }
        
    }
}


// export module

module.exports = cartModel;
