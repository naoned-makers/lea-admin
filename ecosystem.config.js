module.exports = {
  apps: [
    // admin 
    {
      name: 'admin',
      script: './index.js',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["index.js"],
      ignore_watch: ["node_modules"],
      watch_options: {
        "followSymlinks": true
      },
      env: {AVAHI_COMPAT_NOWARN:'1'},
      env_production: {AVAHI_COMPAT_NOWARN:'1'}
    },
    // WEB STATIC
    {
      name: 'web',
      script: '../im-broker/service/web.js',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["service/web.js"],
      ignore_watch: ["node_modules"],
      watch_options: {
        "followSymlinks": true
      },
      env: {},
      env_production: {}
    },
    // MQTT BROKER
    {
      name: 'broker',
      script: '../im-broker/service/broker.js',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["service/broker.js"],
      watch_options: {
        "followSymlinks": true
      },
      env: {},
      env_production: {}
    },

    // DDD agregate: im brain
    {
      name: 'brain',
      script: '../im-broker/service/brain.js',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["service/brains.js", "domain/*"],
      watch_options: {
        "followSymlinks": true
      },
      env: {},
      env_production: {}
    }
    ,
    // firebase gateway
    {
      name: 'cloud',
      script: '../im-broker/service/cloud.js',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["service/cloud.js"],
      watch_options: {
        "followSymlinks": true
      },
      env: {},
      env_production: {}
    }
    ,
    // python hardware-gateway
    {
      name: 'pwmhat',
      //interpreter:'/usr/bin/python'
      interpreter_args: '-u',
      script: '../im-broker/python/pwmhat.py',
      restart_delay: 1000,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["python/pwmhat.py"],
      watch_options: {
        "followSymlinks": true
      },
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        IM_PWMHAT_MOCK: 'True'
      },
      // Environment variables injected when starting with --env production
      env_production: {
        IM_PWMHAT_MOCK: 'False'
      }
    }
    ,
    // python hardware-gateway
    {
      name: 'neopixel',
      //interpreter:'/usr/bin/python'
      interpreter_args: '-u',
      script: '../im-broker/python/neopixel.py',
      restart_delay: 1000,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      watch: ["python/neopixel.py"],
      watch_options: {
        "followSymlinks": true
      },
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        IM_NEOPIXEL_MOCK: 'True'
      },
      // Environment variables injected when starting with --env production
      env_production: {
        IM_NEOPIXEL_MOCK: 'False'
      }
    }
    ,
    {
      name: 'camera',
      //interpreter:'/usr/bin/python'
      interpreter_args: '-u',
      script: '../im-camera/src/main.py',
      args:'-d',
      restart_delay: 1000,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm',
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        IM_CAMERA_MOCK: 'True'
      },
      env_production: {
        IM_CAMERA_MOCK: 'False'
      }
    }
  ]
};
