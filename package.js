Package.describe({
    name: 'omega:monitor-widget',
    version: '0.1.0',
    summary: 'Tiny draggable graph for representing some basic app metrics.',
    git: 'https://github.com/wojtkowiak/meteor-monitor-widget',
    documentation: 'README.md'
});

Package.onUse(function monitorWidgetOnUse(api) {
    api.versionsFrom('1.1.0.3');
    api.use(['templating', 'ecmascript'], 'client');
    api.use('dbernhard:jquery-ui-draggable', 'client');
    api.addFiles([
        'src/monitorWidget.css',
        'src/monitorWidget.html',
        'src/MonitorWidget.js'
    ], 'client');
});
