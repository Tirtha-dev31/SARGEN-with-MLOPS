import { FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';

export default function Overview() {
  const stats = {
    totalCases: 24,
    openCases: 12,
    overdue: 8,
    thisWeek: 12,
    completionRate: 67,
    avgResolutionTime: '4.2 days'
  };

  const recentActivity = [
    { id: 1, action: 'SAR-2024-015 submitted', user: 'Jane Doe', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'SAR-2024-014 flagged for review', user: 'Mike Chen', time: '4 hours ago', type: 'warning' },
    { id: 3, action: 'New case SAR-2024-016 created', user: 'Sarah Wilson', time: '6 hours ago', type: 'info' },
    { id: 4, action: 'SAR-2024-013 approved', user: 'David Kim', time: '1 day ago', type: 'success' },
  ];

  const pendingTasks = [
    { id: 1, case: 'SAR-2024-001', task: 'Complete transaction categorization', priority: 'high', dueDate: '2024-01-16' },
    { id: 2, case: 'SAR-2024-003', task: 'Verify counterparty information', priority: 'medium', dueDate: '2024-01-17' },
    { id: 3, case: 'SAR-2024-007', task: 'Review geographic risk factors', priority: 'high', dueDate: '2024-01-18' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Case Management Overview</h1>
        <p className="text-gray-400">Monitor your SAR pipeline and team performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Open Cases</span>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{stats.openCases}</div>
          <div className="text-sm text-gray-400 mt-1">of {stats.totalCases} total</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Overdue</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
          <div className="text-sm text-gray-400 mt-1">Requires attention</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">This Week</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.thisWeek}</div>
          <div className="text-sm text-gray-400 mt-1">New cases</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Completion Rate</span>
            <CheckCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{stats.completionRate}%</div>
          <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-dark-bg rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-400">by {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Tasks
          </h2>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-4 bg-dark-bg rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-blue-400">{task.case}</p>
                    <p className="text-sm mt-1">{task.task}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary w-full mt-4">View All Tasks</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Create New Case
          </button>
          <button className="btn btn-secondary flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Assign Cases
          </button>
          <button className="btn btn-secondary flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
