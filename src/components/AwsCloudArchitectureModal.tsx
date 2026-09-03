import React, { useState } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  ShieldCheck, 
  Bell, 
  Layers, 
  FileCode, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  HardDrive, 
  UploadCloud, 
  FileText, 
  Video, 
  Mail, 
  Activity, 
  Clock, 
  X,
  Cpu
} from 'lucide-react';
import { awsDeploymentService } from '../services/awsDeploymentService';
import { AwsArchitectureDiagram } from './AwsArchitectureDiagram';
import { 
  AwsEcsServiceStatus, 
  S3BucketConfig, 
  S3StoredObject, 
  SnsNotificationEvent, 
  SqsQueueStatus, 
  SesConfiguration, 
  SnsEventType 
} from '../types';

interface AwsCloudArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AwsCloudArchitectureModal: React.FC<AwsCloudArchitectureModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'ecs' | 's3' | 'sns_sqs' | 'terraform' | 'docker'>('topology');
  const [selectedNode, setSelectedNode] = useState<string>('ecs');
  
  // State from AWS Deployment Service
  const [ecsServices, setEcsServices] = useState<AwsEcsServiceStatus[]>(awsDeploymentService.getEcsServices());
  const [s3Buckets] = useState<S3BucketConfig[]>(awsDeploymentService.getS3Buckets());
  const [s3Objects, setS3Objects] = useState<S3StoredObject[]>(awsDeploymentService.getS3Objects());
  const [snsEvents, setSnsEvents] = useState<SnsNotificationEvent[]>(awsDeploymentService.getSnsEvents());
  const [sqsStatus] = useState<SqsQueueStatus>(awsDeploymentService.getSqsStatus());
  const [sesConfig] = useState<SesConfiguration>(awsDeploymentService.getSesConfig());

  // Simulation & interaction states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [presignedResult, setPresignedResult] = useState<{ id: string; url: string; expiresAt: string } | null>(null);
  const [uploadCategory, setUploadCategory] = useState<S3StoredObject['category']>('cad_drawing');
  const [uploadFilename, setUploadFilename] = useState('sans10139-fire-alarm-zone-layout.dwg');
  const [isUploading, setIsUploading] = useState(false);

  // SNS Simulation form
  const [testEventType, setTestEventType] = useState<SnsEventType>('emergency.fault');
  const [testRecipient, setTestRecipient] = useState('sarah.j@mercantile.co.za');
  const [testRecipientName, setTestRecipientName] = useState('Sarah Jenkins');
  const [testUrgency, setTestUrgency] = useState<'critical' | 'high' | 'normal'>('critical');
  const [isPublishingSns, setIsPublishingSns] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGeneratePresignedUrl = (objectId: string) => {
    try {
      const res = awsDeploymentService.generatePresignedUrl(objectId);
      setPresignedResult({ id: objectId, url: res.url, expiresAt: res.expiresAt });
      setS3Objects([...awsDeploymentService.getS3Objects()]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSimulateDirectUpload = async () => {
    setIsUploading(true);
    try {
      const newObj = await awsDeploymentService.simulateDirectS3Upload(
        uploadFilename,
        uploadCategory,
        uploadCategory.includes('video') ? 64800000 : uploadCategory.includes('photo') ? 3800000 : 1850000,
        'org-sandton-01',
        'site-mercantile-01',
        'sr-2026-0891'
      );
      setS3Objects([...awsDeploymentService.getS3Objects()]);
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handlePublishSnsEvent = async () => {
    setIsPublishingSns(true);
    try {
      await awsDeploymentService.publishSnsEvent(
        testEventType,
        testRecipient,
        testRecipientName,
        testEventType.replace('.', '_'),
        'org-sandton-01',
        testUrgency,
        'SR-2026-0891'
      );
      setSnsEvents([...awsDeploymentService.getSnsEvents()]);
      setIsPublishingSns(false);
    } catch (err) {
      setIsPublishingSns(false);
    }
  };

  const handleRunBlueGreenDeployment = () => {
    setIsDeploying(true);
    setDeploymentLog([
      '🚀 Initiating AWS ECS Fargate Blue/Green Rolling Deployment Pipeline...',
      '📦 Validating Docker Hub image: bethuelm/audrin-fire-engineers:latest',
      '🔍 Trivy security scan: 0 Critical / 0 High vulnerabilities detected.',
      '💾 Running controlled one-off database migration on Amazon RDS PostgreSQL...',
      '☁️ Syncing immutable Next.js & Django static assets to S3 static bucket...',
      '⚡ CloudFront invalidation created for /*',
      '🔄 Registering new ECS Task Definitions across 10 services...',
      '🛡️ Celery Beat Singleton lock verified in ElastiCache Redis (1 active instance)...',
      '🚦 ALB Health checks passing: /health/ (200 OK), /api/health/ (200 OK)',
      '✅ Traffic shifted 100% to new revision. Previous tasks drained safely.'
    ]);

    setTimeout(() => {
      setIsDeploying(false);
      const updated = ecsServices.map(s => ({
        ...s,
        lastDeploymentAt: new Date().toISOString()
      }));
      setEcsServices(updated);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="aws-cloud-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">AWS ECS Fargate & Amazon S3 Production Architecture</h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-semibold">
                  LIVE PROD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audrin Fire Engineers • Amazon ECS Fargate, S3 Private Media, SNS/SQS Notification Bus & SES
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-bluegreen-deploy"
              onClick={handleRunBlueGreenDeployment}
              disabled={isDeploying}
              className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
              {isDeploying ? 'Rolling ECS Deploy...' : 'Simulate Blue/Green Deploy'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/50 overflow-x-auto text-xs font-medium">
          <button
            id="tab-aws-topology"
            onClick={() => setActiveTab('topology')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'topology'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Architecture Topology
          </button>
          <button
            id="tab-aws-ecs"
            onClick={() => setActiveTab('ecs')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ecs'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            ECS Fargate Services (10)
          </button>
          <button
            id="tab-aws-s3"
            onClick={() => setActiveTab('s3')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 's3'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            S3 Evidence Vault & Presigned URLs
          </button>
          <button
            id="tab-aws-sns"
            onClick={() => setActiveTab('sns_sqs')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sns_sqs'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            SNS/SQS & SES Notification Engine
          </button>
          <button
            id="tab-aws-terraform"
            onClick={() => setActiveTab('terraform')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'terraform'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Terraform IaC Modules
          </button>
          <button
            id="tab-aws-docker"
            onClick={() => setActiveTab('docker')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'docker'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Docker Hub & CI/CD
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/60">
          
          {/* TAB 1: ARCHITECTURE TOPOLOGY */}
          {activeTab === 'topology' && (
            <div className="space-y-6">
              <AwsArchitectureDiagram 
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
              />

              {/* Deployment Log Box if triggered */}
              {deploymentLog.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-1">
                  <div className="text-slate-400 font-bold mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Live Blue/Green Rollout Progress:
                  </div>
                  {deploymentLog.map((log, idx) => (
                    <div key={idx} className="text-emerald-400/90">{log}</div>
                  ))}
                </div>
              )}

              {/* Key AWS SLA Specifications Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    Zero Permanent Container Storage
                  </div>
                  <p className="text-xs text-slate-400">
                    All ECS Fargate tasks are stateless and horizontally replaceable. All media, CAD, and PDFs reside in Amazon S3.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Lock className="w-4 h-4" />
                    KMS SSE & Presigned Direct S3 Uploads
                  </div>
                  <p className="text-xs text-slate-400">
                    Direct browser uploads bypass web containers. Presigned URLs expire strictly after 900 seconds.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                    <Bell className="w-4 h-4" />
                    Decoupled SNS → SQS → SES Bus
                  </div>
                  <p className="text-xs text-slate-400">
                    Idempotent event dispatching prevents duplicate client emails. Failed attempts automatically route to SQS DLQ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ECS FARGATE SERVICES */}
          {activeTab === 'ecs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Amazon ECS Fargate Service Registry</h3>
                  <p className="text-xs text-slate-400">10 distinct tasks isolating web traffic, async queues, video transcoding, and monitoring</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-medium">
                  Cluster: audrin-fire-cluster-prod
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ecsServices.map(service => (
                  <div 
                    key={service.id}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{service.name}</span>
                          {service.isSingleton && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                              SINGLETON
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{service.serviceName}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {service.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Tasks</div>
                        <div className="font-bold text-white">{service.runningCount} / {service.desiredCount}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">CPU ({service.cpu} units)</div>
                        <div className="font-bold text-emerald-400">{service.cpuUtilization}%</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Memory ({service.memory}MB)</div>
                        <div className="font-bold text-blue-400">{service.memoryUtilization}%</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2">
                      <span className="font-mono truncate max-w-[200px]">{service.taskDefinition}</span>
                      <span>Last deploy: {new Date(service.lastDeploymentAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: S3 EVIDENCE VAULT & PRESIGNED URLS */}
          {activeTab === 's3' && (
            <div className="space-y-6">
              {/* Buckets Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {s3Buckets.map(b => (
                  <div key={b.bucketName} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white capitalize">{b.type.replace('_', ' ')}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono">
                        {b.encryption}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 break-all">{b.bucketName}</div>
                    <div className="flex justify-between text-xs text-slate-300 pt-1">
                      <span>{b.objectCount} objects</span>
                      <span>{(b.totalSizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct S3 Upload Simulator */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">Direct S3 Browser Upload Tester (Presigned POST)</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">Bypasses ECS Web Containers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Evidence Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="cad_drawing">CAD DWG Floorplan</option>
                      <option value="photo_before">Before-Work Photograph</option>
                      <option value="video_processed">4K Inspection Video (Multipart)</option>
                      <option value="report_pre_work">Pre-Work Condition Report (PDF)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Simulated File Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={uploadFilename}
                        onChange={(e) => setUploadFilename(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <button
                        id="btn-simulate-upload"
                        onClick={handleSimulateDirectUpload}
                        disabled={isUploading}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading to S3...' : 'Simulate Direct Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* S3 Objects Explorer */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Statutory S3 Evidence Vault</h4>
                <div className="space-y-2">
                  {s3Objects.map(obj => (
                    <div key={obj.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {obj.category.includes('video') ? (
                            <Video className="w-4 h-4 text-blue-400" />
                          ) : obj.category.includes('photo') ? (
                            <HardDrive className="w-4 h-4 text-amber-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-rose-400" />
                          )}
                          <span className="text-xs font-mono text-slate-200">{obj.key}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono">
                            {obj.encryption}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">
                            {(obj.sizeBytes / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            onClick={() => handleGeneratePresignedUrl(obj.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-all"
                          >
                            Get Presigned URL (15m)
                          </button>
                        </div>
                      </div>

                      {presignedResult && presignedResult.id === obj.id && (
                        <div className="p-2.5 bg-slate-900 border border-amber-500/40 rounded text-xs space-y-1">
                          <div className="text-amber-400 font-semibold flex items-center justify-between">
                            <span>Temporary Presigned URL (Expires: {new Date(presignedResult.expiresAt).toLocaleTimeString()}):</span>
                            <button
                              onClick={() => handleCopy(presignedResult.url, 'presigned')}
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === 'presigned' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              Copy Link
                            </button>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 break-all">{presignedResult.url}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SNS / SQS & SES NOTIFICATION ENGINE */}
          {activeTab === 'sns_sqs' && (
            <div className="space-y-6">
              {/* Architecture metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Amazon SES Reputation</div>
                  <div className="text-base font-bold text-emerald-400">{sesConfig.dkimStatus}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Bounce: {sesConfig.bounceRatePercent}%</div>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">SQS Queue Depth</div>
                  <div className="text-base font-bold text-white">{sqsStatus.approximateNumberOfMessages} queued</div>
                  <div className="text-[10px] text-slate-500 mt-1">Visibility: 300s</div>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Dead-Letter Queue (DLQ)</div>
                  <div className="text-base font-bold text-emerald-400">{sqsStatus.deadLetterMessageCount} errors</div>
                  <div className="text-[10px] text-slate-500 mt-1">14d retention</div>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">SES Daily Quota</div>
                  <div className="text-base font-bold text-blue-400">{sesConfig.sentLast24Hours} / {sesConfig.dailySendingQuota}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Cape Town SES</div>
                </div>
              </div>

              {/* Publish SNS Simulator */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <h4 className="text-xs font-bold text-white">Trigger Amazon SNS Event → SQS → SES Dispatch</h4>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">audrin-client-notifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Event Type</label>
                    <select
                      value={testEventType}
                      onChange={(e) => setTestEventType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="emergency.fault">emergency.fault (Critical Fault SLA)</option>
                      <option value="report.pre_work_generated">report.pre_work_generated (Condition Report)</option>
                      <option value="site_visit.scheduled">site_visit.scheduled (Quarterly Periodic Test)</option>
                      <option value="evidence.processed">evidence.processed (S3 Video Transcoded)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      id="btn-publish-sns"
                      onClick={handlePublishSnsEvent}
                      disabled={isPublishingSns}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isPublishingSns ? 'Publishing SNS...' : 'Publish Event to SNS Bus'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Audit Trail */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live SNS Event Audit History</h4>
                <div className="space-y-2">
                  {snsEvents.map(evt => (
                    <div key={evt.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{evt.eventType}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            evt.urgency === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {evt.urgency.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          SES Delivered ({evt.sesMessageId})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex justify-between">
                        <span>To: {evt.recipientName} ({evt.recipientEmail})</span>
                        <span className="font-mono text-[10px]">Topic: {evt.topicName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Idempotency Key: {evt.idempotencyKey}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TERRAFORM IAC */}
          {activeTab === 'terraform' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Terraform Infrastructure as Code (Production Modules)</h3>
                  <p className="text-xs text-slate-400">Complete multi-AZ VPC, ALB, ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, KMS, SNS, SQS, SES</p>
                </div>
                <button
                  onClick={() => handleCopy('terraform init && terraform apply -var-file="production.tfvars"', 'tf-cmd')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5"
                >
                  {copiedKey === 'tf-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Apply Command
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
                <div className="text-amber-400 font-bold"># terraform/main.tf</div>
                <div>terraform {'{'}</div>
                <div>&nbsp;&nbsp;required_version = "&gt;= 1.5.0"</div>
                <div>&nbsp;&nbsp;backend "s3" {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;bucket = "audrin-fire-terraform-state-prod"</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;key    = "production/terraform.tfstate"</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;region = "af-south-1"</div>
                <div>&nbsp;&nbsp;{'}'}</div>
                <div>{'}'}</div>
                <div className="text-slate-500 pt-2"># Modules provisioned in /terraform/ directory:</div>
                <div className="text-emerald-400">• vpc.tf (Public, Private App, Private DB subnets across Multi-AZ)</div>
                <div className="text-emerald-400">• ecs.tf (10 Fargate task definitions with Celery Beat Singleton)</div>
                <div className="text-emerald-400">• s3.tf (Static, Private Media, Quarantine with SSE-KMS & TLS)</div>
                <div className="text-emerald-400">• alb.tf (Route rules: / &rarr; Next.js, /api/ &rarr; Django, /secure-admin/)</div>
                <div className="text-emerald-400">• rds.tf (PostgreSQL 16 Multi-AZ with storage encryption)</div>
                <div className="text-emerald-400">• elasticache.tf (Redis Cluster for Celery broker & lock)</div>
                <div className="text-emerald-400">• sns_sqs.tf (Encrypted topics & SQS DLQ queues)</div>
                <div className="text-emerald-400">• ses.tf (DKIM, SPF, DMARC, bounce/complaint handling)</div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCKER HUB & CI/CD */}
          {activeTab === 'docker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Docker Hub Container Registry & GitHub Actions CI/CD</h3>
                  <p className="text-xs text-slate-400">Automated multi-platform builds and deployment pipeline</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-white">Docker Hub Repository:</span>
                  <span className="text-blue-400 font-semibold">bethuelm/audrin-fire-engineers</span>
                </div>

                <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1 text-slate-300">
                  <div className="text-slate-500"># Login & Build Container</div>
                  <div>docker login -u bethuelm</div>
                  <div>docker build -t bethuelm/audrin-fire-engineers:latest .</div>
                  <div>docker push bethuelm/audrin-fire-engineers:latest</div>
                </div>

                <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1 text-slate-300">
                  <div className="text-slate-500"># GitHub Actions Secrets Required:</div>
                  <div>DOCKER_USERNAME: bethuelm</div>
                  <div>DOCKERHUB_TOKEN: &lt;configured-in-github-secrets&gt;</div>
                  <div>AWS_ACCESS_KEY_ID: **********</div>
                  <div>AWS_SECRET_ACCESS_KEY: **********</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
