import React from "react";
import MetricsCards from "./MetricsCards";
import ChartsSection from "./ChartsSection";
import TasksTable from "./TasksTable";

const Dashboard = ({ data, settings, reportType }) => {
  if (!data) return null;

  return (
    <div>
      <MetricsCards data={data} settings={settings} />
      <ChartsSection data={data} settings={settings} reportType={reportType} />
      <TasksTable data={data} settings={settings} />
    </div>
  );
};

export default Dashboard;
