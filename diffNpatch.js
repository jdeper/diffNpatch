

var components = require('ungit-components');
var ko = require('knockout');
var inherits = require('util').inherits;


var GraphActions = components.create('git-graph-actions');

GraphActions.DiffNpatch = function(graph, node) {
  var self = this;
  GraphActions.ActionBase.call(this, graph);
  this.node = node;
  this.visible = ko.computed(function() {
    if (self.performProgressBar.running()) return true;
    return self.graph.currentActionContext() == self.node
  });
}

inherits(GraphActions.DiffNpatch, GraphActions.ActionBase);
GraphActions.DiffNpatch.prototype.text = 'Diff & patch';
GraphActions.DiffNpatch.prototype.style = 'DiffNpatch';
GraphActions.DiffNpatch.prototype.perform = function(callback) {
  var self = this;
  var server = this.server;
  var repoPath = this.graph.repoPath;
  var parent_sha1 = this.node.belowNode.sha1;
  console.log(this.node.belowNode.sha1);
  var patch_name = prompt("Patch name?");
  console.log(patch_name);
  server.get('/plugins/diffNpatch/pack', { path: repoPath ,pid: parent_sha1}, function(err, hook) {
    console.log(err, hook);
    callback();
  });
}


var graphConstructor = components.registered['graph'];

components.register('graph', function(args) {
  var graph = graphConstructor(args);
  // var graphUpdateNode = graph.updateNode.bind(graph);

	graph.getNode = function(sha1) {
	  	var self = this;
	  	// var nodeViewModel = self.getNodeOrg(sha1);
	  	// nodeViewModel.dropareaGraphActions.push(new GraphActions.DiffNpatch(graph, self));

		var nodeViewModel = this.nodesById[sha1];
		if (!nodeViewModel) {
	var gitnodeviewmodel = components.create("git-node", {"graph":graph,"sha1":sha1});
	gitnodeviewmodel.dropareaGraphActions.push(new GraphActions.DiffNpatch(graph, gitnodeviewmodel));
				// gitnodeviewmodel.dropareaGraphActions = [(new GraphActions.Revert(graph, this))];
		  		nodeViewModel = this.nodesById[sha1] = gitnodeviewmodel;
		}

	  	return nodeViewModel;
	}

  return graph;
});
