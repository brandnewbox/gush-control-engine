this.Gush = class Gush {
  constructor() {
    this.workflows = {};
    this.machines = {};
  }

  initialize(jobs) {
    this.registerSockets();     
    this.displayCurrentWorkflows();
    return this.displayJobsOverview(jobs);
  }

  registerSockets() {
    switch (window.currentSockets) {
      case 'workflows_index':
        this.registerNewWorkflowsSocket();
        this.registerWorkflowsSockets(); 
        break;
      case 'workflows_show':
        this.registerSingleWorkflowSockets();
        break;
    }
  }

  displayCurrentWorkflows() {
    $("table.workflows tbody").empty();
    return ($("table.workflows").data("workflows") || []).each(workflow => {
      return this._addWorkflow(workflow);
    });
  }

  filterJobs(filter) {
    const table = $("table.jobs tbody");
    table.find("tr").hide();
    if (filter === "all") {
      return table.find("tr").show();
    } else {
      return table.find(`tr.${filter}`).show();
    }
  }

  refreshJobList() {
    const filter = $('.jobs-filter dd.active a').data('filter');
    return this.filterJobs(filter);
  }

  displayJobsOverview(jobs) {
    if (jobs != null) {
      $("table.jobs tbody").html("");
      jobs.each(function(job) {        
        const j = new Job(job);
        return $("table.jobs tbody").append(j.render());
      });
      return this.refreshJobList();
    }
  }

  registerNewWorkflowsSocket() {
    var self = this;
    App.cable.subscriptions.create(
      { 
        channel: "NewWorkflowsChannel"
      },{ 
        received: function(message) {
          self._addWorkflow(message);
          self.listenToWorkflowSocket(message.id, self._onJobSuccess);
        }
      }
    );
  }

  registerWorkflowsSockets() {
    var self = this;
    if ($('table.workflows').data("workflows")) {
       var unfinishedWorkflowIds = $('table.workflows').data("workflows").filter(function(w) { return w.status != "finished" }).map(w => w.id)
      for( var i = 0; i < unfinishedWorkflowIds.length; i++ ) {
        self.listenToWorkflowSocket(unfinishedWorkflowIds[i], self._onJobSuccess)
      }
    }   
  }

  registerSingleWorkflowSockets() {
    var self = this
    var workflow = $('#workflow').data("workflow")
    this.listenToWorkflowSocket(workflow.id, self._onJobUpdate)
  }

  listenToWorkflowSocket(workflow_id, callback) {
    var self = this;
    App.cable.subscriptions.create(
      { 
        channel: "WorkflowProgressChannel", 
        workflow_id: workflow_id
      },{ 
        received: function(message) {
          callback(message, self)
        }
      }
    );
  }

  destroyWorkflow(workflow) {
    return $.ajax({
      url: `/gush/workflows/${workflow}/purge`,
      type: "POST",
      error(response) {
        return console.log(response);
      },
      success: response => {
        return window.location.href = `/gush/workflows/`;
      }
    });
  }

  removeCompleted() {
    return $.ajax({
      url: `/gush/workflows/purge_all`,
      type: "POST",
      error(response) {
        return console.log(response);
      },
      success: response => {
        return window.location.href = `/gush/workflows/`;
      }
    });
  }

  _onJobSuccess(workflow_params, self) {
    var workflow = self.workflows[workflow_params.id];
    workflow.data = workflow_params
    if (workflow) {
      workflow.changeStatus();
      workflow.updateDates();
      workflow.updateProgress();
      return $("table.workflows").find(`#${workflow_params.id}`).replaceWith(workflow.render());
    }
  }

  _onJobUpdate(workflow_params, self) {
    self._updateGraphStatus(workflow_params);
  }

  _addWorkflow(data) {
    const workflow = new Workflow(data);
    this.workflows[data.id] = workflow;

    return $("table.workflows").append(workflow.render());
  }

  _updateGraphStatus(workflow) {
    const graph = new Graph(`canvas-${workflow.id}`);
    this.displayJobsOverview(workflow.jobs);
    return workflow.jobs.each(function(job) {
      var klasses;
      if ( job.failed_at ) klasses =  "status-finished status-failed"
      if ( job.enqueued_at ) klasses = "status-enqueued"
      if ( job.started_at ) klasses = "status-running"
      if ( job.finished_at ) klasses = "status-finished"
      return graph.markNode(job.name, klasses);
    });
  }
  
};
