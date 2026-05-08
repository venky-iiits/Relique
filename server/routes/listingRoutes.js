const express = require('express');
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListingById,
  getListingsByCategory,
  getMyListings,
  deleteListing
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);
router.get('/category/:category_id', getListingsByCategory);

// Protected routes (login required)
router.post('/', protect, createListing);
router.get('/my/listings', protect, getMyListings);
router.delete('/:id', protect, deleteListing);

module.exports = router;