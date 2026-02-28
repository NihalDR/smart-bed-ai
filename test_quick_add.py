import urllib.request, json, urllib.parse

# Login
login_data = urllib.parse.urlencode({'username':'admin@smartbed.ai','password':'admin123'}).encode()
req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type':'application/x-www-form-urlencoded'})
token = json.load(urllib.request.urlopen(req))['access_token']

# Create a new patient
patient_data = json.dumps({
    "name": "Test Patient",
    "age": 45,
    "condition": "Test condition",
    "triage_level": "Yellow",
    "acuity_score": 6
}).encode()

req2 = urllib.request.Request('http://localhost:8000/api/patients', data=patient_data, headers={'Authorization': f'Bearer {token}', 'Content-Type':'application/json'}, method='POST')
resp = urllib.request.urlopen(req2)
new_patient = json.load(resp)

print("Created patient:")
print(json.dumps(new_patient, indent=2))

# Verify it appears in queue
req3 = urllib.request.Request('http://localhost:8000/api/patients/queue', headers={'Authorization': f'Bearer {token}'})
queue = json.load(urllib.request.urlopen(req3))

print("\nQueue length:", len(queue))
print("Test patient in queue:", any(p['name'] == 'Test Patient' for p in queue))
