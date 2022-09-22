import {
  aws_dynamodb, 
  aws_s3 as s3,
  RemovalPolicy, 
  Stack,
  StackProps,
  aws_rds as rds,
  aws_ec2 as ec2,
  Tags,
  Duration,
  CfnOutput
} from 'aws-cdk-lib';
import { RDS_LOWERCASE_DB_IDENTIFIER } from 'aws-cdk-lib/cx-api';

import { Construct } from 'constructs';


export class HelloWorldStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /*  
      const s3Bucket = new s3.Bucket(this, 'exampleBucket', {
      bucketName: 'myfirsts3fromcdk', 
      removalPolicy: RemovalPolicy.DESTROY
    });

    const dynamoDB = new aws_dynamodb.Table(this, 'Users', {
        tableName: 'users',
        partitionKey: {
         name: 'uid',
          type: aws_dynamodb.AttributeType.STRING
        },
        removalPolicy: RemovalPolicy.DESTROY
      });
  */

      // Create a VPC 
      const vpc = new ec2.Vpc(this, 'my-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 1,
        maxAzs: 2,
        subnetConfiguration: [
          {
            name: 'private-subnet-1',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            cidrMask: 24,
          },
          {
            name: 'public-subnet-1',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24,
          },
          //{
          //  name: 'isolated-subnet-1',
          //  subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          //  cidrMask: 28,
          //},
        ],
      });

      // Create RDS Security Group
      const rdsSG = new ec2.SecurityGroup(this, 'rds-security-group', {
        vpc,
        securityGroupName: 'rds-security-group',
        description: 'Security group to attach to RDS instance',
        //allowAllOutbound: true,
      });

      rdsSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'Allow inbound connections to RDS Instance from World');


      // 👇 create RDS instance
      const dbInstance = new rds.DatabaseInstance(this, 'db-instance', {
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_5_7}),
                instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        storageType: rds.StorageType.GP2,
        credentials: rds.Credentials.fromGeneratedSecret('admin'),
        securityGroups: [rdsSG],
        multiAz: false,
        allocatedStorage: 20,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: false,
        backupRetention: Duration.days(0),
        deleteAutomatedBackups: true,
        removalPolicy: RemovalPolicy.DESTROY,
        deletionProtection: false,
        databaseName: 'firstrdsdb',
        publiclyAccessible: true,
      });    
   
  
      new CfnOutput(this, 'dbEndpoint', {
        value: dbInstance.instanceEndpoint.hostname,
      });
   
      new CfnOutput(this, 'secretName', {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        value: dbInstance.secret?.secretName!,
      });











  }
}
