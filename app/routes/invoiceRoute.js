const router = require('express').Router();
const invoiceController = require('../controller/invoiceController');

router.get('/invoices/:order_id', invoiceController.show);
router.get('/invoices', invoiceController.index);
router.put('/invoices/:id', invoiceController.update);

module.exports = router;