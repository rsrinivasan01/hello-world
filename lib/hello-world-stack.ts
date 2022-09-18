import {
  aws_dynamodb, 
  aws_s3 as s3,
  RemovalPolicy, 
  Stack,
  StackProps
} from 'aws-cdk-lib';

import { Construct } from 'constructs';


export class HelloWorldStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
      }
      )
  }
}
