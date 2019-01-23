module Gush
  module Control
    module Engine
      class WorkflowsController < ActionController::Base
        protect_from_forgery with: :exception
        layout 'gush/control/engine/layouts/application'

        def index
          @workflows = gush.all_workflows
        end

        def show
          @workflow = gush.find_workflow(params[:workflow_id])
          @links = []
          @jobs = []
          @jobs << {name: "Start", klass: "Start"}
          @jobs << {name: "End", klass: "End"}
          @workflow.jobs.each do |job|
            @jobs << {
              name:         job.name,
              klass:        job.class.to_s,
              finished:     job.finished?,
              started_at:   format_time(job.started_at),
              finished_at:  format_time(job.finished_at),
              running:      job.running?,
              enqueued:     job.enqueued?,
              failed:       job.failed?
            }
            if job.incoming.empty?
              @links << {source: "Start", target: job.name, type: "flow"}
            end
            job.outgoing.each do |out|
              @links << {source: job.name, target: out, type: "flow"}
            end

            if job.outgoing.empty?
              @links << {source: job.name, target: "End", type: "flow"}
            end
          end
          return { jobs: @jobs, links: @links }.to_json
        end

        private

        def gush
          @gush ||= Gush::Client.new
        end

        def format_time(timestamp)
          Time.at(timestamp) if timestamp
        end

      end
    end
  end
end
