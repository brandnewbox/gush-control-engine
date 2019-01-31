# Gush::Control::Engine
Short description and motivation.

## Usage
In your routes file, add:

```Ruby
mount Gush::Control::Engine::Engine, at: "/gush"
```

If you are using Devise, you have access to a handful of helpers that allow you to require authorization / authentication for this (or any other) engine:

```Ruby
authenticate :user, ->(user) { user.roles?(:admin) } do
  mount Gush::Control::Engine::Engine => "/gush"
end
```

Now point your browser to `http://localhost:3000/gush`, or whatever your local endpoint is.

## Installation
Add this line to your application's Gemfile:

```ruby
gem 'gush-control-engine'
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install gush-control-engine
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
