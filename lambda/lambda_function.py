import json
import requests
from os import environ

def lambda_handler(event, context):
    
    token = environ.get('REDCAP_API_TOKEN')
    
    print(event['body'])
    data = {
    'token': token,
    'content': 'record',
    'action': 'import',
    'format': 'json',
    'type': 'flat',
    'overwriteBehavior': 'normal',
    'forceAutoNumber': 'true',
    'data': event['body'],
    'returnContent': 'auto_ids',
    'returnFormat': 'json'
    }
    
    r = requests.post('https://redcap.slms.ucl.ac.uk/api/',data=data)
    
    return {
        "isBase64Encoded": False,
        "statusCode": r.status_code,
        "headers": { 
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps(r.json())
    }


