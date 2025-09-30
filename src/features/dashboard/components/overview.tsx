/* App.tsx - Fixed Axis Version */
import { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

interface DataPoint {
  x?: number;
  y: number;
}

const dataPoints1: DataPoint[] = [];
const dataPoints2: DataPoint[] = [];
const updateInterval: number = 2000;
let yValue1: number = 1024;
let yValue2: number = 512;
let xValue: number = 5;

class NetworkTraffic extends Component {
  private chart: any;

  constructor(props: any) {
    super(props);
    this.updateChart = this.updateChart.bind(this);
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
  }

  componentDidMount(): void {
    this.updateChart(20);
    setInterval(this.updateChart, updateInterval);
  }

  toggleDataSeries(e: any): void {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    }
    else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
  }

  updateChart(count?: number): void {
    count = count || 1;
    for (let i = 0; i < count; i++) {
      xValue += 2;
      yValue1 = Math.floor(Math.random() * (102400 - 800 + 1) + 800);  // RX: 800 - 102400 KB/s
      yValue2 = Math.floor(Math.random() * (51200 - 256 + 1) + 256);   // TX: 256 - 51200 KB/s

      dataPoints1.push({
        x: xValue,
        y: yValue1
      });
      dataPoints2.push({
        x: xValue,
        y: yValue2
      });
    }

    this.chart.options.data[0].legendText = " RX Traffic - " + yValue1 + " KB/s";
    this.chart.options.data[1].legendText = " TX Traffic - " + yValue2 + " KB/s";

    this.chart.render();
  }

  render() {
    // Opsi 1: Auto-scaling (tanpa maximum/minimum)
    const optionsAutoScale = {
      zoomEnabled: true,
      theme: "light2",
      axisY: {
        suffix: " KB/s",
        title: "Network Speed",
        // Tidak ada maximum/minimum - biarkan chart auto-scale
      },
      axisX: {
        crosshair: {
          enabled: true,
          snapToDataPoint: true
        }
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 18,
        fontColor: "dimGrey",
        itemclick: this.toggleDataSeries
      },
      data: [
        {
          type: "stepLine",
          color: "#4CAF50",
          yValueFormatString: "#,##0 KB/s",
          showInLegend: true,
          dataPoints: dataPoints1
        },
        {
          type: "stepLine",
          color: "#2196F3",
          yValueFormatString: "#,##0 KB/s",
          showInLegend: true,
          dataPoints: dataPoints2
        }
      ]
    }

    // Fixed scale sesuai permintaan: 0 - 102400 KB/s
    const optionsFixedScale = {
      zoomEnabled: true,
      theme: "light2",
      axisY: {
        suffix: " KB/s",
        title: "Network Speed",
        maximum: 102400,  // Maksimum 102400 KB/s (100 MB/s)
        minimum: 0,       // Minimum 0 KB/s
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 18,
        fontColor: "dimGrey",
        itemclick: this.toggleDataSeries
      },
      data: [
        {
          type: "stepLine",
          color: "#4CAF50",
          yValueFormatString: "#,##0 KB/s",
          showInLegend: true,
          dataPoints: dataPoints1
        },
        {
          type: "stepLine",
          color: "#2196F3",
          yValueFormatString: "#,##0 KB/s",
          showInLegend: true,
          dataPoints: dataPoints2
        }
      ]
    }

    // Gunakan fixed scale 0-102400 KB/s
    const options = optionsFixedScale;

    return (
      <div>
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          Current Values: RX = {yValue1} KB/s, TX = {yValue2} KB/s
        </div>
        <CanvasJSChart options={options}
          onRef={ref => this.chart = ref}
        />
      </div>
    );
  }
}

export default NetworkTraffic;