window.Gush = new Gush;

$(document).ready(function() {
  const jobs = $('#jobs').data('list') || [];
  window.Gush.initialize(jobs);
  Foundation.global.namespace = '';
  $(document).foundation();

  $(this).on("click", ".destroy-workflow", function(event) {
    event.preventDefault();
    return Gush.destroyWorkflow($(this).data("workflow-id"), $(this));
  });

  $(this).on("click", ".retry-workflow", function(event) {
    event.preventDefault();
    return Gush.retryWorkflow($(this).data("workflow-id"), $(this));
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

});
