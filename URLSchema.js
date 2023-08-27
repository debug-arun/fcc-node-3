const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const URLSchema = new Schema({
    original_url: String,
    short_url: String
});

const URLModel = new mongoose.model('URL', URLSchema);

module.exports = {URLModel};