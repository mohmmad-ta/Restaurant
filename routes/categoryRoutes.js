const express = require('express');
const {createCategory, deleteCategory, getAllCategory, getCategory, updateCategory} = require('./../controllers/categoryController');
const {restrictTo, protect} = require('./../controllers/auth/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(getAllCategory)
    .post(
        restrictTo('admin'),
        createCategory
    );

router
    .route('/:id')
    .get(getCategory)
    .patch(
        restrictTo('admin'),
        updateCategory
    )
    .delete(
        restrictTo('admin'),
        deleteCategory
    );

module.exports = router;