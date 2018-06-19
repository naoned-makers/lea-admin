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
      // MQTT BROKER
      {
        name: 'broker',
        script: '../lea-broker/service/broker.js',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm',
        watch: ["../lea-broker/service/broker.js"],
        watch_options: {
          "followSymlinks": true
        },
        env: {AVAHI_COMPAT_NOWARN:'1'},
        env_production: {AVAHI_COMPAT_NOWARN:'1'}
      },
  ]
};
