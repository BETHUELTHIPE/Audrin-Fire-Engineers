import React from 'react';
import { 
  ShieldCheck, 
  Server, 
  Database, 
  Cloud, 
  Lock, 
  Bell, 
  Mail, 
  Cpu, 
  HardDrive, 
  Radio, 
  FileText, 
  Video, 
  Activity,
  Layers
} from 'lucide-react';

interface AwsArchitectureDiagramProps {
  onSelectNode?: (nodeId: string) => void;
  selectedNode?: string;
}

export const AwsArchitectureDiagram: React.FC<AwsArchitectureDiagramProps> = ({ 
  onSelectNode,
  selectedNode = 'ecs'
}) => {
  return (
    <div id="aws-architecture-diagram-container" className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-100 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AWS ECS Fargate & Amazon S3 Production Topology</h3>
              <p className="text-xs text-slate-400">Multi-AZ High Availability • Zero-Local-Storage • SSE-KMS Encrypted • SANS 10139 Compliant</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AWS af-south-1 (Cape Town)
            </span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full font-mono">
              Docker: bethuelm/audrin-fire-engineers
            </span>
          </div>
        </div>

        {/* Visual Architecture Flow Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Level 1: Edge & Ingress Layer (Cols 1-3) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              1. Edge & Load Balancing
            </div>

            {/* Route 53 & ACM */}
            <div 
              id="node-route53"
              onClick={() => onSelectNode?.('route53')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedNode === 'route53'
                  ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Route 53 & ACM TLS</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono">DNS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">audrinfire.co.za (TLS 1.3 Strict)</p>
            </div>

            {/* AWS WAF */}
            <div 
              id="node-waf"
              onClick={() => onSelectNode?.('waf')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedNode === 'waf'
                  ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">AWS WAF v2</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-mono">Firewall</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Rate-limiting, Bot Control, SQLi shield</p>
            </div>

            {/* CloudFront + S3 Static */}
            <div 
              id="node-cloudfront"
              onClick={() => onSelectNode?.('cloudfront')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedNode === 'cloudfront'
                  ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-300">CloudFront CDN + OAC</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono">Edge S3</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Static Next.js / Django Admin assets</p>
            </div>

            {/* Application Load Balancer */}
            <div 
              id="node-alb"
              onClick={() => onSelectNode?.('alb')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                selectedNode === 'alb'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-300">Application Load Balancer</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">ALB</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                <div><code className="text-slate-300">/</code> → Next.js Frontend (Port 80)</div>
                <div><code className="text-slate-300">/api/</code> → Nginx → Django (Port 8000)</div>
                <div><code className="text-slate-300">/secure-admin/</code> → Django Admin</div>
              </div>
            </div>
          </div>

          {/* Level 2: Amazon ECS Fargate Application Cluster (Cols 4-8) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                2. Amazon ECS Fargate Cluster
              </span>
              <span className="text-[10px] text-emerald-400 font-normal">Stateless & Multi-AZ</span>
            </div>

            <div 
              id="node-ecs"
              onClick={() => onSelectNode?.('ecs')}
              className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2.5 ${
                selectedNode === 'ecs'
                  ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500' 
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="grid grid-cols-2 gap-2">
                {/* Task 1: Next.js */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span>Next.js Frontend</span>
                    <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">2 Tasks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Client & Customer Portal</p>
                </div>

                {/* Task 2: Nginx Proxy */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span>Nginx Proxy</span>
                    <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">2 Tasks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Gzip, buffering, security</p>
                </div>

                {/* Task 3: Django Backend */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span>Django & Gunicorn</span>
                    <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">2 Tasks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">REST API, Admin, S3 Auth</p>
                </div>

                {/* Task 4: Celery Beat (Singleton) */}
                <div className="p-2.5 bg-amber-950/20 border border-amber-500/40 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
                    <span>Celery Beat</span>
                    <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-bold">1 Task (Singleton)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Distributed Redis lock</p>
                </div>

                {/* Task 5: Video & Doc Worker */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span>Video/Doc Worker</span>
                    <span className="text-[9px] px-1 bg-blue-500/20 text-blue-400 rounded">30GB Storage</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">FFmpeg, CAD, PDF Report</p>
                </div>

                {/* Task 6: Notification Worker */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span>Notification Worker</span>
                    <span className="text-[9px] px-1 bg-rose-500/20 text-rose-400 rounded">2 Tasks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">SQS consumer → SES emails</p>
                </div>
              </div>

              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded text-[10px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  ECS Task IAM Role (Zero Static API Keys)
                </span>
                <span className="text-slate-500">Auto-scaling enabled</span>
              </div>
            </div>

            {/* Database & Caching Tier */}
            <div className="grid grid-cols-2 gap-2">
              <div 
                id="node-rds"
                onClick={() => onSelectNode?.('rds')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedNode === 'rds'
                    ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-300">Amazon RDS</span>
                  <span className="text-[9px] px-1 bg-blue-500/20 text-blue-300 rounded">Multi-AZ</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">PostgreSQL 16 (Encrypted, 30d backup)</p>
              </div>

              <div 
                id="node-redis"
                onClick={() => onSelectNode?.('redis')}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedNode === 'redis'
                    ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-300">ElastiCache Redis</span>
                  <span className="text-[9px] px-1 bg-rose-500/20 text-rose-300 rounded">Cluster</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Celery Broker & Distributed Lock</p>
              </div>
            </div>
          </div>

          {/* Level 3: Amazon S3 & Event Notification Engine (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              3. S3 Storage & Notification Bus
            </div>

            {/* S3 Storage Multi-Bucket */}
            <div 
              id="node-s3"
              onClick={() => onSelectNode?.('s3')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
                selectedNode === 's3'
                  ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300">Amazon S3 Storage Buckets</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">SSE-KMS</span>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">Static Assets Bucket</span>
                  <span className="text-slate-500">CloudFront OAC</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <span className="text-amber-400 font-medium">Private Media Bucket</span>
                  <span className="text-slate-400">Presigned 15m</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <span className="text-rose-400">Quarantine Vault</span>
                  <span className="text-slate-500">14d Auto-Purge</span>
                </div>
              </div>
            </div>

            {/* SNS -> SQS -> SES Pipeline */}
            <div 
              id="node-sns"
              onClick={() => onSelectNode?.('sns')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
                selectedNode === 'sns'
                  ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300">Amazon SNS & SQS Bus</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">Event-Driven</span>
              </div>
              <div className="p-2 bg-slate-950/90 rounded border border-slate-800 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Django/Celery</span>
                  <span>→</span>
                  <span className="text-purple-400 font-mono">Amazon SNS</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-purple-400 font-mono">Amazon SNS</span>
                  <span>→</span>
                  <span className="text-blue-400 font-mono">Amazon SQS (DLQ)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-blue-400 font-mono">Worker</span>
                  <span>→</span>
                  <span className="text-emerald-400 font-mono">Amazon SES Email</span>
                </div>
              </div>
            </div>

            {/* CloudWatch & KMS */}
            <div 
              id="node-monitoring"
              onClick={() => onSelectNode?.('monitoring')}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                selectedNode === 'monitoring'
                  ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300 font-medium">CloudWatch & KMS</span>
              </div>
              <span className="text-[10px] text-slate-500">Logs, Alarms & Keys</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
