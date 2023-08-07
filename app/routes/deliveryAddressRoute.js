const { police_check } = require('../middlewares');
const deliveryAddressController = require('../controller/deliveryAddressController');

const router = require('express').Router();

router.get('/delivery-addresses', police_check('view', 'DeliveryAddress'), deliveryAddressController.index);

router.get('/delivery-addresses/:id', police_check('read', 'DeliveryAddress'), deliveryAddressController.show);

router.post('/delivery-addresses', deliveryAddressController.store);

router.put('/delivery-addresses/:id', deliveryAddressController.update);

router.delete('/delivery-addresses/:id', police_check('delete', 'DeliveryAddress'), deliveryAddressController.destroy);

module.exports = router;