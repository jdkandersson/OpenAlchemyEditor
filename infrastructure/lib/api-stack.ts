import * as fs from 'fs';
import * as crypto from 'crypto';

import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as certificatemanager from '@aws-cdk/aws-certificatemanager';
import * as iam from '@aws-cdk/aws-iam';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as cloudwatchActions from '@aws-cdk/aws-cloudwatch-actions';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as sns from '@aws-cdk/aws-sns';

import { ENVIRONMENT } from './environment';
import { CONFIG } from './config';

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function
    const deploymentPackage = 'resources/api/deployment-package.zip';
    const functionName = 'editor-service';
    const func = new lambda.Function(this, 'ApiFunc', {
      functionName,
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(deploymentPackage),
      handler: 'api.main',
      environment: {
        STAGE: 'PROD',
        SEEDS_FOLDER: 'assets/seeds',
        DEFAULT_SEED_NAME: 'simple/example-spec',
        ACCESS_CONTROL_ALLOW_ORIGIN: '*',
        ACCESS_CONTROL_ALLOW_HEADERS: 'x-language',
      },
      timeout: cdk.Duration.seconds(15),
    });
    const deploymentPackageContents = fs.readFileSync(deploymentPackage);
    const deploymentPackageHash = crypto
      .createHash('sha256')
      .update(deploymentPackageContents)
      .update(func.toString())
      .digest('hex');
    const version = new lambda.Version(
      this,
      `LambdaVersion-${deploymentPackageHash}`,
      {
        lambda: func,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      }
    );
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'prod',
      version,
    });
    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE,
    });

    // Add alarm subscription
    const alarmName = `${functionName}-error`;
    const alarm = func.metricErrors().createAlarm(this, 'Alarm', {
      threshold: 1,
      evaluationPeriods: 1,
      alarmName,
      alarmDescription: `The ${functionName} lambda function had an error`,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    const topic = new sns.Topic(this, 'Topic', {
      displayName: `${alarmName}-alarm`,
      topicName: `${alarmName}-alarm`,
    });
    topic.addSubscription(
      new snsSubscriptions.EmailSubscription(ENVIRONMENT.alarmEmailAddress)
    );
    alarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));

    // Certificate
    const certificateArn = ENVIRONMENT.awsOpenAlchemyCertificateArn;
    const certificate = certificatemanager.Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn
    );

    // API gateway
    const api = new apigateway.LambdaRestApi(this, 'LambdaRestApi', {
      restApiName: 'Editor Service',
      description: 'Micro service supporting the OpenAlchemy editor',
      handler: alias,
      deployOptions: {
        throttlingBurstLimit: CONFIG.api.throttlingBurstLimit,
        throttlingRateLimit: CONFIG.api.throttlingRateLimit,
      },
      deploy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS.concat(
          CONFIG.api.additionalAllowHeaders
        ),
      },
      domainName: {
        certificate,
        domainName: `${CONFIG.api.recordName}.${CONFIG.domainName}`,
      },
    });
    alias.addPermission('RestApiLambdaPermission', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: api.arnForExecuteApi(),
    });

    // DNS listing
    const zone = route53.PublicHostedZone.fromLookup(this, 'PublicHostedZone', {
      domainName: CONFIG.domainName,
    });
    new route53.ARecord(this, 'NewAliasRecord', {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(api)
      ),
      recordName: CONFIG.api.recordName,
    });
  }
}
