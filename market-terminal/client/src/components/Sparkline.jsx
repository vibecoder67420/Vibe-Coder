import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function Sparkline({ data, width = 100, height = 32, color }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: 'transparent',
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: { mode: 0 },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      handleScroll: false,
      handleScale: false,
    });

    const lineColor = color || (data[data.length - 1]?.value >= data[0]?.value ? '#00c896' : '#ff4560');

    const series = chart.addAreaSeries({
      lineColor,
      topColor: lineColor + '30',
      bottomColor: lineColor + '05',
      lineWidth: 1.5,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data, width, height, color]);

  return <div ref={containerRef} style={{ width, height }} />;
}
