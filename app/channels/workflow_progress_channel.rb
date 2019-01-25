class WorkflowProgressChannel < ApplicationCable::Channel
  def subscribed
    stream_from "workflow_progress_channel_#{params[:workflow_id]}"
  end

  def send_message(message)
    
  end

end