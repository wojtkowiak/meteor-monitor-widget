const templateInstanceToClassInstanceMap = new WeakMap();

/**
 * Class responsible for rendering the MonitorWidget.
 */
class MonitorWidget {

    /**
     * Constructor for this widget class. Every template instance must have a separate instance of this class.
     *
     * @param {Template} templateInstance - Reference to the template instance.
     * @param {Element}  graphElement     - Reference to the html element that holds the graph.
     */
    constructor(templateInstance, graphElement) {
        _.extend(this, {
            graphElements: [],
            graphElement,
            dataSets: [],
            graphWidth: templateInstance.graphWidth(),
            dataSetMaxCount: templateInstance.graphHistoryCount(),
            elementsCount: 0,
            dataSetCount: 0,
            minScale: templateInstance.data.minScale ? templateInstance.data.minScale : 0
        });

        this.elementsWidth = this.graphWidth / this.dataSetMaxCount;
        this.elementsCount = this.graphWidth / this.elementsWidth;

        if (templateInstance.data.firstDataSource !== undefined) {
            this.initDataSet(0);
            this.addGraphDataSetElements(0);
        }
        if (templateInstance.data.secondDataSource !== undefined) {
            this.initDataSet(1);
            this.addGraphDataSetElements(1);
        }
    }

    /**
     * Create the elements in the graph that will represent values.
     *
     * @param {number} dataSetId Data set id.
     */
    addGraphDataSetElements(dataSetId) {
        const position = dataSetId === 0 ? 'bottom: 4px' : 'top: 25px';
        const color = dataSetId === 0 ? 'monitorWidgetFirstDataSourceColor' : 'monitorWidgetSecondDataSourceColor';
        let right = 4;
        let element;

        for (let i = 0; i < this.elementsCount; i++) {
            element = document.createElement('div');
            element.style.cssText = `right:${right}px;height:0px;width:${this.elementsWidth}px;${position}`;
            element.className = `monitorWidgetGraphElement ${color}`;
            right += this.elementsWidth;
            this.graphElement.append(element);
            this.graphElements[dataSetId].push(element);
        }
    }

    /**
     * Initializes arrays for data set.
     *
     * @param {number} dataSetId Data set id.
     */
    initDataSet(dataSetId) {
        this.dataSets[dataSetId] = [];
        this.dataSetCount = this.dataSets.length;
        this.graphElements[dataSetId] = [];
    }

    /**
     * Calculates new max and updates graph html elements.
     */
    updateGraph() {
        for (const dataSet in this.dataSets) {
            if (this.dataSets.hasOwnProperty(dataSet)) {
                if (this.graphElements[dataSet].length === 0) return;
                let max = Math.max(...this.dataSets[dataSet]);
                if (max < this.minScale) max = this.minScale;

                this.dataSets[dataSet].forEach((value, id) => this.updateGraphElement(dataSet, value, id, max));
            }
        }
    }

    /**
     * Updates single html graph element.
     *
     * @param {number} dataSetId - Data set id.
     * @param {*}      value     - Value of the element.
     * @param {number} id        - Id of the element.
     * @param {number} max       - Max value of the current graph.
     */
    updateGraphElement(dataSetId, value, id, max) {
        const height = Math.round((value / max * 30) / this.dataSetCount) + 'px';
        if (this.graphElements[dataSetId][id].style.height !== height) {
            this.graphElements[dataSetId][id].style.height = height;
        }
    }

    /**
     * Puts new values in the graph history.
     *
     * @param {Array} values - Reactively changed values of data sets. These should come from the template.
     */
    updateValues(...values) {
        if (this.dataSets.length === 0) return;
        let dataSet = 0;

        // arguments[@@iterator] is not available in FF<46 so using for.
        for (const value of values) {
            if (value !== undefined && value !== null) {
                this.dataSets[dataSet].unshift(value);
                if (this.dataSets[dataSet].length > this.elementsCount) {
                    this.dataSets[dataSet].pop();
                }
                this.updateGraph();
            }
            dataSet++;
        }
    }
}

Template.monitorWidget.onCreated(function monitorWidgetCreated() {
    // Some basic validation.
    this.graphWidth = () => {
        if (!this.data.graphWidth || this.data.graphWidth < 120) return 120;
        return this.data.graphWidth;
    };
    this.graphHistoryCount = () => {
        if (!this.data.graphHistoryCount || this.data.graphHistoryCount > this.graphWidth()) return this.graphWidth();
        return this.data.graphHistoryCount;
    };
});

Template.monitorWidget.helpers({
    graphWidth: () => Template.instance().graphWidth(),

    // This helper is invoked to pass the reactively changed values to the MonitorWidget instance.
    updateGraph: () => {
        const templateInstance = Template.instance();
        const monitorWidgetInstance = templateInstanceToClassInstanceMap.get(templateInstance);
        if (monitorWidgetInstance) {
            monitorWidgetInstance.updateValues(templateInstance.data.firstDataSource, templateInstance.data.secondDataSource);
        }
    }
});

Template.monitorWidget.onRendered(function monitorWidgetRendered() {
    // Assign the MonitorWidget instance to this template instance.
    templateInstanceToClassInstanceMap.set(Template.instance(), new MonitorWidget(Template.instance(), this.$('.monitorWidgetGraph')));
    $('.monitorWidgetWrapper').draggable();
});
