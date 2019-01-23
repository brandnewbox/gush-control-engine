this.Workflow = class Workflow {
  constructor(data) {
    this.data = data;
    this.template = $("#workflow-template").html();
    this.view = new View(this.template, this.templateData(), this.partialsData());
  }

  render() {
    this.view.setPartialsData(this.partialsData());
    return this.view.render();
  }

  templateData() {
    if (this.data.started_at) {
      this.data.started_at  = moment(this.data.started_at  * 1000).format("DD/MM/YYYY HH:mm");
    }
    if (this.data.finished_at) {
      this.data.finished_at = moment(this.data.finished_at * 1000).format("DD/MM/YYYY HH:mm");
    }

    return this.data;
  }

  partialsData() {
    return {progress: this.calculateProgress(), status: this.data.status, action: this.actionData()};
  }

  calculateProgress() {
    const progress = (this.data.finished*100) / this.data.total;
    if (progress === 100) { this.markAsCompleted(); }

    return progress;
  }

  updateProgress() {
    this.data.finished += 1;
    return this.view.updateProgress(this.calculateProgress());
  }

  changeStatus(status) {
    this.data.status = status;
    if (this.view) { return this.view.updateStatus(status); }
  }

  updateDates(data) {
    this.data.started_at = data.started_at;
    this.data.finished_at = data.finished_at;

    this.templateData();
    if (this.view) { return this.view.updateDates(this.data); }
  }

  markAsCompleted() {
    return this.changeStatus("Finished");
  }

  markAsFailed() {
    return this.changeStatus("Failed");
  }

  actionData() {
    return {workflow_id: this.data.id, status: this.data.status};
  }
};
