Gush::Control::Engine::Engine.routes.draw do
  root to: "workflows#index"
  resources :workflows, only: [:index, :show] do
    post :purge_all, on: :collection
    post :purge, on: :member
    post :start, on: :member
    post :stop, on: :member
  end
end
