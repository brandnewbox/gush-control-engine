Rails.application.routes.draw do
  mount Gush::Control::Engine::Engine, at: "/gush"
end

Gush::Control::Engine::Engine.routes.draw do
  # get "/workflows"                          => "workflows#index"
  # # get "/workflows/show/:workflow_id"        => "workflows#show"
  # # post "/workflows/purge_all"               => "workflows#purge_all"
  # # post "/workflows/purge/:workflow_id"      => "workflows#purge"
  # # post "/workflows/stop/:workflow_id"       => "workflows#stop_workflow"
  # # post "/workflows/start/:workflow_id"      => "workflows#start_workflow"  
  # post "/workflows/start/:workflow_id/job/:job_id"  => "workflows#start_job"
  # get "/workflows/:workflow_id/restart_failed_jobs" => "workflows#restart_failed_jobs"
  # get "/workflows/:workflow_id/jobs/:job_id"        => "workflows#show_job"

  resources :workflows, only: [:index, :show] do
    post :purge_all, on: :collection
    post :purge, on: :member
    post :start, on: :member
    post :stop, on: :member
    post :restart_failed_jobs, on: :member

    resources :jobs, only: [:show] do
      post :start, on: :member
      post :pugre_logs, on: :member
    end    
  end
end