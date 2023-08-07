const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const productSchema = Schema({
    name: {
        type: String,
        minlength: [3, "Panjang nama makanan minimal 3 Karakter"],
        required: [true, "Nama Makanan wajib diisi"]
    },

    description: {
        type: String,
        maxlength: [1000, "Panjang Deskripsi maksimal 100 karakter"]
    },

    price: {
        type: Number,
        default: 0
    },

    image_url: String,

    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },

    tags: {
        type: [Schema.Types.ObjectId],
        ref: 'Tag'
    },
}, { timestamps: true });

module.exports = model('Product', productSchema);