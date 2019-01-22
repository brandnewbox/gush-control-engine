Rails.application.routes.draw do
  mount Gush::Control::Engine::Engine => "/gush-control-engine"
end
