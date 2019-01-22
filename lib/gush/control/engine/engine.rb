module Gush
  module Control
    module Engine
      class Engine < ::Rails::Engine
        isolate_namespace Gush::Control::Engine
      end
    end
  end
end
