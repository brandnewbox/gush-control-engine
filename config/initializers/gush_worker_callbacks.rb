class Gush::Worker
  after_perform do |job|
    workflow = job.send(:client).find_workflow(job.arguments[0])
    broadcast_to( "workflow_progress_channel_#{workflow_id}", workflow )
  end

  def broadcast_to(channel, workflow)
    ActionCable.server.broadcast( channel, workflow.to_hash )
  end    
end
