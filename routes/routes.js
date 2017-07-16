  const mongoose = require ('mongoose');
    const SingleImage = new mongoose.Schema({
         filename:String,
     votes:Number
     })
    var SingleImageModel = mongoose.model('singleImage', SingleImage)

module.exports = function(express, app, formidable, io ,os, fs, knoxClient, mongoose) {
  
     const router = express.Router();
    router.get('/', (req, res, next) => {
        res.render('index', {
            host: app.get('host')
        })
    })
   
     router.post('/upload', (req, res, next) => {
        // file upload
        console.log('functioncalldededede')
        generatefilename = (filename) => {
            var ext_regex = /(?:\.([^.]+))?$/;
            var ext = ext_regex.exec(filename)[1];
            var date = new Date().getTime();
            var charBank = 'abcdefghijklmnopqrstuvwxyq';
            var fstring = '';
            for (var i = 0; i < 15; i++) {
                fstring += charBank[parseInt(Math.random() * 26)]
            }
            return (fstring += date + '.' + ext)

        }
        var tmpFile, nfile, fname;
        var newForm = new formidable.IncomingForm();
        newForm.keepExtensions = true;
        newForm.parse(req, (err, fields, files) => {
            tmpFile = files.upload.path;
            fname = generatefilename(files.upload.name);
            nfile = os.tmpDir() + '/' + fname;
            res.writeHead(200, {
                'Content-type': 'text/plain'
            });
            res.end();
        })
        newForm.on('end', () => {
            fs.rename(tmpFile, nfile, () => {
                // resize the image and upload in to the S# bucket
                gm(nfile).resize(300).write(nfile, () => {
                    // upload to the S3 bucket
                    fs.readFile(nfile, (err, buf) => {
                        var req = knoxClient.put(fname, {
                            "Content-Length": buf.lenght,
                            'Content-Type': 'image/jpeg'
                        });
                        req.on('response', (res) => {
                            if (res.statusCode == 200) {
                              
                                // this file has been uploaded
                              var newImage  = new SingleImageModel({
                                  filename:fname,
                                  votes:0
                              }).save();
                                Socket.emit('status',{'msg':'Saved !!', 'delay':3000});
                                Socket.emit('doupdate',{})
                               //
                            //    fs.unlink(nfile,()=>{
                            //        console.log("local file deleted")
                            //    })
                            }
                        });
                        req.end(buf);

                    })

                })
            })
        })

    })
  app.use(router);
};