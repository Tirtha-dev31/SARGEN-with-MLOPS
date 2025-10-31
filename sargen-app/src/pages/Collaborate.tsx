import { useState } from 'react';
import { MessageSquare, Send, Plus, CheckCircle, Clock, AlertCircle, Users, UserPlus } from 'lucide-react';

export default function Collaborate() {
  const [activeTab, setActiveTab] = useState('feed');
  const [comment, setComment] = useState('');

  const team = [
    { initials: 'JD', name: 'Jane Doe', role: 'Senior Analyst', color: 'bg-blue-500' },
    { initials: 'MC', name: 'Mike Chen', role: 'Compliance Officer', color: 'bg-green-500' },
    { initials: 'SW', name: 'Sarah Wilson', role: 'Investigator', color: 'bg-purple-500' },
    { initials: 'DK', name: 'David Kim', role: 'Review Manager', color: 'bg-yellow-500' },
  ];

  const activities = [
    {
      id: 1,
      user: 'Jane Doe',
      initials: 'JD',
      action: 'added a comment',
      content: 'The transaction pattern analysis looks comprehensive. I think we should also include the customer\'s historical behavioral data to strengthen the narrative.',
      time: '2 hours ago',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      user: 'Mike Chen',
      initials: 'MC',
      action: 'completed task',
      content: 'Verified all counterparty information',
      time: '4 hours ago',
      color: 'bg-green-500'
    },
    {
      id: 3,
      user: 'Sarah Wilson',
      initials: 'SW',
      action: 'uploaded document',
      content: 'Transaction_Evidence_Report.pdf',
      time: '6 hours ago',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      user: 'David Kim',
      initials: 'DK',
      action: 'requested changes',
      content: 'Please review the geographic risk factors section',
      time: '1 day ago',
      color: 'bg-yellow-500'
    },
  ];

  const tasks = [
    {
      id: 1,
      title: 'Complete transaction categorization',
      assignee: 'Jane Doe',
      initials: 'JD',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-01-16'
    },
    {
      id: 2,
      title: 'Verify counterparty information',
      assignee: 'Mike Chen',
      initials: 'MC',
      priority: 'medium',
      status: 'completed',
      dueDate: '2024-01-17'
    },
    {
      id: 3,
      title: 'Review geographic risk factors',
      assignee: 'Sarah Wilson',
      initials: 'SW',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-01-18'
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Collaboration Hub</h1>
        <p className="text-gray-400">SAR-2024-001 • Marcus Johnson</p>
      </div>

      {/* Team Members */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold">Team</h3>
          </div>
          <button className="btn btn-secondary text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
        <div className="flex items-center gap-3">
          {team.map((member, idx) => (
            <div key={idx} className="text-center">
              <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center font-bold text-sm mb-1`}>
                {member.initials}
              </div>
              <p className="text-xs text-gray-400">{member.name.split(' ')[0]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-6 border-b border-dark-border">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-3 px-1 font-semibold ${
              activeTab === 'feed'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 px-1 font-semibold ${
              activeTab === 'workflow'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Approval Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed / Workflow */}
        <div className="lg:col-span-2">
          <div className="card">
            {activeTab === 'feed' && (
              <>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Team Discussion
                </h3>

                {/* Comment Input */}
                <div className="mb-6 p-4 bg-dark-bg rounded-lg">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold flex-shrink-0">
                      JD
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment... Use @username to mention team members"
                        className="w-full bg-dark-card border border-dark-border rounded-lg p-3 text-sm resize-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">Tip: Use @username to mention team members</p>
                        <button className="btn btn-primary text-sm flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                        {activity.initials}
                      </div>
                      <div className="flex-1">
                        <div className="bg-dark-bg p-4 rounded-lg">
                          <div className="mb-2">
                            <span className="font-semibold">{activity.user}</span>
                            <span className="text-gray-400 text-sm"> {activity.action}</span>
                            <span className="text-gray-500 text-xs ml-2">{activity.time}</span>
                          </div>
                          <p className="text-gray-300">{activity.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'workflow' && (
              <>
                <h3 className="font-bold mb-4">Approval Workflow</h3>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-green-500 bg-dark-bg rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Initial Review</span>
                      </div>
                      <span className="text-xs text-green-400">Completed</span>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">Reviewed by Sarah Wilson on Jan 14, 2024</p>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-dark-bg rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                        <span className="font-semibold">Compliance Review</span>
                      </div>
                      <span className="text-xs text-blue-400">In Progress</span>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">Assigned to Mike Chen</p>
                  </div>

                  <div className="p-4 border-l-4 border-gray-600 bg-dark-bg rounded-lg opacity-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold">Final Approval</span>
                      </div>
                      <span className="text-xs text-gray-400">Pending</span>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">Awaiting David Kim</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Tasks
            </h3>
            <button className="btn btn-secondary text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          {/* Task Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Add a new task..."
              className="input w-full text-sm"
            />
            <div className="flex gap-2 mt-2">
              <select className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs">
                <option>Assignee</option>
                <option>Jane Doe</option>
                <option>Mike Chen</option>
                <option>Sarah Wilson</option>
              </select>
              <select className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs">
                <option>Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border-l-4 ${
                  task.status === 'completed'
                    ? 'bg-green-500/10 border-green-500 opacity-60'
                    : task.priority === 'high'
                    ? 'bg-dark-bg border-red-500'
                    : 'bg-dark-bg border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-600'
                  }`}>
                    {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                        {task.initials}
                      </div>
                      <span className="text-xs text-gray-400">Assigned to {task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
