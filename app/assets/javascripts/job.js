this.Job = class Job {
  constructor(data) {
    this.data = data;
  }

  isFinished() {
    return !!this.data.finished;
  }

  isFailed() {
    return !!this.data.failed;
  }

  isRunning() {
    return !!this.data.running;
  }

  isWaiting() {
    return !this.isEnqueued() && !this.isRunning() && !this.isFailed();
  }

  isEnqueued() {
    return !!this.data.enqueued;
  }

  status() {
    switch (false) {
      case !this.isFinished():
        return "Finished";
      case !this.isFailed():
        return "Failed";
      case !this.isEnqueued():
        return "Enqueued";
      case !this.isRunning():
        return "Running";
      default:
        return "Waiting";
    }
  }

  isValid() {
    return this.data.hasOwnProperty("finished");
  }

  render() {
    if (this.isValid()) {
      return Templates.job({
        name: this.data.name,
        started_at: this.data.started_at,
        finished_at: this.data.finished_at,
        status: this.status(),
        class: this.status().toLowerCase()
      });
    }
  }
};

