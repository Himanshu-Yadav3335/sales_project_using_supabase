import supabase from './supabase-client';
import { useEffect, useState } from 'react';
import { Chart } from 'react-charts';

function Dashboard() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetchMetrics()
// channel builds a websocket connection to Database(DB) to listen to changes in a table
  const channel = supabase
      .channel('deal-changes')//creates new real-time channel to listen for changes in the sales_deals table
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'sales_deals'  
        },
        (payload) => {//this fxn runs if any change occurs in table and calls fetchMetrics() to update the chart with new data
          fetchMetrics();
        })
      .subscribe(); //starts the connection to DB and nothing above it works without it

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
	
	async function fetchMetrics() {
    try {
      const { data, error } = await supabase
        .from('sales_deals')
        .select(
          `
          name,
          value.sum()
          `,
        )
      if (error) {
        throw error;
      }
      setMetrics(data);
    } catch (error) {
        console.error('Error fetching metrics:', error);
    }
  }

  const chartData = [
    {
      data: metrics.map((m) => ({
        primary: m.name,
        secondary: m.sum,
      })),
    },
  ];

  const primaryAxis = {
    getValue: (d) => d.primary,
    scaleType: 'band',
    padding: 0.2,
    position: 'bottom',
  };

  function y_max() {
    if (metrics.length > 0) {
      const maxSum = Math.max(...metrics.map((m) => m.sum));
      return maxSum + 2000;
    }
    return 5000; 
  }

  const secondaryAxes = [
    {
      getValue: (d) => d.secondary,
      scaleType: 'linear',
      min: 0,
      max: y_max(),
      padding: {
        top: 20,
        bottom: 40,
      },
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="chart-container">
        <h2>Total Sales This Week (Rs)</h2>
        <div style={{ flex: 1 }}>
          <Chart
            options={{
              data: chartData,
              primaryAxis,
              secondaryAxes,
              type: 'bar',
              defaultColors: ['#58d675'],
              tooltip: {
                show: false,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}


export default Dashboard;