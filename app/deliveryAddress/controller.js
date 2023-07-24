const { subject } = require('@casl/ability');
const DeliveryAddress = require('./model');
const { policyFor } = require('../../utils');

const store = async (req, res, next) => {
    try {
        let payload = req.body;
        let user = req.user;

        let address = new DeliveryAddress({ ...payload, user: user._id });

        await address.save();
        return res.json(address);

    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }
}

const index = async (req, res, next) => {
    try {
        let deliveryAddress = await DeliveryAddress.find();
        return res.json(deliveryAddress);
    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const update = async (req, res, next) => {
    try {
        //? ingin saya tanyakan kenapa ada _id dari body? padahal dari body tidak mengirim _id
        let { _id, ...payload } = req.body;
        let { id } = req.params;
        let address = await DeliveryAddress.findById(id);
        let subjectAddress = subject('DeliveryAddress', { ...address, user_id: address.user });
        console.log(req.user);
        let policy = policyFor(req.user);
        if (!policy.can('update', subjectAddress)) {
            return res.json({
                error: 1,
                message: `You're not allowed to modify this resource`
            });
        }

        address = await DeliveryAddress.findByIdAndUpdate(id, payload, { new: true });
        res.json(address);
    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const destroy = async (req, res, next) => {
    try {
        let { id } = req.params;
        let address = await DeliveryAddress.findById(id);
        let subjectAddress = subject('DeliveryAddress', { ...address, user_id: address.user });
        let policy = policyFor(req.user);
        if (!policy.can('delete', subjectAddress)) {
            return res.json({
                error: 1,
                message: `You're not allowed to modify this resource`
            });
        }

        address = await DeliveryAddress.findByIdAndDelete(id);
        res.json(address);
    } catch (err) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

module.exports = {
    store,
    index,
    update,
    destroy
}