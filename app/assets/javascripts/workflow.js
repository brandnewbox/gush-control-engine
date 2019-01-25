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
      this.data.started_at  = moment(this.data.started_at  * 1000).format("DD/MM/YYYY HH:mm:ss");
    }
    if (this.data.finished_at) {
      this.data.finished_at = moment(this.data.finished_at * 1000).format("DD/MM/YYYY HH:mm:ss");
    }

    return this.data;
  }

  partialsData() {
    return {progress: this.calculateProgress(), status: (this.data.status.charAt(0).toUpperCase() + this.data.status.slice(1)), action: this.actionData()};
  }

  calculateProgress() {
    const progress = (this.data.finished*100) / this.data.total;
    return progress;
  }

  updateProgress() {
    // if (this.data.finished >= this.data.total) return
    // this.data.finished += 1;
    return this.view.updateProgress(this.calculateProgress());
  }

  changeStatus() {
    if (this.view) { return this.view.updateStatus(this.data.status); }
  }

  updateDates() {
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
