module Gush
  module Control
    module Engine
      class WorkflowsController < ActionController::Base
        protect_from_forgery with: :exception
        skip_before_action :verify_authenticity_token
        before_action :set_workflow, only: [:show, :restart_failed_jobs, :purge, :stop_workflow, :start_workflow, :start_job, :show_job]
        layout 'gush/control/engine/layouts/application'

        def index
          @workflows = gush.all_workflows
        end

        def show
          get_jobs_for_workflow
        end

        def restart_failed_jobs
          get_jobs_for_workflow
          render json: { jobs: @jobs, links: @links }.to_json
        end

        def purge
          remove_workflow_and_logs(@workflow)
          head :ok
        end

        def purge_all
          completed = gush.all_workflows.select(&:finished?)
          completed.each { |workflow| remove_workflow_and_logs(workflow) }
          head :ok
        end

        def stop_workflow
          gush.stop_workflow(@workflow)
          @workflow.to_json
        end

        def start_workflow
          gush.start_workflow(@workflow, [])
          @workflow.to_json
        end

        def start_job
          gush.start_workflow(@workflow, Array(params[:job_id]))
          @workflow.to_json
        end

        def show_job
          @job = @workflow.find_job(params[:job_id])
          render template: "gush/control/engine/workflows/job"
        end

        private

        def gush
          @gush ||= Gush::Client.new
        end

        def set_workflow
          @workflow = gush.find_workflow(params[:workflow_id])
        end

        def redis
          Thread.current[:redis] ||= Redis.new(url: gush.configuration.redis_url)
        end

        def format_time(timestamp)
          Time.at(timestamp).asctime if timestamp
        end

        def remove_workflow_and_logs(workflow)
          remove_workflow(workflow)
          remove_logs(workflow)
        end

        def remove_workflow(workflow)
          gush.destroy_workflow(workflow)
        end

        def remove_logs(workflow)
          redis.keys("gush.logs.#{workflow.id}.*").each {|key| redis.del(key) }
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
              finished:     job.finished?,
              started_at:   format_time(job.started_at),
              finished_at:  format_time(job.finished_at),
              running:      job.running?,
              enqueued:     job.enqueued?,
              failed:       job.failed?
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
