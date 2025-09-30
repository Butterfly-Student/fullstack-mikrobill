import React, { Component } from 'react';

// Mock CanvasJS untuk demo - dalam aplikasi nyata gunakan @canvasjs/react-charts
const CanvasJSReact = {
  CanvasJS: {},
  CanvasJSChart: class extends Component {
    constructor(props) {
      super(props);
      this.chartRef = React.createRef();
    }

    componentDidMount() {
      this.renderChart();
    }

    componentDidUpdate() {
      this.renderChart();
    }

    renderChart() {
      if (!this.chartRef.current) return;

      const { options } = this.props;
      const container = this.chartRef.current;

      // Clear previous content
      container.innerHTML = '';

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = container.clientWidth || 800;
      canvas.height = container.clientHeight || 400;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      this.drawLineChart(ctx, canvas, options);
    }

    drawLineChart(ctx, canvas, options) {
      const { width, height } = canvas;
      const margin = { top: 60, right: 50, bottom: 60, left: 80 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      // Clear canvas
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw title
      if (options.title?.text) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.title.text, width / 2, 35);
      }

      const datasets = options.data || [];
      if (datasets.length === 0) return;

      // Get all values for scaling
      let allValues = [];
      let allXValues = [];
      datasets.forEach(dataset => {
        if (dataset.dataPoints) {
          allValues = allValues.concat(dataset.dataPoints.map(p => p.y));
          allXValues = allXValues.concat(dataset.dataPoints.map(p => p.x));
        }
      });

      if (allValues.length === 0) return;

      const maxY = Math.max(...allValues);
      const minY = Math.min(...allValues);
      const maxX = Math.max(...allXValues);
      const minX = Math.min(...allXValues);

      const rangeY = maxY - minY || 1;
      const rangeX = maxX - minX || 1;
      const paddingY = rangeY * 0.1;

      const adjustedMaxY = maxY + paddingY;
      const adjustedMinY = Math.max(0, minY - paddingY);
      const adjustedRangeY = adjustedMaxY - adjustedMinY;

      // Draw grid
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (chartHeight * i / 5);
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();

        // Y-axis labels
        const value = adjustedMaxY - (adjustedRangeY * i / 5);
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value), margin.left - 10, y + 4);
      }

      // Vertical grid lines
      for (let i = 0; i <= 8; i++) {
        const x = margin.left + (chartWidth * i / 8);
        ctx.strokeStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();

        // X-axis labels (show time)
        if (allXValues.length > 0) {
          const value = minX + (rangeX * i / 8);
          ctx.fillStyle = '#666';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(value), x, margin.top + chartHeight + 20);
        }
      }

      // Draw each line
      datasets.forEach((dataset, datasetIndex) => {
        const dataPoints = dataset.dataPoints || [];
        if (dataPoints.length === 0) return;

        const color = dataset.color || this.getColor(datasetIndex);

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = dataset.lineThickness || 2;
        ctx.setLineDash([]);

        ctx.beginPath();
        dataPoints.forEach((point, index) => {
          const x = margin.left + ((point.x - minX) / rangeX * chartWidth);
          const y = margin.top + chartHeight - ((point.y - adjustedMinY) / adjustedRangeY * chartHeight);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Draw dots
        ctx.fillStyle = color;
        dataPoints.forEach((point) => {
          const x = margin.left + ((point.x - minX) / rangeX * chartWidth);
          const y = margin.top + chartHeight - ((point.y - adjustedMinY) / adjustedRangeY * chartHeight);

          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });

      // Draw axes
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, margin.top + chartHeight);
      ctx.moveTo(margin.left, margin.top + chartHeight);
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.stroke();

      // Draw legend
      if (datasets.length > 1) {
        this.drawLegend(ctx, datasets, margin.left + chartWidth - 150, margin.top + 15);
      }
    }

    getColor(index) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      return colors[index % colors.length];
    }

    drawLegend(ctx, datasets, x, y) {
      const legendWidth = 130;
      const legendHeight = datasets.length * 20 + 10;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.fillRect(x - 5, y - 5, legendWidth, legendHeight);
      ctx.strokeRect(x - 5, y - 5, legendWidth, legendHeight);

      datasets.forEach((dataset, index) => {
        const legendY = y + 5 + (index * 20);
        const color = dataset.color || this.getColor(index);

        // Line sample
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, legendY + 2);
        ctx.lineTo(x + 15, legendY + 2);
        ctx.stroke();

        // Dot sample
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 7.5, legendY + 2, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Text
        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(dataset.name || `Series ${index + 1}`, x + 20, legendY + 5);
      });
    }

    render() {
      return (
        <div
          ref={this.chartRef}
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#ffffff'
          }}
        />
      );
    }
  }
};

class LiveChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataPoints1: [],
      dataPoints2: [],
      dataPoints3: [],
      xValue: 0,
      isRunning: false
    };

    this.updateInterval = null;
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Generate random data that simulates live sensor data
  generateRandomData = () => {
    const baseValue1 = 50 + Math.sin(this.state.xValue * 0.1) * 20; // Sinusoidal pattern
    const baseValue2 = 40 + Math.cos(this.state.xValue * 0.15) * 15; // Different pattern
    const baseValue3 = 30 + Math.random() * 40; // Random pattern

    return {
      point1: {
        x: this.state.xValue,
        y: Math.round(baseValue1 + (Math.random() - 0.5) * 10) // Add noise
      },
      point2: {
        x: this.state.xValue,
        y: Math.round(baseValue2 + (Math.random() - 0.5) * 8)
      },
      point3: {
        x: this.state.xValue,
        y: Math.round(baseValue3 + (Math.random() - 0.5) * 6)
      }
    };
  }

  updateData = () => {
    const { point1, point2, point3 } = this.generateRandomData();

    this.setState(prevState => {
      // Keep only last 50 points for performance
      const maxPoints = 50;

      let newDataPoints1 = [...prevState.dataPoints1, point1];
      let newDataPoints2 = [...prevState.dataPoints2, point2];
      let newDataPoints3 = [...prevState.dataPoints3, point3];

      if (newDataPoints1.length > maxPoints) {
        newDataPoints1 = newDataPoints1.slice(-maxPoints);
        newDataPoints2 = newDataPoints2.slice(-maxPoints);
        newDataPoints3 = newDataPoints3.slice(-maxPoints);
      }

      return {
        dataPoints1: newDataPoints1,
        dataPoints2: newDataPoints2,
        dataPoints3: newDataPoints3,
        xValue: prevState.xValue + 1
      };
    });
  }

  startLiveData = () => {
    if (!this.state.isRunning) {
      this.setState({ isRunning: true });
      this.updateData(); // Initial data
      this.updateInterval = setInterval(this.updateData, 500); // Update every 500ms
    }
  }

  stopLiveData = () => {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.setState({ isRunning: false });
  }

  clearData = () => {
    this.stopLiveData();
    this.setState({
      dataPoints1: [],
      dataPoints2: [],
      dataPoints3: [],
      xValue: 0,
      isRunning: false
    });
  }

  render() {
    const { dataPoints1, dataPoints2, dataPoints3, isRunning } = this.state;

    const options = {
      animationEnabled: false, // Disable for better performance with live data
      theme: "light2",
      title: {
        text: "Live Data - Multiple Lines"
      },
      backgroundColor: "#ffffff",
      data: [
        {
          type: "line",
          name: "Sensor 1 (°C)",
          color: "#3b82f6",
          lineThickness: 2,
          dataPoints: dataPoints1
        },
        {
          type: "line",
          name: "Sensor 2 (°C)",
          color: "#10b981",
          lineThickness: 2,
          dataPoints: dataPoints2
        },
        {
          type: "line",
          name: "Sensor 3 (°C)",
          color: "#f59e0b",
          lineThickness: 2,
          dataPoints: dataPoints3
        }
      ]
    };

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Data Chart dengan Multiple Lines
          </h1>
          <p className="text-gray-600">
            Simulasi data live dengan 3 sensor suhu yang update setiap 500ms
          </p>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={this.startLiveData}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-medium ${isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {isRunning ? 'Running...' : 'Start Live Data'}
          </button>

          <button
            onClick={this.stopLiveData}
            disabled={!isRunning}
            className={`px-4 py-2 rounded-lg font-medium ${!isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
              }`}
          >
            Stop
          </button>

          <button
            onClick={this.clearData}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600"
          >
            Clear Data
          </button>

          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></span>
            <span className="text-sm text-gray-600">
              Status: {isRunning ? 'Live' : 'Stopped'} |
              Points: {dataPoints1.length}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <CanvasJSReact.CanvasJSChart options={options} />
        </div>

        {/* Info */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Fitur Live Data:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Update otomatis setiap 500ms</li>
              <li>• 3 sensor dengan pola data berbeda</li>
              <li>• Maksimal 50 data points (rolling window)</li>
              <li>• Real-time legend dan scaling</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Pola Data:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <span className="w-3 h-3 bg-blue-500 inline-block rounded mr-1"></span> Sensor 1: Pola sinusoidal + noise</li>
              <li>• <span className="w-3 h-3 bg-green-500 inline-block rounded mr-1"></span> Sensor 2: Pola cosinusoidal + noise</li>
              <li>• <span className="w-3 h-3 bg-yellow-500 inline-block rounded mr-1"></span> Sensor 3: Data random</li>
            </ul>
          </div>
        </div>

        {/* Implementation code */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Implementasi dengan CanvasJS asli:</h3>
          <div className="bg-gray-800 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
            <div>npm install @canvasjs/react-charts</div>
            <div className="mt-2">
              {'// Import CanvasJS'}<br />
              {'import CanvasJSReact from "@canvasjs/react-charts";'}<br />
              {'const CanvasJSChart = CanvasJSReact.CanvasJSChart;'}<br /><br />
              {'// Update data dengan setInterval'}<br />
              {'setInterval(() => {'}<br />
              {'  // Add new data point'}<br />
              {'  dataPoints.push({x: xValue++, y: newValue});'}<br />
              {'  chart.render();'}<br />
              {'}, 500);'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LiveChart;