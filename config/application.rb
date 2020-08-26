require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Provides a location for application-wide configuration options.
module Qpixel
  # Direct descendant of the base <tt>Rails::Application</tt>, and the overall parent class of the application.
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    config.exceptions_app = -> (env) do
      ErrorsController.action(:error).call(env)
    end

    # Ensure docker ip added to allowed, given that we are in container
    if File.file?('/.dockerenv') == true
      host_ip = `/sbin/ip route|awk '/default/ { print $3 }'`.strip
      config.web_console.whitelisted_ips << host_ip

      # ==> Configuration for :confirmable
      # A period that the user is allowed to access the website even without
      # confirming their account. 
      days = ENV['CONFIRMABLE_ALLOWED_ACCESS_DAYS'] || '0'
      config.allow_unconfirmed_access_for = (days.to_i).days

    end

  end
end
