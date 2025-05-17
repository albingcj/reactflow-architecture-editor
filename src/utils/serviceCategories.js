export const serviceCategories = {
    "Compute": [
        "EC2", "Lambda", "ElasticBeanstalk", "ECS", "EKS", "Fargate",
        "EC2Instance", "EC2Instances", "EC2Ami", "EC2AutoScaling", "EC2SpotInstance",
        "ElasticContainerService", "ElasticContainerServiceContainer", "ElasticContainerServiceService",
        "ElasticKubernetesService", "ElasticBeanstalkApplication", "ElasticBeanstalkDeployment",
        "AppRunner", "Batch", "Lightsail", "LocalZones", "Outposts", "ServerlessApplicationRepository",
        "ThinkboxDeadline", "ThinkboxDraft", "ThinkboxFrost", "ThinkboxKrakatoa", "ThinkboxSequoia",
        "ThinkboxStoke", "ThinkboxXmesh", "VmwareCloudOnAWS", "Wavelength"
    ],
    "Storage": [
        "S3", "EBS", "EFS", "Glacier", "StorageGateway",
        "SimpleStorageServiceS3", "SimpleStorageServiceS3Bucket", "SimpleStorageServiceS3Object",
        "SimpleStorageServiceS3BucketWithObjects", "S3AccessPoints", "S3ObjectLambdaAccessPoints",
        "S3Glacier", "S3GlacierVault", "S3GlacierArchive",
        "ElasticBlockStoreEBS", "ElasticBlockStoreEBSVolume", "ElasticBlockStoreEBSSnapshot",
        "ElasticFileSystemEFS", "ElasticFileSystemEFSFileSystem", "EFSStandardPrimaryBg", "EFSInfrequentaccessPrimaryBg",
        "Fsx", "FsxForWindowsFileServer", "FsxForLustre",
        "StorageGatewayCachedVolume", "StorageGatewayNonCachedVolume", "StorageGatewayVirtualTapeLibrary",
        "MultipleVolumesResource", "SnowFamilySnowballImportExport"
    ],
    "Database": [
        "RDS", "DynamoDB", "ElastiCache", "Neptune", "Redshift",
        "Aurora", "AuroraInstance", "DocumentdbMongodbCompatibility",
        "KeyspacesManagedApacheCassandraService", "Timestream",
        "DatabaseMigrationService", "DatabaseMigrationServiceDatabaseMigrationWorkflow",
        "Dynamodb", "DynamodbTable", "DynamodbItem", "DynamodbItems", "DynamodbStreams",
        "DynamodbGlobalSecondaryIndex", "DynamodbDax", "DynamodbAttributes", "DynamodbAttribute"
    ],
    "Networking": [
        "VPC", "CloudFront", "Route53", "APIGateway", "DirectConnect",
        "VPCElasticNetworkInterface", "VPCElasticNetworkAdapter", "VPCPeering",
        "TransitGateway", "TransitGatewayAttachment", "VpnConnection", "VpnGateway",
        "VPCCustomerGateway", "VPCRouter", "VPCFlowLogs", "VPCTrafficMirroring",
        "SiteToSiteVpn", "ClientVpn", "PrivateSubnet", "PublicSubnet", "Nacl",
        "NATGateway", "Endpoint", "GlobalAccelerator", "RouteTable",
        "CloudMap", "ElbApplicationLoadBalancer", "ElbClassicLoadBalancer",
        "ElbNetworkLoadBalancer", "ElasticLoadBalancing", "APIGatewayEndpoint",
        "CloudFrontDownloadDistribution", "CloudFrontStreamingDistribution", "CloudFrontEdgeLocation"
    ],
    "Integration": [
        "SQS", "SNS", "EventBridge", "StepFunctions", "AppSync",
        "SimpleQueueServiceSqs", "SimpleQueueServiceSqsQueue", "SimpleQueueServiceSqsMessage",
        "SimpleNotificationServiceSns", "SimpleNotificationServiceSnsTopic", "SimpleNotificationServiceSnsEmailNotification",
        "SimpleNotificationServiceSnsHttpNotification", "Appsync", "Eventbridge", "EventbridgeCustomEventBusResource",
        "EventbridgeDefaultEventBusResource", "EventbridgeSaasPartnerEventBusResource", "ExpressWorkflows", "MQ"
    ],
    "Monitoring": [
        "CloudWatch", "CloudTrail", "XRay",
        "Cloudwatch", "CloudwatchAlarm", "CloudwatchRule", "CloudwatchEventTimeBased",
        "CloudwatchEventEventBased", "CloudwatchLogs"
    ],
    "Security": [
        "IAM", "Cognito", "KMS", "WAF", "Shield",
        "IdentityAndAccessManagementIam", "IdentityAndAccessManagementIamRole",
        "IdentityAndAccessManagementIamPermissions", "IdentityAndAccessManagementIamLongTermSecurityCredential",
        "IdentityAndAccessManagementIamTemporarySecurityCredential", "IdentityAndAccessManagementIamMfaToken",
        "IdentityAndAccessManagementIamDataEncryptionKey", "IdentityAndAccessManagementIamEncryptedData",
        "IdentityAndAccessManagementIamAWSSts", "IdentityAndAccessManagementIamAWSStsAlternate",
        "IdentityAndAccessManagementIamAddOn", "IdentityAndAccessManagementIamAccessAnalyzer",
        "CertificateManager", "CertificateAuthority", "SecretsManager", "KeyManagementService",
        "Cognito", "WAF", "WAFFilteringRule", "Shield", "ShieldAdvanced", "SingleSignOn",
        "Detective", "Inspector", "InspectorAgent", "Guardduty", "FirewallManager", "Macie",
        "SecurityHub", "SecurityHubFinding", "DirectoryService", "AdConnector", "SimpleAd",
        "ManagedMicrosoftAd", "ResourceAccessManager", "Cloudhsm", "CloudDirectory"
    ]
};


export const getCategoryForService = (serviceName) => {
    for (const [category, services] of Object.entries(serviceCategories)) {
        if (services.includes(serviceName)) {
            return category;
        }
    }
    return "Other";
};
