import express from "express";
import GM from "gm";
import config from "../config";
import Promise from "bluebird";
const router = express.Router();

router

// Get image
    .get(['/:key', '/:folder1/:key',
            '/:folder1/:folder2/:key',
            '/:folder1/:folder2/:folder3/:key',
            '/:folder1/:folder2/:folder3/:folder4/:key',
            '/:folder1/:folder2/:folder3/:folder4/:folder5/:key'],
        (req, res) => {
            let originalBucket = config.s3_bucket_root;
            let bucket = '';

            // structure folders, may add more folders if necessary
            if (req.params.folder1 !== undefined)
                originalBucket += "/" + req.params.folder1;
            if (req.params.folder2 !== undefined)
                originalBucket += "/" + req.params.folder2;
            if (req.params.folder3 !== undefined)
                originalBucket += "/" + req.params.folder3;
            if (req.params.folder4 !== undefined)
                originalBucket += "/" + req.params.folder4;
            if (req.params.folder5 !== undefined)
                originalBucket += "/" + req.params.folder5;
            if (req.query.width && req.query.height)
                bucket += originalBucket + "/" + req.query.width + "_" + req.query.height;

            let s3 = new req.aws.S3();

            let getResized = function () {
                return new Promise(function (resolve) {
                    s3.getObject({Bucket: bucket, Key: req.params.key}, (error, response) => {
                        if (error)
                            resolve(null);
                        else
                            resolve(response)
                    });
                });
            };

            let getOriginal = function () {
                return new Promise(function (resolve, reject) {
                    s3.getObject({Bucket: originalBucket, Key: req.params.key}, (error, response) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(response);
                        }
                    });
                });
            };

            let resizeImage = function (data) {
                return new Promise(function (resolve, reject) {
                    GM(data.Body)
                        .resize(req.query.width, req.query.height)
                        .toBuffer('jpg', (error, buffer) => {
                            if (error)
                                reject(error);
                            else {
                                data.Body = buffer;
                                resolve(data);
                            }
                        });
                });
            };

            let putObject = function (data) {
                return new Promise(function (resolve, reject) {
                    let params = {
                        Bucket: bucket,
                        Key: req.params.key,
                        Body: data.Body,
                        ContentType: data.ContentType
                    };
                    s3.putObject(params, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
                });
            };

            let handleError = function (error) {
                if (error.statusCode === 404)
                    res.status(404).send("Not Found");
                else
                    res.json({success: false, errors: [error]});
                res.end();
                throw new Error();
            };

            getResized()
                .then(ret => {
                    if (ret === null) {
                        // resized image not found, get the original image to resize
                        return getOriginal()
                            .then(ret => {
                                return resizeImage(ret)
                            }, handleError)
                            .catch(Error)
                            .then(ret => {
                                return putObject(ret)
                            }, handleError)
                            .catch(Error)
                            .then(ret => {
                                res.writeHead(200, {
                                    'Content-Type': ret.ContentType,
                                    'Content-Length': ret.Body.length
                                });
                                res.end(ret.Body, 'binary');
                            }, handleError)
                            .catch(Error)
                    } else {
                        if (ret.ContentLength > 0) {
                            // resized image found, so just respond it.
                            res.writeHead(200, {
                                'Content-Type': ret.ContentType,
                                'Content-Length': ret.Body.length
                            });
                            res.end(ret.Body, 'binary');
                        } else {
                            // probably wrong url or the file no longer exists.
                            res.end();
                        }
                    }
                }, handleError)
                .catch(Error);
        });

module.exports = router;