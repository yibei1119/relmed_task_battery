import json
import requests
from os import environ
import io

def upload_file_to_redcap(record, file_content):
    token = environ.get('REDCAP_API_TOKEN')
    
    # Create an in-memory file object
    file_obj = io.BytesIO(file_content.encode('utf-8'))
    
    # Prepare the file to be sent
    files = {
        'file': file_obj,
    }
    
    data = {
        'token': token,
        'content': 'file',
        'action': 'import',
        'record': record,
        'field': 'jspsych_data'
    }
    
    r = requests.post('https://redcap.slms.ucl.ac.uk/api/', data=data, files=files)
    
    return r

def lambda_handler(event, context):
    
    token = environ.get('REDCAP_API_TOKEN')

    print(event)
        
    data = {
    'token': token,
    'content': 'record',
    'action': 'import',
    'format': 'json',
    'type': 'flat',
    'overwriteBehavior': 'normal',
    'data': event['body'],
    'returnFormat': 'json'
    }
    
    r = requests.post('https://redcap.slms.ucl.ac.uk/api/',data=data)
    
    # Save as file
    body_data = json.loads(event['body'])[0]
    print(body_data)

    participant_id = body_data['participant_id']
    print(participant_id)
    
    jspsych_data = body_data["jspsych_data"]  
    
    # Upload the long text as a file
    file_upload_response = upload_file_to_redcap(participant_id, 
        jspsych_data)
    print(file_upload_response)

    return {
        "isBase64Encoded": False,
        "statusCode": r.status_code,
        "headers": { 
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps({
            'record_import_response': r.json(),
            'file_upload_response': file_upload_response.status_code
        })
    }

