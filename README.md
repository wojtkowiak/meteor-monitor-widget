# Meteor Monitor Widget

![Widgets screenshot](https://github.com/wojtkowiak/meteor-monitor-widget/blob/master/widget.png)

Tiny draggable little widget with chart, made for the purpose of quick overview of some key app metrics.
This was made for a concrete use case of monitoring transfer rate but I think it might be easily used for other metrics like online users count etc.

## Installation

    meteor add omega:monitor-widget
    
## Usage

First you have to provide a reactive single value data source. Here is dummy example with `Session`:
```javascript
Meteor.startup(() => {
    Session.set('value1', 1);
    Session.set('value2', 1);
    Meteor.setInterval(() => {
        Session.set('value1', Math.floor((Math.random() * 100) + 1));
        Session.set('value2', Math.floor((Math.random() * 100) + 1));
    }, 1000);
});
```

Then you need to wrap those reactive values in a helpers like this:
```javascript
Template.body.testDataSource = () => {
  return Session.get('value1');
};
Template.body.testDataSource2 = () => {
    return Session.get('value2');
};
```
_Important! The chart is updated only when the data sources are reactively changed. It does not auto refresh every 1s or so which is a behaviour you might have expected.__

And finally in your template include the widget's template like this:
```html
{{>monitorWidget units="kb/s" graphHistoryCount=60 firstChartName='Up' widgetName='Test' secondChartName='Down' minScale=1 firstDataSource=testDataSource secondDataSource=testDataSource2}}
```

You can also check how [meteor-transfer-rate-monitor](https://github.com/wojtkowiak/meteor-transfer-rate-monitor/blob/master/src/templates/transferRate.html) packages is using it.

### API

Public properties you can pass when including the `monitorWidget` template:

 * **class** - wraps the widgets html in a div with a custom class name (see styling section below)
 * **graphWidth** - width of the chart in pixels (can not be lower than 120, default 120)
 * **graphHistoryCount** - the number of elements in the graph (can not be higher than the graphWidth, should be equal to graphWidth or be a divisor of it)
 * **marginTop** - sets the `margin-top` css property of the widget
 * **units** - units name in a string like for example "kb/s"
 * **firstChartName** & **secondChartName** - names of the data sets
 * **widgetName** - widget's title
 * **minScale** - the minimal highest value represented on the chart (defaults to 1) 
 * **firstDataSource** & **secondDataSource** - helpers with reactive data should be passed here
 
### Styling
 
Feel free to overwrite the default css styles. You can also make different themes if you want - use **class** property for that or just wrap the widget with `div`.
If you just need to adjust the colors here is a quick css gist you can use:

```css
.monitorWidgetBackgroundColor { background: #002; }
.monitorWidgetHeaderTextColor { color: #0ff; }
.monitorWidgetFirstDataSourceColor { background-color: #0f0; }
.monitorWidgetSecondDataSourceColor { background-color: #f08; }
.monitorWidgetFirstDataSourceHeaderColor { color: #0f0; }
.monitorWidgetSecondDataSourceHeaderColor { color: #f08; }
.monitorWidgetGraphBackgroundColor { background: #002; }
```

## Contributing

If you discovered a bug please file an issue. PR are always welcome.

## TODO

- save the position of the widget in local storage
- draw on canvas

