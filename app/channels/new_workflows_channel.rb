class NewWorkflowsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "new_workflows_channel"
  end
end