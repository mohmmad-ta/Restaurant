const express = require('express');
const {setRestAndUserIds, createReview, deleteReview, getAllReviews, getReview, updateReview} = require('./../controllers/reviewController');
const {restrictTo, protect} = require('./../controllers/auth/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(getAllReviews)
    .post(
        restrictTo('user'),
        setRestAndUserIds,
        createReview
    );

router
    .route('/:id')
    .get(getReview)
    .patch(
        restrictTo('user', 'admin'),
        updateReview
    )
    .delete(
        restrictTo('user', 'admin'),
        deleteReview
    );

module.exports = router;