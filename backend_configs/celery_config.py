"""
Audrin Fire Engineers - Celery & Celery Beat Singleton Configuration
Enforces single-scheduler execution and task routing across dedicated ECS workers.
"""

import os
import redis
from celery import Celery
from celery.schedules import crontab
from kombu import Queue, Exchange

# Initialize Celery app
app = Celery('audrin_fire')

# ElastiCache Redis Broker & Result Backend
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

app.conf.update(
    broker_url=REDIS_URL,
    result_backend=REDIS_URL,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Africa/Johannesburg',
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Task Queues and Routing
    task_queues=(
        Queue('default', Exchange('default'), routing_key='default'),
        Queue('video_processing', Exchange('video_processing'), routing_key='video.#'),
        Queue('document_conversion', Exchange('document_conversion'), routing_key='doc.#'),
        Queue('notifications', Exchange('notifications'), routing_key='notify.#'),
        Queue('sla_watchdog', Exchange('sla_watchdog'), routing_key='sla.#'),
    ),
    
    task_routes={
        'audrin_fire.tasks.process_video': {'queue': 'video_processing'},
        'audrin_fire.tasks.convert_cad_drawing': {'queue': 'document_conversion'},
        'audrin_fire.tasks.generate_condition_report': {'queue': 'document_conversion'},
        'audrin_fire.tasks.publish_sns_event': {'queue': 'notifications'},
        'audrin_fire.tasks.check_sans_10139_sla_deadlines': {'queue': 'sla_watchdog'},
    },
    
    # Celery Beat Periodic Schedule
    beat_schedule={
        'audit-sla-deadlines-every-minute': {
            'task': 'audrin_fire.tasks.check_sans_10139_sla_deadlines',
            'schedule': 60.0, # Every 60 seconds
        },
        'sync-s3-quarantine-cleanup-daily': {
            'task': 'audrin_fire.tasks.cleanup_expired_quarantine_objects',
            'schedule': crontab(hour=2, minute=0), # 2:00 AM SAST
        },
        'reconcile-ses-bounces-and-complaints': {
            'task': 'audrin_fire.tasks.reconcile_ses_suppressions',
            'schedule': crontab(hour='*/4', minute=15), # Every 4 hours
        },
        'verify-celery-beat-singleton-lock': {
            'task': 'audrin_fire.tasks.verify_singleton_heartbeat',
            'schedule': 30.0, # Every 30 seconds
        }
    }
)


class CeleryBeatSingletonLock:
    """
    Distributed Redis lock ensuring strictly only ONE Celery Beat scheduler instance
    runs across AWS ECS Fargate tasks, eliminating duplicate email/report triggers.
    """
    def __init__(self, redis_url: str = REDIS_URL, lock_key: str = 'audrin:celery_beat:singleton_lock', ttl_seconds: int = 120):
        self.client = redis.from_url(redis_url)
        self.lock_key = lock_key
        self.ttl = ttl_seconds
        self.instance_id = os.environ.get('HOSTNAME', 'beat-singleton-node-1')

    def acquire(self) -> bool:
        """Attempts to acquire distributed lock via Redis SETNX with TTL."""
        acquired = self.client.set(self.lock_key, self.instance_id, ex=self.ttl, nx=True)
        return bool(acquired)

    def renew(self) -> bool:
        """Renews lock if currently held by this instance."""
        current_holder = self.client.get(self.lock_key)
        if current_holder and current_holder.decode('utf-8') == self.instance_id:
            self.client.expire(self.lock_key, self.ttl)
            return True
        return False

    def release(self):
        """Releases lock gracefully during ECS container termination."""
        current_holder = self.client.get(self.lock_key)
        if current_holder and current_holder.decode('utf-8') == self.instance_id:
            self.client.delete(self.lock_key)
