this.Gush = class Gush {
  constructor() {
    this.registerLogsSocket = this.registerLogsSocket.bind(this);
    this._onStatus = this._onStatus.bind(this);
    this._onWorkflowStatusChange = this._onWorkflowStatusChange.bind(this);
    this._onMachineStatusMessage = this._onMachineStatusMessage.bind(this);
    this._onJobStart = this._onJobStart.bind(this);
    this._onJobSuccess = this._onJobSuccess.bind(this);
    this._onJobHeartbeat = this._onJobHeartbeat.bind(this);
    this._onJobFail = this._onJobFail.bind(this);
    this._addWorkflow = this._addWorkflow.bind(this);
    this._onLogsSocketMessage = this._onLogsSocketMessage.bind(this);
    this.workflows = {};
    this.machines = {};
  }

  initialize(jobs) {
    // this.registerSockets();
    this.displayCurrentWorkflows();
    return this.displayJobsOverview(jobs);
  }

  registerSockets() {
    this.registerWorkersSocket();
    this.registerWorkflowsSocket();
    return this.registerMachinesSocket();
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

  registerWorkersSocket() {
    const workersSocket = new WebSocket(this._socketUrl(`gush/workflows/subscribe/workers.status`));

    workersSocket.onopen    = this._onOpen;
    workersSocket.onerror   = this._onError;
    workersSocket.onmessage = this._onStatus;
    return workersSocket.onclose   = this._onClose;
  }

  registerWorkflowsSocket() {
    const workflowsSocket = new WebSocket(this._socketUrl(`gush/workflows/subscribe/workflows.status`));

    workflowsSocket.onopen    = this._onOpen;
    workflowsSocket.onerror   = this._onError;
    workflowsSocket.onmessage = this._onWorkflowStatusChange;
    return workflowsSocket.onclose   = this._onClose;
  }

  registerMachinesSocket() {
    const machinesSocket = new WebSocket(this._socketUrl(`gush/workflows/workers`));

    machinesSocket.onopen    = this._onOpen;
    machinesSocket.onerror   = this._onError;
    machinesSocket.onmessage = this._onMachineStatusMessage;

    return machinesSocket.onclose   = this._onClose;
  }

  registerLogsSocket(workflow, job) {
    const logsSocket = new WebSocket(this._socketUrl(`gush/workflows/logs/${workflow}.${job}`));

    this._registerScrollHook(logsSocket);

    logsSocket.onopen    = this._onOpen;
    logsSocket.onerror   = this._onError;
    logsSocket.onmessage = this._onLogsSocketMessage;

    return logsSocket.onclose   = this._onClose;
  }

  startWorkflow(workflow, el) {
    $.ajax({
      url: `/gush/workflows/start/` + workflow,
      type: "POST",
      error(response) {
        return console.log(response);
      }
    });

    if (el) {
      return el.removeClass("success")
        .addClass("alert")
        .data("action", "stop")
        .contents().filter(function() {
          return this.nodeType === 3;}).replaceWith("Stop workflow");
    }
  }

  startJob(workflow, job, el) {
    return $.ajax({
      url: `/gush/workflows/start/${workflow}/${job}`,
      type: "POST",
      error(response) {
        return console.log(response);
      },
      success() {
        return window.location.href = `/gush/workflows/show/${workflow}`;
      }
    });
  }

  stopWorkflow(workflow, el) {
    $.ajax({
      url: `/gush/workflows/stop/` + workflow,
      type: "POST",
      error(response) {
        return console.log(response);
      }
    });

    if (el) {
      return el.addClass("success")
        .removeClass("alert")
        .data("action", "start")
        .contents().filter(function() {
          return this.nodeType === 3;}).replaceWith("Start workflow");
    }
  }

  retryWorkflow(workflow_id) {
    return $.ajax({
      url: `/gush/workflows/show/${workflow_id}.json`,
      type: "GET",
      success: response => {
        return response.jobs.each(job => {
          if (job.failed) {
            return this.startJob(workflow_id, job.name, null);
          }
        });
      }
    });
  }

  createWorkflow(workflow) {
    return $.ajax({
      url: `/gush/workflows/create/` + workflow,
      type: "POST",
      error(response) {
        return console.log(response);
      },
      success: response => {
        return window.location.href = `/gush/workflows/show/${response.id}`;
      }
    });
  }

  destroyWorkflow(workflow) {
    return $.ajax({
      url: `/gush/workflows/destroy/` + workflow,
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
      url: `/gush/workflows/purge`,
      type: "POST",
      error(response) {
        return console.log(response);
      },
      success: response => {
        return window.location.href = `/gush/workflows/`;
      }
    });
  }

  removeLogs(workflow_id, job_name) {
    return $.ajax({
      url: `/gush/workflows/purge_logs/${workflow_id}.${job_name}`,
      type: "POST",
      error(response) {
        return console.log(response);
      },
      success: response => {
        return window.location.href = `/gush/workflows/jobs/${workflow_id}.${job_name}`;
      }
    });
  }

  _onOpen() {
    return $("#modalBox").foundation("reveal", "close");
  }

  _onError(error) {
    $("#modalBox .data").html("<h2>Lost connection with server.</h2> <h3>Reconnecting…</h3>");
    return $("#modalBox").foundation("reveal", "open");
  }

  _onClose() {
    return console.log("Connection closed");
  }

  _onStatus(message) {
    message = JSON.parse(message.data);
    console.log(message);
    switch (message.status) {
      case "started":
        return this._onJobStart(message);
      case "finished":
        return this._onJobSuccess(message);
      case "heartbeat":
        return this._onJobHeartbeat(message);
      case "failed":
        return this._onJobFail(message);
      default:
        return console.error("Unkown job status:", message.status, "data: ", message);
    }
  }


  _onWorkflowStatusChange(message) {
    message = JSON.parse(message.data);
    const workflow = this.workflows[message.workflow_id];
    if (workflow) {
      workflow.changeStatus(message.status);
      workflow.updateDates(message);
      return $("table.workflows").find(`#${message.workflow_id}`).replaceWith(workflow.render());
    }
  }

  _onMachineStatusMessage(message) {
      message = JSON.parse(message.data);
      return message.each(machine => {
        machine = this.machines[message.id] || (this.machines[message.id] = new Machine(machine, $("table.machines tbody")));
        machine.markAsAlive();
        return machine.render();
      });
    }

  _onJobStart(message) {
    return this._updateGraphStatus(message.workflow_id);
  }

  _onJobSuccess(message) {
    this._updateGraphStatus(message.workflow_id);

    const workflow = this.workflows[message.workflow_id];
    if (workflow) {
      workflow.updateProgress();
      return $("table.workflows").find(`#${message.workflow_id}`).replaceWith(workflow.render());
    }
  }

  _onJobHeartbeat(message) {}

  _onJobFail(message) {
    this._updateGraphStatus(message.workflow_id);

    const workflow = this.workflows[message.workflow_id];
    if (workflow) {
      workflow.markAsFailed();
      return $("table.workflows").find(`#${message.workflow_id}`).replaceWith(workflow.render());
    }
  }

  _addWorkflow(data) {
    const workflow = new Workflow(data);
    this.workflows[data.id] = workflow;

    return $("table.workflows").append(workflow.render());
  }

  _updateGraphStatus(workflow_id) {
    return $.ajax({
      url: `/gush/workflows/show/${workflow_id}.json`,
      type: "GET",
      error(response) {
        return console.log(response);
      },
      success: response => {
        const graph = new Graph(`canvas-${workflow_id}`);
        this.displayJobsOverview(response.jobs);
        return response.jobs.each(function(job) {
          const klasses = (() => { switch (false) {
            case !job.failed: return "status-finished status-failed";
            case !job.finished: return "status-finished";
            case !job.enqueued: return "status-enqueued";
          } })();
          return graph.markNode(job.name, klasses);
        });
      }
    });
  }

  _socketUrl(path) {
    return `ws://${window.location.host}/${path}`;
  }

  _scrollToBottom(container) {
    return container.scrollTop(container.prop('scrollHeight'));
  }

  _preservePosition(container, originalHeight) {
    return container.scrollTop(container.prop('scrollHeight') - originalHeight);
  }

  _onLogsSocketMessage(message) {
    const container = $('ul.logs');
    const originalHeight = container.prop('scrollHeight');

    const logs = JSON.parse(message.data);
    return logs.lines.forEach(log => {
      container[logs.method](`<li>${log}</li>`);
      if (logs.method === "append") {
        return this._scrollToBottom(container);
      } else {
        return this._preservePosition(container, originalHeight);
      }
    });
  }

  _registerScrollHook(logsSocket) {
    const container = $('ul.logs');
    return container.scroll(function(e) {
      if (container.scrollTop() < 30) {
        return logsSocket.send("prepend");
      }
    });
  }
};
