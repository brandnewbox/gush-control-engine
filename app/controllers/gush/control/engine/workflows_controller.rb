module Gush
  module Control
    module Engine
      class WorkflowsController < ActionController::Base
        layout 'gush/control/engine/layouts/application'
        protect_from_forgery with: :exception
        skip_before_action :verify_authenticity_token
        before_action :set_workflow, only: [:show, :purge, :stop, :start]        

        def index          
          @workflows = gush.all_workflows
        end

        def show
          get_jobs_for_workflow
        end

        def purge
          remove_workflow(@workflow)
          head :ok
        end

        def purge_all
          completed = gush.all_workflows.select(&:finished?)
          completed.each { |workflow| remove_workflow(workflow) }
          head :ok
        end

        def stop
          gush.stop_workflow(@workflow.id)
          render json: @workflow.to_json
        end

        def start
          gush.start_workflow(@workflow, [])
          render json: @workflow.to_json
        end

        private

        def gush
          @gush ||= Gush::Client.new
        end

        def set_workflow
          @workflow = gush.find_workflow(params[:id])
        end

        def redis
          Thread.current[:redis] ||= Redis.new(url: gush.configuration.redis_url)
        end

        def format_time(timestamp)
          Time.at(timestamp).asctime if timestamp
        end

        def remove_workflow(workflow)
          gush.destroy_workflow(workflow)
        end

        def get_jobs_for_workflow
          @links = []
          @jobs = []
          @jobs << {name: "Start", klass: "Start"}
          @jobs << {name: "End", klass: "End"}
          @workflow.jobs.each do |job|
            @jobs << {
              name:         job.name,
              klass:        job.class.to_s,
              started_at:   job.started_at,
              finished_at:  job.finished_at,
              enqueued_at:  job.enqueued_at,
              failed_at:    job.failed_at
            }
            @links << {source: "Start", target: job.name, type: "flow"} if job.incoming.empty?
            job.outgoing.each{ |out| @links << {source: job.name, target: out, type: "flow"} }
            @links << {source: job.name, target: "End", type: "flow"} if job.outgoing.empty?            
          end
        end

      end
    end
  end
end
