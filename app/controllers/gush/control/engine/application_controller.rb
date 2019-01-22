module Gush
  module Control
    module Engine
      class ApplicationController < ActionController::Base
        protect_from_forgery with: :exception
      end
    end
  end
end
