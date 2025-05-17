export const serviceCategories = {
    "Compute": ["EC2", "Lambda", "Elastic Beanstalk", "ECS", "EKS", "Fargate"],
    "Storage": ["S3", "EBS", "EFS", "Glacier", "Storage Gateway"],
    "Database": ["RDS", "DynamoDB", "ElastiCache", "Neptune", "Redshift"],
    "Networking": ["VPC", "CloudFront", "Route 53", "API Gateway", "Direct Connect"],
    "Integration": ["SQS", "SNS", "EventBridge", "Step Functions", "AppSync"],
    "Monitoring": ["CloudWatch", "CloudTrail", "X-Ray"],
    "Security": ["IAM", "Cognito", "KMS", "WAF", "Shield"]
};

export const getCategoryForService = (serviceName) => {
    for (const [category, services] of Object.entries(serviceCategories)) {
        if (services.includes(serviceName)) {
            return category;
        }
    }
    return "Other";
};
