module Gush
  module Control
    module Engine
      class JobsController < ApplicationController
        layout 'gush/control/engine/layouts/application'
        skip_before_action :verify_authenticity_token
        before_action :set_workflow, only: [:show, :start]
        before_action :set_job, only: [:show, :start]

        def show
        end

        def start
          gush.start_workflow(@workflow, Array(@job))
          @workflow.to_json
        end

        private 

        def gush
          @gush ||= Gush::Client.new
        end

        def set_workflow
          @workflow = gush.find_workflow(params[:workflow_id])
        end

        def set_job
          @job = @workflow.find_job(params[:id])
        end

      end
    end
  end
end