import { X, Calendar, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';

interface ProjectModalProps {
  project: any;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  const statusConfig = {
    'on-track': { label: 'On Track', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'at-risk': { label: 'At Risk', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
    'critical': { label: 'Critical', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  };

  const status = statusConfig[project.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{project.name}</h2>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
              <span className="text-sm text-gray-600">{project.portfolio} • {project.program}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{project.progress}%</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">SPI</span>
              </div>
              <p className={`text-2xl font-semibold ${project.spi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {project.spi.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {project.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">CPI</span>
              </div>
              <p className={`text-2xl font-semibold ${project.cpi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {project.cpi.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {project.cpi >= 1 ? 'Under budget' : 'Over budget'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Confidence</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{project.deliveryConfidence}%</p>
              <p className="text-xs text-gray-600 mt-1">Delivery confidence</p>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Financial Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Budget</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${(project.budget / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Spent</p>
                <p className="text-xl font-semibold text-blue-600">
                  ${(project.spent / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Forecast</p>
                <p className={`text-xl font-semibold ${project.forecast > project.budget ? 'text-red-600' : 'text-green-600'}`}>
                  ${(project.forecast / 1000000).toFixed(2)}M
                </p>
                {project.forecast > project.budget && (
                  <p className="text-xs text-red-600 mt-1">
                    +${((project.forecast - project.budget) / 1000000).toFixed(2)}M over
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Project Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Project Manager:</dt>
                  <dd className="font-medium text-gray-900">{project.projectManager}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Start Date:</dt>
                  <dd className="font-medium text-gray-900">{project.startDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">End Date:</dt>
                  <dd className="font-medium text-gray-900">{project.endDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Strategic Initiative:</dt>
                  <dd className="font-medium text-gray-900">{project.strategicInitiative}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Schedule Variance:</dt>
                  <dd className={`font-medium ${project.sv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {project.sv > 0 ? '+' : ''}{project.sv} days
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Cost Variance:</dt>
                  <dd className={`font-medium ${project.cv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(project.cv / 1000).toFixed(0)}K
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Value Delivered:</dt>
                  <dd className="font-medium text-gray-900">{project.valueDelivered}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Value Planned:</dt>
                  <dd className="font-medium text-gray-900">{project.valuePlanned}%</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Link
              to={`/project-details?id=${project.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              View Full Details
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}