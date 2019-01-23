Rails.application.routes.draw do
  mount Gush::Control::Engine::Engine, at: "/gush"
end

Gush::Control::Engine::Engine.routes.draw do
  get "/workflows" => "workflows#index"
  get "/workflows/:workflow_id" => "workflows#show"
end