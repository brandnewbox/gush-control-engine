this.Templates = class Templates {
  static status(status) {
    const labelClass = {"Failed": "alert", "Running": "", "Finished": "success", "Pending": "secondary"};
    const template = $("#status-template").html();
    return Mustache.render(template, {status, class: labelClass[status]});
  }

  static progress(progress) {
    const template = $("#progress-template").html();
    return Mustache.render(template, {progress: parseInt(progress)});
  }

  static job(data) {
    const template = $("#node-template").html();
    return Mustache.render(template, data);
  }

  static machine(data) {
    const template = $("#machine-template").html();
    return Mustache.render(template, data);
  }

  static action(data) {
    const description = data.status === "running" ? "Stop Workflow" : "Start Workflow";
    const buttonClass = {"Start workflow": "success", "Stop Workflow": "alert"};
    const buttonAction = data.status === "running" ? "stop" : "start";
    const template = $("#workflow-action-template").html();

    if (data.status !== "finished") {
      return Mustache.render(template, {workflow_id: data.workflow_id, action: buttonAction, classes: buttonClass[description], description});
    }
  }
};
