this.Job = class Job {
  constructor(data) {
    this.data = data;
  }

  status() {
    if ( this.data.failed_at ) return "Failed"
    if ( this.data.finished_at ) return "Finished"
    if ( this.data.started_at ) return "Running"
    if ( this.data.enqueued_at ) return "Enqueued"
    else return "Waiting"
  }

  isValid() {
    return this.data.hasOwnProperty("started_at");
  }

  render() {
    if (this.isValid()) {
      return Templates.job({
        name: this.data.name,
        started_at: this.data.started_at ? moment(this.data.started_at  * 1000).format("HH:mm:ss") : "",
        finished_at: this.data.finished_at ? moment(this.data.finished_at  * 1000).format("HH:mm:ss"): "",
        status: this.status(),
        class: this.status().toLowerCase()
      });
    }
  }
};

