import urllib.request, json, urllib.parse

# Login
login_data = urllib.parse.urlencode({'username':'admin@smartbed.ai','password':'admin123'}).encode()
req = urllib.request.Request('http://localhost:8000/api/auth/login', data=login_data, headers={'Content-Type':'application/x-www-form-urlencoded'})
token = json.load(urllib.request.urlopen(req))['access_token']

# Get queue
req2 = urllib.request.Request('http://localhost:8000/api/patients/queue', headers={'Authorization': f'Bearer {token}'})
queue = json.load(urllib.request.urlopen(req2))

print(f"Total patients in queue: {len(queue)}\n")
print("Patients:")
for p in queue:
    print(f"  - {p['id']}: {p['name']} ({p['triage_level']} - Acuity {p['acuity_score']})")
