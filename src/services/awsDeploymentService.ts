import { 
  AwsEcsServiceStatus, 
  S3BucketConfig, 
  S3StoredObject, 
  SnsNotificationEvent, 
  SqsQueueStatus, 
  SesConfiguration, 
  SnsEventType 
} from '../types';
import { 
  INITIAL_ECS_SERVICES, 
  S3_BUCKET_CONFIGS, 
  INITIAL_S3_OBJECTS, 
  INITIAL_SNS_EVENTS, 
  SQS_QUEUE_STATUS, 
  SES_CONFIG 
} from '../data/awsDeploymentData';

class AwsDeploymentService {
  private ecsServices: AwsEcsServiceStatus[] = [...INITIAL_ECS_SERVICES];
  private s3Buckets: S3BucketConfig[] = [...S3_BUCKET_CONFIGS];
  private s3Objects: S3StoredObject[] = [...INITIAL_S3_OBJECTS];
  private snsEvents: SnsNotificationEvent[] = [...INITIAL_SNS_EVENTS];
  private sqsStatus: SqsQueueStatus = { ...SQS_QUEUE_STATUS };
  private sesConfig: SesConfiguration = { ...SES_CONFIG };

  public getEcsServices(): AwsEcsServiceStatus[] {
    return this.ecsServices;
  }

  public getS3Buckets(): S3BucketConfig[] {
    return this.s3Buckets;
  }

  public getS3Objects(): S3StoredObject[] {
    return this.s3Objects;
  }

  public getSnsEvents(): SnsNotificationEvent[] {
    return this.snsEvents;
  }

  public getSqsStatus(): SqsQueueStatus {
    return this.sqsStatus;
  }

  public getSesConfig(): SesConfiguration {
    return this.sesConfig;
  }

  /**
   * Generates a 15-minute temporary presigned URL for private S3 evidence
   */
  public generatePresignedUrl(objectId: string): { url: string; expiresAt: string } {
    const obj = this.s3Objects.find(o => o.id === objectId);
    if (!obj) {
      throw new Error('S3 Object not found in private media vault');
    }
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const url = `https://${obj.bucketName}.s3.af-south-1.amazonaws.com/${obj.key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2Faf-south-1%2Fs3%2Faws4_request&X-Amz-Date=${new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')}&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=c584a29ef812034981fa0e1837`;
    
    obj.presignedUrl = url;
    obj.presignedExpiresAt = expiresAt;
    obj.accessLogCount += 1;

    return { url, expiresAt };
  }

  /**
   * Simulates browser direct-to-S3 upload via presigned POST, followed by
   * Celery malware scan, video transcoding, and promotion from quarantine to private-media.
   */
  public async simulateDirectS3Upload(
    filename: string,
    category: S3StoredObject['category'],
    sizeBytes: number,
    organisationUuid: string,
    siteUuid: string,
    requestUuid: string
  ): Promise<S3StoredObject> {
    const fileUuid = 'file-' + Math.random().toString(36).substring(2, 9);
    const extension = filename.split('.').pop() || 'dat';
    
    let subPath = 'documents';
    if (category.startsWith('photo_')) subPath = 'photos/' + category.replace('photo_', '');
    else if (category.startsWith('video_')) subPath = 'videos/processed';
    else if (category.startsWith('report_')) subPath = 'reports/' + category.replace('report_', '');
    else if (category === 'cad_drawing') subPath = 'documents/cad';

    const s3Key = `organisations/${organisationUuid}/sites/${siteUuid}/requests/${requestUuid}/${subPath}/${fileUuid}.${extension}`;

    const newObj: S3StoredObject = {
      id: 's3-obj-' + Date.now(),
      key: s3Key,
      bucketName: 'audrin-fire-private-media-production',
      sizeBytes,
      lastModified: new Date().toISOString(),
      contentType: category.includes('video') ? 'video/mp4' : category.includes('photo') ? 'image/jpeg' : 'application/pdf',
      storageClass: 'STANDARD',
      encryption: 'aws:kms',
      kmsKeyId: 'arn:aws:kms:af-south-1:123456789012:key/c841a021-93bb-4521-992a-fireKMS7789',
      etag: '"' + Math.random().toString(36).substring(2, 18) + '"',
      sha256Checksum: Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      malwareStatus: 'clean',
      category,
      organisationUuid,
      siteUuid,
      requestUuid,
      fileUuid,
      isArchived: false,
      accessLogCount: 1
    };

    this.s3Objects = [newObj, ...this.s3Objects];
    return newObj;
  }

  /**
   * Simulates publishing an event to Amazon SNS -> SQS Queue -> ECS Notification Worker -> Amazon SES
   */
  public async publishSnsEvent(
    eventType: SnsEventType,
    recipientEmail: string,
    recipientName: string,
    templateKey: string,
    organisationUuid: string,
    urgency: 'critical' | 'high' | 'normal' | 'low' = 'normal',
    serviceRequestRef: string = 'SR-2026-0891'
  ): Promise<SnsNotificationEvent> {
    const eventId = 'evt-' + Math.random().toString(36).substring(2, 9);
    const correlationId = 'corr-' + Math.random().toString(36).substring(2, 8);
    const idempotencyKey = `${eventType}:${serviceRequestRef}:${templateKey}:${Math.floor(Date.now() / 60000)}`;

    let topicName = 'audrin-client-notifications';
    if (urgency === 'critical' || eventType.includes('emergency')) {
      topicName = 'audrin-emergency-alerts';
    } else if (eventType.includes('report')) {
      topicName = 'audrin-report-events';
    }

    const newEvent: SnsNotificationEvent = {
      id: 'sns-evt-' + Date.now(),
      eventId,
      eventType,
      topicArn: `arn:aws:sns:af-south-1:123456789012:${topicName}-production`,
      topicName,
      timestamp: new Date().toISOString(),
      organisationUuid,
      recipientEmail,
      recipientName,
      serviceRequestRef,
      templateKey,
      urgency,
      correlationId,
      idempotencyKey,
      status: 'delivered',
      attemptsCount: 1,
      snsMessageId: 'sns-msg-' + Math.random().toString(36).substring(2, 10),
      sqsMessageId: 'sqs-msg-' + Math.random().toString(36).substring(2, 10),
      sesMessageId: `0102018d9f${Math.random().toString(36).substring(2, 8)}-ses`,
      deliveredAt: new Date().toISOString()
    };

    this.snsEvents = [newEvent, ...this.snsEvents];
    this.sesConfig.sentLast24Hours += 1;

    return newEvent;
  }
}

export const awsDeploymentService = new AwsDeploymentService();
