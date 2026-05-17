#!/usr/bin/env bash
set -euo pipefail

# CloudShell often sets AWS_REGION to the console's selected region. Keep this
# project's infrastructure in us-west-2 unless we explicitly override it.
REGION="${BEFORE_I_FORGET_AWS_REGION:-us-west-2}"
TABLE_NAME="${DYNAMODB_TABLE_NAME:-BeforeIForgetMemories}"
BUCKET_NAME="${S3_BUCKET_NAME:-before-i-forget-uploads-${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}-${REGION}}"
USER_NAME="${IAM_USER_NAME:-before-i-forget-vercel-api}"
POLICY_NAME="${IAM_POLICY_NAME:-BeforeIForgetVercelApiPolicy}"
STATE_MACHINE_NAME="${STEP_FUNCTION_NAME:-before-i-forget-memory-workflow}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET_NAME="${BUCKET_NAME//_/-}"

echo "Provisioning Before I Forget backend in ${REGION} for account ${ACCOUNT_ID}"

if ! aws dynamodb describe-table --region "$REGION" --table-name "$TABLE_NAME" >/dev/null 2>&1; then
  aws dynamodb create-table \
    --region "$REGION" \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=memoryId,AttributeType=S \
    --key-schema AttributeName=memoryId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
  aws dynamodb wait table-exists --region "$REGION" --table-name "$TABLE_NAME"
fi

if ! aws s3api head-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1; then
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME"
  else
    aws s3api create-bucket \
      --bucket "$BUCKET_NAME" \
      --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
fi

aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'

if ! aws iam get-user --user-name "$USER_NAME" >/dev/null 2>&1; then
  aws iam create-user --user-name "$USER_NAME" >/dev/null
fi

POLICY_DOCUMENT="$(mktemp)"
cat > "$POLICY_DOCUMENT" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}/uploads/*",
        "arn:aws:s3:::${BUCKET_NAME}/transcripts/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "translate:TranslateText"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "states:StartExecution"
      ],
      "Resource": "arn:aws:states:${REGION}:${ACCOUNT_ID}:stateMachine:${STATE_MACHINE_NAME}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "states:DescribeExecution"
      ],
      "Resource": "arn:aws:states:${REGION}:${ACCOUNT_ID}:execution:${STATE_MACHINE_NAME}:*"
    }
  ]
}
JSON

aws iam put-user-policy \
  --user-name "$USER_NAME" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://${POLICY_DOCUMENT}" >/dev/null

EXISTING_ACCESS_KEY_ID="$(aws iam list-access-keys --user-name "$USER_NAME" --query 'AccessKeyMetadata[0].AccessKeyId' --output text)"

if [ "$EXISTING_ACCESS_KEY_ID" = "None" ]; then
  ACCESS_KEY_JSON="$(aws iam create-access-key --user-name "$USER_NAME")"
  ACCESS_KEY_ID="$(echo "$ACCESS_KEY_JSON" | jq -r '.AccessKey.AccessKeyId')"
  ACCESS_KEY_SECRET="$(echo "$ACCESS_KEY_JSON" | jq -r '.AccessKey.SecretAccessKey')"
else
  ACCESS_KEY_ID="$EXISTING_ACCESS_KEY_ID"
  ACCESS_KEY_SECRET="<use the existing secret for this access key or rotate the key>"
fi

cat <<EOF

Created/verified AWS resources.

Add these Vercel server-side environment variables:

AWS_REGION=${REGION}
AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${ACCESS_KEY_SECRET}
S3_BUCKET_NAME=${BUCKET_NAME}
DYNAMODB_TABLE_NAME=${TABLE_NAME}
STEP_FUNCTION_ARN=<paste Person 1 Step Functions state machine ARN>
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

Optional public variable:
NEXT_PUBLIC_API_BASE_URL=

Keep AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY server-only. Do not prefix them with NEXT_PUBLIC_.

Step Functions IAM note:
states:StartExecution is scoped to arn:aws:states:${REGION}:${ACCOUNT_ID}:stateMachine:${STATE_MACHINE_NAME}
states:DescribeExecution is scoped to arn:aws:states:${REGION}:${ACCOUNT_ID}:execution:${STATE_MACHINE_NAME}:*
EOF
