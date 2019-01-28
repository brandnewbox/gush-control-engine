class WorkflowProgressChannel < ApplicationCable::Channel
  def subscribed
    stream_from "workflow_progress_channel_#{params[:workflow_id]}"
  end
end