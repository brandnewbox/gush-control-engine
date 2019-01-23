this.View = class View {
  constructor(template, params, partialsData) {
    this.template = template;
    this.params = params;
    this.partialsData = partialsData;
  }

  partials() {
    return {progress: this._progressTemplate(), status: this._statusTemplate(), action: this._actionTemplate() };
  }

  setPartialsData(partialsData) {
    this.partialsData = partialsData;
  }

  render() {
    return Mustache.render(this.template, this.params, this.partials());
  }

  updateStatus(status) {
    return this.partialsData.status = status;
  }

  updateDates(data) {
    this.params.started_at = data.started_at;
    return this.params.finished_at = data.finished_at;
  }

  updateProgress(progress) {
    return this.partialsData.progress = progress;
  }

  incrementProgress() {
    return this.partialsData.progress += 1;
  }

  _progressTemplate() {
    return Templates.progress(this.partialsData.progress);
  }

  _statusTemplate() {
    return Templates.status(this.partialsData.status);
  }

  _actionTemplate() {
    return Templates.action(this.partialsData.action);
  }
};
