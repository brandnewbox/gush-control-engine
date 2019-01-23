this.Machine = class Machine {
  constructor(data, el) {
    this.markAsFrozen = this.markAsFrozen.bind(this);
    this.markAsDead = this.markAsDead.bind(this);
    this.el = el;
    this.host = data.host;
    this.pid = data.pid;
    this.jobs = data.jobs;
    this.status = this.getStatus();
    this.resetFrozenTimeout();
  }

  getStatus() {
    if (this.jobs === 0) { return "Idle"; } else { return "Working"; }
  }

  resetFrozenTimeout() {
    clearTimeout(this.frozen);
    clearTimeout(this.dead);
    return this.frozen = setTimeout(this.markAsFrozen, 6000);
  }

  markAsFrozen() {
    this.status = "Frozen";
    this.render();
    return this.dead = setTimeout(this.markAsDead, 6000);
  }

  markAsDead() {
    this.status = "Dead";
    return this.render();
  }

  markAsAlive() {
    this.status = this.getStatus();
    return this.resetFrozenTimeout();
  }

  render() {
    const row = this.el.find(`tr[data-pid='${this.pid}']`);
    const template = Templates.machine({pid: this.pid, host: this.host, status: this.status, jobs: this.jobs});

    if (row.length === 0) {
      return this.el.append(template);
    } else {
      return row.replaceWith(template);
    }
  }
};
