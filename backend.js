var fs = require('fs');
var os = require('os');
var child_process = require('child_process');
var path = require('path');

function ensurePathExists(req, res, next) {
  var path = req.query.path;
  if (!fs.existsSync(path)) {
    res.json(400, { error: 'No such path: ' + path, errorCode: 'no-such-path' });
  } else {
    next();
  }
}

exports.install = function(env) {
    var app = env.app;
    var ensureAuthenticated = env.ensureAuthenticated;
    var git = env.git;

    app.get(env.httpPath + '/diff', ensureAuthenticated, ensurePathExists, function(req, res) {
    	var repoPath = req.query.path;
     	var command = "mkdir -p "+ repoPath + "../patch/tmp;   "+repoPath+"jed.txt";
    	child_process.exec(command,
            function (err, stdout, stderr) {
              if (err) return res.json(400, { error: err, stdout: stdout, stderr: stderr });
              res.json({});
        });
    });


    app.get(env.httpPath + '/pack', ensureAuthenticated, ensurePathExists, function(req, res) {
    	var repoPath = req.query.path;
    	var parentSha = req.query.pid;
    	var patchPath = path.join(repoPath, '..','patch');
    	var tmpPath = path.join(repoPath, '..', 'patch', 'tmp');
    	if (!fs.existsSync(tmpPath)) {
    		var mkdir_cmd = "mkdir -p "+ tmpPath
    		child_process.execSync(mkdir_cmd);
    	}
    	var d = new Date();
		var n = d.getTime();
    	var	zipName = path.join(tmpPath, "patch_"+n+".zip");

    	var pack_cmd = "cd '"+repoPath+"' ;zip -r '"+zipName+"'  $(git diff --name-only HEAD "+parentSha+" )";

    	child_process.exec(pack_cmd,
            function (err, stdout, stderr) {
              if (err) return res.json( { error: err, stdout: stdout, stderr: stderr });
              res.json({c:'ok'});
        	}
        );
    });

};