'use strict';

var localConfig = {};
try {
    localConfig = require('./localConfig.json');
} catch (e) {
    // no local config was found
}

module.exports = {
    'secret': process.env.JETSPREE_SECRET || localConfig.JETSPREE_SECRET,
    'connection_string': process.env.DATABASE_URL || 'postgres://postgres:P%40ssword@localhost:5432/jetspree',
    'token_duration': 60 * 60 * 24, // expires in 24 hours
    'facebook_app_id': process.env.FACEBOOK_APP_ID || localConfig.FACEBOOK_APP_ID,
    'facebook_app_secret': process.env.FACEBOOK_APP_SECRET || localConfig.FACEBOOK_APP_SECRET,
    'facebook_callback_url': process.env.NODE_ENV === 'production' ? 'https://jetspree-node-test.herokuapp.com/login/facebook/callback' : "/login/facebook/callback",
    'google_client_id': process.env.GOOGLE_CLIENT_ID || localConfig.GOOGLE_CLIENT_ID,
    'google_client_secret': process.env.GOOGLE_CLIENT_SECRET || localConfig.GOOGLE_CLIENT_SECRET,
    'google_callback_url': process.env.NODE_ENV === 'production' ? 'https://jetspree-node-test.herokuapp.com/login/google/callback' : "/login/google/callback",
    'smtp_provider': 'outlook',
    'smtp_username': process.env.SMTP_USERNAME || localConfig.SMTP_USERNAME,
    'smtp_password': process.env.SMTP_PASSWORD || localConfig.SMTP_PASSWORD,
    'aws_access_key_id': process.env.AWS_ACCESS_KEY_ID || localConfig.AWS_ACCESS_KEY_ID,
    'aws_secret_access_key': process.env.AWS_SECRET_ACCESS_KEY || localConfig.AWS_SECRET_ACCESS_KEY,
    's3_bucket_root': process.env.S3_BUKCET_ROOT || localConfig.S3_BUKCET_ROOT,
    's3_url': 'https://s3-ap-southeast-1.amazonaws.com',
    'image_max_resolution': {width: 1024, height: 1024}
};