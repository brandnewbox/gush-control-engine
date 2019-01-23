module Gush
  module Control
    module Engine
      class ApplicationController < ActionController::Base
        protect_from_forgery with: :exception
        layout 'application'
      end
    end
  end
end
