<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'monetbil' => [
        'service_key' => env('MONETBIL_SERVICE_KEY', 'L5rXOzz3tvh7LMyYjELj6PS5FrbwtmhN'),
        'service_secret' => env('MONETBIL_SERVICE_SECRET', 'ZTWcGQ583Ws5V6QjGjM6ongL9YvK7MEwreXCIAQY4rnVXcleYeSd20dwHmfYkQK6'),
        'widget_version' => env('MONETBIL_WIDGET_VERSION', 'v2.1'),
        'currency' => env('MONETBIL_CURRENCY', 'XAF'),
        'country' => env('MONETBIL_COUNTRY', 'CM'),
        'lang' => env('MONETBIL_LANG', 'fr'),
    ],

];
