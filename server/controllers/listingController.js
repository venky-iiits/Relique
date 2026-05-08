const pool = require('../models/db');

// CREATE LISTING
const createListing = async (req, res) => {
  const {
    title,
    description,
    starting_price,
    reserve_price,
    end_time,
    category_id,
    images
  } = req.body;

  const seller_id = req.user.id;

  try {
    const newListing = await pool.query(
      `INSERT INTO listings 
        (title, description, starting_price, current_price, reserve_price, end_time, category_id, seller_id, images)
       VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, starting_price, reserve_price, end_time, category_id, seller_id, images || []]
    );

    res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL LISTINGS
const getAllListings = async (req, res) => {
  try {
    const listings = await pool.query(
      `SELECT l.*, 
              u.name AS seller_name, 
              c.name AS category_name
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       JOIN categories c ON l.category_id = c.id
       WHERE l.status = 'active'
       ORDER BY l.created_at DESC`
    );

    res.status(200).json({ listings: listings.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET SINGLE LISTING
const getListingById = async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await pool.query(
      `SELECT l.*, 
              u.name AS seller_name, 
              c.name AS category_name
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       JOIN categories c ON l.category_id = c.id
       WHERE l.id = $1`,
      [id]
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Get bids for this listing
    const bids = await pool.query(
      `SELECT b.*, u.name AS bidder_name
       FROM bids b
       JOIN users u ON b.bidder_id = u.id
       WHERE b.listing_id = $1
       ORDER BY b.amount DESC`,
      [id]
    );

    // Get provenance for this listing
    const provenance = await pool.query(
      `SELECT * FROM provenance
       WHERE listing_id = $1
       ORDER BY year ASC`,
      [id]
    );

    // Get valuation for this listing
    const valuation = await pool.query(
      `SELECT * FROM valuations
       WHERE listing_id = $1`,
      [id]
    );

    res.status(200).json({
      listing: listing.rows[0],
      bids: bids.rows,
      provenance: provenance.rows,
      valuation: valuation.rows[0] || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET LISTINGS BY CATEGORY
const getListingsByCategory = async (req, res) => {
  const { category_id } = req.params;

  try {
    const listings = await pool.query(
      `SELECT l.*, 
              u.name AS seller_name, 
              c.name AS category_name
       FROM listings l
       JOIN users u ON l.seller_id = u.id
       JOIN categories c ON l.category_id = c.id
       WHERE l.category_id = $1 AND l.status = 'active'
       ORDER BY l.created_at DESC`,
      [category_id]
    );

    res.status(200).json({ listings: listings.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY LISTINGS (seller)
const getMyListings = async (req, res) => {
  const seller_id = req.user.id;

  try {
    const listings = await pool.query(
      `SELECT l.*, c.name AS category_name
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.seller_id = $1
       ORDER BY l.created_at DESC`,
      [seller_id]
    );

    res.status(200).json({ listings: listings.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE LISTING
const deleteListing = async (req, res) => {
  const { id } = req.params;
  const seller_id = req.user.id;

  try {
    const listing = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND seller_id = $2',
      [id, seller_id]
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found or unauthorized' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    res.status(200).json({ message: 'Listing deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  getListingsByCategory,
  getMyListings,
  deleteListing
};