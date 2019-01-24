window.Gush = new Gush;

$(document).ready(function() {
  const jobs = $('#jobs').data('list') || [];
  window.Gush.initialize(jobs);
  Foundation.global.namespace = '';
  $(document).foundation();

  $(this).on("click", ".button.start-workflow", function(event) {
    event.preventDefault();
    if (!$(event.target).is(".button")) {
      return;
    }
    if($(this).data("action") === "start") {
      return Gush.startWorkflow($(this).data("workflow-id"), $(this));
    } else {
      return Gush.stopWorkflow($(this).data("workflow-id"), $(this));
    }
  });

  $(this).on("click", ".start-job", function(event) {
    event.preventDefault();
    return Gush.startJob($(this).data("workflow-id"), $(this).data("job-name"), $(this));
  });

  $(this).on("click", ".create-workflow", function(event) {
    event.preventDefault();
    return Gush.createWorkflow($(this).data("workflow-class"));
  });

  $(this).on("click", ".destroy-workflow", function(event) {
    event.preventDefault();
    return Gush.destroyWorkflow($(this).data("workflow-id"), $(this));
  });

  $(this).on("click", ".retry-workflow", function(event) {
    event.preventDefault();
    return Gush.retryWorkflow($(this).data("workflow-id"), $(this));
  });

  $(this).on("click", "svg .node", function(event) {
    event.preventDefault();
    const workflow_id = $(this).closest('svg').data('workflow-id');
    const name = $(this).data('job-name');
    if ((name !== "Start") && (name !== "End")) {
      return window.location.href = `/gush/workflows/${workflow_id}/jobs/${name}`;
    }
  });

  $(this).on("click", ".jobs-filter dd a", function(event) {
    event.preventDefault();
    const filter = $(this).data('filter');
    $(this).closest('dl').find('dd').removeClass('active');
    $(this).parent().addClass('active');
    return Gush.filterJobs(filter);
  });


  $(this).on("click", "a.remove-completed", function(event) {
    event.preventDefault();
    return Gush.removeCompleted();
  });

  return $(this).on("click", "a.remove-logs", function(event) {
    event.preventDefault();
    return Gush.removeLogs($(this).data('workflow-id'), $(this).data('job-name'));
  });
});
