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

var patchExec = function (res, prefix){
	var d = new Date();
	var n = d.getTime();

	res.json({c:prefix});
	// git.diffNpatchConfig;
//;cp '".$patch_path."tmp/".$zipName."' '".$destZip."' ;cd '".$destZip."' ;unzip '".$zipName."' ;rm '".$zipName."'

    	// child_process.exec(pack_cmd,
     //        function (err, stdout, stderr) {
     //          if (err) return res.json( { error: err, stdout: stdout, stderr: stderr });
     //          res.json({c:'ok'});
     //    	}
     //    );
}

var jsonResultOrFail = function(res, err, result) {
	if (err) res.status(400).json(err);
	else res.json(result || {});
}
var jsonFail = function(res, err) {
	res.status(400).json(err);
}

exports.install = function(env) {
    var app = env.app;
    var ensureAuthenticated = env.ensureAuthenticated;
    var git = env.git;
     var self = this;
     self.targetEnv = 'local';
    git.diffNpatchConfig = function ( repoPath, key ,default_val , cb){
    	var config_dst = 'diffNpatch.'+self.targetEnv+'.'+key;
    	return git(['config', '--get',config_dst ], repoPath)
	    .catch( function(err){
	    	git(['config', config_dst, default_val], repoPath)
 			.then(cb.bind(null,default_val));
	    })
	    .then(function(result){
	    	var lines = result.split('\n');
	    	cb(lines[0].trim());
	    });

    }
    var mkdirTmp = function (req, res, next) {
		var repoPath = req.query.path;
		var destPath = path.join(repoPath, '..', 'patch');

		git.diffNpatchConfig( repoPath,"dest",  destPath ,
		function(dest) {
			self.patchPath = dest;
			next();
		});
	}
    var mkdirPrefix = function (req, res, next) {
		var repoPath = req.query.path;
		var patch_name = req.query.patch_name;

		git.diffNpatchConfig( repoPath,"prefix",  'httpdocs' ,
		function(dest) {
			self.prefix = path.join(self.patchPath,patch_name ,dest);
			if (!fs.existsSync(self.prefix)) {
				var mkdir_cmd = "mkdir -p '"+ self.prefix + "'";
				child_process.exec(mkdir_cmd,
			        function (err, stdout, stderr) {
			          if (err) res.json( { error: err, stdout: stdout, stderr: stderr });
			          next();
			    });
			} else {
				next();
			}
		});
	}

    app.get(env.httpPath + '/diff', ensureAuthenticated, ensurePathExists, function(req, res) {
    	var repoPath = req.query.path;
     	var command = "mkdir -p "+ repoPath + "../patch/tmp;   "+repoPath+"jed.txt";
    	child_process.exec(command,
            function (err, stdout, stderr) {
              if (err) return res.json(400, { error: err, stdout: stdout, stderr: stderr });
              res.json({});
        });
    });


    app.get(env.httpPath + '/pack', ensureAuthenticated, ensurePathExists, mkdirTmp,mkdirPrefix,function(req, res) {
    	var repoPath = req.query.path;
    	var parentSha = req.query.pid;
    	var targetEnv = "local";

			// res.json({c:prefix , tmp: self.tmp_path});
			var d = new Date();
			var n = d.getTime();
			var	zipName = path.join(self.prefix, "patch_"+n+".zip");

			var pack_cmd = "cd '"+repoPath+"' ;git diff --name-only  "+parentSha + ' HEAD | sed  -e "s/^/\\"/;s/$/\\"/" ' + "| xargs zip -r  '"+zipName+"' ;cd '"+self.prefix+"' ;unzip -o '"+zipName+"' ;rm '"+zipName+ "'";

	    	child_process.exec(pack_cmd,
	            function (err, stdout, stderr) {
	              if (err) return res.json( { error: err, stdout: stdout, stderr: stderr });
	              res.json({c:'ok'});
	        	}
	        );

    });

};