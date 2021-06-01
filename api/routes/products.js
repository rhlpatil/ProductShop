const express = require('express');
const router = express.Router();
const multer = require('multer');
var uuid = require('uuid');
const checkAuth = require('../middleware/check-auth');

//Database
const mongoose = require('mongoose');
const Product = require('../models/product');

//file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v1() + '_' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //rejecy file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }

};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileFilter
});
//const upload = multer({dest: 'uploads/'});

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec().
        then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage:doc.productImage,
                        id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            console.log("All entries from database", docs);
            res.status(200).json(response);
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    /*  res.status(200).json({
         message: 'Handling GET Request from Product'
     }); */
});

router.post('/upload', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);

    res.status(200).json({
        message: "file uploaded successfully"
    });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {

    console.log(req.file);

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });


});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("From Database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: "GET",
                        description: "Get all products",
                        url: "http://localhost:3000/products"
                    }
                });
            }
            else {
                res.status(404).json({
                    message: "No valid entry found"
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    /* if(id === 'special'){
        res.status(200).json({
            message: 'You discovered the special ID',
            id: id
        });
    } else {
        res.status(200).json({
            message: 'You passed an ID'
        });
    } */
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;

    /*     Product.updateOne({_id: id}, {$set: { name: req.body.name, price: req.body.price}}, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
          }); */

    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps }).exec()
        .then(result => {
            console.log(result);
            res.set(200).json({
                message: "Product updated successfully",
                request: {
                    type: "GET",
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    /* res.status(200).json({
        message: 'Updated Product!'
    }); */
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id }).exec()
        .then(result => {
            res.status(200).json({
                message: "Product deleted successfully",
                request: {
                    type: "GET",
                    description: "Get all products",
                    url: "http://localhost:3000/products"
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    /* res.status(200).json({
        message: 'Deleted Product!'
    }); */
});

module.exports = router;