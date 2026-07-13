const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { getMyDocuments, getAllDocuments, uploadDocument } = require('../controllers/documentController');

router.get('/', authenticate, getMyDocuments);
router.get('/all', authenticate, getAllDocuments);
router.post('/upload', authenticate, upload.single('document'), uploadDocument);

module.exports = router;