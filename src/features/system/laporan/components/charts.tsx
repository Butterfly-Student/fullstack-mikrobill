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
      const margin = { top: 60, right: 50, bottom: 80, left: 120 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      // Clear canvas with background
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

      // Get all Y values to calculate range
      let allValues = [];
      datasets.forEach(dataset => {
        if (dataset.dataPoints) {
          allValues = allValues.concat(dataset.dataPoints.map(p => p.y));
        }
      });

      const maxY = Math.max(...allValues);
      const minY = Math.min(...allValues);
      const range = maxY - minY;
      const padding = range * 0.1;
      const adjustedMax = maxY + padding;
      const adjustedMin = Math.max(0, minY - padding);
      const adjustedRange = adjustedMax - adjustedMin;

      // Draw grid lines
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 1;

      // Horizontal grid lines and Y-axis labels
      for (let i = 0; i <= 6; i++) {
        const y = margin.top + (chartHeight * i / 6);

        // Grid line
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();

        // Y-axis label
        const value = adjustedMax - (adjustedRange * i / 6);
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(this.formatCurrency(value), margin.left - 10, y + 4);
      }

      // Get x-axis data points from first dataset
      const firstDataset = datasets[0];
      const xValues = firstDataset.dataPoints || [];

      // Vertical grid lines and X-axis labels
      xValues.forEach((point, index) => {
        const x = margin.left + (chartWidth * index / Math.max(1, xValues.length - 1));

        // Grid line
        ctx.strokeStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();

        // X-axis label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const label = point.label || point.x?.toLocaleDateString('id-ID', { month: 'short' }) || `Point ${index + 1}`;
        ctx.fillText(label, x, margin.top + chartHeight + 25);
      });

      // Draw each line dataset
      datasets.forEach((dataset, datasetIndex) => {
        const dataPoints = dataset.dataPoints || [];
        const color = dataset.color || (datasetIndex === 0 ? '#3b82f6' : '#10b981');
        const isDashed = dataset.lineDashType === 'dash';

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = dataset.lineThickness || 3;

        if (isDashed) {
          ctx.setLineDash([8, 4]);
        } else {
          ctx.setLineDash([]);
        }

        // Draw smooth curve
        ctx.beginPath();
        if (dataPoints.length > 0) {
          // Start point
          const startX = margin.left;
          const startY = margin.top + chartHeight - ((dataPoints[0].y - adjustedMin) / adjustedRange * chartHeight);
          ctx.moveTo(startX, startY);

          // Draw curve through all points
          for (let i = 0; i < dataPoints.length; i++) {
            const x = margin.left + (chartWidth * i / Math.max(1, dataPoints.length - 1));
            const y = margin.top + chartHeight - ((dataPoints[i].y - adjustedMin) / adjustedRange * chartHeight);

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              // Simple line to - could be enhanced with bezier curves for smoother splines
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw dots/markers
        ctx.fillStyle = color;
        dataPoints.forEach((point, index) => {
          const x = margin.left + (chartWidth * index / Math.max(1, dataPoints.length - 1));
          const y = margin.top + chartHeight - ((point.y - adjustedMin) / adjustedRange * chartHeight);

          // Draw dot
          ctx.beginPath();
          ctx.arc(x, y, dataset.markerSize || 5, 0, 2 * Math.PI);
          ctx.fill();

          // White border on dots
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });

      // Draw axes borders
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Y-axis
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, margin.top + chartHeight);
      // X-axis  
      ctx.moveTo(margin.left, margin.top + chartHeight);
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.stroke();

      // Draw Y-axis title
      if (options.axisY?.title) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.save();
        ctx.translate(20, margin.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(options.axisY.title, 0, 0);
        ctx.restore();
      }

      // Draw X-axis title
      if (options.axisX?.title) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(options.axisX.title, margin.left + chartWidth / 2, margin.top + chartHeight + 55);
      }

      // Draw legend if multiple datasets
      if (datasets.length > 1) {
        this.drawLegend(ctx, datasets, margin.left + chartWidth - 180, margin.top + 15);
      }
    }

    drawLegend(ctx, datasets, x, y) {
      // Legend background
      const legendWidth = 160;
      const legendHeight = datasets.length * 25 + 10;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.fillRect(x - 5, y - 5, legendWidth, legendHeight);
      ctx.strokeRect(x - 5, y - 5, legendWidth, legendHeight);

      datasets.forEach((dataset, index) => {
        const legendY = y + 5 + (index * 25);
        const color = dataset.color || (index === 0 ? '#3b82f6' : '#10b981');

        // Draw line sample
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        if (dataset.lineDashType === 'dash') {
          ctx.setLineDash([6, 3]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.moveTo(x, legendY + 2);
        ctx.lineTo(x + 20, legendY + 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw dot sample
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 10, legendY + 2, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw text
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(dataset.name || `Series ${index + 1}`, x + 30, legendY + 6);
      });
    }

    formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
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

class LineChart extends Component {
  render() {
    const options = {
      animationEnabled: true,
      title: {
        text: "Perbandingan Penjualan Aktual vs Target"
      },
      axisX: {
        title: "Bulan",
        titleFontSize: 14
      },
      axisY: {
        title: "Penjualan (IDR)",
        titleFontSize: 14
      },
      backgroundColor: "#ffffff",
      data: [
        {
          type: "spline",
          name: "Penjualan Aktual",
          color: "#3b82f6",
          lineThickness: 3,
          markerSize: 6,
          dataPoints: [
            { label: "Jan", y: 400000000 },
            { label: "Feb", y: 300000000 },
            { label: "Mar", y: 450000000 },
            { label: "Apr", y: 280000000 },
            { label: "Mei", y: 390000000 },
            { label: "Jun", y: 520000000 },
            { label: "Jul", y: 480000000 },
            { label: "Agu", y: 520000000 },
            { label: "Sep", y: 450000000 },
            { label: "Okt", y: 480000000 },
            { label: "Nov", y: 520000000 },
            { label: "Des", y: 550000000 }
          ]
        },
        {
          type: "spline",
          name: "Target Penjualan",
          color: "#10b981",
          lineThickness: 3,
          lineDashType: "dash",
          markerSize: 6,
          dataPoints: [
            { label: "Jan", y: 350000000 },
            { label: "Feb", y: 400000000 },
            { label: "Mar", y: 420000000 },
            { label: "Apr", y: 380000000 },
            { label: "Mei", y: 400000000 },
            { label: "Jun", y: 450000000 },
            { label: "Jul", y: 480000000 },
            { label: "Agu", y: 500000000 },
            { label: "Sep", y: 480000000 },
            { label: "Okt", y: 500000000 },
            { label: "Nov", y: 520000000 },
            { label: "Des", y: 540000000 }
          ]
        }
      ]
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Line Chart dengan CanvasJS
          </h1>
          <p className="text-gray-600">
            Chart sederhana dengan dua garis (Aktual vs Target) dan dots pada setiap data point
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <CanvasJSReact.CanvasJSChart options={options} />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Fitur Line Chart:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Garis Biru (Solid):</strong> Data penjualan aktual dengan dots</li>
            <li>• <strong>Garis Hijau (Dashed):</strong> Target penjualan dengan dots</li>
            <li>• <strong>Format IDR:</strong> Nilai Y-axis dalam format Rupiah Indonesia</li>
            <li>• <strong>Legend:</strong> Keterangan untuk membedakan kedua garis</li>
            <li>• <strong>Grid Lines:</strong> Garis bantu untuk memudahkan pembacaan data</li>
          </ul>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Cara Install CanvasJS:</h3>
          <div className="bg-gray-800 text-gray-100 p-3 rounded text-sm font-mono">
            npm install @canvasjs/react-charts
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Kemudian import: <code className="bg-gray-200 px-1 rounded">import CanvasJSReact from '@canvasjs/react-charts';</code>
          </p>
        </div>
      </div>
    );
  }
}

export default LineChart;