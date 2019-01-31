class Gush::Worker
  after_perform do |job|
    workflow = job.send(:client).find_workflow(job.arguments[0])
    broadcast_to( "workflow_progress_channel_#{workflow_id}", workflow.to_hash.merge({ jobs: workflow.jobs }) )
  end

  def broadcast_to(channel, message)
    ActionCable.server.broadcast( channel, message )
  end    
end
