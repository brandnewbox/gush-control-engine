module BroadcastEvents

   def start_workflow(workflow, args=[])
    super(workflow, args=[])
    ActionCable.server.broadcast( "new_workflows_channel", workflow.to_hash )
  end

end

class Gush::Client
  prepend BroadcastEvents
end