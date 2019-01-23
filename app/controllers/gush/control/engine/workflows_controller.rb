module Gush
  module Control
    module Engine
      class WorkflowsController < ActionController::Base
        protect_from_forgery with: :exception
        layout 'gush/control/engine/layouts/application'

        def index
          @workflows = gush.all_workflows
        end

        private

        def gush
          @gush ||= Gush::Client.new
        end

      end
    end
  end
end
