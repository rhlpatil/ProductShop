const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth =  require('../middleware/check-auth');

const Order = require('../models/order');
const product = require('../models/product');

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/orders/" + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
});

router.post('/', checkAuth, (req, res, next) => {

    product.findById(req.body.productId)
        .then(product => {
            if(!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });

            order.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: "Order saved successfully",
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/orders/" + result._id
                        }
                    });
                })
                .catch(err => {
                    error: err
                });
        })
        .catch(err => {
            res.status(500).json({
                message: "Product not found",
                error: err
            });
        })


});

router.get('/:orderId', checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
    .select('product quantity _id')
    .populate('product','name')
    .exec()
    .then(order => {
        if(!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            order: order,
            request: {
                type: "GET",
                url: "http://localhost:3000/orders"
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Order deleted successfully",
            request: {
                type: "GET",
                url: "http://localhost:3000/orders"
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        });
    });
});

module.exports = router;