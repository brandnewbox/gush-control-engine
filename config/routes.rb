Rails.application.routes.draw do
  mount Gush::Control::Engine::Engine, at: "/gush"
end

Gush::Control::Engine::Engine.routes.draw do

  resources :workflows, only: [:index, :show] do
    post :purge_all, on: :collection
    post :purge, on: :member
    post :start, on: :member
    post :stop, on: :member
  end
end