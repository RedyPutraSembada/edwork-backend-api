const path = require('path');
const fs = require('fs');
const config = require('../config');
const Product = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model');

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10, q = '', category = '', tags = [] } = req.query;
        let tagss = tags ? JSON.parse(tags) : [];
        // console.log(tags);

        let criteria = {};

        if (q.length) {
            criteria = {
                ...criteria,
                name: { $regex: `${q}`, $options: 'i' }
            }
        }

        if (category.length) {
            let categoryResult = await Category.findOne({ name: { $regex: `${category}`, $options: 'i' } });

            if (categoryResult) {
                criteria = {
                    ...criteria,
                    category: categoryResult._id
                }
            }
        }

        if (tagss.length) {
            // console.log(tagss);
            // db.products.find({
            //     $and: [
            //         { tags: ObjectId("64b7898f3b03b0b83072df00") },
            //         { tags: ObjectId("64c0cefee61e93cb0eaf71c6") }
            //     ]
            // })
            tagsResult = await Tag.find({ name: { $in: tagss } });
            console.log(tagsResult);
            if (tagsResult.length > 0) {
                criteria = {
                    ...criteria,
                    $and: tagsResult.map(tag => ({ tags: tag._id }))
                }
            }
            console.log(criteria);
        }

        let count = await Product.find().countDocuments();
        console.log('criteria');
        console.log(criteria);

        const explained = await Product.find(criteria)
            .populate("category")
            .populate("tags").explain()
        console.log(explained.queryPlanner)

        let product = await Product.find(criteria)
            .populate("category")
            .populate("tags")
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        return res.json({
            data: product,
            count: count
        });
    } catch (err) {
        next(err);
    }
}

const show = async (req, res, next) => {
    try {
        let { id } = req.params;
        let product = await Product.findById(id).populate("category").populate("tags");
        return res.json(product);
    } catch (error) {
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
    }
}

const store = async (req, res, next) => {
    try {
        let payload = req.body;

        //* Update Materi relasi dengan Category
        if (payload.category) {
            console.log(payload.category);
            let category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } });
            if (category) {
                payload = { ...payload, category: category._id };
            } else {
                delete payload.category;
            }
        }

        //* Update Materi relasi dengan Tag
        if (payload.tags && payload.tags.length > 0) {
            console.log(payload.tags);
            let tags = await Tag.find({ name: { $in: payload.tags } });
            console.log(tags);
            if (tags.length > 0) {
                payload = { ...payload, tags: tags.map(tag => tag._id) };
            }
        }

        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);

            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on('end', async () => {
                try {
                    let product = new Product({ ...payload, image_url: filename });
                    console.log(product);
                    await product.save()
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path);
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }

                    next(err);
                }
            });

            //* Ketika Upload Error
            src.on('error', async () => {
                next(err);
            });
        } else {
            let product = new Product(payload);
            await product.save();
            return res.json(product);
        }
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
    console.log(req.body);
    console.log(req.file);
    try {
        let payload = req.body;
        let { id } = req.params;

        //* Update Materi relasi dengan Category
        if (payload.category) {
            let category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } });
            if (category) {
                payload = { ...payload, category: category._id };
            } else {
                delete payload.category;
            }
        }

        //* Update Materi relasi dengan Tag
        if (payload.tags && payload.tags.length > 0) {
            let tags = await Tag.find({ name: { $in: payload.tags } });
            if (tags.length > 0) {
                payload = { ...payload, tags: tags.map(tag => tag._id) };
            } else {
                delete payload.tags;
            }
        }

        if (req.file) {
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);

            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on('end', async () => {
                try {

                    let product = await Product.findById(id);
                    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

                    if (fs.existsSync(currentImage)) {
                        fs.unlinkSync(currentImage);
                    }
                    product = await Product.findByIdAndUpdate(id, { ...payload, image_url: filename }, {
                        new: true,
                        runValidators: true
                    });
                    return res.json(product);
                } catch (err) {
                    fs.unlinkSync(target_path);
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }

                    next(err);
                }
            });

            //* Ketika Upload Error
            src.on('error', async () => {
                next(err);
            });
        } else {
            let product = await Product.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true
            });
            return res.json(product);
        }
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
        const { id } = req.params;
        let product = await Product.findByIdAndDelete(id);
        let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
        if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
        }
        return res.json(product);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    index,
    store,
    update,
    destroy,
    show
}