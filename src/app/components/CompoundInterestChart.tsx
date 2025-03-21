"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CompoundInterestChartProps {
  balance: number;
  interestRate: number;
}

export default function CompoundInterestChart({
  balance,
  interestRate,
}: CompoundInterestChartProps) {
  const years = 5;
  const dataPoints = Array.from({ length: years * 12 + 1 }, (_, i) => {
    const month = i;
    const amount = balance * Math.pow(1 + interestRate / 100 / 12, month);
    return {
      month,
      amount,
    };
  });

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#4B5563", // text-gray-600
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1F2937", // text-gray-800
        bodyColor: "#4B5563", // text-gray-600
        borderColor: "#E5E7EB", // border-gray-200
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: "600",
        },
        callbacks: {
          label: (context) => {
            return `Balance: $${context.parsed.y.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#F3F4F6", // gray-100
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#6B7280", // text-gray-500
        },
      },
      y: {
        grid: {
          color: "#F3F4F6", // gray-100
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: "#6B7280", // text-gray-500
          callback: (value) => {
            return `$${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  const data = {
    labels: dataPoints.map((point) => {
      const date = new Date();
      date.setMonth(date.getMonth() + point.month);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "Projected Balance",
        data: dataPoints.map((point) => point.amount),
        borderColor: "#3B82F6", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)", // blue-500 with opacity
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#3B82F6",
        pointHoverBorderColor: "#FFFFFF",
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <Line options={options} data={data} />
    </div>
  );
}
