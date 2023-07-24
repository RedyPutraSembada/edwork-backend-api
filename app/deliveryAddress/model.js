const { Schema, model } = require('mongoose');

const deliveryAddressSchema = Schema({
    nama: {
        type: String,
        required: [true, 'Nama alamat harus diisi'],
        maxLength: [255, 'Panjang maksimal nama alamat 255 karakter']
    },

    kelurahan: {
        type: String,
        required: [true, 'kelurahan alamat harus diisi'],
        maxLength: [255, 'Panjang maksimal kelurahan alamat 255 karakter']
    },

    kecamatan: {
        type: String,
        required: [true, 'kecamatan alamat harus diisi'],
        maxLength: [255, 'Panjang maksimal kecamatan alamat 255 karakter']
    },

    kabupaten: {
        type: String,
        required: [true, 'kabupaten alamat harus diisi'],
        maxLength: [255, 'Panjang maksimal kabupaten alamat 255 karakter']
    },

    provinsi: {
        type: String,
        required: [true, 'provinsi alamat harus diisi'],
        maxLength: [255, 'Panjang maksimal provinsi alamat 255 karakter']
    },

    detail: {
        type: String,
        required: [true, 'detail alamat harus diisi'],
        maxLength: [1000, 'Panjang maksimal detail alamat 255 karakter']
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = model('DeliveryAddress', deliveryAddressSchema);